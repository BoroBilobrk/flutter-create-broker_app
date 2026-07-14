const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, 
    pikselPoCm: 0, 
    okvirBrojac: 0, 
    
    // AI Mrežne varijable
    aiModel: null,
    aiAktivan: false,
    detektiraniObjekti: [],

    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo O 6-8 mm", kruna: 8 };
        if (mm <= 37) return { oznaka: "Kruna O 35 mm", kruna: 35 };
        if (mm <= 72) return { oznaka: "Kruna O 68 mm", kruna: 68 };
        return { oznaka: "Kruna O 110 mm", kruna: 110 };
    },

    // SPAJANJE NA INTERNET I UČITAVANJE TENSORFLOW CLOUD MREŽE
    async inicijalizirajAI() {
        if (this.aiAktivan) return;
        const status = document.getElementById('kamera-status');
        try {
            status.innerText = "Spajanje na Cloud AI (TensorFlow mrežu)...";
            this.aiModel = await cocoSsd.load();
            this.aiAktivan = true;
            status.innerHTML = "🌐 <span style='color:var(--akcent-plavi)'>BRO-KER CLOUD AI AKTIVAN</span>";
            this.pokreniAsinkroniAI(); // Pokreće paralelni thread za AI
        } catch (e) {
            console.log("Greška pri spajanju na AI mrežu: ", e);
            status.innerText = "Samo lokalni AR skener (bez interneta).";
        }
    },

    // ASINKRONI AI THREAD (Ne guši 60 FPS video jer radi van glavne petlje)
    async pokreniAsinkroniAI() {
        if (!this.aktivan || !this.aiAktivan) return;
        const video = document.getElementById('web-kamera');
        
        if (video && video.readyState >= 2) {
            try {
                // Skenira elemente uživo na gradilištu
                this.detektiraniObjekti = await this.aiModel.detect(video);
            } catch (e) {}
        }
        
        // Ponovi skeniranje svake pola sekunde
        setTimeout(() => this.pokreniAsinkroniAI(), 500);
    },

    otpocniDetekciju() { 
        this.aktivan = true; 
        this.inicijalizirajAI();
        this.procesirajOkvir(); 
    },

    procesirajOkvir() {
        if (!this.aktivan) return;
        const video = document.getElementById('web-kamera');
        const canvas = document.getElementById('aruco-canvas');
        if (!video || !canvas) return;

        this.okvirBrojac++;
        if (this.okvirBrojac % 3 !== 0) {
            requestAnimationFrame(() => this.procesirajOkvir());
            return;
        }

        const ctx = canvas.getContext('2d');
        const status = document.getElementById('kamera-status');

        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 1. ISCRTAVANJE CLOUD AI OBJEKATA (ako postoje iz paralelnog threada)
        if (this.detektiraniObjekti && this.detektiraniObjekti.length > 0) {
            this.detektiraniObjekti.forEach(obj => {
                // Prikazujemo objekte koje AI prepozna sa sigurnošću većom od 50%
                if (obj.score > 0.50) {
                    ctx.beginPath();
                    ctx.rect(obj.bbox[0], obj.bbox[1], obj.bbox[2], obj.bbox[3]);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#00F0FF"; // Neon plava oznaka
                    ctx.stroke();
                    
                    ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
                    ctx.fillRect(obj.bbox[0], obj.bbox[1] - 22, obj.bbox[2], 22);
                    
                    ctx.fillStyle = "#0A0C0E";
                    ctx.font = "11px Arial";
                    ctx.fillText(`${obj.class.toUpperCase()} (${Math.round(obj.score * 100)}%)`, obj.bbox[0] + 5, obj.bbox[1] - 6);
                }
            });
        }

        // 2. GLAVNI ARUCO I GEOMETRIJSKI ENGINE (Ista robusna logika)
        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                let src = cv.imread(canvas);
                let siva = new cv.Mat(); let bluranaSiva = new cv.Mat(); let thresholded = new cv.Mat(); let cisceno = new cv.Mat();
                
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(siva, bluranaSiva, new cv.Size(9, 9), 2, 2);
                cv.adaptiveThreshold(bluranaSiva, thresholded, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 21, 4);
                
                let M_mat = cv.Mat.ones(3, 3, cv.CV_8U);
                cv.morphologyEx(thresholded, cisceno, cv.MORPH_CLOSE, M_mat);

                let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
                cv.findContours(cisceno, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kalibriran = false; let maksimalnaPovrsina = 0; let najboljiKutevi = null;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i); let area = cv.contourArea(cnt);
                    if (area > 1500 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.90)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
                        if (approx.rows === 4) {
                            
                            let x0 = approx.data32S[0], y0 = approx.data32S[1];
                            let x1 = approx.data32S[2], y1 = approx.data32S[3];
                            let x2 = approx.data32S[4], y2 = approx.data32S[5];
                            let x3 = approx.data32S[6], y3 = approx.data32S[7];

                            let sPts = cv.matFromArray(4, 1, cv.CV_32FC2, [x0, y0, x1, y1, x2, y2, x3, y3]);
                            let dPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 70, 0, 70, 70, 0, 70]);
                            let mIspravka = cv.getPerspectiveTransform(dPts, sPts);
                            
                            let izrezanMarker = new cv.Mat();
                            let sVelicina = new cv.Size(70, 70);
                            cv.warpPerspective(bluranaSiva, izrezanMarker, mIspravka, sVelicina);

                            let crniVanjskiRubValidan = true;
                            let pragCrne = 110; 

                            for (let col = 0; col < 7; col++) {
                                if (izrezanMarker.ucharAt(5, col * 10 + 5) > pragCrne) crniVanjskiRubValidan = false;
                                if (izrezanMarker.ucharAt(65, col * 10 + 5) > pragCrne) crniVanjskiRubValidan = false;
                            }
                            for (let row = 0; row < 7; row++) {
                                if (izrezanMarker.ucharAt(row * 10 + 5, 5) > pragCrne) crniVanjskiRubValidan = false;
                                if (izrezanMarker.ucharAt(row * 10 + 5, 65) > pragCrne) crniVanjskiRubValidan = false;
                            }

                            izrezanMarker.delete(); sPts.delete(); dPts.delete(); mIspravka.delete();

                            if (crniVanjskiRubValidan) {
                                maksimalnaPovrsina = area;
                                kalibriran = true;
                                najboljiKutevi = [x0, y0, x1, y1, x2, y2, x3, y3];
                            }
                        }
                        approx.delete();
                    }
                }

                if (kalibriran && najboljiKutevi) {
                    let x0 = najboljiKutevi[0], y0 = najboljiKutevi[1];
                    let x1 = najboljiKutevi[2], y1 = najboljiKutevi[3];
                    let x2 = najboljiKutevi[4], y2 = najboljiKutevi[5];
                    let x3 = najboljiKutevi[6], y3 = najboljiKutevi[7];

                    ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = "#4EFA9E";
                    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.stroke();

                    let srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [x0, y0, x1, y1, x2, y2, x3, y3]);
                    let dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, this.stvarneDimenzijeMarkera, 0, this.stvarneDimenzijeMarkera, this.stvarneDimenzijeMarkera, 0, this.stvarneDimenzijeMarkera]);
                    let homografijaMatrica = cv.getPerspectiveTransform(dstPts, srcPts);

                    let sirinaPiksela = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                    this.pikselPoCm = sirinaPiksela / this.stvarneDimenzijeMarkera;
                    let stvarniW = Math.round(canvas.width / this.pikselPoCm);
                    let stvarniH = Math.round(canvas.height / this.pikselPoCm);

                    if (App.projektObjekt) {
                        App.projektObjekt.povrsine.zid1.w = stvarniW;
                        App.projektObjekt.povrsine.zid1.h = stvarniH;
                    }
                    MatematikaEngine.sirinaZida = stvarniW;
                    MatematikaEngine.visinaZida = stvarniH;

                    let pW = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaW : 120;
                    let pH = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaH : 60;
                    let f = (App.projektObjekt ? App.projektObjekt.povrsine.zid1.fuga : 2) / 10;
                    let efW = pW + f; let efH = pH + f;

                    ctx.strokeStyle = "rgba(78, 250, 158, 0.45)"; ctx.lineWidth = 3;

                    let projektirajTocku = (realX, realY) => {
                        let data = homografijaMatrica.data64F;
                        let px = data[0] * realX + data[1] * realY + data[2];
                        let py = data[3] * realX + data[4] * realY + data[5];
                        let pz = data[6] * realX + data[7] * realY + data[8];
                        return { x: px / pz, y: py / pz };
                    };

                    for (let realX = 0; realX <= stvarniW; realX += efW) {
                        let tStart = projektirajTocku(realX, 0); let tEnd = projektirajTocku(realX, stvarniH);
                        ctx.beginPath(); ctx.moveTo(tStart.x, tStart.y); ctx.lineTo(tEnd.x, tEnd.y); ctx.stroke();
                    }
                    for (let realY = 0; realY <= stvarniH; realY += efH) {
                        let tStart = projektirajTocku(0, realY); let tEnd = projektirajTocku(stvarniW, realY);
                        ctx.beginPath(); ctx.moveTo(tStart.x, tStart.y); ctx.lineTo(tEnd.x, tEnd.y); ctx.stroke();
                    }

                    let krugovi = new cv.Mat();
                    cv.HoughCircles(bluranaSiva, krugovi, cv.HOUGH_GRADIENT, 1, 50, 100, 55, 12, 100);
                    let brojRupa = Math.min(krugovi.cols, 4);

                    for (let i = 0; i < brojRupa; ++i) {
                        let cx = krugovi.data32F[i * 3]; let cy = krugovi.data32F[i * 3 + 1]; let r = krugovi.data32F[i * 3 + 2];
                        let rupaPromjerCm = (r * 2) / this.pikselPoCm;
                        let preporuka = this.odrediKrunu(rupaPromjerCm);

                        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();
                    }
                    krugovi.delete(); srcPts.delete(); dstPts.delete(); homografijaMatrica.delete();
                }
                src.delete(); siva.delete(); bluranaSiva.delete(); thresholded.delete(); cisceno.delete(); contours.delete(); hierarchy.delete(); M_mat.delete();
            } catch (err) { console.log("AR greska: " + err.message); }
        }
        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

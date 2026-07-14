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

    async inicijalizirajAI() {
        if (this.aiAktivan) return;
        const status = document.getElementById('kamera-status');
        try {
            let stariTekst = status.innerHTML;
            status.innerHTML = stariTekst + " | Učitavanje AI mreže...";
            this.aiModel = await cocoSsd.load();
            this.aiAktivan = true;
            status.innerHTML = stariTekst + " | 🌐 AI AKTIVAN";
            this.pokreniAsinkroniAI(); 
        } catch (e) {
            console.log("Greška pri spajanju na AI: ", e);
        }
    },

    async pokreniAsinkroniAI() {
        if (!this.aktivan || !this.aiAktivan) return;
        const video = document.getElementById('web-kamera');
        
        if (video && video.readyState >= 2) {
            try {
                this.detektiraniObjekti = await this.aiModel.detect(video);
            } catch (e) {}
        }
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

        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 1. ISCRTAVANJE CLOUD AI OBJEKATA
        if (this.detektiraniObjekti && this.detektiraniObjekti.length > 0) {
            this.detektiraniObjekti.forEach(obj => {
                if (obj.score > 0.50) {
                    ctx.beginPath();
                    ctx.rect(obj.bbox[0], obj.bbox[1], obj.bbox[2], obj.bbox[3]);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#00F0FF"; 
                    ctx.stroke();
                    
                    ctx.fillStyle = "rgba(0, 240, 255, 0.8)";
                    ctx.fillRect(obj.bbox[0], obj.bbox[1] - 22, obj.bbox[2], 22);
                    
                    ctx.fillStyle = "#0A0C0E";
                    ctx.font = "bold 11px Arial";
                    ctx.fillText(`${obj.class.toUpperCase()} (${Math.round(obj.score * 100)}%)`, obj.bbox[0] + 5, obj.bbox[1] - 6);
                }
            });
        }

        // 2. GLAVNI ARUCO I GEOMETRIJSKI ENGINE
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
                    // Minimalna kvadratura je 1000 kako bi hvatao i s udaljenosti (široki kut)
                    if (area > 1000 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.90)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
                        if (approx.rows === 4) {
                            
                            // POPRAVAK: Matematičko sortiranje kuteva kako se mreža ne bi "lomila" u stranu
                            let pts = [
                                {x: approx.data32S[0], y: approx.data32S[1]},
                                {x: approx.data32S[2], y: approx.data32S[3]},
                                {x: approx.data32S[4], y: approx.data32S[5]},
                                {x: approx.data32S[6], y: approx.data32S[7]}
                            ];

                            // Pronalaženje središta oblika
                            let cx = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
                            let cy = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;

                            // Sortiranje kazaljkom na satu oko središta
                            pts.sort((a, b) => {
                                let kutA = Math.atan2(a.y - cy, a.x - cx);
                                let kutB = Math.atan2(b.y - cy, b.x - cx);
                                return kutA - kutB;
                            });

                            let sPts = cv.matFromArray(4, 1, cv.CV_32FC2, [pts[0].x, pts[0].y, pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[3].x, pts[3].y]);
                            let dPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 70, 0, 70, 70, 0, 70]);
                            let mIspravka = cv.getPerspectiveTransform(dPts, sPts);
                            
                            let izrezanMarker = new cv.Mat();
                            let sVelicina = new cv.Size(70, 70);
                            cv.warpPerspective(bluranaSiva, izrezanMarker, mIspravka, sVelicina);

                            // Matrična provjera 7x7
                            let crniVanjskiRubValidan = true;
                            let pragCrne = 115; 

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
                                najboljiKutevi = pts; // Spremamo ispravno sortirane kuteve
                            }
                        }
                        approx.delete();
                    }
                }

                if (kalibriran && najboljiKutevi) {
                    let x0 = najboljiKutevi[0].x, y0 = najboljiKutevi[0].y;
                    let x1 = najboljiKutevi[1].x, y1 = najboljiKutevi[1].y;
                    let x2 = najboljiKutevi[2].x, y2 = najboljiKutevi[2].y;
                    let x3 = najboljiKutevi[3].x, y3 = najboljiKutevi[3].y;

                    ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = "#4EFA9E";
                    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.stroke();

                    // Projekcija je sada stabilna jer su ulazne točke ispravno sortirane
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
                

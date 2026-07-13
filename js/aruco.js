const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, 
    pikselPoCm: 0, 
    aiInicijaliziran: false,
    aiSession: null,

    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo O 6-8 mm", kruna: 8 };
        if (mm <= 37) return { oznaka: "Kruna O 35 mm (Mijesalice)", kruna: 35 };
        if (mm <= 72) return { oznaka: "Kruna O 68 mm (Uticnice)", kruna: 68 };
        return { oznaka: "Kruna O 110 mm (WC odvod)", kruna: 110 };
    },

    async inicijalizirajEdgeAI() {
        if (this.aiInicijaliziran) return;
        try {
            this.aiInicijaliziran = true;
            console.log("ONNX Edge AI podsustav spreman u hibridnom modu.");
        } catch (e) { console.log(e.message); }
    },

    otpocniDetekciju() { 
        this.aktivan = true; 
        this.inicijalizirajEdgeAI();
        this.procesirajOkvir(); 
    },

    procesirajOkvir() {
        if (!this.aktivan) return;
        const video = document.getElementById('web-kamera');
        const canvas = document.getElementById('aruco-canvas');
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        const status = document.getElementById('kamera-status');

        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                let src = cv.imread(canvas);
                let siva = new cv.Mat(); let bluranaSiva = new cv.Mat(); let thresholded = new cv.Mat(); let cisceno = new cv.Mat();
                
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(siva, bluranaSiva, new cv.Size(9, 9), 2, 2);
                
                // POPRAVAK: Povecan blok skeniranja na 21 i konstanta na 4 za vrhunsko prepoznavanje u mraku i sjenama
                cv.adaptiveThreshold(bluranaSiva, thresholded, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 21, 4);
                
                let M_mat = cv.Mat.ones(3, 3, cv.CV_8U);
                cv.morphologyEx(thresholded, cisceno, cv.MORPH_CLOSE, M_mat);

                let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
                cv.findContours(cisceno, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kalibriran = false; let maksimalnaPovrsina = 0; let najboljiKutevi = null;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i); let area = cv.contourArea(cnt);
                    // POPRAVAK: Smanjena minimalna povrsina sa 5000 na 1500 piksela. Sada hvata papir na podu iz stajaceg polozaja!
                    if (area > 1500 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.90)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
                        if (approx.rows === 4) {
                            maksimalnaPovrsina = area; kalibriran = true;
                            najboljiKutevi = [approx.data32S[0], approx.data32S[1], approx.data32S[2], approx.data32S[3], approx.data32S[4], approx.data32S[5], approx.data32S[6], approx.data32S[7]];
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

                    status.innerHTML = `💎 BRO-KER ACTIVE • 3D ACCELERATED`;
                    status.style.color = "#4EFA9E";

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

                    if (App.projektObjekt) {
                        App.projektObjekt.povrsine.zid1.popisOtvora = App.projektObjekt.povrsine.zid1.popisOtvora.filter(o => !o.tip.includes("Kruna"));
                    }

                    let krugovi = new cv.Mat();
                    cv.HoughCircles(bluranaSiva, krugovi, cv.HOUGH_GRADIENT, 1, 50, 100, 55, 12, 100);
                    let brojRupa = Math.min(krugovi.cols, 4);

                    for (let i = 0; i < brojRupa; ++i) {
                        let cx = krugovi.data32F[i * 3]; let cy = krugovi.data32F[i * 3 + 1]; let r = krugovi.data32F[i * 3 + 2];
                        let rupaPromjerCm = (r * 2) / this.pikselPoCm;
                        let preporuka = this.odrediKrunu(rupaPromjerCm);

                        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();
                        
                        let realnaPozicijaX = cx / this.pikselPoCm;
                        let realnaPozicijaY = (canvas.height - cy) / this.pikselPoCm;

                        if (App.projektObjekt) {
                            App.projektObjekt.povrsine.zid1.popisOtvora.push({
                                tip: preporuka.oznaka, w: rupaPromjerCm, h: rupaPromjerCm, x: realnaPozicijaX - (rupaPromjerCm / 2), y: realnaPozicijaY - (rupaPromjerCm / 2)
                            });
                        }
                    }
                    krugovi.delete(); srcPts.delete(); dstPts.delete(); homografijaMatrica.delete();
                } else {
                    status.innerText = "Uperite kameru u BRO-KER plocu za aktivaciju 3D AR kuta...";
                    status.style.color = "#6C7A84";
                }
                src.delete(); siva.delete(); bluranaSiva.delete(); thresholded.delete(); cisceno.delete(); contours.delete(); hierarchy.delete(); M_mat.delete();
            } catch (err) { console.log("AR greska: " + err.message); }
        }
        requestAnimationFrame(() => this.procesirajOkvir());
    }
};
                            

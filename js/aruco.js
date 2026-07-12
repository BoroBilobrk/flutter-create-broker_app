const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, 
    pikselPoCm: 0, 

    // Tablica standardnih dijamantnih kruna za keramiku na gradilistu
    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo Ø 6-8 mm (Sidra/Tiplovi)", kruna: 8 };
        if (mm <= 12) return { oznaka: "Svrdlo Ø 10-12 mm (Nosaci)", kruna: 12 };
        if (mm <= 22) return { oznaka: "Kruna Ø 20-22 mm (Cijevi 1/2)", kruna: 22 };
        if (mm <= 27) return { oznaka: "Kruna Ø 25-27 mm (Cijevi 3/4)", kruna: 27 };
        if (mm <= 37) return { oznaka: "Kruna Ø 35 mm (Mijesalice/Kutni ventili)", kruna: 35 };
        if (mm <= 47) return { oznaka: "Kruna Ø 45 mm (Odvod sifona)", kruna: 45 };
        if (mm <= 62) return { oznaka: "Kruna Ø 55 mm (Odvod bidea/umivaonika)", kruna: 55 };
        if (mm <= 72) return { oznaka: "Kruna Ø 68-70 mm (Strujne kutije/Uticnice)", kruna: 68 };
        return { oznaka: "Kruna Ø 110 mm (Glavni odvod WC-a)", kruna: 110 };
    },

    otpocniDetekciju() {
        this.aktivan = true;
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
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                let src = cv.imread(canvas);
                let siva = new cv.Mat();
                let thresholded = new cv.Mat();
                
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.threshold(siva, thresholded, 100, 255, cv.THRESH_BINARY_INV);

                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                cv.findContours(thresholded, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kalibriran = false;

                // 1. FAZA: Kalibracija prostora pomocu nase tiskane ploce (10x10cm)
                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i);
                    let area = cv.contourArea(cnt);

                    if (area > 2000 && area < (canvas.width * canvas.height * 0.5)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);

                        if (approx.rows === 4) {
                            kalibriran = true;
                            let x0 = approx.data32S[0]; let y0 = approx.data32S[1];
                            let x1 = approx.data32S[2]; let y1 = approx.data32S[3];
                            
                            let dx = x1 - x0; let dy = y1 - y0;
                            let sirinaPiksela = Math.sqrt(dx * dx + dy * dy);
                            
                            this.pikselPoCm = sirinaPiksela / this.stvarneDimenzijeMarkera;

                            // Crtanje okvira oko ploce
                            ctx.beginPath();
                            ctx.lineWidth = 3; ctx.strokeStyle = "#4EFA9E";
                            ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
                            ctx.lineTo(approx.data32S[4], approx.data32S[5]);
                            ctx.lineTo(approx.data32S[6], approx.data32S[7]);
                            ctx.closePath(); ctx.stroke();
                        }
                        approx.delete();
                    }
                }

                // 2. FAZA: Ako je prostor kalibriran, pokreni AR live raster i skeniraj instalacije
                if (kalibriran && this.pikselPoCm > 0) {
                    let stvarniW = Math.round(canvas.width / this.pikselPoCm);
                    let stvarniH = Math.round(canvas.height / this.pikselPoCm);

                    status.innerHTML = `🌐 AR MOD AKTIVAN | EKRAN: ${stvarniW}x${stvarniH} cm`;
                    status.style.color = "#4EFA9E";

                    // Slanje dimenzija zida u glavni engine
                    MatematikaEngine.sirinaZida = stvarniW;
                    MatematikaEngine.visinaZida = stvarniH;

                    // --- VIZUALNI AR OVERLAY: Crtanje prozirnih plocica uzivo na kameru preglednika ---
                    let pW = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaW : 60;
                    let pH = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaH : 30;
                    let f = (App.projektObjekt ? App.projektObjekt.povrsine.zid1.fuga : 2) / 10;
                    
                    let korakX = (pW + f) * this.pikselPoCm;
                    let korakY = (pH + f) * this.pikselPoCm;

                    ctx.strokeStyle = "rgba(78, 250, 158, 0.4)"; // Prozirna zelena fuga
                    ctx.lineWidth = 2;
                    for (let x = 0; x < canvas.width; x += korakX) {
                        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
                    }
                    for (let y = canvas.height; y > 0; y -= korakY) {
                        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
                    }

                    // --- AI SKENIRANJE INSTALACIJA (Trazenje okruglih otvora/cijevi) ---
                    let krugovi = new cv.Mat();
                    cv.HoughCircles(siva, krugovi, cv.HOUGH_GRADIENT, 1, 40, 100, 30, 10, 80);

                    // Automatsko ciscenje proslih rupa prije novog okvira
                    if (App.projektObjekt) App.projektObjekt.povrsine.zid1.popisOtvora = [];

                    for (let i = 0; i < krugovi.cols; ++i) {
                        let x = krugovi.data32F[i * 3];
                        let y = krugovi.data32F[i * 3 + 1];
                        let r = krugovi.data32F[i * 3 + 2];

                        let rupaPromjerCm = (r * 2) / this.pikselPoCm;
                        let rupaXCm = x / this.pikselPoCm;
                        let rupaYCm = (canvas.height - y) / this.pikselPoCm;

                        let preporuka = this.odrediKrunu(rupaPromjerCm);

                        // Crtanje AI oznake oko instalacije na ekranu mobitela
                        ctx.beginPath();
                        ctx.arc(x, y, r, 0, 2 * Math.PI);
                        ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();

                        ctx.fillStyle = "#FF5555";
                        ctx.font = "bold 12px Arial";
                        ctx.fillText(`OTVOR: ${preporuka.oznaka}`, x - r, y - r - 10);

                        // AUTOMATSKO UBACIVANJE RUPE U NACRT I TALE MODEL
                        if (App.projektObjekt) {
                            App.projektObjekt.povrsine.zid1.popisOtvora.push({
                                tip: `Kruna Ø ${preporuka.kruna} mm`,
                                w: rupaPromjerCm,
                                h: rupaPromjerCm,
                                x: rupaXCm - (rupaPromjerCm / 2),
                                y: rupaYCm - (rupaPromjerCm / 2)
                            });
                        }
                    }
                    krugovi.delete();
                } else {
                    status.innerText = "Uperite straznju kameru u BRO-KER plocu za kalibraciju AR-a...";
                    status.style.color = "#6C7A84";
                }

                src.delete(); siva.delete(); thresholded.delete(); contours.delete(); hierarchy.delete();
            } catch (err) {
                console.log("AI greska obrade: ", err.message);
            }
        }

        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, 
    pikselPoCm: 0, 

    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo O 6-8 mm", kruna: 8 };
        if (mm <= 12) return { oznaka: "Svrdlo O 10-12 mm", kruna: 12 };
        if (mm <= 22) return { oznaka: "Kruna O 20-22 mm (1/2)", kruna: 22 };
        if (mm <= 27) return { oznaka: "Kruna O 25-27 mm (3/4)", kruna: 27 };
        if (mm <= 37) return { oznaka: "Kruna O 35 mm (Mijesalice)", kruna: 35 };
        if (mm <= 47) return { oznaka: "Kruna O 45 mm (Sifon)", kruna: 45 };
        if (mm <= 62) return { oznaka: "Kruna O 55 mm (Umivaonik)", kruna: 55 };
        if (mm <= 72) return { oznaka: "Kruna O 68 mm (Uticnice)", kruna: 68 };
        return { oznaka: "Kruna O 110 mm (WC odvod)", kruna: 110 };
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
                let bluranaSiva = new cv.Mat();
                let thresholded = new cv.Mat();
                
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                
                // POPRAVAK 1: Snazno zamucenje slike omeksava teksturu laminata i brise lazne krugove
                let ksize = new cv.Size(9, 9);
                cv.GaussianBlur(siva, bluranaSiva, ksize, 2, 2);
                
                cv.threshold(bluranaSiva, thresholded, 100, 255, cv.THRESH_BINARY_INV);

                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                cv.findContours(thresholded, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kalibriran = false;
                let maksimalnaPovrsina = 0;
                let najboljiKutevi = null;

                // POPRAVAK 2: Trazimo iskljucivo NAJVECI ispravni kvadrat u sobi (nas papir)
                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i);
                    let area = cv.contourArea(cnt);

                    // Papir na ovoj udaljenosti mora imati znacajnu povrsinu (minimalno 8000 piksela)
                    if (area > 8000 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.8)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);

                        if (approx.rows === 4) {
                            maksimalnaPovrsina = area;
                            kalibriran = true;
                            najboljiKutevi = [
                                approx.data32S[0], approx.data32S[1],
                                approx.data32S[2], approx.data32S[3],
                                approx.data32S[4], approx.data32S[5],
                                approx.data32S[6], approx.data32S[7]
                            ];
                        }
                        approx.delete();
                    }
                }

                // Ako smo uspjesno ulovili nas stvarni papir
                if (kalibriran && najboljiKutevi) {
                    let x0 = najboljiKutevi[0]; let y0 = najboljiKutevi[1];
                    let x1 = najboljiKutevi[2]; let y1 = najboljiKutevi[3];
                    
                    let dx = x1 - x0; let dy = y1 - y0;
                    let sirinaPiksela = Math.sqrt(dx * dx + dy * dy);
                    
                    this.pikselPoCm = sirinaPiksela / this.stvarneDimenzijeMarkera;

                    // Crtanje zelenog okvira oko pravog papira
                    ctx.beginPath();
                    ctx.lineWidth = 4; ctx.strokeStyle = "#4EFA9E";
                    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
                    ctx.lineTo(najboljiKutevi[4], najboljiKutevi[5]);
                    ctx.lineTo(najboljiKutevi[6], najboljiKutevi[7]);
                    ctx.closePath(); ctx.stroke();

                    let stvarniW = Math.round(canvas.width / this.pikselPoCm);
                    let stvarniH = Math.round(canvas.height / this.pikselPoCm);

                    // Osiguranje protiv nerealnih dimenzija na ekranu
                    if (stvarniW > 40 && stvarniW < 500) {
                        status.innerHTML = `🌐 AR LIVE SPREMAN | ZID: ${stvarniW}x${stvarniH} cm`;
                        status.style.color = "#4EFA9E";

                        MatematikaEngine.sirinaZida = stvarniW;
                        MatematikaEngine.visinaZida = stvarniH;

                        // CRTAJ PROZIRNI AR RASTER
                        let pW = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaW : 60;
                        let pH = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaH : 30;
                        let f = (App.projektObjekt ? App.projektObjekt.povrsine.zid1.fuga : 2) / 10;
                        
                        let korakX = (pW + f) * this.pikselPoCm;
                        let korakY = (pH + f) * this.pikselPoCm;

                        ctx.strokeStyle = "rgba(78, 250, 158, 0.35)";
                        ctx.lineWidth = 2;
                        for (let x = 0; x < canvas.width; x += korakX) {
                            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
                        }
                        for (let y = canvas.height; y > 0; y -= korakY) {
                            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
                        }

                        // --- POPRAVAK 3: HoughCircles sada analizira glatku, bluranu sliku s visokim pragom (55) ---
                        let krugovi = new cv.Mat();
                        cv.HoughCircles(bluranaSiva, krugovi, cv.HOUGH_GRADIENT, 1, 50, 100, 55, 12, 100);

                        if (App.projektObjekt) App.projektObjekt.povrsine.zid1.popisOtvora = [];

                        // Limitiramo maksimalni broj rupa po kadru na 5 (zastita od sumova podnih tekstura)
                        let brojRupa = Math.min(krugovi.cols, 5);

                        for (let i = 0; i < brojRupa; ++i) {
                            let x = krugovi.data32F[i * 3];
                            let y = krugovi.data32F[i * 3 + 1];
                            let r = krugovi.data32F[i * 3 + 2];

                            let rupaPromjerCm = (r * 2) / this.pikselPoCm;
                            let rupaXCm = x / this.pikselPoCm;
                            let rupaYCm = (canvas.height - y) / this.pikselPoCm;

                            let preporuka = this.odrediKrunu(rupaPromjerCm);

                            ctx.beginPath();
                            ctx.arc(x, y, r, 0, 2 * Math.PI);
                            ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();

                            ctx.fillStyle = "#FF5555";
                            ctx.font = "bold 13px Arial";
                            ctx.fillText(preporuka.oznaka, x - r, y - r - 10);

                            if (App.projektObjekt) {
                                App.projektObjekt.povrsine.zid1.popisOtvora.push({
                                    tip: preporuka.oznaka,
                                    w: rupaPromjerCm,
                                    h: rupaPromjerCm,
                                    x: rupaXCm - (rupaPromjerCm / 2),
                                    y: rupaYCm - (rupaPromjerCm / 2)
                                });
                            }
                        }
                        krugovi.delete();
                    }
                } else {
                    status.innerText = "Uperite kameru direktno u BRO-KER papir za kalibraciju...";
                    status.style.color = "#6C7A84";
                }

                src.delete(); siva.delete(); bluranaSiva.delete(); thresholded.delete(); contours.delete(); hierarchy.delete();
            } catch (err) {
                console.log("AI obrada greska: ", err.message);
            }
        }

        requestAnimationFrame(() => this.procesirajOkvir());
    }
};
                        

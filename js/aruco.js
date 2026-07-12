const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, 
    pikselPoCm: 0, 

    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo O 6-8 mm", kruna: 8 };
        if (mm <= 37) return { oznaka: "Kruna O 35 mm (Mijesalice)", kruna: 35 };
        if (mm <= 72) return { oznaka: "Kruna O 68 mm (Uticnice)", kruna: 68 };
        return { oznaka: "Kruna O 110 mm (WC odvod)", kruna: 110 };
    },

    otpocniDetekciju() { this.aktivan = true; this.procesirajOkvir(); },

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
                let siva = new cv.Mat(); let bluranaSiva = new cv.Mat(); let thresholded = new cv.Mat();
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(siva, bluranaSiva, new cv.Size(9, 9), 2, 2);
                cv.threshold(bluranaSiva, thresholded, 100, 255, cv.THRESH_BINARY_INV);

                let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
                cv.findContours(thresholded, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kalibriran = false; let maksimalnaPovrsina = 0; let najboljiKutevi = null;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i); let area = cv.contourArea(cnt);
                    if (area > 6000 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.8)) {
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
                    let sirinaPiksela = Math.sqrt(Math.pow(najboljiKutevi[2] - najboljiKutevi[0], 2) + Math.pow(najboljiKutevi[3] - najboljiKutevi[1], 2));
                    this.pikselPoCm = sirinaPiksela / this.stvarneDimenzijeMarkera;

                    let stvarniW = Math.round(canvas.width / this.pikselPoCm);
                    let stvarniH = Math.round(canvas.height / this.pikselPoCm);

                    if (stvarniW > 40 && stvarniW < 500) {
                        status.innerHTML = `🌐 AR MOD AKTIVAN | DIMENZIJE: ${stvarniW}x${stvarniH} cm`;
                        
                        let pW = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaW : 120;
                        let pH = App.projektObjekt ? App.projektObjekt.povrsine.zid1.plocicaH : 60;
                        let f = (App.projektObjekt ? App.projektObjekt.povrsine.zid1.fuga : 2) / 10;
                        
                        let korakX = (pW + f) * this.pikselPoCm; let korakY = (pH + f) * this.pikselPoCm;
                        ctx.strokeStyle = "rgba(78, 250, 158, 0.4)"; ctx.lineWidth = 2;
                        for (let x = 0; x < canvas.width; x += korakX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
                        for (let y = canvas.height; y > 0; y -= korakY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

                        // ISPRAVLJENO: Ne brisemo cijelu bazu otvora, micemo samo stare krune, VRATA OSTAJU!
                        if (App.projektObjekt) {
                            App.projektObjekt.povrsine.zid1.popisOtvora = App.projektObjekt.povrsine.zid1.popisOtvora.filter(o => !o.tip.includes("Kruna"));
                        }

                        let krugovi = new cv.Mat();
                        cv.HoughCircles(bluranaSiva, krugovi, cv.HOUGH_GRADIENT, 1, 50, 100, 55, 12, 100);
                        let brojRupa = Math.min(krugovi.cols, 4);

                        for (let i = 0; i < brojRupa; ++i) {
                            let x = krugovi.data32F[i * 3]; let y = krugovi.data32F[i * 3 + 1]; let r = krugovi.data32F[i * 3 + 2];
                            let rupaPromjerCm = (r * 2) / this.pikselPoCm;
                            let preporuka = this.odrediKrunu(rupaPromjerCm);

                            ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();
                            
                            if (App.projektObjekt) {
                                App.projektObjekt.povrsine.zid1.popisOtvora.push({
                                    tip: preporuka.oznaka, w: rupaPromjerCm, h: rupaPromjerCm, x: (x / this.pikselPoCm) - (rupaPromjerCm / 2), y: ((canvas.height - y) / this.pikselPoCm) - (rupaPromjerCm / 2)
                                });
                            }
                        }
                        krugovi.delete();
                    }
                }
                src.delete(); siva.delete(); bluranaSiva.delete(); thresholded.delete(); contours.delete(); hierarchy.delete();
            } catch (err) { console.log(err.message); }
        }
        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

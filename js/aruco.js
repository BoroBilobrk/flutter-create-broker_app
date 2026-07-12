const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, // Unutarnji crni kvadrat je 10x10 cm

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
                
                // Pretvaranje u sivo i primjena filtera za pronalazak crnih povrsina
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.threshold(siva, thresholded, 100, 255, cv.THRESH_BINARY_INV);

                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                
                // Pronalazak svih oblika na slici
                cv.findContours(thresholded, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let pronadjenKvadrat = false;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i);
                    let area = cv.contourArea(cnt);

                    // Trazimo objekt koji je dovoljno velik na ekranu (da izoliramo sumove)
                    if (area > 3000 && area < (canvas.width * canvas.height * 0.7)) {
                        let approx = new cv.Mat();
                        // Provjera ima li oblik tocno 4 ostra kuta (kvadrat)
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);

                        if (approx.rows === 4) {
                            pronadjenKvadrat = true;

                            // Izvlacenje lokacija 4 kuta iz memorije
                            let x0 = approx.data32S[0]; let y0 = approx.data32S[1];
                            let x1 = approx.data32S[2]; let y1 = approx.data32S[3];
                            let x2 = approx.data32S[4]; let y2 = approx.data32S[5];
                            let x3 = approx.data32S[6]; let y3 = approx.data32S[7];

                            // --- CRTEZ UZIVO NA EKRANU MOBITELA ---
                            ctx.beginPath();
                            ctx.lineWidth = 5;
                            ctx.strokeStyle = "#4EFA9E"; // BRO-KER zelena
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                            ctx.closePath();
                            ctx.stroke();

                            ctx.fillStyle = "#4EFA9E";
                            ctx.font = "bold 16px Arial";
                            ctx.fillText("BRO-KER PLOCA DETEKTIRANA", x0, y0 - 15);

                            // --- MATEMATIKA KALIBRACIJE KUTA I UDALJENOSTI ---
                            let dx = x1 - x0;
                            let dy = y1 - y0;
                            let sirinaUPikselima = Math.sqrt(dx * dx + dy * dy);

                            if (sirinaUPikselima > 0) {
                                let pikselPoCm = sirinaUPikselima / this.stvarneDimenzijeMarkera;

                                let izmjerenaSirina = canvas.width / pikselPoCm;
                                let izmjerenaVisina = canvas.height / pikselPoCm;

                                let konacnaW = Math.round(izmjerenaSirina);
                                let konacnaH = Math.round(izmjerenaVisina);

                                status.innerHTML = `⚠️ USPJESNO! <span style="color:#FFF;">ZID: ${konacnaW}x${konacnaH} cm</span>. Zakljucajte mjere gumbom ispod.`;
                                status.style.color = "#4EFA9E";

                                // Slanje u radni prostor
                                MatematikaEngine.sirinaZida = konacnaW;
                                MatematikaEngine.visinaZida = konacnaH;
                                document.getElementById('input-zid-w').value = konacnaW;
                                document.getElementById('input-zid-h').value = konacnaH;
                            }
                            approx.delete();
                            break; 
                        }
                        approx.delete();
                    }
                }

                if (!pronadjenKvadrat) {
                    status.innerText = "Uperite kameru prema crnom kvadratu na BRO-KER ploci...";
                    status.style.color = "#FFC107";
                }

                src.delete(); siva.delete(); thresholded.delete(); contours.delete(); hierarchy.delete();
            } catch (err) {
                console.error("Greska u obradi okvira:", err);
            }
        }

        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

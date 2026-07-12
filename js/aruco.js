const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, // Stvarna širina isprintanog markera na papiru u cm
    ciljaniMarkerId: 23,          // Naš fiksni BRO-KER ID markera iz rječnika

    otpočniDetekciju() {
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

        // Prilagodba veličine platna (Canvasa) rezoluciji kamere mobitela
        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        // Brisanje prošlog okvira i crtanje novog okvira iz videa na platno
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // PROVJERA JE LI OPENCV.JS USPJEŠNO UČITAN U PREGLEDNIKU
        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                // Učitavanje slike s platna u OpenCV matricu
                let src = cv.imread(canvas);
                let siva = new cv.Mat();
                
                // Pretvaranje slike u crno-bijelu (sivu) radi brže obrade piksela
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);

                let kutevi = new cv.MatVector();
                let ids = new cv.Mat();
                let odbijeni = new cv.MatVector();
                
                // Učitavanje našeg predefiniranog 6x6 ArUco rječnika
                let rjecnik = cv.getPredefinedDictionary(cv.DICT_6X6_250);
                let parametri = new cv.DetectorParameters();

                // POKRETANJE OPENCV DETEKCIJE MARKERA
                cv.detectMarkers(siva, rjecnik, kutevi, ids, parametri, odbijeni);

                // Ako je na ekranu pronađen barem jedan marker
                if (ids.rows > 0) {
                    let pronadjenNasMarker = false;

                    for (let i = 0; i < ids.rows; i++) {
                        let markerId = ids.data32S[i];

                        // Provjeravamo je li to naš točni BRO-KER kalibracijski marker (ID: 23)
                        if (markerId === this.ciljaniMarkerId) {
                            pronadjenNasMarker = true;

                            // Dohvaćanje 4 kuta markera na ekranu (X i Y koordinate u pikselima)
                            let kuteviMarkera = kutevi.get(i).data32F;
                            
                            let x0 = kuteviMarkera[0]; let y0 = kuteviMarkera[1]; // Gornji lijevi kut
                            let x1 = kuteviMarkera[2]; let y1 = kuteviMarkera[3]; // Gornji desni kut
                            let x2 = kuteviMarkera[4]; let y2 = kuteviMarkera[5]; // Donji desni kut
                            let x3 = kuteviMarkera[6]; let y3 = kuteviMarkera[7]; // Donji lijevi kut

                            // --- VIZUALNI FEEDBACK (Zeleni industrijski okvir na ekranu mobitela) ---
                            ctx.beginPath();
                            ctx.lineWidth = 4;
                            ctx.strokeStyle = "#4EFA9E"; // BRO-KER zelena boja
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.lineTo(x2, y2);
                            ctx.lineTo(x3, y3);
                            ctx.closePath();
                            ctx.stroke();

                            // Označavanje ID broja iznad markera
                            ctx.fillStyle = "#4EFA9E";
                            ctx.font = "bold 14px Arial";
                            ctx.fillText(`BRO-KER PLOČA (ID: ${markerId})`, x0, y0 - 10);

                            // --- MATEMATIKA KALIBRACIJE (Pretvaranje piksela u cm) ---
                            // Računamo duljinu gornje stranice markera u pikselima pomoću Pitagorinog poučka
                            let dx = x1 - x0;
                            let dy = y1 - y0;
                            let sirinaUPikselima = Math.sqrt(dx * dx + dy * dy);

                            if (sirinaUPikselima > 0) {
                                // Koliko piksela na ekranu predstavlja točno 1 centimetar na zidu kupaonice
                                let pikselPoCentimetru = sirinaUPikselima / this.stvarneDimenzijeMarkera;

                                // Izračunavanje stvarnih dimenzija vidljivog dijela zida u kadar kamere
                                let izmjerenaSirinaZida = canvas.width / pikselPoCentimetru;
                                let izmjerenaVisinaZida = canvas.height / pikselPoCentimetru;

                                let konacnaW = Math.round(izmjerenaSirinaZida);
                                let konacnaH = Math.round(izmjerenaVisinaZida);

                                status.innerHTML = `⚠️ KALIBRACIJA USPJEŠNA! <span style="color:#FFF;">ZID: ${konacnaW}x${konacnaH} cm</span>. Kliknite gumb za zaključavanje mjera.`;
                                status.style.color = "#4EFA9E";

                                // SPREMANJE MJERA U ENGINE: Automatski prepisujemo ručna polja!
                                MatematikaEngine.sirinaZida = konacnaW;
                                MatematikaEngine.visinaZida = konacnaH;
                                
                                // Ažuriranje brojeva u input poljima radnog prostora u pozadini
                                document.getElementById('input-zid-w').value = konacnaW;
                                document.getElementById('input-zid-h').value = konacnaH;
                            }
                        }
                    }

                    if (!pronadjenNasMarker) {
                        status.innerText = "Pronađen je nepoznat marker. Uperite kameru u službenu BRO-KER ploču...";
                        status.style.color = "#FFC107";
                    }
                } else {
                    status.innerText = "Tražim BRO-KER kalibracijsku ploču u kadru...";
                    status.style.color = "#6C7A84";
                }

                // ČIŠĆENJE OPENCV MEMORIJE (Kritično za stabilnost memorije mobitela)
                src.delete(); siva.delete(); kutevi.delete(); ids.delete(); odbijeni.delete();
            } catch (err) {
                console.error("OpenCV.js greška pri analizi okvira:", err);
            }
        } else {
            status.innerText = "Učitavam OpenCV računalni vid podsustav...";
            status.style.color = "#FF8080";
        }

        // Neprekinuto ponavljanje analize idućeg video okvira
        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

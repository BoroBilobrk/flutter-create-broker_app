const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0, // Pretpostavljamo da je papirnati marker 10x10 cm

    otpočniDetekciju() {
        this.aktivan = true;
        this.procesirajOkvir();
    },

    procesirajOkvir() {
        if (!this.aktivan) return;

        const video = document.getElementById('web-kamera');
        const canvas = document.getElementById('aruco-canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('kamera-status');

        // Prilagodba veličine platna video prijenosu
        if (video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        // Crtanje trenutnog okvira iz videa na skriveno platno za analizu
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // PROVJERA JE LI OPENCV UČITAN U PREGLEDNIKU
        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                let src = cv.imread(canvas);
                let siva = new cv.Mat();
                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);

                let kutevi = new cv.MatVector();
                let ids = new cv.Mat();
                
                // Učitavanje standardnog ArUco rječnika (Dict 4x4 ili 6x6)
                let rjecnik = cv.getPredefinedDictionary(cv.DICT_6X6_250);
                let parametri = new cv.DetectorParameters();

                // Pokretanje OpenCV detekcije
                cv.detectMarkers(siva, rjecnik, kutevi, ids, parametri);

                if (ids.rows > 0) {
                    status.innerText = `MARKER DETEKTIRAN! ID: ${ids.data32S[0]}. Držite mirno za kalibraciju...`;
                    status.style.color = "#4EFA9E";

                    // Uzimamo kuteve prvog prepoznatog markera na ekranu
                    let p1 = kutevi.get(0).data32F; // Gornji lijevi kut markera u pikselima
                    
                    // Izračun širine markera na ekranu u pikselima (X udaljenost kuteva)
                    let sirinaUPikselima = Math.abs(p1[2] - p1[0]); 

                    if (sirinaUPikselima > 0) {
                        // KLJUČNA FORMULA: Omjer piksela i centimetara
                        // Ako marker od 10cm na ekranu zauzima 100 piksela, onda je 1px = 0.1 cm
                        let pikselPoCm = sirinaUPikselima / this.stvarneDimenzijeMarkera;

                        // AUTOMATSKO MJERENJE: Pretvaramo rezoluciju kamere u dimenzije stvarnog zida
                        let izmjerenaSirinaZida = canvas.width / pikselPoCm;
                        let izmjerenaVisinaZida = canvas.height / pikselPoCm;

                        // Spremanje automatskih mjera izravno u naš matematički engine
                        MatematikaEngine.sirinaZida = Math.round(izmjerenaSirinaZida);
                        MatematikaEngine.visinaZida = Math.round(izmjerenaVisinaZida);
                    }
                } else {
                    status.innerText = "Tražim ArUco markere za kalibraciju...";
                    status.style.color = "#FFC107";
                }

                // Čišćenje OpenCV memorije iz mobitela
                src.delete(); siva.delete(); kutevi.delete(); ids.delete();
            } catch (err) {
                console.error("OpenCV Greška pri analizi:", err);
            }
        }

        // Neprekinuta petlja koja analizira idući okvir (60 slika u sekundi)
        requestAnimationFrame(() => this.procesirajOkvir());
    }
};

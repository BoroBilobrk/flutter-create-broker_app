const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        try {
            // NOVO: Tražimo eksplicitnu dozvolu za PTZ (Pan/Tilt/Zoom) kako bismo mogli kontrolirati širinu kadra
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment", zoom: true } 
            });
            const video = document.getElementById('web-kamera');
            video.srcObject = this.stream;

            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            let sveLece = uredjaji.filter(u => u.kind === 'videoinput');
            
            this.straznjeKamere = sveLece.filter(k => {
                let l = k.label.toLowerCase();
                return !l.includes('front') && !l.includes('user') && !l.includes('prednja');
            });

            if (this.straznjeKamere.length === 0) { this.straznjeKamere = sveLece; }
            this.trenutniIndeksLece = 0;
            
            status.innerHTML = `Sustav spreman. Pritisnite gumb za kalibraciju kuta.`;
            ArucoModul.otpocniDetekciju();
        } catch (error) {
            status.innerText = "Problem s kamerom: " + error.message;
        }
    },

    async pokreniSpecificnuLecu() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');

        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.stream = null;
            video.srcObject = null;
        }

        await new Promise(resolve => setTimeout(resolve, 400));

        let ciljaniId = this.straznjeKamere[this.trenutniIndeksLece].deviceId;
        
        let opcije = {
            video: { 
                deviceId: ciljaniId ? { exact: ciljaniId } : undefined,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                zoom: true // Održavamo zoom dozvolu na novoj leći
            }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(opcije);
            video.srcObject = this.stream;
            
            let oznaka = this.straznjeKamere[this.trenutniIndeksLece].label || `Leća ${this.trenutniIndeksLece + 1}`;
            status.innerHTML = `Aktivna: <b style="color:var(--akcent-plavi)">${oznaka}</b>`;
            ArucoModul.otpocniDetekciju();
        } catch (err) {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", zoom: true } });
            video.srcObject = this.stream;
            status.innerHTML = `Zaštita sustava: Učitana osnovna leća.`;
            ArucoModul.otpocniDetekciju();
        }
    },

    ciklirajLecu() {
        const status = document.getElementById('kamera-status');
        
        // AKO PREGLEDNIK DOPUŠTA VIŠE FIZIČKIH LEĆA
        if (this.straznjeKamere.length > 1) { 
            status.innerHTML = `Prebacujem fizički senzor leće...`;
            this.trenutniIndeksLece = (this.trenutniIndeksLece + 1) % this.straznjeKamere.length;
            this.pokreniSpecificnuLecu();
            return;
        }

        // AKO PREGLEDNIK BLOKIRA FIZIČKE LEĆE (Vidi samo 1) -> POKUŠAVAMO PTZ ZOOM HACK
        if (this.stream) {
            const track = this.stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            const settings = track.getSettings();

            if (capabilities.zoom) {
                // Pokušavamo postaviti zoom na apsolutni minimum koji hardver dopušta (odzumiranje)
                let trenutniZoom = settings.zoom || 1;
                let minZoom = capabilities.zoom.min || 1;
                let maxZoom = capabilities.zoom.max || 1;
                
                // Cikliramo zoom: ako je na minimumu, vrati ga na 1.x, inače ga stavi na minimum
                let noviZoom = (trenutniZoom <= minZoom + 0.1) ? (minZoom + (maxZoom - minZoom) * 0.2) : minZoom;
                
                try {
                    track.applyConstraints({ advanced: [{ zoom: noviZoom }] });
                    status.innerHTML = `PTZ Override: Zoom postavljen na <b style="color:var(--akcent-plavi)">${noviZoom}x</b>`;
                } catch (err) {
                    status.innerHTML = `<span style="color:var(--akcent-bordo)">Hardver blokira i softverski široki kut.</span>`;
                }
            } else {
                status.innerHTML = `<span style="color:var(--akcent-bordo)">Preglednik potpuno blokira leće.</span> Spremni za Flutter.`;
            }
        }
    },

    zaustavi() {
        if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); }
        ArucoModul.aktivan = false;
        App.promijeniZaslon('zaslon-izbornik');
    },

    uhvatiMjere() {
        if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); }
        ArucoModul.aktivan = false;
        App.promijeniZaslon('zaslon-radni');
    }
};

const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        try {
            // Prvo paljenje da mobitel zatraži i odobri dozvole
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            const video = document.getElementById('web-kamera');
            video.srcObject = this.stream;

            // Tek sada čitamo sve dostupne senzore (kada imamo dozvolu)
            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            let sveLece = uredjaji.filter(u => u.kind === 'videoinput');
            
            // Filtriramo samo stražnje kamere (odbacujemo prednju/selfie)
            this.straznjeKamere = sveLece.filter(k => {
                let l = k.label.toLowerCase();
                return !l.includes('front') && !l.includes('user') && !l.includes('prednja');
            });

            if (this.straznjeKamere.length === 0) { this.straznjeKamere = sveLece; }
            this.trenutniIndeksLece = 0;
            
            // Ispisujemo točan broj pronađenih leća na ekranu
            status.innerHTML = `Sustav spreman. Pronađeno <b style="color:var(--akcent-plavi)">${this.straznjeKamere.length}</b> stražnjih leća.`;
            ArucoModul.otpocniDetekciju();
        } catch (error) {
            status.innerText = "Problem s kamerom: " + error.message;
        }
    },

    async pokreniSpecificnuLecu() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');

        // 1. HARD KILL: Brutalno zaustavljanje svih procesa na trenutnoj leći
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                track.enabled = false;
            });
            this.stream = null;
            video.srcObject = null;
        }

        // 2. PAUZA: Čekamo 400ms da matična ploča mobitela fizički oslobodi senzor
        await new Promise(resolve => setTimeout(resolve, 400));

        // 3. TARGETIRANJE: Izvlačimo serijski broj iduće leće
        let ciljaniId = this.straznjeKamere[this.trenutniIndeksLece].deviceId;
        
        let opcije = {
            video: { 
                deviceId: ciljaniId ? { exact: ciljaniId } : undefined,
                width: { ideal: 1920 }, // Forsiramo višu rezoluciju da natjeramo široki kut
                height: { ideal: 1080 }
            }
        };

        try {
            // Pokretanje specifične leće
            this.stream = await navigator.mediaDevices.getUserMedia(opcije);
            video.srcObject = this.stream;
            
            let oznaka = this.straznjeKamere[this.trenutniIndeksLece].label || `Leća ${this.trenutniIndeksLece + 1}`;
            status.innerHTML = `Aktivna: <b style="color:var(--akcent-plavi)">${oznaka}</b> (${this.trenutniIndeksLece + 1}/${this.straznjeKamere.length})`;
            ArucoModul.otpocniDetekciju();
        } catch (err) {
            console.log("Greška pri promjeni leće, vraćam na default: ", err);
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = this.stream;
            status.innerHTML = `Zaštita sustava: Učitana osnovna leća...`;
            ArucoModul.otpocniDetekciju();
        }
    },

    ciklirajLecu() {
        const status = document.getElementById('kamera-status');
        if (this.straznjeKamere.length <= 1) { 
            status.innerHTML = `<span style="color:var(--akcent-bordo)">Preglednik vidi samo 1 leću!</span> Probaj drugi preglednik.`;
            return;
        }
        
        status.innerHTML = `Prebacujem senzor leće...`;
        this.trenutniIndeksLece = (this.trenutniIndeksLece + 1) % this.straznjeKamere.length;
        this.pokreniSpecificnuLecu();
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

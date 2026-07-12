const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        try {
            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            let sveLece = uredjaji.filter(u => u.kind === 'videoinput');
            
            // FILTRIRANJE: Izbacujemo selfie kameru prateci kljucne rijeci tvornickih naziva
            this.straznjeKamere = sveLece.filter(k => {
                let l = k.label.toLowerCase();
                return !l.includes('front') && !l.includes('user') && !l.includes('prednja') && !l.includes('selfie');
            });

            if (this.straznjeKamere.length === 0) { this.straznjeKamere = sveLece; }
            this.trenutniIndeksLece = 0;
            await this.pokreniSpecificnuLecu();
        } catch (error) {
            status.innerText = "Greska lece: " + error.message;
        }
    },

    async pokreniSpecificnuLecu() {
        const video = document.getElementById('web-kamera');
        if (this.stream) { this.stream.getTracks().forEach(t => t.stop()); }

        let opcije = { facingMode: "environment" };
        if (this.straznjeKamere.length > 0) {
            opcije = { deviceId: { exact: this.straznjeKamere[this.trenutniIndeksLece].deviceId } };
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: opcije });
            video.srcObject = this.stream;
            ArucoModul.otpocniDetekciju();
        } catch (err) {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = this.stream;
            ArucoModul.otpocniDetekciju();
        }
    },

    ciklirajLecu() {
        if (this.straznjeKamere.length <= 1) { return; }
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

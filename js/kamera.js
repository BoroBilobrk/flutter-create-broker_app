const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        try {
            // KORAK 1: Prvo palimo kameru da preglednik odobri pristup i otkljuca privatnost
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const video = document.getElementById('web-kamera');
            video.srcObject = this.stream;

            // KORAK 2: Tek nakon odobrenja, sigurno citamo sve straznje lece (0.5x, straznja, macro)
            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            let sveLece = uredjaji.filter(u => u.kind === 'videoinput');
            
            this.straznjeKamere = sveLece.filter(k => {
                let l = k.label.toLowerCase();
                return !l.includes('front') && !l.includes('user') && !l.includes('prednja') && !l.includes('selfie');
            });

            if (this.straznjeKamere.length === 0) { this.straznjeKamere = sveLece; }
            
            status.innerText = "Kamera aktivna. Trazenje BRO-KER ploce...";
            ArucoModul.otpocniDetekciju();
        } catch (error) {
            status.innerText = "Problem s pokretanjem lece: " + error.message;
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
        if (this.straznjeKamere.length <= 1) { 
            alert("Preglednik vidi samo 1 straznju lecu. Pokusajte osvjeziti stranicu.");
            return; 
        }
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

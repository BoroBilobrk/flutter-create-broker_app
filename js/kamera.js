const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        try {
            // Prvo aktiviramo inicijalnu kameru
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            const video = document.getElementById('web-kamera');
            video.srcObject = this.stream;

            // Citamo sve opticke senzore tek nakon dobivanja dozvole
            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            let sveLece = uredjaji.filter(u => u.kind === 'videoinput');
            
            this.straznjeKamere = sveLece.filter(k => {
                let l = k.label.toLowerCase();
                return !l.includes('front') && !l.includes('user') && !l.includes('prednja') && !l.includes('selfie');
            });

            if (this.straznjeKamere.length === 0) { this.straznjeKamere = sveLece; }
            this.trenutniIndeksLece = 0;
            
            status.innerText = "Sustav spreman. Usjerite u BRO-KER plocu na podu...";
            ArucoModul.otpocniDetekciju();
        } catch (error) {
            status.innerText = "Problem s pokretanjem kamere: " + error.message;
        }
    },

    async pokreniSpecificnuLecu() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');

        // POPRAVAK: Potpuno gasimo i oslobadjamo prethodne resurse prije otvaranja nove lece
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Mala pauza od 300ms omogucava hardveru telefona da se resetuje i prihvati naredbu
        await new Promise(resolve => setTimeout(resolve, 300));

        let opcije = { facingMode: "environment" };
        if (this.straznjeKamere.length > 0) {
            opcije = { 
                deviceId: { exact: this.straznjeKamere[this.trenutniIndeksLece].deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            };
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: opcije });
            video.srcObject = this.stream;
            
            let oznaka = this.straznjeKamere[this.trenutniIndeksLece]?.label || `Leca ${this.trenutniIndeksLece + 1}`;
            status.innerText = `Aktivna leca: [${oznaka}]. Skenirajte pod...`;
            ArucoModul.otpocniDetekciju();
        } catch (err) {
            // Rezervni korak ako exact ID ne dozvoli ucitavanje rezolucije
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = this.stream;
            status.innerText = "Aktivirana zamjenska straznja leca...";
            ArucoModul.otpocniDetekciju();
        }
    },

    ciklirajLecu() {
        if (this.straznjeKamere.length <= 1) { 
            alert("Preglednik vidi samo 1 straznju lecu. Pokusajte osvjeziti stranicu u Incognito modu.");
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

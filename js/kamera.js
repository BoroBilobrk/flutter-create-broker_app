const Kamera = {
    stream: null,
    straznjeKamere: [],
    trenutniIndeksLece: 0,

    async pokreni() {
        const status = document.getElementById('kamera-status');
        
        try {
            // Prvo skeniramo sve dostupne opticke uredjaje na mobitelu
            const uredjaji = await navigator.mediaDevices.enumerateDevices();
            this.straznjeKamere = uredjaji.filter(u => u.kind === 'videoinput');
            
            // Pokretanje prve straznje lece s popisa
            await this.pokreniSpecificnuLecu();
        } catch (error) {
            status.innerText = "Greska pri inicijalizaciji leca: " + error.message;
        }
    },

    async pokreniSpecificnuLecu() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');

        if (this.stream) {
            this.stream.getTracks().forEach(t => track.stop());
        }

        let opcijeVidea = { facingMode: "environment" };

        // Ako mobitel ima vise straznjih leca (glavna, širokokutna, macro), gadjamo tocan ID
        if (this.straznjeKamere.length > 0) {
            let ciljanaLeca = this.straznjeKamere[this.trenutniIndeksLece];
            opcijeVidea = { 
                deviceId: { exact: ciljanaLeca.deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            };
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: opcijeVidea });
            video.srcObject = this.stream;
            
            let nazivLece = this.straznjeKamere[this.trenutniIndeksLece]?.label || `Leca ${this.trenutniIndeksLece + 1}`;
            status.innerText = `Skeniranje aktivno [${nazivLece}]. Uperite u papir...`;
            
            ArucoModul.otpocniDetekciju();
        } catch (err) {
            // Fallback ako exact ID ne dopusta rezoluciju
            this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = this.stream;
            status.innerText = "Aktivna zamjenska leca...";
            ArucoModul.otpocniDetekciju();
        }
    },

    // Funkcija koja se izvrsava na pritisak novog gumba na ekranu
    async ciklirajLecu() {
        if (this.straznjeKamere.length <= 1) {
            alert("Vas mobitel prijavljuje samo jednu straznju lecu unutar web preglednika.");
            return;
        }

        // Pomakni indeks na iducu lecu (0.5x širokokutna)
        this.trenutniIndeksLece = (this.trenutniIndeksLece + 1) % this.straznjeKamere.length;
        await this.pokreniSpecificnuLecu();
    },

    zaustavi() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        ArucoModul.aktivan = false;
        App.promijeniZaslon('zaslon-izbornik');
    },

    uhvatiMjere() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        ArucoModul.aktivan = false;
        App.promijeniZaslon('zaslon-radni');
    }
};

const Kamera = {
    stream: null,

    async pokreni() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');
        
        try {
            // Zahtjev za aktivaciju stražnje kamere (environment) s maksimalnom preciznošću
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            video.srcObject = this.stream;
            status.innerText = "Kamera aktivna. Postavite ArUco marker u kadar...";
            
            // Pokretanje ArUco skeniranja u idućem koraku petlje
            ArucoModul.otpočniDetekciju();
        } catch (error) {
            console.warn("Nema stražnje kamere, prebacujem na standardnu...", error);
            // Fallback ako se testira preko laptopa/prednje kamere
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = this.stream;
        }
    },

    zaustavi() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        ArucoModul.aktivan = false;
        App.promijeniZaslon('zaslon-izbornik');
    },

    uhvatiMjere() {
        // Kada prepozna marker, povlači automatske mjere i šalje ih u matematiku
        this.zaustavi();
        App.promijeniZaslon('zaslon-radni');
    }
};

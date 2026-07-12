const Kamera = {
    stream: null,

    async pokreni() {
        const video = document.getElementById('web-kamera');
        const status = document.getElementById('kamera-status');
        
        try {
            // Maknut "exact" - idealno rjesenje za mnostvo straznjih leca na novim mobitelima
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: "environment", 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 } 
                }
            });
            video.srcObject = this.stream;
            status.innerText = "Straznja kamera aktivna. Uperite u crni kvadrat...";
            
            ArucoModul.otpocniDetekciju();
        } catch (error) {
            try {
                // Rezervni pokusaj ako je operativni sustav mobitela restriktivan
                this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                video.srcObject = this.stream;
                status.innerText = "Straznja kamera aktivna (osnovni mod)...";
                ArucoModul.otpocniDetekciju();
            } catch (err2) {
                alert("Problem s kamerom: " + err2.message);
            }
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
        this.zaustavi();
        App.promijeniZaslon('zaslon-radni');
    }
};

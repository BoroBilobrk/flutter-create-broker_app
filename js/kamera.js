const Kamera = {
    pokreni() {
        const status = document.getElementById('kamera-status');
        if (status) status.innerHTML = `Pokretanje Native Kamere...`;
        
        // Otkrivamo Flutter kameru ispod HTML-a (radimo web prozirnim)
        document.body.style.backgroundColor = "transparent";
        document.documentElement.style.backgroundColor = "transparent";
        let zk = document.getElementById('zaslon-kamera');
        if (zk) zk.style.backgroundColor = "transparent";
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'pokreni').then(function(odgovor) {
                if (status) status.innerHTML = `Uspjeh! Nađeno leća: ${odgovor}`;
                // NAPOMENA: Obrisali smo poziv ArucoModul-a jer sada koristimo AI u radnom prostoru!
            }).catch(function(err) {
                if (status) status.innerHTML = `Greška: ${err}`;
            });
        } else {
            if (status) status.innerHTML = `Nije u Flutter okruženju!`;
        }
    },

    zaustavi() {
        // Vraćamo originalne boje aplikacije
        document.body.style.backgroundColor = "";
        document.documentElement.style.backgroundColor = "";
        let zk = document.getElementById('zaslon-kamera');
        if (zk) zk.style.backgroundColor = "";
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-izbornik');
    }
};

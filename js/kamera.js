const Kamera = {
    pokreni() {
        const status = document.getElementById('kamera-status');
        status.innerHTML = `Inicijalizacija...`;

        if (typeof window.flutter_inappwebview === 'undefined') {
            status.innerHTML = `<b style="color:red">GREŠKA: Most (InAppWebView) nije pronađen!</b>`;
            return;
        }

        status.innerHTML = `Pozivam FlutterKamera...`;
        
        window.flutter_inappwebview.callHandler('FlutterKamera', 'pokreni')
            .then(function(odgovor) {
                // Ako Flutter vrati broj leća, znamo da je veza uspjela
                status.innerHTML = `Uspjeh! Nađeno leća: ${odgovor}`;
            })
            .catch(function(err) {
                status.innerHTML = `GREŠKA: ${err}`;
            });
    },

    zaustavi() {
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-izbornik');
    }
};

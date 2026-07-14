const Kamera = {
    pokreni() {
        const status = document.getElementById('kamera-status');
        status.innerHTML = `Pokretanje Native Flutter Kamere...`;
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'pokreni').then(function(odgovor) {
                status.innerHTML = `Native Kamera Aktivna. Pronađeno fizičkih leća: <b style="color:var(--akcent-plavi)">${odgovor}</b>`;
            });
        } else {
            status.innerHTML = `<span style="color:var(--akcent-bordo)">Sustav nije u Flutter okruženju! Otvorite preko APK-a.</span>`;
        }
    },

    ciklirajLecu() {
        const status = document.getElementById('kamera-status');
        status.innerHTML = `Mijenjam Native leću...`;
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'cikliraj').then(function(odgovor) {
                status.innerHTML = `Aktivna Native Leća: <b style="color:var(--akcent-plavi)">${odgovor}</b>`;
            });
        }
    },

    zaustavi() {
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-izbornik');
    },

    uhvatiMjere() {
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-radni');
    }
};

const Kamera = {
    pokreni() {
        const status = document.getElementById('kamera-status');
        status.innerHTML = `Pokretanje Native Flutter Kamere...`;
        
        // OVO JE KLJUČNO: Skidamo crnu boju s glavnog web dokumenta da vidimo kameru ispod!
        document.body.style.backgroundColor = "transparent";
        document.documentElement.style.backgroundColor = "transparent";
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'pokreni').then(function(odgovor) {
                status.innerHTML = `Native Kamera Aktivna. Sustav vidi logičkih leća: <b style="color:var(--akcent-plavi)">${odgovor}</b>`;
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
        // Vraćamo normalnu boju pozadine iz teme kada izađemo iz kamere
        document.body.style.backgroundColor = "var(--bg-glavna)";
        document.documentElement.style.backgroundColor = "";
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-izbornik');
    },

    uhvatiMjere() {
        // Vraćamo normalnu boju pozadine iz teme
        document.body.style.backgroundColor = "var(--bg-glavna)";
        document.documentElement.style.backgroundColor = "";
        
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-radni');
    }
};

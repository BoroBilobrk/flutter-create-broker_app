const Kamera = {
    trenutnaLeca: '1x',

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
                status.innerHTML = `Uspjeh! Nađeno leća: ${odgovor}`;
            })
            .catch(function(err) {
                status.innerHTML = `GREŠKA: ${err}`;
            });
    },

    // NOVO: prebacivanje izmedju 0.5x (siroki) i 1x (standard) leca.
    // PRETPOSTAVKA KOJU TREBA PROVJERITI: native Flutter strana (folder
    // /flutter iz repoa, koji nisam vidio) mora imati handler 'FlutterKamera'
    // koji prihvaca akciju 'promijeniLecu' s parametrom '0.5x' ili '1x' i
    // vraca potvrdu naziva aktivne lece. Ako se native akcija zove drugacije,
    // promijeni string 'promijeniLecu' ovdje da odgovara.
    ciklirajLecu() {
        const status = document.getElementById('kamera-status');
        if (typeof window.flutter_inappwebview === 'undefined') {
            if (status) status.innerHTML = `<b style="color:red">GREŠKA: Most (InAppWebView) nije pronađen!</b>`;
            return;
        }

        this.trenutnaLeca = (this.trenutnaLeca === '1x') ? '0.5x' : '1x';
        if (status) status.innerHTML = `Prebacujem na ${this.trenutnaLeca} lecu...`;

        window.flutter_inappwebview.callHandler('FlutterKamera', 'promijeniLecu', this.trenutnaLeca)
            .then((odgovor) => {
                if (status) status.innerHTML = `Aktivna leca: ${odgovor || this.trenutnaLeca}`;
            })
            .catch((err) => {
                // Vrati staro stanje ako promjena nije uspjela na native strani
                this.trenutnaLeca = (this.trenutnaLeca === '1x') ? '0.5x' : '1x';
                if (status) status.innerHTML = `GREŠKA pri promjeni lece: ${err}`;
            });
    },

    // NOVO: "zakljucaj" trenutno stabilno AR ocitanje (raster + rupe) u
    // aktivni projekt. Prije ova funkcija uopce nije postojala iako ju je
    // index.html vec pozivao na dugme "ZAKLJUČAJ RASTER I RUPE".
    uhvatiMjere() {
        const status = document.getElementById('kamera-status');
        const rezultat = ArucoModul.zakljucajMjere();

        if (!rezultat.uspjeh) {
            if (status) { status.innerHTML = `⚠️ ${rezultat.poruka}`; status.style.color = "#FFA500"; }
            return;
        }

        const elW = document.getElementById('input-zid-w');
        const elH = document.getElementById('input-zid-h');
        if (elW) elW.value = rezultat.w;
        if (elH) elH.value = rezultat.h;

        // PRETPOSTAVKA KOJU TREBA PROVJERITI: App.sacuvajPoljaUObjekt() i
        // App.promijeniZaslon() postoje u app.js (nisam ga vidio) - koriste se
        // ovdje na isti nacin kao sto ih vec pozivaju index.html i matematika.js.
        if (typeof App !== 'undefined' && App.sacuvajPoljaUObjekt) App.sacuvajPoljaUObjekt();
        if (typeof MatematikaEngine !== 'undefined' && typeof App !== 'undefined' && App.projektObjekt) {
            MatematikaEngine.osvjeziIzObjekta(App.projektObjekt.povrsine[App.aktivnaPovrsinaKey || 'zid1']);
        }

        if (status) {
            status.innerHTML = `✅ Zakljucano: ${rezultat.w}x${rezultat.h}cm, ${rezultat.brojRupa} otvora`;
            status.style.color = "#4EFA9E";
        }

        // Ugasi AR petlju i native kameru, ali vrati na RADNI zaslon (ne na
        // izbornik) jer korisnik nastavlja uredjivati taj isti zid.
        ArucoModul.aktivan = false;
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-radni');
    },

    zaustavi() {
        ArucoModul.aktivan = false;
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterKamera', 'ugasi');
        }
        App.promijeniZaslon('zaslon-izbornik');
    }
};

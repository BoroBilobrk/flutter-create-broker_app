const BazaModul = {
    KLJUČ_BAZE: 'BROKER_PROJEKTI',

    // SPREMANJE TRENUTNOG PROJEKTA
    spasiProjekt(imeKlijenta, prostorija, sirinaZida, visinaZida, otvori, zone) {
        let sviProjekti = this.dohvatiSveProjekte();
        
        const noviProjekt = {
            id: imeKlijenta.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now(),
            klijent: imeKlijenta,
            prostorija: prostorija,
            sirinaZida: sirinaZida,
            visinaZida: visinaZida,
            popisOtvora: otvori,
            zone: zone,
            datum: new Date().toLocaleDateString('hr-HR')
        };

        // Ako projekt s istim ID-om već postoji, prebriši ga (Update), inače dodaj novi
        const indeks = sviProjekti.findIndex(p => p.klijent === imeKlijenta && p.prostorija === prostorija);
        if (indeks !== -1) {
            sviProjekti[indeks] = noviProjekt;
        } else {
            sviProjekti.push(noviProjekt);
        }

        localStorage.setItem(this.KLJUČ_BAZE, JSON.stringify(sviProjekti));
        console.log("Projekt uspješno spremljen u memoriju mobitela.");
    },

    // DOHVAĆANJE SVIH SPREMLJENIH KLIJENATA
    dohvatiSveProjekte() {
        const podaci = localStorage.getItem(this.KLJUČ_BAZE);
        return podaci ? JSON.parse(podaci) : [];
    },

    // BRISANJE PROJEKTA IZ MEMORIJE
    izbrisiProjekt(idProjekta) {
        let sviProjekti = this.dohvatiSveProjekte();
        sviProjekti = sviProjekti.filter(p => p.id !== idProjekta);
        localStorage.setItem(this.KLJUČ_BAZE, JSON.stringify(sviProjekti));
    }
};

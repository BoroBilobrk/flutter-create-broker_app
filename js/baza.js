const BazaModul = {
    KLJUC_BAZE: 'BROKER_PROJEKTI',

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

        const indeks = sviProjekti.findIndex(p => p.klijent === imeKlijenta && p.prostorija === prostorija);
        if (indeks !== -1) {
            sviProjekti[indeks] = noviProjekt;
        } else {
            sviProjekti.push(noviProjekt);
        }

        localStorage.setItem(this.KLJUC_BAZE, JSON.stringify(sviProjekti));
        console.log("Projekt uspjesno spremljen.");
    },

    dohvatiSveProjekte() {
        const podaci = localStorage.getItem(this.KLJUC_BAZE);
        return podaci ? JSON.parse(podaci) : [];
    },

    izbrisiProjekt(idProjekta) {
        let sviProjekti = this.dohvatiSveProjekte();
        sviProjekti = sviProjekti.filter(p => p.id !== idProjekta);
        localStorage.setItem(this.KLJUC_BAZE, JSON.stringify(sviProjekti));
    }
};

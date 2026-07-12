const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        if (!projekt) return;
        const p = projekt.povrsine || projekt.povrsines;
        if (!p) { alert("Greska pri citanju kupaonice."); return; }

        let qZid1 = p.zid1.kvadratura || ((p.zid1.w * p.zid1.h) / 10000) || 0;
        let qZid2 = p.zid2.kvadratura || ((p.zid2.w * p.zid2.h) / 10000) || 0;
        let qZid3 = p.zid3.kvadratura || ((p.zid3.w * p.zid3.h) / 10000) || 0;
        let qZid4 = p.zid4.kvadratura || ((p.zid4.w * p.zid4.h) / 10000) || 0;

        let fmtZidW = p.zid1.plocicaW || 60;
        let fmtZidH = p.zid1.plocicaH || 30;
        let fgZid = p.zid1.fuga || 2;

        let cZid1 = p.zid1.izracunCijelih || Math.ceil(qZid1 / ((fmtZidW * fmtZidH) / 10000)) || 0;
        let cZid2 = p.zid2.izracunCijelih || Math.ceil(qZid2 / ((fmtZidW * fmtZidH) / 10000)) || 0;
        let cZid3 = p.zid3.izracunCijelih || Math.ceil(qZid3 / ((fmtZidW * fmtZidH) / 10000)) || 0;
        let cZid4 = p.zid4.izracunCijelih || Math.ceil(qZid4 / ((fmtZidW * fmtZidH) / 10000)) || 0;

        let m2Zidovi = qZid1 + qZid2 + qZid3 + qZid4;
        let komZidovi = cZid1 + cZid2 + cZid3 + cZid4;

        let m2Pod = p.pod.kvadratura || ((p.pod.w * p.pod.h) / 10000) || 0;
        let komPod = p.pod.izracunCijelih || Math.ceil(m2Pod / (((p.pod.plocicaW || 60) * (p.pod.plocicaH || 60)) / 10000)) || 0;

        let opseg = (p.zid1.w || 240) + (p.zid2.w || 200) + (p.zid3.w || 240) + (p.zid4.w || 200);
        let duzinaSokla = p.sokl.h || opseg; 
        let komSokla = p.sokl.izracunCijelih || Math.ceil(duzinaSokla / (p.sokl.plocicaW || 60)) || 0;

        const stariPrikaz = document.getElementById('print-overlay');
        if (stariPrikaz) stariPrikaz.remove();

        const overlay = document.createElement('div');
        overlay.id = 'print-overlay';
        overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.backgroundColor = '#FFFFFF'; overlay.style.color = '#1A1D20';
        overlay.style.zIndex = '999999'; overlay.style.overflowY = 'auto';
        overlay.style.padding = '24px'; overlay.style.boxSizing = 'border-box';

        overlay.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #print-overlay, #print-overlay * { visibility: visible; }
                    #print-overlay { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 0; }
                    .no-print { display: none !important; }
                }
            </style>
            <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:30px; background:#111417; padding:12px; margin:-24px -24px 24px -24px;">
                <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px 20px; font-weight:bold; font-size:11px; letter-spacing:1px; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PRINT / PDF</button>
                <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px 20px; font-weight:bold; font-size:11px; letter-spacing:1px; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2C3236; padding-bottom: 15px;">
                <div style="font-weight: bold; font-size: 26px; letter-spacing: 2px; color: #2C3236;">BRO-KER</div>
                <div style="text-transform:uppercase; font-size:11px; font-weight:bold; color:#8A959E; text-align:right;">Zbirna Specifikacija</div>
            </div>
            <div style="margin: 24px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236; font-size:13px; line-height:1.6; color:#333;">
                <strong>PROJEKTNI NALOG: ${projekt.prostorija.toUpperCase()}</strong><br>
                Klijent: ${projekt.klijent}<br>
                Sustav: BRO-KER Multi-Surface CAD
            </div>
            <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px;">1. SPECIFIKACIJA ZIDOVA (Keramika: ${fmtZidW}x${fmtZidH} cm)</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
                <thead>
                    <tr style="background:#2C3236; color:#FFFFFF;"><th style="padding:10px; text-align:left;">Povrsina</th><th style="padding:10px; text-align:left;">Kvadratura</th><th style="padding:10px; text-align:left;">Kolicina</th></tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 1 (Glavni)</td><td style="padding:10px;">${qZid1.toFixed(2)} m2</td><td style="padding:10px;">${cZid1} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 2 (Desni)</td><td style="padding:10px;">${qZid2.toFixed(2)} m2</td><td style="padding:10px;">${cZid2} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 3 (Straznji)</td><td style="padding:10px;">${qZid3.toFixed(2)} m2</td><td style="padding:10px;">${cZid3} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 4 (Lijevi)</td><td style="padding:10px;">${qZid4.toFixed(2)} m2</td><td style="padding:10px;">${cZid4} kom</td></tr>
                    <tr style="background:#EAEDEF; font-weight:bold;"><td style="padding:10px;">UKUPNO ZIDOVI</td><td style="padding:10px;">${m2Zidovi.toFixed(2)} m2</td><td style="padding:10px;">${komZidovi} kom</td></tr>
                </tbody>
            </table>
            <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px;">2. SPECIFIKACIJA PODA I SOKLA</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
                <tbody>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Podna povrsina (Neto)</td><td style="padding:10px;">${m2Pod.toFixed(2)} m2 (${komPod} kom)</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Sokl (Linearni metri)</td><td style="padding:10px;">${(duzinaSokla/100).toFixed(2)} m (${komSokla} kom)</td></tr>
                </tbody>
            </table>
        `;
        document.body.appendChild(overlay);
    }
};

const App = {
    trenutniKlijent: '',
    trenutnaProstorija: '',
    aktivnaPovrsinaKey: 'zid1',
    projektObjekt: null,

    init() {
        console.log("BRO-KER Sustav Inicijaliziran.");
        this.osvjeziListuSpremljenihProjekata();
    },

    promijeniZaslon(idZaslona) {
        // Sakrij sve standardne zaslone
        document.querySelectorAll('.zaslon').forEach(z => z.style.display = 'none');
        
        const camSection = document.getElementById('zaslon-kamera');
        
        if (idZaslona === 'zaslon-kamera') {
            if (camSection) camSection.style.display = 'block';
            document.getElementById('naslov-prikaza').innerText = "Skeniranje prostora";
            Kamera.pokreni();
        } else {
            if (camSection) camSection.style.display = 'none';
            const cilj = document.getElementById(idZaslona);
            if (cilj) cilj.style.display = 'block';
            
            if (idZaslona === 'zaslon-radni') {
                document.getElementById('naslov-prikaza').innerText = `${this.trenutniKlijent} - Rad`;
                this.ucitajPovrsinuUUrednik();
            } else if (idZaslona === 'zaslon-izbornik') {
                document.getElementById('naslov-prikaza').innerText = "Glavni Izbornik";
                this.osvjeziListuSpremljenihProjekata();
            }
        }
    },

    kreirajNoviProjekt(modRada) {
        const klijentInput = document.getElementById('input-klijent').value.trim();
        const prostorijaInput = document.getElementById('input-prostorija').value.trim();

        if (klijentInput === "" || prostorijaInput === "") {
            alert("Molimo unesite ime klijenta i prostoriju.");
            return;
        }

        const initW = parseFloat(document.getElementById('init-plocica-w').value) || 120;
        const initH = parseFloat(document.getElementById('init-plocica-h').value) || 60;
        const initF = parseFloat(document.getElementById('init-fuga').value) || 2;

        this.trenutniKlijent = klijentInput;
        this.trenutnaProstorija = prostorijaInput;
        this.aktivnaPovrsinaKey = 'zid1';
        document.getElementById('odabir-povrsine').value = 'zid1';

        this.projektObjekt = {
            klijent: klijentInput,
            prostorija: prostorijaInput,
            povrsine: {
                zid1: { tip: 'Zid', w: 243, h: 265, popisOtvora: [], hZona: false, vZona: false, plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid2: { tip: 'Zid', w: 200, h: 265, popisOtvora: [], hZona: false, vZona: false, plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid3: { tip: 'Zid', w: 243, h: 265, popisOtvora: [], hZona: false, vZona: false, plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid4: { tip: 'Zid', w: 200, h: 265, popisOtvora: [], hZona: false, vZona: false, plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                pod:  { tip: 'Pod',  w: 243, h: 200, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   popisOtvora: [], plocicaW: initW, plocicaH: 8,  fuga: initF, odmakX: 0 }
            }
        };

        if (modRada === 'kamera') { this.promijeniZaslon('zaslon-kamera'); } 
        else { this.promijeniZaslon('zaslon-radni'); }
    },

    promijeniAktivnuPovrsinu(kljuc) {
        this.sacuvajPoljaUObjekt();
        this.aktivnaPovrsinaKey = kljuc;
        this.ucitajPovrsinuUUrednik();
    },

    ucitajPovrsinuUUrednik() {
        if (!this.projektObjekt) return;
        let komponente = this.projektObjekt.povrsine || this.projektObjekt.povrsines;
        const p = komponente[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        document.getElementById('input-zid-w').value = p.w;
        document.getElementById('input-plocica-w').value = p.plocicaW || 120;
        document.getElementById('input-plocica-h').value = p.plocicaH || 60;
        document.getElementById('input-fuga').value = p.fuga || 2;

        const sekcijaZona = document.getElementById('sekcija-zona');
        const sekcijaFormat = document.getElementById('sekcija-format-plocice');
        const sekcijaPomicanje = document.getElementById('sekcija-pomicanje-rastera');
        const gumbOtvor = document.getElementById('gumb-dodaj-otvor');

        if (p.tip === 'Zid') {
            document.getElementById('input-zid-h').value = p.h;
            if (sekcijaZona) sekcijaZona.style.display = 'grid';
            if (sekcijaFormat) sekcijaFormat.style.display = 'flex';
            if (sekcijaPomicanje) sekcijaPomicanje.style.display = 'flex';
            if (gumbOtvor) gumbOtvor.innerText = "➕ DODAJ OTVOR / KRUNU MANUELNO";
            document.getElementById('check-visina').checked = p.hZona || false;
            document.getElementById('check-tus').checked = p.vZona || false;
        } else {
            if (sekcijaZona) sekcijaZona.style.display = 'none';
        }
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    sacuvajPoljaUObjekt() {
        if (!this.projektObjekt) return;
        let komponente = this.projektObjekt.povrsine || this.projektObjekt.povrsines;
        const p = komponente[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        p.h = parseFloat(document.getElementById('input-zid-h').value) || 0;
        p.plocicaW = parseFloat(document.getElementById('input-plocica-w').value) || 120;
        p.plocicaH = parseFloat(document.getElementById('input-plocica-h').value) || 60;
        p.fuga = parseFloat(document.getElementById('input-fuga').value) || 2;

        MatematikaEngine.osvjeziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        let komponente = this.projektObjekt.povrsine || this.projektObjekt.povrsines;
        this.projektObjekt.povrsine = komponente;

        BazaModul.spasiProjekt(this.trenutniKlijent, this.trenutnaProstorija, komponente.zid1.w, komponente.zid1.h, komponente.zid1.popisOtvora, this.projektObjekt);
        localStorage.setItem('BROKER_COMP_' + this.trenutniKlijent, JSON.stringify(this.projektObjekt));
        alert("Kompletna kupaonica spremljena!");
    },

    ucitajProjektIzBaze(idProjekta) {
        const projekti = BazaModul.dohvatiSveProjekte();
        const staro = projekti.find(proj => proj.id === idProjekta);
        if (staro) {
            this.trenutniKlijent = staro.klijent; this.trenutnaProstorija = staro.prostorija;
            let napredni = localStorage.getItem('BROKER_COMP_' + staro.klijent);
            if (napredni) {
                this.projektObjekt = JSON.parse(napredni);
                if (this.projektObjekt.povrsines && !this.projektObjekt.povrsine) this.projektObjekt.povrsine = this.projektObjekt.povrsines;
            }
            this.aktivnaPovrsinaKey = 'zid1';
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const el = document.getElementById('lista-projekata'); if (!el) return;
        const projekti = BazaModul.dohvatiSveProjekte(); el.innerHTML = '';
        projekti.forEach(p => {
            const kartica = document.createElement('div'); kartica.className = 'alat-kartica';
            kartica.innerHTML = `<div onclick="App.ucitajProjektIzBaze('${p.id}')" style="cursor:pointer;text-align:left;"><div style="font-weight:bold;color:#FFF;">${p.klijent}</div><div style="font-size:11px;color:#8C9BA5;">${p.prostorija}</div></div>`;
            el.appendChild(kartica);
        });
    },

    otvoriDokumentaciju() {
        this.sacuvajPoljaUObjekt();
        DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt);
    }
};
window.onload = () => App.init();
                

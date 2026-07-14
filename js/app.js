/* ==========================================================================
   BRO-KER ENTERPRISE SYSTEM ENGINE
   ========================================================================== */

const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        if (!projekt) return;
        const p = App.osvjeziSveKvadraturneProracune(projekt);
        if (!p) { alert("Greska pri ucitavanju."); return; }

        let htmlZidovi = '';
        if (projekt.konfiguracija.zidovi) {
            let m2Zidovi = (p.zid1.kvadratura||0) + (p.zid2.kvadratura||0) + (p.zid3.kvadratura||0) + (p.zid4.kvadratura||0);
            let komZidovi = (p.zid1.izracunCijelih||0) + (p.zid2.izracunCijelih||0) + (p.zid3.izracunCijelih||0) + (p.zid4.izracunCijelih||0);
            let fmtW = p.zid1.plocicaW || 120; let fmtH = p.zid1.plocicaH || 60; let f = p.zid1.fuga || 2;
            
            htmlZidovi = `
                <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px; color:#1A1D20;">1. SPECIFIKACIJA ZIDOVA (Format: ${fmtW}x${fmtH} cm | Fuga: ${f} mm)</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; color:#1A1D20;">
                    <thead>
                        <tr style="background:#2C3236; color:#FFFFFF;"><th style="padding:10px; text-align:left;">Površina</th><th style="padding:10px; text-align:left;">Neto kvadratura</th><th style="padding:10px; text-align:left;">Naručiti (kom)</th></tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 1 (Glavni)</td><td style="padding:10px;">${(p.zid1.kvadratura||0).toFixed(2)} m2</td><td style="padding:10px;">${p.zid1.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 2 (Desni)</td><td style="padding:10px;">${(p.zid2.kvadratura||0).toFixed(2)} m2</td><td style="padding:10px;">${p.zid2.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 3 (Stražnji)</td><td style="padding:10px;">${(p.zid3.kvadratura||0).toFixed(2)} m2</td><td style="padding:10px;">${p.zid3.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 4 (Lijevi)</td><td style="padding:10px;">${(p.zid4.kvadratura||0).toFixed(2)} m2</td><td style="padding:10px;">${p.zid4.izracunCijelih||0}</td></tr>
                        <tr style="background:#EAEDEF; font-weight:bold;"><td style="padding:10px;">UKUPNO ZIDOVI</td><td style="padding:10px;">${m2Zidovi.toFixed(2)} m2</td><td style="padding:10px;">${komZidovi}</td></tr>
                    </tbody>
                </table>
            `;
        }

        let htmlPod = '';
        if (projekt.konfiguracija.pod || projekt.konfiguracija.sokl) {
            htmlPod = `<h3 style="font-size:13px; text-transform:uppercase; margin-top:30px; color:#1A1D20;">2. SPECIFIKACIJA PODA I SOKLA</h3>
                       <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; color:#1A1D20;"><tbody>`;
            if (projekt.konfiguracija.pod) {
                htmlPod += `<tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Pod (Format: ${p.pod.plocicaW}x${p.pod.plocicaH} cm)</td><td style="padding:10px;">${(p.pod.kvadratura||0).toFixed(2)} m2 (${p.pod.izracunCijelih||0} kom)</td></tr>`;
            }
            if (projekt.konfiguracija.sokl) {
                htmlPod += `<tr><td style="padding:10px;">Sokl / Cokl (Linearni opseg)</td><td style="padding:10px;">${((p.sokl.h||0)/100).toFixed(2)} m (${p.sokl.izracunCijelih||0} kom)</td></tr>`;
            }
            htmlPod += `</tbody></table>`;
        }

        const stariPrikaz = document.getElementById('print-overlay');
        if (stariPrikaz) stariPrikaz.remove();

        const overlay = document.createElement('div');
        overlay.id = 'print-overlay';
        overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.backgroundColor = '#FFFFFF'; overlay.style.color = '#1A1D20';
        overlay.style.zIndex = '99999999'; overlay.style.overflowY = 'auto';
        overlay.style.padding = '24px'; overlay.style.boxSizing = 'border-box';

        // POPRAVAK ZA PDF (Uklanja prazan papir)
        overlay.innerHTML = `
            <style>
                @media print {
                    /* Nasilno gasimo apsolutno sve osim ovog overlay-a da spriječimo prijelom na drugu stranicu */
                    body > *:not(#print-overlay) { display: none !important; }
                    #print-overlay { 
                        display: block !important; 
                        position: relative !important; 
                        width: 100% !important; 
                        height: auto !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        overflow: visible !important;
                    }
                    .no-print { display: none !important; }
                    @page { margin: 1cm; }
                }
            </style>
            <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:30px; background:#111417; padding:12px; margin:-24px -24px 24px -24px;">
                <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px 20px; font-weight:bold; font-size:11px; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PDF</button>
                <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px 20px; font-weight:bold; font-size:11px; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2C3236; padding-bottom: 15px;">
                <div style="font-weight: bold; font-size: 26px; letter-spacing: 2px; color: #2C3236;">BRO-KER</div>
                <div style="text-transform:uppercase; font-size:11px; font-weight:bold; color:#8A959E; text-align:right;">Tehnička Specifikacija</div>
            </div>
            <div style="margin: 24px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236; font-size:13px; line-height:1.6; color:#1A1D20;">
                <strong>KLIJENT / PROJEKT: ${projekt.klijent.toUpperCase()}</strong><br>
                Prostorija: ${projekt.prostorija}<br>
                Datum proračuna: ${new Date().toLocaleDateString('hr-HR')}<br>
                Engine: BRO-KER CAD
            </div>
            ${htmlZidovi}
            ${htmlPod}
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
        const spremljenaTema = localStorage.getItem('BROKER_PREFERIRANA_TEMA') || 'stealth';
        this.promijeniTemu(spremljenaTema);
        this.promijeniZaslon('zaslon-izbornik');
    },

    promijeniTemu(nazivTeme) {
        document.body.classList.remove('theme-stealth', 'theme-architect', 'theme-hud');
        document.body.classList.add('theme-' + nazivTeme);
        localStorage.setItem('BROKER_PREFERIRANA_TEMA', nazivTeme);
        const selektor = document.getElementById('odabir-teme');
        if (selektor) selektor.value = nazivTeme;
    },

    promijeniZaslon(idZaslona) {
        document.querySelectorAll('.zaslon').forEach(z => z.style.setProperty('display', 'none', 'important'));
        const camSection = document.getElementById('zaslon-kamera');
        const header = document.getElementById('glavno-zaglavlje');
        
        if (idZaslona === 'zaslon-kamera') {
            if (camSection) camSection.style.setProperty('display', 'block', 'important');
            if (header) header.style.setProperty('display', 'none', 'important');
            Kamera.pokreni();
        } else {
            if (camSection) camSection.style.setProperty('display', 'none', 'important');
            if (header) header.style.setProperty('display', 'flex', 'important');
            
            const cilj = document.getElementById(idZaslona);
            if (cilj) cilj.style.setProperty('display', 'block', 'important');
            
            if (idZaslona === 'zaslon-radni') {
                document.getElementById('naslov-prikaza').innerText = `${this.trenutniKlijent} - ${this.trenutnaProstorija}`;
                this.osvjeziDropdownPovrsina();
                this.ucitajPovrsinuUUrednik();
            } else if (idZaslona === 'zaslon-izbornik') {
                document.getElementById('naslov-prikaza').innerText = "Glavni Izbornik";
                this.osvjeziListuSpremljenihProjekata();
            }
        }
    },

    osvjeziDropdownPovrsina() {
        const select = document.getElementById('odabir-povrsine');
        if (!select || !this.projektObjekt || !this.projektObjekt.konfiguracija) return;
        
        select.innerHTML = '';
        const conf = this.projektObjekt.konfiguracija;
        
        if (conf.zidovi) {
            select.innerHTML += `<option value="zid1">ZID 1 (Prednji / Glavni)</option>
                                 <option value="zid2">ZID 2 (Desni)</option>
                                 <option value="zid3">ZID 3 (Stražnji)</option>
                                 <option value="zid4">ZID 4 (Lijevi)</option>`;
        }
        if (conf.pod) {
            select.innerHTML += `<option value="pod">POD KUPAONICE</option>`;
        }
        if (conf.sokl) {
            select.innerHTML += `<option value="sokl">SOKL / RUBNI REZOVI</option>`;
        }
        
        const opcije = Array.from(select.options).map(o => o.value);
        if (!opcije.includes(this.aktivnaPovrsinaKey) && opcije.length > 0) {
            this.aktivnaPovrsinaKey = opcije[0];
        }
        select.value = this.aktivnaPovrsinaKey;
    },

    kreirajNoviProjekt(modRada) {
        const klijentInput = document.getElementById('input-klijent').value.trim();
        const prostorijaInput = document.getElementById('input-prostorija').value.trim();

        if (klijentInput === "" || prostorijaInput === "") {
            alert("Unesite klijenta i prostoriju."); return;
        }

        const hZidovi = document.getElementById('conf-zidovi').checked;
        const hPod = document.getElementById('conf-pod').checked;
        const hSokl = document.getElementById('conf-sokl').checked;
        
        if (!hZidovi && !hPod && !hSokl) {
            alert("Morate odabrati barem jedan opseg radova (Zid, Pod ili Cokl)."); return;
        }

        const initW = parseFloat(document.getElementById('init-plocica-w').value) || 120;
        const initH = parseFloat(document.getElementById('init-plocica-h').value) || 60;
        const initF = parseFloat(document.getElementById('init-fuga').value) || 2;

        this.trenutniKlijent = klijentInput;
        this.trenutnaProstorija = prostorijaInput;
        this.aktivnaPovrsinaKey = hZidovi ? 'zid1' : (hPod ? 'pod' : 'sokl');

        this.projektObjekt = {
            klijent: klijentInput,
            prostorija: prostorijaInput,
            konfiguracija: { zidovi: hZidovi, pod: hPod, sokl: hSokl },
            povrsine: {
                zid1: { tip: 'Zid', w: 240, h: 265, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid2: { tip: 'Zid', w: 200, h: 265, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid3: { tip: 'Zid', w: 240, h: 265, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                zid4: { tip: 'Zid', w: 200, h: 265, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
                pod:  { tip: 'Pod',  w: 240, h: 200, popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0 },
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
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        document.getElementById('input-zid-w').value = p.w;
        document.getElementById('input-plocica-w').value = p.plocicaW || 120;
        document.getElementById('input-plocica-h').value = p.plocicaH || 60;
        document.getElementById('input-fuga').value = p.fuga || 2;

        const sekcijaFormat = document.getElementById('sekcija-format-plocice');
        const gumbOtvor = document.getElementById('gumb-dodaj-otvor');

        if (p.tip === 'Zid') {
            document.getElementById('input-zid-h').value = p.h;
            if (sekcijaFormat) sekcijaFormat.style.display = 'flex';
            if (gumbOtvor) gumbOtvor.innerText = "➕ DODAJ OTVOR MANUELNO";
        }
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    sacuvajPoljaUObjekt() {
        if (!this.projektObjekt) return;
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        p.h = parseFloat(document.getElementById('input-zid-h').value) || 0;
        
        let tekuciW = parseFloat(document.getElementById('input-plocica-w').value) || 120;
        let tekuciH = parseFloat(document.getElementById('input-plocica-h').value) || 60;
        let tekuciF = parseFloat(document.getElementById('input-fuga').value) || 2;

        Object.keys(this.projektObjekt.povrsine).forEach(key => {
            this.projektObjekt.povrsine[key].plocicaW = tekuciW;
            this.projektObjekt.povrsine[key].plocicaH = tekuciH;
            this.projektObjekt.povrsine[key].fuga = tekuciF;
        });

        if (this.aktivnaPovrsinaKey === 'zid1') {
            this.projektObjekt.povrsine.zid3.w = p.w; this.projektObjekt.povrsine.zid3.h = p.h; this.projektObjekt.povrsine.pod.w = p.w;
            this.projektObjekt.povrsine.zid2.h = p.h; this.projektObjekt.povrsine.zid4.h = p.h;
        }
        if (this.aktivnaPovrsinaKey === 'zid2') {
            this.projektObjekt.povrsine.zid4.w = p.w; this.projektObjekt.povrsine.zid4.h = p.h; this.projektObjekt.povrsine.pod.h = p.w;
        }

        Object.keys(this.projektObjekt.povrsine).forEach(key => {
            MatematikaEngine.pokreniTihiZbirniProracun(this.projektObjekt.povrsine[key]);
        });
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        let jedinstveniKljuc = 'BROKER_COMP_' + this.trenutniKlijent + '_' + this.trenutnaProstorija;
        localStorage.setItem(jedinstveniKljuc, JSON.stringify(this.projektObjekt));
        BazaModul.spasiProjekt(this.trenutniKlijent, this.trenutnaProstorija, this.projektObjekt.povrsine.zid1.w, this.projektObjekt.povrsine.zid1.h, this.projektObjekt.povrsine.zid1.popisOtvora, this.projektObjekt);
        alert("Projektna soba je spremljena!");
    },

    ucitajProjektIzBaze(idProjekta) {
        const projekti = BazaModul.dohvatiSveProjekte();
        const staro = projekti.find(proj => proj.id === idProjekta);
        if (staro) {
            this.trenutniKlijent = staro.klijent; this.trenutnaProstorija = staro.prostorija;
            let jedinstveniKljuc = 'BROKER_COMP_' + staro.klijent + '_' + staro.prostorija;
            let napredni = localStorage.getItem(jedinstveniKljuc);
            
            if (napredni) {
                this.projektObjekt = JSON.parse(napredni);
                if(!this.projektObjekt.konfiguracija) {
                    this.projektObjekt.konfiguracija = { zidovi: true, pod: true, sokl: true };
                }
            }
            this.aktivnaPovrsinaKey = this.projektObjekt.konfiguracija.zidovi ? 'zid1' : (this.projektObjekt.konfiguracija.pod ? 'pod' : 'sokl');
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const el = document.getElementById('lista-projekata'); if (!el) return;
        const projekti = BazaModul.dohvatiSveProjekte(); 
        el.innerHTML = '';
        
        const klijentiGrupe = {};
        projekti.forEach(p => {
            if(!klijentiGrupe[p.klijent]) klijentiGrupe[p.klijent] = [];
            klijentiGrupe[p.klijent].push(p);
        });

        Object.keys(klijentiGrupe).forEach(klijentIme => {
            const grupaDiv = document.createElement('div');
            grupaDiv.style.marginBottom = '20px';
            grupaDiv.innerHTML = `<div style="font-size:11px; font-weight:800; color:var(--tekst-sporedni); margin-bottom:8px; border-bottom:1px solid var(--boja-okvira); padding-bottom:4px; text-transform:uppercase; letter-spacing:1px;">🏢 KLIJENT: ${klijentIme}</div>`;
            
            klijentiGrupe[klijentIme].forEach(p => {
                const kartica = document.createElement('div'); 
                kartica.className = 'alat-kartica';
                kartica.style.marginBottom = '8px';
                kartica.style.padding = '12px 16px';
                kartica.innerHTML = `
                <div onclick="App.ucitajProjektIzBaze('${p.id}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:bold; color:var(--akcent-plavi); font-size:12px;">🚪 ${p.prostorija}</div>
                    <div style="font-size:18px; color:var(--tekst-sporedni); font-weight:bold;">›</div>
                </div>`;
                grupaDiv.appendChild(kartica);
            });
            el.appendChild(grupaDiv);
        });
    },

    osvjeziSveKvadraturneProracune(proj) {
        Object.keys(proj.povrsine).forEach(k => MatematikaEngine.pokreniTihiZbirniProracun(proj.povrsine[k]));
        return proj.povrsine;
    },

    otvoriDokumentaciju() {
        this.sacuvajPoljaUObjekt();
        DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt);
    }
};
window.onload = () => App.init();
                                                                                           

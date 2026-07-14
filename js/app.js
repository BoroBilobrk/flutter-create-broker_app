const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        if (!projekt) return;
        const p = App.osvjeziSveKvadraturneProracune(projekt);
        if (!p) { alert("Greska pri ucitavanju."); return; }

        let htmlZidovi = '';
        if (projekt.konfiguracija.zidovi) {
            let m2Zidovi = (p.zid1.kvadratura||0) + (p.zid2.kvadratura||0) + (p.zid3.kvadratura||0) + (p.zid4.kvadratura||0);
            let komZidovi = (p.zid1.izracunCijelih||0) + (p.zid2.izracunCijelih||0) + (p.zid3.izracunCijelih||0) + (p.zid4.izracunCijelih||0);
            
            htmlZidovi = `
                <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px;">1. SPECIFIKACIJA ZIDOVA</h3>
                <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
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
            htmlPod = `<h3 style="font-size:13px; text-transform:uppercase; margin-top:30px;">2. SPECIFIKACIJA PODA I SOKLA</h3>
                       <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;"><tbody>`;
            if (projekt.konfiguracija.pod) {
                htmlPod += `<tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Pod kupaonice</td><td style="padding:10px;">${(p.pod.kvadratura||0).toFixed(2)} m2 (${p.pod.izracunCijelih||0} kom)</td></tr>`;
            }
            if (projekt.konfiguracija.sokl) {
                htmlPod += `<tr><td style="padding:10px;">Sokl / Cokl</td><td style="padding:10px;">${((p.sokl.h||0)/100).toFixed(2)} m (${p.sokl.izracunCijelih||0} kom)</td></tr>`;
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
        overlay.style.padding = '24px';
        overlay.innerHTML = `
            <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:30px; background:#111417; padding:12px; margin:-24px -24px 24px -24px;">
                <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px; font-weight:bold; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PDF</button>
                <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px; font-weight:bold; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
            </div>
            <div style="font-weight: bold; font-size: 26px; border-bottom: 3px solid #2C3236; padding-bottom: 15px;">BRO-KER Zbirni Troškovnik</div>
            <div style="margin: 24px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236;">
                <strong>KLIJENT: ${projekt.klijent.toUpperCase()} | PROSTORIJA: ${projekt.prostorija}</strong>
            </div>
            ${htmlZidovi} ${htmlPod}
        `;
        document.body.appendChild(overlay);
    }
};

const App = {
    trenutniKlijent: '', trenutnaProstorija: '', aktivnaPovrsinaKey: 'zid1', projektObjekt: null,

    init() { this.promijeniZaslon('zaslon-izbornik'); },

    promijeniTemu(nazivTeme) {
        document.body.className = ''; document.body.classList.add('theme-' + nazivTeme);
    },

    promijeniZaslon(idZaslona) {
        document.querySelectorAll('.zaslon').forEach(z => z.style.setProperty('display', 'none', 'important'));
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
    },

    osvjeziDropdownPovrsina() {
        const select = document.getElementById('odabir-povrsine'); select.innerHTML = '';
        const conf = this.projektObjekt.konfiguracija;
        if (conf.zidovi) select.innerHTML += `<option value="zid1">ZID 1 (Glavni)</option><option value="zid2">ZID 2 (Desni)</option><option value="zid3">ZID 3 (Stražnji)</option><option value="zid4">ZID 4 (Lijevi)</option>`;
        if (conf.pod)  select.innerHTML += `<option value="pod">POD KUPAONICE</option>`;
        if (conf.sokl) select.innerHTML += `<option value="sokl">SOKL / RUBNI REZOVI</option>`;
        select.value = this.aktivnaPovrsinaKey;
    },

    kreirajNoviProjekt(modRada) {
        const klijentInput = document.getElementById('input-klijent').value.trim();
        const prostorijaInput = document.getElementById('input-prostorija').value.trim();
        if (!klijentInput || !prostorijaInput) return alert("Unesite klijenta i prostoriju.");

        const hZidovi = document.getElementById('conf-zidovi').checked;
        const hPod = document.getElementById('conf-pod').checked;
        const hSokl = document.getElementById('conf-sokl').checked;
        const initW = parseFloat(document.getElementById('init-plocica-w').value) || 120;
        const initH = parseFloat(document.getElementById('init-plocica-h').value) || 60;
        const initF = parseFloat(document.getElementById('init-fuga').value) || 2;

        this.trenutniKlijent = klijentInput; this.trenutnaProstorija = prostorijaInput;
        this.aktivnaPovrsinaKey = hZidovi ? 'zid1' : (hPod ? 'pod' : 'sokl');

        this.projektObjekt = {
            klijent: klijentInput, prostorija: prostorijaInput,
            konfiguracija: { zidovi: hZidovi, pod: hPod, sokl: hSokl },
            povrsine: {
                zid1: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 265, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null },
                zid2: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null },
                zid3: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null },
                zid4: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null },
                pod:  { tip: 'Pod',  w: 240, h: 200, visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: 8,  fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null }
            }
        };
        this.promijeniZaslon('zaslon-radni');
    },

    promijeniAktivnuPovrsinu(kljuc) {
        this.sacuvajPoljaUObjekt(); this.aktivnaPovrsinaKey = kljuc; this.ucitajPovrsinuUUrednik();
    },

    ucitajPovrsinuUUrednik() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        document.getElementById('input-zid-w').value = p.w;
        document.getElementById('input-plocica-w').value = p.plocicaW;
        document.getElementById('input-plocica-h').value = p.plocicaH;
        document.getElementById('input-fuga').value = p.fuga;
        
        document.getElementById('slider-odmak-x').value = p.odmakX || 0;
        document.getElementById('prikaz-odmaka-x').innerText = `${p.odmakX || 0} cm`;
        document.getElementById('slider-odmak-y').value = p.odmakY || 0;
        document.getElementById('prikaz-odmaka-y').innerText = `${p.odmakY || 0} cm`;

        const sekOblaganja = document.getElementById('sekcija-visina-oblaganja');
        const konVisina = document.getElementById('kontejner-visina-zida');
        const sekPodOpcije = document.getElementById('sekcija-pod-opcije');

        // Osvježavanje statusa i gumba teksture pločice
        const statusTeksture = document.getElementById('naziv-teksture-status');
        const gumbBrisi = document.getElementById('gumb-brisi-teksturu');
        
        if (p.slikaTeksture) {
            statusTeksture.innerHTML = `<b style="color:var(--akcent-zeleni);">UČITANA AKTIVNA TEKSTURA</b>`;
            gumbBrisi.style.display = 'inline-block';
        } else {
            statusTeksture.innerHTML = `Nema aktivne teksture pločice`;
            gumbBrisi.style.display = 'none';
        }

        if (p.tip === 'Zid') {
            konVisina.style.display = 'block'; sekOblaganja.style.display = 'flex'; sekPodOpcije.style.display = 'none';
            document.getElementById('input-zid-h').value = p.h;
            document.getElementById('input-oblaganje-h').value = p.visinaOblaganja;
        } else {
            konVisina.style.display = 'none'; sekOblaganja.style.display = 'none'; 
            if(p.tip === 'Pod') {
                sekPodOpcije.style.display = 'flex';
                document.getElementById('chk-rotacija').checked = p.rotacija || false;
            } else {
                sekPodOpcije.style.display = 'none';
            }
        }
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    ucitajTeksturuPlocice(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
                p.slikaTeksture = e.target.result; // Sprema b64 sliku izravno u projekt
                document.getElementById('naziv-teksture-status').innerHTML = `<b style="color:var(--akcent-zeleni);">UČITANA AKTIVNA TEKSTURA</b>`;
                document.getElementById('gumb-brisi-teksturu').style.display = 'inline-block';
                MatematikaEngine.osvjeziIzObjekta(p);
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    ukloniTeksturuPlocice() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.slikaTeksture = null;
        document.getElementById('naziv-teksture-status').innerHTML = `Nema aktivne teksture pločice`;
        document.getElementById('gumb-brisi-teksturu').style.display = 'none';
        document.getElementById('foto-tekstura').value = ''; // Reset input elementa
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    toggleRotacija(isRotated) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.rotacija = isRotated;
        this.sacuvajPoljaUObjekt();
    },

    promijeniOdmakX(v) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey]; p.odmakX = parseFloat(v);
        document.getElementById('prikaz-odmaka-x').innerText = `${v} cm`; MatematikaEngine.osvjeziIzObjekta(p);
    },

    promijeniOdmakY(v) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey]; p.odmakY = parseFloat(v);
        document.getElementById('prikaz-odmaka-y').innerText = `${v} cm`; MatematikaEngine.osvjeziIzObjekta(p);
    },

    sacuvajPoljaUObjekt() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        if (p.tip === 'Zid') {
            p.h = parseFloat(document.getElementById('input-zid-h').value) || 265;
            p.visinaOblaganja = parseFloat(document.getElementById('input-oblaganje-h').value) || 120;
        }
        
        let tekuciW = parseFloat(document.getElementById('input-plocica-w').value) || 120;
        let tekuciH = parseFloat(document.getElementById('input-plocica-h').value) || 60;
        let tekuciF = parseFloat(document.getElementById('input-fuga').value) || 2;

        Object.keys(this.projektObjekt.povrsine).forEach(key => {
            this.projektObjekt.povrsine[key].plocicaW = tekuciW;
            this.projektObjekt.povrsine[key].plocicaH = tekuciH;
            this.projektObjekt.povrsine[key].fuga = tekuciF;
            MatematikaEngine.pokreniTihiZbirniProracun(this.projektObjekt.povrsine[key]);
        });
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        let jedinstveniKljuc = 'BROKER_COMP_' + this.trenutniKlijent + '_' + this.trenutnaProstorija;
        localStorage.setItem(jedinstveniKljuc, JSON.stringify(this.projektObjekt));
        alert("Spremljeno!");
    },

    ucitajProjektIzBaze(idProjekta) {
        const staro = BazaModul.dohvatiSveProjekte().find(proj => proj.id === idProjekta);
        if (staro) {
            this.trenutniKlijent = staro.klijent; this.trenutnaProstorija = staro.prostorija;
            let napredni = localStorage.getItem('BROKER_COMP_' + staro.klijent + '_' + staro.prostorija);
            if (napredni) this.projektObjekt = JSON.parse(napredni);
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const el = document.getElementById('lista-projekata'); el.innerHTML = '';
        const projekti = BazaModul.dohvatiSveProjekte();
        projekti.forEach(p => {
            const kartica = document.createElement('div'); kartica.className = 'alat-kartica';
            kartica.innerHTML = `<div onclick="App.ucitajProjektIzBaze('${p.id}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><div style="font-weight:bold; color:var(--akcent-plavi); font-size:12px;">🚪 ${p.klijent} - ${p.prostorija}</div><span>›</span></div>`;
            el.appendChild(kartica);
        });
    },

    osvjeziSveKvadraturneProracune(proj) {
        Object.keys(proj.povrsine).forEach(k => MatematikaEngine.pokreniTihiZbirniProracun(proj.povrsine[k])); return proj.povrsine;
    },

    otvoriDokumentaciju() { this.sacuvajPoljaUObjekt(); DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt); }
};
window.onload = () => App.init();
               

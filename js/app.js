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
        
        if (!klijentInput || !prostorijaInput) {
            alert("Unesite klijenta i prostoriju.");
            return;
        }

        const hZidovi = document.getElementById('conf-zidovi').checked;
        const hPod = document.getElementById('conf-pod').checked;
        const hSokl = document.getElementById('conf-sokl').checked;
        const initW = parseFloat(document.getElementById('init-plocica-w').value) || 120;
        const initH = parseFloat(document.getElementById('init-plocica-h').value) || 60;
        const initF = parseFloat(document.getElementById('init-fuga').value) || 2;

        this.trenutniKlijent = klijentInput; 
        this.trenutnaProstorija = prostorijaInput;
        this.aktivnaPovrsinaKey = hZidovi ? 'zid1' : (hPod ? 'pod' : 'sokl');

        this.projektObjekt = {
            klijent: klijentInput, prostorija: prostorijaInput,
            konfiguracija: { zidovi: hZidovi, pod: hPod, sokl: hSokl },
            povrsine: {
                zid1: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 265, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null },
                zid2: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null },
                zid3: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null },
                zid4: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null },
                pod:  { tip: 'Pod',  w: 240, h: 200, visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: 8,  fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null }
            }
        };

        if (modRada === 'kamera') {
            this.promijeniZaslon('zaslon-kamera'); 
            if (typeof Kamera !== 'undefined') Kamera.pokreni();
        } else {
            this.promijeniZaslon('zaslon-radni');
        }
    },

    promijeniAktivnuPovrsinu(kljuc) {
        this.sacuvajPoljaUObjekt(); 
        this.aktivnaPovrsinaKey = kljuc; 
        this.ucitajPovrsinuUUrednik();
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
        const sekTusTekstura = document.getElementById('sekcija-tekstura-tusa');

        const statusTeksture = document.getElementById('naziv-teksture-status');
        const gumbBrisi = document.getElementById('gumb-brisi-teksturu');
        const statusTekstureTusa = document.getElementById('naziv-teksture-tusa-status');
        const gumbBrisiTusa = document.getElementById('gumb-brisi-teksturu-tusa');
        
        if (p.slikaTeksture) {
            statusTeksture.innerHTML = `<b style="color:var(--akcent-zeleni);">Učitana tekstura</b>`;
            if(gumbBrisi) gumbBrisi.style.display = 'inline-block';
        } else {
            statusTeksture.innerHTML = `Zid: Nema teksture`;
            if(gumbBrisi) gumbBrisi.style.display = 'none';
        }

        if (p.slikaTekstureTusa) {
            if(statusTekstureTusa) statusTekstureTusa.innerHTML = `<b style="color:var(--akcent-zeleni);">Učitan dekor</b>`;
            if(gumbBrisiTusa) gumbBrisiTusa.style.display = 'inline-block';
        } else {
            if(statusTekstureTusa) statusTekstureTusa.innerHTML = `Tuš: Nema teksture`;
            if(gumbBrisiTusa) gumbBrisiTusa.style.display = 'none';
        }

        if (p.tip === 'Zid') {
            konVisina.style.display = 'block'; sekOblaganja.style.display = 'flex'; 
            sekPodOpcije.style.display = 'none'; 
            if(sekTusTekstura) sekTusTekstura.style.display = 'flex';
            document.getElementById('input-zid-h').value = p.h;
            document.getElementById('input-oblaganje-h').value = p.visinaOblaganja;
        } else {
            konVisina.style.display = 'none'; sekOblaganja.style.display = 'none'; 
            if(sekTusTekstura) sekTusTekstura.style.display = 'none';
            if(p.tip === 'Pod') {
                sekPodOpcije.style.display = 'flex';
                document.getElementById('chk-rotacija').checked = p.rotacija || false;
            } else {
                sekPodOpcije.style.display = 'none';
            }
        }
        if (typeof MatematikaEngine !== 'undefined') MatematikaEngine.osvjeziIzObjekta(p);
    },

    ucitajTeksturuPlocice(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
                p.slikaTeksture = e.target.result;
                this.ucitajPovrsinuUUrednik(); 
            };
            reader.readAsDataURL(input.files[0]);
        }
    },
    ukloniTeksturuPlocice() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.slikaTeksture = null;
        document.getElementById('foto-tekstura').value = ''; 
        this.ucitajPovrsinuUUrednik();
    },

    ucitajTeksturuTusa(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
                p.slikaTekstureTusa = e.target.result;
                this.ucitajPovrsinuUUrednik(); 
            };
            reader.readAsDataURL(input.files[0]);
        }
    },
    ukloniTeksturuTusa() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.slikaTekstureTusa = null;
        document.getElementById('foto-tekstura-tusa').value = ''; 
        this.ucitajPovrsinuUUrednik();
    },

    toggleRotacija(isRotated) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.rotacija = isRotated;
        this.sacuvajPoljaUObjekt();
    },

    promijeniOdmakX(v) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey]; p.odmakX = parseFloat(v);
        document.getElementById('prikaz-odmaka-x').innerText = `${v} cm`; 
        if (typeof MatematikaEngine !== 'undefined') MatematikaEngine.osvjeziIzObjekta(p);
    },

    promijeniOdmakY(v) {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey]; p.odmakY = parseFloat(v);
        document.getElementById('prikaz-odmaka-y').innerText = `${v} cm`; 
        if (typeof MatematikaEngine !== 'undefined') MatematikaEngine.osvjeziIzObjekta(p);
    },

    // KLJUČNA PROMJENA: Sada se podaci zapisuju ISKLJUČIVO u aktivnu površinu!
    sacuvajPoljaUObjekt() {
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        
        if (p.tip === 'Zid') {
            p.h = parseFloat(document.getElementById('input-zid-h').value) || 265;
            p.visinaOblaganja = parseFloat(document.getElementById('input-oblaganje-h').value) || 120;
        }
        
        p.plocicaW = parseFloat(document.getElementById('input-plocica-w').value) || 120;
        p.plocicaH = parseFloat(document.getElementById('input-plocica-h').value) || 60;
        p.fuga = parseFloat(document.getElementById('input-fuga').value) || 2;

        if (typeof MatematikaEngine !== 'undefined') {
            MatematikaEngine.pokreniTihiZbirniProracun(p);
            MatematikaEngine.osvjeziIzObjekta(p);
        }
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        let jedinstveniKljuc = 'BROKER_COMP_' + this.trenutniKlijent + '_' + this.trenutnaProstorija;
        localStorage.setItem(jedinstveniKljuc, JSON.stringify(this.projektObjekt));
        alert("Spremljeno!");
    },

    ucitajProjektIzBaze(idProjekta) {
        if(typeof BazaModul === 'undefined') return;
        const staro = BazaModul.dohvatiSveProjekte().find(proj => proj.id === idProjekta);
        if (staro) {
            this.trenutniKlijent = staro.klijent; this.trenutnaProstorija = staro.prostorija;
            let napredni = localStorage.getItem('BROKER_COMP_' + staro.klijent + '_' + staro.prostorija);
            if (napredni) this.projektObjekt = JSON.parse(napredni);
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const el = document.getElementById('lista-projekata'); 
        if(!el) return;
        el.innerHTML = '';
        if(typeof BazaModul === 'undefined') return;
        const projekti = BazaModul.dohvatiSveProjekte();
        projekti.forEach(p => {
            const kartica = document.createElement('div'); kartica.className = 'alat-kartica';
            kartica.innerHTML = `<div onclick="App.ucitajProjektIzBaze('${p.id}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;"><div style="font-weight:bold; color:var(--akcent-plavi); font-size:12px;">🚪 ${p.klijent} - ${p.prostorija}</div><span>›</span></div>`;
            el.appendChild(kartica);
        });
    },

    osvjeziSveKvadraturneProracune(proj) {
        if (typeof MatematikaEngine !== 'undefined') {
            Object.keys(proj.povrsine).forEach(k => MatematikaEngine.pokreniTihiZbirniProracun(proj.povrsine[k])); 
        }
        return proj.povrsine;
    },

    otvoriDokumentaciju() { 
        this.sacuvajPoljaUObjekt(); 
        if (typeof DokumentacijaModul !== 'undefined') DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt); 
    }
};

// SIGURNOSNI MOST ZA AI MODUL
App.ucitajSlikuZidaZaBusenje = function(input) { if(typeof AIModul !== 'undefined') AIModul.ucitajSlikuZidaZaBusenje(input); };
App.zatvoriFotogrametriju = function() { if(typeof AIModul !== 'undefined') AIModul.zatvoriFotogrametriju(); };
App.zumirajSliku = function(val) { if(typeof AIModul !== 'undefined') AIModul.zumirajSliku(val); };
App.klikniNaSliku = function(e) { if(typeof AIModul !== 'undefined') AIModul.klikniNaSliku(e); };
App.pokreniAIDetekciju = function() { if(typeof AIModul !== 'undefined') AIModul.pokreniAIDetekciju(); };

window.onload = () => {
    try {
        App.init();
    } catch(e) {
        console.error("Greska pri paljenju: ", e);
    }
};
    

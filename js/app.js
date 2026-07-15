window.onerror = function(message, source, lineno, colno, error) {
    alert("GREŠKA: " + message + " | Linija: " + lineno);
};

const DokumentacijaModul = {
    generirajSVGZid(p) {
        if (!p) return '';
        let mjerilo = 0.5;
        let w = p.w * mjerilo;
        let h = (p.tip === 'Zid' ? p.h : p.h) * mjerilo;
        let oblH = (p.tip === 'Zid' ? p.visinaOblaganja : p.h) * mjerilo;
        
        let plW = (p.rotacija ? p.plocicaH : p.plocicaW) * mjerilo;
        let plH = (p.rotacija ? p.plocicaW : p.plocicaH) * mjerilo;
        
        let bgX = (p.odmakX || 0) * mjerilo;
        let bgY = (p.odmakY || 0) * mjerilo; 

        let rId = 'pat-' + Math.random().toString(36).substr(2, 9);
        
        return `
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="background:#F5F6F7; border:1px solid #CBD5E1; display:block; margin:auto;">
            <defs>
                <pattern id="${rId}" patternUnits="userSpaceOnUse" width="${plW}" height="${plH}" x="${bgX}" y="${h - bgY}">
                    <rect x="0" y="0" width="${plW}" height="${plH}" fill="#94A3B8" stroke="#1E293B" stroke-width="0.5"/>
                </pattern>
            </defs>
            <rect x="0" y="${h - oblH}" width="${w}" height="${oblH}" fill="url(#${rId})" />
        </svg>`;
    },

    generisiZbirniTroskovnik(projekt) {
        if (!projekt) return;
        const p = App.osvjeziSveKvadraturneProracune(projekt);

        const generirajRedTable = (naziv, zid) => {
            let kom = zid.izracunCijelih || 0;
            let m2 = (zid.kvadratura || 0).toFixed(2);
            let rezoviHtml = (zid.listaRezova && zid.listaRezova.length > 0) 
                ? `<div style="font-size:9px; color:#475569; margin-top:6px; padding:6px; background:#F8FAFC; border-left:3px solid #0EA5E9; line-height:1.4;">
                     <b style="color:#0F172A;">SPECIFIKACIJA REZANJA:</b><br>${zid.listaRezova.join('<br>')}
                   </div>` 
                : '';
            
            return `
                <tr style="border-bottom:1px solid #E0E0E0;">
                    <td style="padding:12px 8px; vertical-align:top;"><b>${naziv}</b>${rezoviHtml}</td>
                    <td style="padding:12px 8px; vertical-align:top; font-size:14px;">${m2} m2</td>
                    <td style="padding:12px 8px; vertical-align:top; font-weight:bold; font-size:14px;">${kom}</td>
                </tr>
            `;
        };

        let htmlZidovi = '';
        if (projekt.konfiguracija.zidovi) {
            let m2Zidovi = (p.zid1.kvadratura||0) + (p.zid2.kvadratura||0) + (p.zid3.kvadratura||0) + (p.zid4.kvadratura||0);
            let komZidovi = (p.zid1.izracunCijelih||0) + (p.zid2.izracunCijelih||0) + (p.zid3.izracunCijelih||0) + (p.zid4.izracunCijelih||0);
            
            htmlZidovi = `
                <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
                    <thead>
                        <tr style="background:#2C3236; color:#FFFFFF;">
                            <th style="padding:10px 8px; text-align:left;">Površina / Krojna Lista</th>
                            <th style="padding:10px 8px; text-align:left; width:80px;">Neto kv.</th>
                            <th style="padding:10px 8px; text-align:left; width:90px;">Naručiti (kom)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generirajRedTable('Zid 1 (Glavni)', p.zid1)}
                        ${generirajRedTable('Zid 2 (Desni)', p.zid2)}
                        ${generirajRedTable('Zid 3 (Stražnji)', p.zid3)}
                        ${generirajRedTable('Zid 4 (Lijevi)', p.zid4)}
                        <tr style="background:#EAEDEF; font-weight:bold;">
                            <td style="padding:12px 8px; text-align:right;">UKUPNO ZIDOVI:</td>
                            <td style="padding:12px 8px; font-size:14px;">${m2Zidovi.toFixed(2)} m2</td>
                            <td style="padding:12px 8px; color:#0EA5E9; font-size:15px;">${komZidovi} kom</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        let htmlPod = '';
        if (projekt.konfiguracija.pod || projekt.konfiguracija.sokl) {
            htmlPod = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:20px;"><tbody>`;
            if (projekt.konfiguracija.pod) {
                htmlPod += generirajRedTable('Pod kupaonice', p.pod);
            }
            if (projekt.konfiguracija.sokl) {
                htmlPod += `<tr><td style="padding:12px 8px; font-weight:bold;">Sokl / Cokl</td><td style="padding:12px 8px;">${((p.sokl.h||0)/100).toFixed(2)} m</td><td style="padding:12px 8px; font-weight:bold; color:#0EA5E9;">${p.sokl.izracunCijelih||0} kom</td></tr>`;
            }
            htmlPod += `</tbody></table>`;
        }

        let krizniPrikaz = '';
        if (projekt.konfiguracija.zidovi && projekt.konfiguracija.pod) {
            krizniPrikaz = `
            <h3 style="font-size:12px; text-transform:uppercase; margin-top:30px; text-align:center; color:#64748B;">KRIŽNI PRIKAZ (UNFOLD) - PREMA SLIDER ODMACIMA</h3>
            <div style="display:table; margin: 0 auto; border-spacing:10px;">
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 3 (Stražnji)</div>
                        ${this.generirajSVGZid(p.zid3)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                </div>
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 4 (Lijevi)</div>
                        ${this.generirajSVGZid(p.zid4)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle; background:#ECFDF5; border:2px solid #0EA5E9; padding:5px;">
                        <div style="font-size:9px; font-weight:bold; color:#0EA5E9;">POD (Centar)</div>
                        ${this.generirajSVGZid(p.pod)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 2 (Desni)</div>
                        ${this.generirajSVGZid(p.zid2)}
                    </div>
                </div>
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 1 (Glavni)</div>
                        ${this.generirajSVGZid(p.zid1)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                </div>
            </div>`;
        }

        const stariPrikaz = document.getElementById('print-overlay');
        if (stariPrikaz) stariPrikaz.remove();

        const overlay = document.createElement('div');
        overlay.id = 'print-overlay';
        
        overlay.innerHTML = `
            <style>
                @media print {
                    html, body { background-color: #FFFFFF !important; color: #000000 !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    body > *:not(#print-overlay) { display: none !important; }
                    #print-overlay { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; min-height: 100vh !important; background-color: #FFFFFF !important; margin: 0 !important; padding: 0 !important; z-index: 999999; }
                    .no-print { display: none !important; }
                    @page { margin: 1cm; }
                }
            </style>
            <div id="print-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:#FFFFFF; color:#1A1D20; z-index:99999999; overflow-y:auto; padding:24px; box-sizing:border-box;">
                <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:20px; background:#111417; padding:12px; margin:-24px -24px 20px -24px;">
                    <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px; font-weight:bold; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PDF</button>
                    <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px; font-weight:bold; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
                </div>
                <div style="font-weight: bold; font-size: 20px; border-bottom: 2px solid #2C3236; padding-bottom: 10px;">BRO-KER Zbirni Troškovnik (Real-Cut)</div>
                <div style="margin: 15px 0; background-color: #F5F6F7; padding: 15px; border-left: 5px solid #0EA5E9;">
                    <strong>KLIJENT: ${projekt.klijent.toUpperCase()} | PROSTORIJA: ${projekt.prostorija}</strong>
                </div>
                ${htmlZidovi} ${htmlPod}
                ${krizniPrikaz}
            </div>
        `;
        document.body.appendChild(overlay.firstElementChild.nextElementSibling);
        document.body.appendChild(document.getElementById('print-overlay'));
    }
};

// OVDJE DOLAZI "const App = {" KOJI NE DIRAS
                                               

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
            if (typeof MatematikaEngine !== 'undefined') MatematikaEngine.pokreniTihiZbirniProracun(this.projektObjekt.povrsine[key]);
        });
        if (typeof MatematikaEngine !== 'undefined') MatematikaEngine.osvjeziIzObjekta(p);
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
        DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt); 
    },

    otvoriFotogrametriju() {
        document.getElementById('input-slika-zida').click();
    },

    ucitajSlikuZidaZaBusenje(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('foto-zid');
                img.onload = () => {
                    const canvas = document.getElementById('ai-overlay');
                    if(canvas) {
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                    }
                };
                img.src = e.target.result;
                document.getElementById('modal-fotogrametrija').style.display = 'flex';
                document.getElementById('zoom-slider').value = 1;
                this.zumirajSliku(1);
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    zatvoriFotogrametriju() {
        document.getElementById('modal-fotogrametrija').style.display = 'none';
        document.getElementById('input-slika-zida').value = '';
    },

    zumirajSliku(val) {
        document.getElementById('zoom-prikaz').innerText = parseFloat(val).toFixed(1) + 'x';
        document.getElementById('zoom-wrapper').style.transform = `scale(${val})`;
    },

    klikniNaSliku(e) {
        const img = document.getElementById('foto-zid');
        const rect = img.getBoundingClientRect();
        const zoomFaktor = parseFloat(document.getElementById('zoom-slider').value);
        
        const klikX = (e.clientX - rect.left) / zoomFaktor;
        const klikY = (e.clientY - rect.top) / zoomFaktor;
        
        const stvarnaSirinaSlike = img.clientWidth;
        const stvarnaVisinaSlike = img.clientHeight;
        
        const postotakX = klikX / stvarnaSirinaSlike;
        const postotakY = klikY / stvarnaVisinaSlike;
        
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        const stvarniZidW = p.w || 240;
        const stvarniZidH = p.h || 265;
        
        let tockaX = postotakX * stvarniZidW;
        let tockaY = stvarniZidH - (postotakY * stvarniZidH);

        let rupW = parseFloat(prompt("Unesi širinu otvora za bušenje u cm (npr. dozna=5, odvod=10):", "5"));
        let rupH = parseFloat(prompt("Unesi visinu otvora za bušenje u cm:", "5"));

        if (!rupW || !rupH) return;

        let finalX = tockaX - (rupW / 2);
        let finalY = tockaY - (rupH / 2);

        if (!p.popisOtvora) p.popisOtvora = [];
        p.popisOtvora.push({ tip: "Ručna koda", w: rupW, h: rupH, x: finalX, y: finalY });
        
        this.sacuvajPoljaUObjekt();
        alert(`Oznaka spremljena! Centar rupe: X=${tockaX.toFixed(1)} cm, Y=${tockaY.toFixed(1)} cm.`);
        this.zatvoriFotogrametriju();
    },

    pokreniAIDetekciju() {
        if (typeof cv === 'undefined' || !cv.Mat) {
            alert("OpenCV AI modul se još učitava. Pričekajte 5 sekundi pa pokušajte ponovno.");
            return;
        }

        const imgElement = document.getElementById('foto-zid');
        if (!imgElement || !imgElement.src) {
            alert("Prvo učitajte fotografiju zida!");
            return;
        }

        const canvas = document.getElementById('ai-overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let mat = cv.imread(imgElement);
        let gray = new cv.Mat();
        
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);
        cv.medianBlur(gray, gray, 5);

        let circles = new cv.Mat();
        let minR = Math.floor(mat.cols / 60); 
        let maxR = Math.floor(mat.cols / 10); 

        cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, mat.cols/15, 100, 30, minR, maxR);

        let pronadjeneKote = [];
        
        if (circles.cols > 0) {
            for (let i = 0; i < circles.cols; ++i) {
                let x = circles.data32F[i * 3];
                let y = circles.data32F[i * 3 + 1];
                let radius = circles.data32F[i * 3 + 2];

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#0EA5E9';
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#FF4C4C';
                ctx.fill();

                const postotakX = x / imgElement.naturalWidth;
                const postotakY = y / imgElement.naturalHeight;

                const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
                const stvarniZidW = p.w || 240;
                const stvarniZidH = p.h || 265;
                
                let tockaX = postotakX * stvarniZidW;
                let tockaY = stvarniZidH - (postotakY * stvarniZidH);

                pronadjeneKote.push({x: tockaX, y: tockaY});
            }
            
            setTimeout(() => {
                let potvrda = confirm(`🧠 AI JE PRONAŠAO ${circles.cols} INSTALACIJA!\nVidite li plave nišane na slici?\nŽelite li da program automatski upiše ove kote u mrežu pločica?`);
                if(potvrda) {
                    const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
                    if (!p.popisOtvora) p.popisOtvora = [];
                    
                    pronadjeneKote.forEach(kota => {
                        let finalX = kota.x - 2.5; 
                        let finalY = kota.y - 2.5;
                        p.popisOtvora.push({ tip: "AI Kalibrirano", w: 5, h: 5, x: finalX, y: finalY });
                    });
                    
                    this.sacuvajPoljaUObjekt();
                    alert("AI je uspješno preslikao i kalibrirao sve rupe na mrežni nacrt!");
                    this.zatvoriFotogrametriju();
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); 
                }
            }, 200);

        } else {
            alert("AI nije uspio detektirati pravilne geometrijske krugove na ovoj fotografiji. Pokušajte izoštriti sliku ili koristite ručni Tap-to-Drill klikom na cijev.");
        }

        mat.delete(); gray.delete(); circles.delete();
    }
};

window.onload = () => {
    try {
        App.init();
    } catch(e) {
        alert("SISTEMSKA GREŠKA PRI PALJENJU:\n" + e.message);
    }
};

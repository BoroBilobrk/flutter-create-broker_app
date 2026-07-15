// DEBUGER: Ako ovo vidiš u Alertu, znaš točno gdje je problem
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

        let htmlZidovi = '';
        if (projekt.konfiguracija.zidovi) {
            let m2Zidovi = (p.zid1.kvadratura||0) + (p.zid2.kvadratura||0) + (p.zid3.kvadratura||0) + (p.zid4.kvadratura||0);
            let komZidovi = (p.zid1.izracunCijelih||0) + (p.zid2.izracunCijelih||0) + (p.zid3.izracunCijelih||0) + (p.zid4.izracunCijelih||0);
            
            htmlZidovi = `
                <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
                    <thead>
                        <tr style="background:#2C3236; color:#FFFFFF;"><th style="padding:8px; text-align:left;">Površina</th><th style="padding:8px; text-align:left;">Neto kvadratura</th><th style="padding:8px; text-align:left;">Komada</th></tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:8px;">Zid 1 (Glavni)</td><td style="padding:8px;">${(p.zid1.kvadratura||0).toFixed(2)} m2</td><td style="padding:8px;">${p.zid1.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:8px;">Zid 2 (Desni)</td><td style="padding:8px;">${(p.zid2.kvadratura||0).toFixed(2)} m2</td><td style="padding:8px;">${p.zid2.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:8px;">Zid 3 (Stražnji)</td><td style="padding:8px;">${(p.zid3.kvadratura||0).toFixed(2)} m2</td><td style="padding:8px;">${p.zid3.izracunCijelih||0}</td></tr>
                        <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:8px;">Zid 4 (Lijevi)</td><td style="padding:8px;">${(p.zid4.kvadratura||0).toFixed(2)} m2</td><td style="padding:8px;">${p.zid4.izracunCijelih||0}</td></tr>
                        <tr style="background:#EAEDEF; font-weight:bold;"><td style="padding:8px;">UKUPNO ZIDOVI</td><td style="padding:8px;">${m2Zidovi.toFixed(2)} m2</td><td style="padding:8px;">${komZidovi}</td></tr>
                    </tbody>
                </table>
            `;
        }

        let htmlPod = '';
        if (projekt.konfiguracija.pod || projekt.konfiguracija.sokl) {
            htmlPod = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;"><tbody>`;
            if (projekt.konfiguracija.pod) {
                htmlPod += `<tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:8px; font-weight:bold;">Pod kupaonice</td><td style="padding:8px;">${(p.pod.kvadratura||0).toFixed(2)} m2</td><td style="padding:8px;">${p.pod.izracunCijelih||0}</td></tr>`;
            }
            if (projekt.konfiguracija.sokl) {
                htmlPod += `<tr><td style="padding:8px; font-weight:bold;">Sokl / Cokl</td><td style="padding:8px;">${((p.sokl.h||0)/100).toFixed(2)} m</td><td style="padding:8px; font-weight:bold;">${p.sokl.izracunCijelih||0}</td></tr>`;
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
                    #print-overlay { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; min-height: 100vh !important; background: white !important; }
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
        console.log("Tipka stisnuta, mod: " + modRada);
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
                zid1: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 265, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 },
                zid2: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 },
                zid3: { tip: 'Zid', w: 240, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 },
                zid4: { tip: 'Zid', w: 200, h: 265, visinaOblaganja: 120, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 },
                pod:  { tip: 'Pod',  w: 240, h: 200, visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: initH, fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   visinaOblaganja: 0, tusZone: [], popisOtvora: [], plocicaW: initW, plocicaH: 8,  fuga: initF, odmakX: 0, odmakY: 0, rotacija: false, slikaTeksture: null, slikaTekstureTusa: null, izracunCijelih: 0, kvadratura: 0 }
            }
        };

        if (modRada === 'kamera') {
            this.promijeniZaslon('zaslon-kamera');
            Kamera.pokreni();
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
            gumbBrisi.style.display = 'inline-block';
        } else {
            statusTeksture.innerHTML = `Zid: Nema teksture`;
            gumbBrisi.style.display = 'none';
        }

        if (p.slikaTekstureTusa) {
            statusTekstureTusa.innerHTML = `<b style="color:var(--akcent-zeleni);">Učitan dekor</b>`;
            gumbBrisiTusa.style.display = 'inline-block';
        } else {
            statusTekstureTusa.innerHTML = `Tuš: Nema teksture`;
            gumbBrisiTusa.style.display = 'none';
        }

        if (p.tip === 'Zid') {
            konVisina.style.display = 'block'; sekOblaganja.style.display = 'flex'; 
            sekPodOpcije.style.display = 'none'; sekTusTekstura.style.display = 'flex';
            document.getElementById('input-zid-h').value = p.h;
            document.getElementById('input-oblaganje-h').value = p.visinaOblaganja;
        } else {
            konVisina.style.display = 'none'; sekOblaganja.style.display = 'none'; sekTusTekstura.style.display = 'none';
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

    otvoriFotogrametriju() {
        document.getElementById('input-slika-zida').click();
    },

    ucitajSlikuZidaZaBusenje(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('foto-zid').src = e.target.result;
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
        document.getElementById('foto-zid').style.transform = `scale(${val})`;
    },

    klikniNaSliku(e) {
        const img = document.getElementById('foto-zid');
        const rect = img.getBoundingClientRect();
        const zoomFaktor = parseFloat(document.getElementById('zoom-slider').value);
        
        const stvarnaSirinaSlike = rect.width / zoomFaktor;
        const stvarnaVisinaSlike = rect.height / zoomFaktor;
        
        const klikX = (e.clientX - rect.left) / zoomFaktor;
        const klikY = (e.clientY - rect.top) / zoomFaktor;
        
        const postotakX = klikX / stvarnaSirinaSlike;
        const postotakY = klikY / stvarnaVisinaSlike;
        
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        const stvarniZidW = p.w || 240;
        const stvarniZidH = p.h || 265;
        
        let tockaX = postotakX * stvarniZidW;
        let tockaY = stvarniZidH - (postotakY * stvarniZidH);

        let odabir = prompt("Koja je veličina otvora oko ove točke (centra)?\n1 - Instalacijska cijev / Dozna (rupa 5x5 cm)\n2 - Odvod za školjku (rupa 12x12 cm)\n3 - Unesi ručno", "1");
        if (!odabir) return;

        let rupW = 5, rupH = 5;
        if (odabir === "2") {
            rupW = 12; rupH = 12;
        } else if (odabir === "3") {
            rupW = parseFloat(prompt("Širina rupe (cm):", "10")) || 10;
            rupH = parseFloat(prompt("Visina rupe (cm):", "10")) || 10;
        }

        let finalX = tockaX - (rupW / 2);
        let finalY = tockaY - (rupH / 2);

        if (!p.popisOtvora) p.popisOtvora = [];
        p.popisOtvora.push({ tip: "Precizna Rupa", w: rupW, h: rupH, x: finalX, y: finalY });
        
        this.sacuvajPoljaUObjekt();
        alert(`Oznaka spremljena! Centar rupe nalazi se točno na: X = ${tockaX.toFixed(1)} cm, Y = ${tockaY.toFixed(1)} cm.`);
        
        this.zatvoriFotogrametriju();
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
        });
        
        MatematikaEngine.osvjeziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        if (!this.projektObjekt) return;
        BazaModul.spasiProjekt(this.projektObjekt);
        alert("Projekt je uspješno spasen!");
    },

    osvjeziListuSpremljenihProjekata() {
        const lista = document.getElementById('lista-projekata');
        if (!lista) return;
        lista.innerHTML = '';
        
        const projekti = BazaModul.dohvatiSveProjekte();
        projekti.forEach(p => {
            const kartaDiv = document.createElement('div');
            kartaDiv.className = 'alat-kartica';
            kartaDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-weight:bold; color:#4EFA9E;">${p.klijent} - ${p.prostorija}</div>
                        <div style="font-size:10px; color:#8C9BA5;">${p.datum}</div>
                    </div>
                    <button style="background:#FF6B6B; color:#FFF; border:none; padding:6px 12px; cursor:pointer;" onclick="BazaModul.izbrisiProjekt('${p.id}'); App.osvjeziListuSpremljenihProjekata();">Briši</button>
                </div>
            `;
            kartaDiv.onclick = () => {
                this.projektObjekt = p;
                this.trenutniKlijent = p.klijent;
                this.trenutnaProstorija = p.prostorija;
                this.promijeniZaslon('zaslon-radni');
            };
            lista.appendChild(kartaDiv);
        });
    },

    otvoriDokumentaciju() {
        if (!this.projektObjekt) {
            alert("Nema učitanog projekta!");
            return;
        }
        DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt);
    },

    osvjeziSveKvadraturneProracune(projekt) {
        if (!projekt || !projekt.povrsine) return projekt;
        
        Object.keys(projekt.povrsine).forEach(key => {
            MatematikaEngine.pokreniTihiZbirniProracun(projekt.povrsine[key]);
        });
        
        return projekt.povrsine;
    }
};

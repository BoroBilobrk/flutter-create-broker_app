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
        document.querySelectorAll('.zaslon').forEach(z => z.classList.remove('aktivni-zaslon'));
        const cilj = document.getElementById(idZaslona);
        if (cilj) cilj.classList.add('aktivni-zaslon');

        if (idZaslona === 'zaslon-kamera') {
            document.getElementById('naslov-prikaza').innerText = "Skeniranje prostora";
            Kamera.pokreni();
        } else if (idZaslona === 'zaslon-radni') {
            document.getElementById('naslov-prikaza').innerText = `${this.trenutniKlijent} - Rad`;
            this.ucitajPovrsinuUUrednik();
        } else if (idZaslona === 'zaslon-izbornik') {
            document.getElementById('naslov-prikaza').innerText = "Glavni Izbornik";
            this.osvjeziListuSpremljenihProjekata();
        }
    },

    kreirajNoviProjekt() {
        const klijentInput = document.getElementById('input-klijent').value.trim();
        const prostorijaInput = document.getElementById('input-prostorija').value.trim();

        if (klijentInput === "" || prostorijaInput === "") {
            alert("Molimo unesite ime klijenta i prostoriju.");
            return;
        }

        this.trenutniKlijent = klijentInput;
        this.trenutnaProstorija = prostorijaInput;
        this.aktivnaPovrsinaKey = 'zid1';
        document.getElementById('odabir-povrsine').value = 'zid1';

        this.projektObjekt = {
            klijent: klijentInput,
            prostorija: prostorijaInput,
            povrsine: {
                zid1: { tip: 'Zid', w: 240, h: 200, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                zid2: { tip: 'Zid', w: 200, h: 200, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                zid3: { tip: 'Zid', w: 240, h: 200, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                zid4: { tip: 'Zid', w: 200, h: 200, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                pod:  { tip: 'Pod',  w: 240, h: 200, popisOtvora: [], plocicaW: 60, plocicaH: 60, fuga: 2 },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   popisOtvora: [], plocicaW: 60, plocicaH: 8,  fuga: 2 }
            }
        };

        this.promijeniZaslon('zaslon-radni');
    },

    promijeniAktivnuPovrsinu(kljuc) {
        this.sacuvajPoljaUObjekt();
        this.aktivnaPovrsinaKey = kljuc;
        this.ucitajPovrsinuUUrednik();
    },

    ucitajPovrsinuUUrednik() {
        if (!this.projektObjekt || !this.projektObjekt.povrsine) return;
        
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        const sekcijaZona = document.getElementById('sekcija-zona');
        const sekcijaFormat = document.getElementById('sekcija-format-plocice');
        const gumbOtvor = document.getElementById('gumb-dodaj-otvor');
        const lblW = document.getElementById('label-dim-w');
        const lblH = document.getElementById('label-dim-h');

        document.getElementById('input-zid-w').value = p.w;
        document.getElementById('input-plocica-w').value = p.plocicaW;
        document.getElementById('input-plocica-h').value = p.plocicaH;
        document.getElementById('input-fuga').value = p.fuga;

        if (p.tip === 'Zid') {
            document.getElementById('input-zid-h').value = p.h;
            if (sekcijaZona) sekcijaZona.style.display = 'grid';
            if (sekcijaFormat) sekcijaFormat.style.display = 'flex';
            if (gumbOtvor) {
                gumbOtvor.style.display = 'block';
                gumbOtvor.innerText = "➕ DODAJ OTVOR (VRATA / PROZOR)";
            }
            if (lblW) lblW.innerText = "ŠIRINA ZIDA (cm)";
            if (lblH) lblH.innerText = "VISINA ZIDA (cm)";
            
            document.getElementById('check-visina').checked = p.hZona;
            document.getElementById('check-tus').checked = p.vZona;
        } else if (p.tip === 'Pod') {
            document.getElementById('input-zid-h').value = p.h;
            if (sekcijaZona) sekcijaZona.style.display = 'none';
            if (sekcijaFormat) sekcijaFormat.style.display = 'flex';
            if (gumbOtvor) {
                gumbOtvor.style.display = 'block';
                gumbOtvor.innerText = "➕ DODAJ OTVOR (PODNI SLIVNIK)";
            }
            if (lblW) lblW.innerText = "ŠIRINA PODA X (cm)";
            if (lblH) lblH.innerText = "DULJINA PODA Y (cm)";
        } else if (p.tip === 'Sokl') {
            if (sekcijaZona) sekcijaZona.style.display = 'none';
            if (gumbOtvor) gumbOtvor.style.display = 'none';
            if (sekcijaFormat) sekcijaFormat.style.display = 'none';
            if (lblW) lblW.innerText = "VISINA SOKLA (cm)";
            if (lblH) lblH.style.display = 'none';
            document.getElementById('input-zid-h').style.display = 'none';
            
            let opseg = (parseFloat(this.projektObjekt.povrsine.zid1.w) || 0) + 
                        (parseFloat(this.projektObjekt.povrsine.zid2.w) || 0) + 
                        (parseFloat(this.projektObjekt.povrsine.zid3.w) || 0) + 
                        (parseFloat(this.projektObjekt.povrsine.zid4.w) || 0);
            p.h = opseg;
        }

        if (p.tip !== 'Sokl') {
            if (lblH) lblH.style.display = 'block';
            document.getElementById('input-zid-h').style.display = 'block';
        }

        MatematikaEngine.osveziIzObjekta(p);
    },

    sacuvajPoljaUObjekt() {
        if (!this.projektObjekt || !this.projektObjekt.povrsine) return;
        
        const p = this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        if (!p) return;
        
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        if (p.tip !== 'Sokl') {
            p.h = parseFloat(document.getElementById('input-zid-h').value) || 0;
            p.plocicaW = parseFloat(document.getElementById('input-plocica-w').value) || 60;
            p.plocicaH = parseFloat(document.getElementById('input-plocica-h').value) || 30;
            p.fuga = parseFloat(document.getElementById('input-fuga').value) || 2;
        } else {
            p.plocicaH = p.w;
        }
        
        if (p.tip === 'Zid') {
            p.hZona = document.getElementById('check-visina').checked;
            p.vZona = document.getElementById('check-tus').checked;
        }

        // --- AUTOMATSKO PREUZIMANJE DIMENZIJA ZA 3D SOBU I POD ---
        if (this.aktivnaPovrsinaKey === 'zid1') {
            // Zid 3 (nasuprotni) dobiva istu širinu i visinu
            this.projektObjekt.povrsine.zid3.w = p.w;
            this.projektObjekt.povrsine.zid3.h = p.h;
            // Pod dobiva širinu (X os) od Zida 1
            this.projektObjekt.povrsine.pod.w = p.w;
            // Kopiraj visinu na sve ostale zidove jer su prostorije u pravilu jednako visoke
            this.projektObjekt.povrsine.zid2.h = p.h;
            this.projektObjekt.povrsine.zid4.h = p.h;
        }
        
        if (this.aktivnaPovrsinaKey === 'zid2') {
            // Zid 4 (nasuprotni) dobiva istu širinu i visinu
            this.projektObjekt.povrsine.zid4.w = p.w;
            this.projektObjekt.povrsine.zid4.h = p.h;
            // Pod dobiva duljinu (Y os) od širine Zida 2!
            this.projektObjekt.povrsine.pod.h = p.w;
        }

        MatematikaEngine.osveziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        BazaModul.spasiProjekt(
            this.trenutniKlijent,
            this.trenutnaProstorija,
            this.projektObjekt.povrsine.zid1.w,
            this.projektObjekt.povrsine.zid1.h,
            this.projektObjekt.povrsine.zid1.popisOtvora,
            this.projektObjekt
        );
        let kljuc = 'BROKER_COMP_' + this.trenutniKlijent;
        localStorage.setItem(kljuc, JSON.stringify(this.projektObjekt));
        alert("Kompletna kupaonica (Svi zidovi, pod i sokl) spremljena!");
    },

    učitajProjektIzBaze(idProjekta) {
        const projekti = BazaModul.dohvatiSveProjekte();
        const staro = projekti.find(proj => proj.id === idProjekta);
        
        if (staro) {
            this.trenutniKlijent = staro.klijent;
            this.trenutnaProstorija = staro.prostorija;
            
            let kljuc = 'BROKER_COMP_' + staro.klijent;
            const napredniPodaci = localStorage.getItem(kljuc);
            
            if (napredniPodaci) {
                this.projektObjekt = JSON.parse(napredniPodaci);
                Object.keys(this.projektObjekt.povrsine).forEach(k => {
                    let pov = this.projektObjekt.povrsine[k];
                    if (!pov.plocicaW) {
                        pov.plocicaW = 60;
                        pov.plocicaH = pov.tip === 'Pod' ? 60 : 30;
                        pov.fuga = 2;
                    }
                });
            } else {
                this.projektObjekt = {
                    klijent: staro.klijent,
                    prostorija: staro.prostorija,
                    povrsine: {
                        zid1: { tip: 'Zid', w: staro.sirinaZida, h: staro.visinaZida, popisOtvora: staro.popisOtvora || [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                        zid2: { tip: 'Zid', w: 200, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                        zid3: { tip: 'Zid', w: staro.sirinaZida, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                        zid4: { tip: 'Zid', w: 200, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false, plocicaW: 60, plocicaH: 30, fuga: 2 },
                        pod:  { tip: 'Pod',  w: staro.sirinaZida, h: 200, popisOtvora: [], plocicaW: 60, plocicaH: 60, fuga: 2 },
                        sokl: { tip: 'Sokl', w: 8, h: (staro.sirinaZida * 2) + 400, popisOtvora: [], plocicaW: 60, plocicaH: 8, fuga: 2 }
                    }
                };
            }
            this.aktivnaPovrsinaKey = 'zid1';
            document.getElementById('odabir-povrsine').value = 'zid1';
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const el = document.getElementById('lista-projekata');
        if (!el) return;
        const projekti = BazaModul.dohvatiSveProjekte();
        el.innerHTML = '';
        if (projekti.length === 0) {
            el.innerHTML = `<div style="font-size:12px; color:#6C7A84; padding:10px; border:1px dashed #22282C; text-align:center;">Nema spremljenih projekata.</div>`;
            return;
        }
        projekti.forEach(p => {
            const kartica = document.createElement('div');
            kartica.className = 'alat-kartica';
            kartica.style.display = 'flex'; kartica.style.justifyContent = 'space-between'; kartica.style.alignItems = 'center';
            kartica.style.marginBottom = '6px';
            kartica.innerHTML = `
                <div onclick="App.učitajProjektIzBaze('${p.id}')" style="cursor:pointer; flex:1; text-align:left;">
                    <div style="font-weight:bold; font-size:13px; color:#FFF; margin-bottom:4px;">${p.klijent}</div>
                    <div style="font-size:11px; color:#8C9BA5;">${p.prostorija} | Dinamički Formati</div>
                </div>
                <button onclick="App.obrisiProjektIzBaze('${p.id}')" style="background:transparent; border:none; color:#FF5555; font-size:16px; cursor:pointer;">✕</button>
            `;
            el.appendChild(kartica);
        });
    },

    obrisiProjektIzBaze(idProjekta) {
        if (confirm("Jeste li sigurni da želite obrisati ovu cijelu kupaonicu?")) {
            BazaModul.izbrisiProjekt(idProjekta);
            this.osvjeziListuSpremljenihProjekata();
        }
    },

    otvoriDokumentaciju() {
        this.sacuvajPoljaUObjekt();
        DokumentacijaModul.generisiZbirniTroskovnik(this.projektObjekt);
    }
};
window.onload = () => App.init();
        

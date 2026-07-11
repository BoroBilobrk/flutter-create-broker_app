const App = {
    trenutniKlijent: '',
    trenutnaProstorija: '',
    aktivnaPovrsinaKey: 'zid1',
    projektObjekt: null, // Ovdje držimo sve površine kupaonice

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

        // STVARANJE 3D STRUKTURE PROSTORIJE (Sve površine na nuli ili zadano)
        this.projektObjekt = {
            klijent: klijentInput,
            prostorija: prostorijaInput,
            povrsine: {
                zid1: { tip: 'Zid', w: 240, h: 200, popisOtvora: [], hZona: false, vZona: false },
                zid2: { tip: 'Zid', w: 200, h: 200, popisOtvora: [], hZona: false, vZona: false },
                zid3: { tip: 'Zid', w: 240, h: 200, popisOtvora: [], hZona: false, vZona: false },
                zid4: { tip: 'Zid', w: 200, h: 200, popisOtvora: [], hZona: false, vZona: false },
                pod:  { tip: 'Pod',  w: 240, h: 200, popisOtvora: [] },
                sokl: { tip: 'Sokl', w: 8,    h: 0,   popisOtvora: [] } // w = visina sokla, h = automatski linearni metri
            }
        };

        this.promijeniZaslon('zaslon-radni');
    },

    promijeniAktivnuPovrsinu(kljuc) {
        // Prije nego prebacimo, spremamo trenutno stanje s ekrana u stari ključ
        this.sacuvajPoljaUObjekt();
        this.aktivnaPovrsinaKey = kljuc;
        this.ucitajPovrsinuUUrednik();
    },

    ucitajPovrsinuUUrednik() {
        const p = this.projektObjekt.povrsines[this.aktivnaPovrsinaKey] || this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        
        // Prilagodba kontrola formi ovisno o tipu (Zid vs Pod vs Sokl)
        const sekcijaZona = document.getElementById('sekcija-zona');
        const gumbOtvor = document.getElementById('gumb-dodaj-otvor');
        const lblW = document.getElementById('label-dim-w');
        const lblH = document.getElementById('label-dim-h');

        document.getElementById('input-zid-w').value = p.w;
        document.getElementById('input-zid-h').value = p.h;

        if (p.tip === 'Zid') {
            sekcijaZona.style.display = 'grid';
            gumbOtvor.style.display = 'block';
            gumbOtvor.innerText = "➕ DODAJ OTVOR (VRATA / PROZOR)";
            lblW.innerText = "ŠIRINA ZIDA (cm)";
            lblH.innerText = "VISINA ZIDA (cm)";
            document.getElementById('check-visina').checked = p.hZona;
            document.getElementById('check-tus').checked = p.vZona;
        } else if (p.tip === 'Pod') {
            sekcijaZona.style.display = 'none';
            gumbOtvor.style.display = 'block';
            gumbOtvor.innerText = "➕ DODAJ OTVOR (PODNI SLIVNIK)";
            lblW.innerText = "ŠIRINA PODA X (cm)";
            lblH.innerText = "DULJINA PODA Y (cm)";
        } else if (p.tip === 'Sokl') {
            sekcijaZona.style.display = 'none';
            gumbOtvor.style.display = 'none';
            lblW.innerText = "VISINA SOKLA (cm)";
            lblH.style.display = 'none';
            document.getElementById('input-zid-h').style.display = 'none';
            
            // Automatski izračun opsega kupaonice za sokl na temelju dimenzija svih zidova!
            let opseg = this.projektObjekt.povrsines.zid1.w + this.projektObjekt.povrsines.zid2.w + this.projektObjekt.povrsines.zid3.w + this.projektObjekt.povrsines.zid4.w;
            p.h = opseg;
        }

        if (p.tip !== 'Sokl') {
            lblH.style.display = 'block';
            document.getElementById('input-zid-h').style.display = 'block';
        }

        // Pokretanje proračuna na platnu
        MatematikaEngine.osveziIzObjekta(p);
    },

    sacuvajPoljaUObjekt() {
        const p = this.projektObjekt.povrsines[this.aktivnaPovrsinaKey] || this.projektObjekt.povrsine[this.aktivnaPovrsinaKey];
        p.w = parseFloat(document.getElementById('input-zid-w').value) || 0;
        if (p.tip !== 'Sokl') {
            p.h = parseFloat(document.getElementById('input-zid-h').value) || 0;
        }
        if (p.tip === 'Zid') {
            p.hZona = document.getElementById('check-visina').checked;
            p.vZona = document.getElementById('check-tus').checked;
        }
        MatematikaEngine.osveziIzObjekta(p);
    },

    spasiTrenutnoStanjeUBazu() {
        this.sacuvajPoljaUObjekt();
        BazaModul.spasiProjekt(
            this.trenutniKlijent,
            this.trenutnaProstorija,
            this.projektObjekt.povrsines.zid1.w, // fallback za staru bazu
            this.projektObjekt.povrsines.zid1.h,
            this.projektObjekt.povrsines.zid1.popisOtvora,
            this.projektObjekt // ŠALJEMO CIJELI MULTI-SURFACE OBJEKT U BAZU!
        );
        // Trik za spremanje cijele strukture pod napredni ključ
        let kljuc = 'BROKER_COMP_ ' + this.trenutniKlijent;
        localStorage.setItem(kljuc, JSON.stringify(this.projektObjekt));
        alert("Kompletna kupaonica (Svi zidovi, pod i sokl) spremljena!");
    },

    učitajProjektIzBaze(idProjekta) {
        const projekti = BazaModul.dohvatiSveProjekte();
        const staro = projekti.find(proj => proj.id === idProjekta);
        
        if (staro) {
            this.trenutniKlijent = staro.klijent;
            this.trenutnaProstorija = staro.prostorija;
            
            let kljuc = 'BROKER_COMP_ ' + staro.klijent;
            const napredniPodaci = localStorage.getItem(kljuc);
            
            if (napredniPodaci) {
                this.projektObjekt = JSON.parse(napredniPodaci);
            } else {
                // Ako je stari nalog, konvertiramo ga u novi format s 4 zida automatizmom
                this.projektObjekt = {
                    klijent: staro.klijent, prostorija: staro.prostorija,
                    povrsine: {
                        zid1: { tip: 'Zid', w: staro.sirinaZida, h: staro.visinaZida, popisOtvora: staro.popisOtvora || [], hZona: false, vZona: false },
                        zid2: { tip: 'Zid', w: 200, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false },
                        zid3: { tip: 'Zid', w: staro.sirinaZida, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false },
                        zid4: { tip: 'Zid', w: 200, h: staro.visinaZida, popisOtvora: [], hZona: false, vZona: false },
                        pod:  { tip: 'Pod',  w: staro.sirinaZida, h: 200, popisOtvora: [] },
                        sokl: { tip: 'Sokl', w: 8, h: (staro.sirinaZida * 2) + 400, popisOtvora: [] }
                    }
                };
            }
            this.aktivnaPovrsinaKey = 'zid1';
            document.getElementById('odabir-povrsine').value = 'zid1';
            this.promijeniZaslon('zaslon-radni');
        }
    },

    osvjeziListuSpremljenihProjekata() {
        const kontejner = document.getElementById('lista-projekata');
        if (!kontejner) return;
        const projekti = BazaModul.dohvatiSveProjekte();
        kontejner.innerHTML = '';
        if (projekti.length === 0) {
            kontejner.innerHTML = `<div style="font-size:12px; color:#6C7A84; padding:10px; border:1px dashed #22282C; text-align:center;">Nema spremljenih projekata.</div>`;
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
                    <div style="font-size:11px; color:#8C9BA5;">${p.prostorija} | 3D Soba</div>
                </div>
                <button onclick="App.obrisiProjektIzBaze('${p.id}')" style="background:transparent; border:none; color:#FF5555; font-size:16px; cursor:pointer;">✕</button>
            `;
            kontejner.appendChild(kartica);
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
        

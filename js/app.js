const App = {
    trenutniKlijent: '',
    trenutnaProstorija: '',

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
            document.getElementById('naslov-prikaza').innerText = `${this.trenutniKlijent} - Mreža`;
            MatematikaEngine.iscrtajMrezuPlocica();
        } else if (idZaslona === 'zaslon-izbornik') {
            document.getElementById('naslov-prikaza').innerText = "Glavni Izbornik";
            this.osvjeziListuSpremljenihProjekata(); // Ponovno učitaj listu klijenata
        }
    },

    // KREIRANJE NOVOG PROJEKTA PREKO FORME
    kreirajNoviProjekt() {
        const klijentInput = document.getElementById('input-klijent').value.trim();
        const prostorijaInput = document.getElementById('input-prostorija').value.trim();

        if (klijentInput === "" || prostorijaInput === "") {
            alert("Molimo unesite ime klijenta i prostoriju.");
            return;
        }

        this.trenutniKlijent = klijentInput;
        this.trenutnaProstorija = prostorijaInput;

        // Postavljanje zadanih tvorničkih mjera zida za novi projekt
        document.getElementById('input-zid-w').value = 240;
        document.getElementById('input-zid-h').value = 200;
        MatematikaEngine.sirinaZida = 240;
        MatematikaEngine.visinaZida = 200;
        MatematikaEngine.popisOtvora = [];
        MatematikaEngine.imaHorizontalnuZonu = false;
        MatematikaEngine.imaVertikalnuZonu = false;
        
        document.getElementById('check-visina').checked = false;
        document.getElementById('check-tus').checked = false;

        this.promijeniZaslon('zaslon-radni');
    },

    // AKCIJA GUMBA ZA TRAJNO SPREMANJE
    spasiTrenutnoStanjeUBazu() {
        const zoneStanje = {
            hZona: MatematikaEngine.imaHorizontalnuZonu,
            vZona: MatematikaEngine.imaVertikalnuZonu
        };
        
        BazaModul.spasiProjekt(
            this.trenutniKlijent,
            this.trenutnaProstorija,
            MatematikaEngine.sirinaZida,
            MatematikaEngine.visinaZida,
            MatematikaEngine.popisOtvora,
            zoneStanje
        );
        alert("Projekt uspješno spremljen!");
    },

    // DETALJNO UCITAVANJE STAROG PROJEKTA IZ LISTE
    učitajProjektIzBaze(idProjekta) {
        const projekti = BazaModul.dohvatiSveProjekte();
        const p = projekti.find(proj => proj.id === idProjekta);
        
        if (p) {
            this.trenutniKlijent = p.klijent;
            this.trenutnaProstorija = p.prostorija;
            
            // Vraćanje svih dimenzija i ugrađenih vrata/prozora
            MatematikaEngine.sirinaZida = p.sirinaZida;
            MatematikaEngine.visinaZida = p.visinaZida;
            MatematikaEngine.popisOtvora = p.popisOtvora || [];
            
            document.getElementById('input-zid-w').value = p.sirinaZida;
            document.getElementById('input-zid-h').value = p.visinaZida;

            // Vraćanje stanja prekidača zona
            if (p.zone) {
                MatematikaEngine.imaHorizontalnuZonu = p.zone.hZona;
                MatematikaEngine.imaVertikalnuZonu = p.zone.vZona;
                document.getElementById('check-visina').checked = p.zone.hZona;
                document.getElementById('check-tus').checked = p.zone.vZona;
            }

            this.promijeniZaslon('zaslon-radni');
        }
    },

    // DINAMIČKO ISCRTAVANJE KARTICA KLIJENATA NA POČETNOM ZASLONU
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
            kartica.style.backgroundColor = '#111417';
            kartica.style.border = '1px solid #1C2125';
            kartica.style.padding = '14px';
            kartica.style.display = 'flex';
            kartica.style.justifyContent = 'space-between';
            kartica.style.alignItems = 'center';

            kartica.innerHTML = `
                <div onclick="App.učitajProjektIzBaze('${p.id}')" style="cursor:pointer; flex:1; text-align:left;">
                    <div style="font-weight:bold; font-size:13px; color:#FFF; margin-bottom:4px;">${p.klijent}</div>
                    <div style="font-size:11px; color:#8C9BA5;">${p.prostorija} | ${p.datum}</div>
                </div>
                <button onclick="App.obrisiProjektIzBaze('${p.id}')" style="background:transparent; border:none; color:#FF5555; font-size:16px; cursor:pointer; padding:5px 10px;">✕</button>
            `;
            kontejner.appendChild(kartica);
        });
    },

    obrisiProjektIzBaze(idProjekta) {
        if (confirm("Jeste li sigurni da želite obrisati ovaj projekt?")) {
            BazaModul.izbrisiProjekt(idProjekta);
            this.osvjeziListuSpremljenihProjekata();
        }
    },

    otvoriDokumentaciju() {
        DokumentacijaModul.generisiTroskovnik();
    }
};

window.onload = () => App.init();
                

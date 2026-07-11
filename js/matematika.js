const MatematikaEngine = {
    // Dimenzije koje ArUco kamera automatski postavlja (zadano za demo)
    sirinaZida: 240, 
    visinaZida: 200, 
    
    // Dimenzije pločice i fuge (u cm)
    plocicaW: 60,  
    plocicaH: 30,  
    fuga: 0.2,     

    // Stanja zona koje kontroliraš preko prekidača na ekranu
    imaHorizontalnuZonu: false,
    imaVertikalnuZonu: false,
    visinaRazgranicenja: 90, // cm od poda
    pocetakTrakeX: 90,       // cm od lijevog kuta
    sirinaTrakeX: 60,        // širina tuš zone

    // Statističko praćenje za narudžbenicu
    bazaOstataka: [],
    iskoristeniOstatciCount: 0,
    potrosenoCijelihPlocica: 0,

    // UPRAVLJANJE PREKIDAČIMA (Uživo preračunavanje)
    toggleVisina(vrijednost) {
        this.imaHorizontalnuZonu = vrijednost;
        this.iscrtajMrezuPlocica();
    },

    toggleTus(vrijednost) {
        this.imaVertikalnuZonu = vrijednost;
        this.iscrtajMrezuPlocica();
    },

    // GLAVNA FUNKCIJA ZA LIJEPLJENJE MREŽE I KONTROLU OTPADA
    iscrtajMrezuPlocica() {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner) return;
        
        kontejner.innerHTML = ''; 
        this.bazaOstataka = [];
        this.iskoristeniOstatciCount = 0;
        this.potrosenoCijelihPlocica = 0;

        // Skaliranje mreže kako bi savršeno stala na ekran mobitela
        const maxMoguciW = kontejner.parentElement.clientWidth;
        const skala = maxMoguciW / this.sirinaZida;

        kontejner.style.width = (this.sirinaZida * skala) + 'px';
        kontejner.style.height = (this.visinaZida * skala) + 'px';
        kontejner.style.position = 'relative';

        let efektivnaSirina = this.plocicaW + this.fuga;
        let efektivnaVisina = this.plocicaH + this.fuga;
        let minimalniRez = 8.0; // Izbjegavanje kajli manjih od 8cm

        // Algoritam simetrije kuta protiv uskih traka
        let ostatakKuta = this.sirinaZida % efektivnaSirina;
        let pocetniPomakX = 0;
        if (ostatakKuta > 0 && ostatakKuta < minimalniRez) {
            pocetniPomakX = (efektivnaSirina - ostatakKuta) / 2;
        }

        let tekuceY = 0;
        while (tekuceY < this.visinaZida) {
            let tekuceX = pocetniPomakX > 0 ? -pocetniPomakX : 0;

            while (tekuceX < this.sirinaZida) {
                // Određivanje dizajna pločice ovisno o zonama
                let jeDekor = false;
                if (this.imaHorizontalnuZonu && tekuceY >= this.visinaRazgranicenja) jeDekor = true;
                if (this.imaVertikalnuZonu && tekuceX >= this.pocetakTrakeX && tekuceX <= (this.pocetakTrakeX + this.sirinaTrakeX)) jeDekor = true;

                let w = efektivnaSirina;
                let h = efektivnaVisina;

                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) {
                    w = efektivnaSirina + tekuceX;
                } else if (tekuceX + w > this.sirinaZida) {
                    w = this.sirinaZida - tekuceX;
                }

                if (tekuceY + h > this.visinaZida) {
                    h = this.visinaZida - tekuceY;
                }

                let jeRezana = w < efektivnaSirina || h < efektivnaVisina;
                let izOstatka = false;

                // Provjera baze ostataka (Ušteda materijala prateći uzorak)
                if (jeRezana && this.bazaOstataka.length > 0) {
                    let indeks = this.bazaOstataka.findIndex(ost => ost.w >= w && ost.h >= h);
                    if (indeks !== -1) {
                        this.bazaOstataka.splice(indeks, 1);
                        izOstatka = true;
                        this.iskoristeniOstatciCount++;
                    }
                }

                if (!izOstatka) {
                    this.potrosenoCijelihPlocica++;
                    if (jeRezana && (efektivnaSirina - w) > 10) {
                        this.bazaOstataka.push({ w: efektivnaSirina - w, h: h });
                    }
                }

                // Stvaranje vizualnog elementa u premium stilu
                const plocicaDiv = document.createElement('div');
                plocicaDiv.style.position = 'absolute';
                plocicaDiv.style.left = (stvarniX * skala) + 'px';
                plocicaDiv.style.bottom = (tekuceY * skala) + 'px';
                plocicaDiv.style.width = ((w - this.fuga) * skala) + 'px';
                plocicaDiv.style.height = ((h - this.fuga) * skala) + 'px';
                plocicaDiv.style.border = '1px solid #0A0C0E';
                
                // Određivanje premium boja na temelju arhitekture brenda BRO-KER
                if (izOstatka) {
                    plocicaDiv.style.backgroundColor = '#14281E'; // Eko ušteda (Tamno zelena)
                    plocicaDiv.style.border = '1px dashed #2E5C43';
                } else if (jeDekor) {
                    plocicaDiv.style.backgroundColor = '#1F2A33'; // Zona tuša / dekor (Slate plava)
                } else if (jeRezana) {
                    plocicaDiv.style.backgroundColor = '#1A1D20'; // Rezani krajevi zida (Tamno siva)
                } else {
                    plocicaDiv.style.backgroundColor = '#22282C'; // Tvornička cijela ploča (Škriljevac)
                }

                // Dodavanje diskretnih ikona za obradu
                if (izOstatka) {
                    plocicaDiv.innerHTML = `<span style="position:absolute; top:2px; left:3px; font-size:9px; color:#4EFA9E;">♻</span>`;
                }

                // Povezivanje s našim novim profesionalnim modalom na klik prsta
                let trenutnoW = w - this.fuga;
                let trenutnoH = h - this.fuga;
                plocicaDiv.onclick = () => this.prikaži2DDetaljModal(trenutnoW, trenutnoH, jeRezana, izOstatka);

                kontejner.appendChild(plocicaDiv);
                tekuceX += efektivnaSirina;
            }
            tekuceY += efektivnaVisina;
        }

        // Ažuriranje statusne poruke na dnu
        const statusTraka = document.getElementById('kamera-status');
        if (statusTraka) {
            statusTraka.innerHTML = `ZID: ${this.sirinaZida}x${this.visinaZida}cm | POTREBNO: <span style="color:#FFF;">${this.potrosenoCijelihPlocica} kom</span> | UŠTEDA: <span style="color:#4EFA9E;">${this.iskoristeniOstatciCount} kom</span>`;
        }
    },

    // MODERAN MODAL S OŠTRIM RUBOVIMA (Zamjena za amaterski alert)
    prikaži2DDetaljModal(w, h, jeRezana, izOstatka) {
        // Ako stari modal postoji, ukloni ga
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();

        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed';
        modalDiv.style.top = '0';
        modalDiv.style.left = '0';
        modalDiv.style.width = '100%';
        modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';

        let statusTekst = izOstatka ? "ISKORISTI REZANI OSTATAK" : jeRezana ? "REZATI OD CIJELE PLOČICE" : "TVORNIČKA CIJELA PLOČICA";
        let statusBoja = izOstatka ? "#4EFA9E" : jeRezana ? "#FFC107" : "#8C9BA5";

        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: ${statusBoja}; text-transform: uppercase;">${statusTekst}</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>
                
                <div style="width: 100%; height: 180px; background-color: #0A0C0E; border: 1px dashed #343D44; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 20px;">
                    <div style="width: 160px; height: 100px; background-color: #22282C; border: 2px solid #FFFFFF; position: relative;">
                        <span style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: #FFF;">${w.toFixed(1)} cm</span>
                        <span style="position: absolute; right: -55px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: bold; color: #FFF;">${h.toFixed(1)} cm</span>
                        
                        <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: rgba(255,255,255,0.05);">↑</span>
                    </div>
                </div>

                <div style="font-size: 12px; color: #8C9BA5; line-height: 1.6; margin-bottom: 20px;">
                    Mjere prenesene automatski s tvorničkih bridova. Provjerite smjer strelice prije rezanja mašinom.
                </div>

                <button class="gumb-ostri" style="margin:0; width:100%;" onclick="document.getElementById('broker-modal').remove()">POTVRDI I ZATVORI</button>
            </div>
        `;

        document.body.appendChild(modalDiv);
    }
};

const MatematikaEngine = {
    // Zadane vrijednosti koje ArUco kamera automatski prepisuje
    sirinaZida: 240, // u cm
    visinaZida: 200, // u cm
    
    // Parametri pločice
    plocicaW: 60,  // duljina u cm
    plocicaH: 30,  // sirina u cm
    fuga: 0.2,     // debljina fuge u cm (2mm)

    // Naša virtualna baza odrezanih komada za ponovno iskorištavanje uzorka
    bazaOstataka: [],
    iskoristeniOstatciCount: 0,
    potrosenoCijelihPlocica: 0,

    iscrtajMrezuPlocica() {
        const kontejner = document.getElementById('mreza-zida');
        kontejner.innerHTML = ''; // Očisti stari prikaz
        
        this.bazaOstataka = [];
        this.iskoristeniOstatciCount = 0;
        this.potrosenoCijelihPlocica = 0;

        // Prilagodba veličine vizualnog zida na ekranu mobitela
        kontejner.style.width = this.sirinaZida + 'px';
        kontejner.style.height = this.visinaZida + 'px';
        kontejner.style.position = 'relative';
        kontejner.style.border = '2px solid #3A4349';
        kontejner.style.backgroundColor = '#0B0C0E';

        let efektivnaSirina = this.plocicaW + this.fuga;
        let efektivnaVisina = this.plocicaH + this.fuga;
        let minimalniDopusteniRez = 8.0; // 8 cm granica za "kajle"

        // PRAVILO PROTIV USKIH REZOVA (Simetrija kuta)
        let ostatakKuta = this.sirinaZida % efektivnaSirina;
        let pocetniPomakX = 0;
        if (ostatakKuta > 0 && ostatakKuta < minimalniDopusteniRez) {
            pocetniPomakX = (efektivnaSirina - ostatakKuta) / 2; // Centriraj mrežu
        }

        let tekuceY = 0;
        while (tekuceY < this.visinaZida) {
            let tekuceX = pocetniPomakX > 0 ? -pocetniPomakX : 0;

            while (tekuceX < this.sirinaZida) {
                let w = efektivnaSirina;
                let h = efektivnaVisina;

                // Kraćenje na rubovima zida
                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) {
                    w = efektivnaSirina + tekuceX;
                } else if (tekuceX + w > this.sirinaZida) {
                    w = this.sirinaZida - tekuceX;
                }

                // Kraćenje na stropu
                if (tekuceY + h > this.visinaZida) {
                    h = this.visinaZida - tekuceY;
                }

                let jeRezana = w < efektivnaSirina || h < efektivnaVisina;
                let uzetaIzOstataka = false;

                // LOGIKA RECIKLIRANJA OSTATAKA (ISTI UZORAK)
                if (jeRezana && this.bazaOstataka.length > 0) {
                    let indeksOstatka = this.bazaOstataka.findIndex(ost => ost.w >= w && ost.h >= h);
                    if (indeksOstatka !== -1) {
                        this.bazaOstataka.splice(indeksOstatka, 1);
                        uzetaIzOstataka = true;
                        this.iskoristeniOstatciCount++;
                    }
                }

                if (!uzetaIzOstataka) {
                    this.potrosenoCijelihPlocica++;
                    // Ako je pločica odrezana, spremi preostali dio u bazu za iduće redove
                    if (jeRezana && (efektivnaSirina - w) > 10) {
                        this.bazaOstataka.push({ w: efektivnaSirina - w, h: h });
                    }
                }

                // GENERIRANJE VIZUALNE PLOČICE U HTML-u (Oštri rubovi)
                const plocicaDiv = document.createElement('div');
                plocicaDiv.style.position = 'absolute';
                plocicaDiv.style.left = stvarniX + 'px';
                plocicaDiv.style.bottom = tekuceY + 'px';
                plocicaDiv.style.width = (w - this.fuga) + 'px';
                plocicaDiv.style.height = (h - this.fuga) + 'px';
                plocicaDiv.style.border = '1px solid #0F1113';
                
                // Bojanje ovisno o statusu (Ušteda = Zelena, Rezano = Plavkasto, Cijela = Siva)
                plocicaDiv.style.backgroundColor = uzetaIzOstataka ? '#144D3A' : jeRezana ? '#232A2E' : '#2C3236';
                
                // Klik na pojedinu pločicu otvara njezine 2D kote za rezanje
                plocicaDiv.onclick = () => this.otvori2DDetalj(w, h, jeRezana, uzetaIzOstataka);

                kontejner.appendChild(plocicaDiv);
                tekuceX += efektivnaSirina;
            }
            tekuceY += efektivnaVisina;
        }

        // Ažuriranje statusne trake s rezultatima uštede
        const statusTraka = document.getElementById('kamera-status');
        if (statusTraka) {
            statusTraka.innerText = `Mreža izračunata. Dimenzije zida: ${this.sirinaZida}x${this.visinaZida} cm. Ušteđeno komada: ${this.iskoristeniOstatciCount}`;
        }
    },

    otvori2DDetalj(w, h, jeRezana, izOstatka) {
        // Dinamički iskačući prozor (Modal) za rezanje na terenu
        alert(`2D REZANJE:\nŠirina: ${w.toFixed(1)} cm\nVisina: ${h.toFixed(1)} cm\nStatus: ${izOstatka ? "Iskoristi odrezani ostatak (Ušteda)" : jeRezana ? "Rezati od cijele pločice" : "Cijela pločica"}`);
    }
};

const MatematikaEngine = {
    sirinaZida: 240, 
    visinaZida: 200, 
    
    plocicaW: 60,  
    plocicaH: 30,  
    fuga: 0.2,     

    imaHorizontalnuZonu: false,
    imaVertikalnuZonu: false,
    visinaRazgranicenja: 90, 
    pocetakTrakeX: 90,       
    sirinaTrakeX: 60,        

    // Niz u koji se spremaju unesena vrata i prozori
    popisOtvora: [],

    bazaOstataka: [],
    iskoristeniOstatciCount: 0,
    potrosenoCijelihPlocica: 0,

    azurirajDimenzijeZida() {
        this.sirinaZida = parseFloat(document.getElementById('input-zid-w').value) || 240;
        this.visinaZida = parseFloat(document.getElementById('input-zid-h').value) || 200;
        this.iscrtajMrezuPlocica();
    },

    toggleVisina(vrijednost) {
        this.imaHorizontalnuZonu = vrijednost;
        this.iscrtajMrezuPlocica();
    },

    toggleTus(vrijednost) {
        this.imaVertikalnuZonu = vrijednost;
        this.iscrtajMrezuPlocica();
    },

    // DIJALOG ZA UNOS VRATA ILI PROZORA
    prikažiDijalogZaOtvor() {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();

        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed';
        modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';

        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #FFF; text-transform: uppercase;">DODAJ GRAĐEVINSKI OTVOR</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>
                
                <div style="margin-bottom:12px;">
                    <label style="font-size:10px; color:#6C7A84; font-weight:bold; display:block; margin-bottom:4px;">TIP OTVORA</label>
                    <select id="modal-tip-otvora" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:10px;">
                        <option value="Vrata">VRATA (Krenite od poda Y=0)</option>
                        <option value="Prozor">PROZOR</option>
                    </select>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:12px;">
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">ŠIRINA (cm)</label>
                        <input type="number" id="modal-otvor-w" value="70" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">VISINA (cm)</label>
                        <input type="number" id="modal-otvor-h" value="120" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">OD LIJEVA X (cm)</label>
                        <input type="number" id="modal-otvor-x" value="40" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">OD PODA Y (cm)</label>
                        <input type="number" id="modal-otvor-y" value="0" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                </div>

                <button class="gumb-ostri" style="margin:0; width:100%; background-color:#19242D; border-color:#34495C;" onclick="MatematikaEngine.zakljucajOtvorIzForme()">UBACI NA ZID</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    zakljucajOtvorIzForme() {
        const tip = document.getElementById('modal-tip-otvora').value;
        const w = parseFloat(document.getElementById('modal-otvor-w').value) || 60;
        const h = parseFloat(document.getElementById('modal-otvor-h').value) || 60;
        const x = parseFloat(document.getElementById('modal-otvor-x').value) || 0;
        const y = parseFloat(document.getElementById('modal-otvor-y').value) || 0;

        this.popisOtvora.push({ tip, w, h, x, y });
        document.getElementById('broker-modal').remove();
        this.iscrtajMrezuPlocica(); // Ponovno pokretanje proračuna zida
    },

    iscrtajMrezuPlocica() {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner) return;
        
        kontejner.innerHTML = ''; 
        this.bazaOstataka = [];
        this.iskoristeniOstatciCount = 0;
        this.potrosenoCijelihPlocica = 0;

        const maxMoguciW = kontejner.parentElement.clientWidth;
        const skala = maxMoguciW / this.sirinaZida;

        kontejner.style.width = (this.sirinaZida * skala) + 'px';
        kontejner.style.height = (this.visinaZida * skala) + 'px';

        let efektivnaSirina = this.plocicaW + this.fuga;
        let efektivnaVisina = this.plocicaH + this.fuga;
        let minimalniRez = 8.0;

        let ostatakKuta = this.sirinaZida % efektivnaSirina;
        let pocetniPomakX = 0;
        if (ostatakKuta > 0 && ostatakKuta < minimalniRez) {
            pocetniPomakX = (efektivnaSirina - ostatakKuta) / 2;
        }

        let tekuceY = 0;
        while (tekuceY < this.visinaZida) {
            let tekuceX = pocetniPomakX > 0 ? -pocetniPomakX : 0;

            while (tekuceX < this.sirinaZida) {
                let jeDekor = false;
                if (this.imaHorizontalnuZonu && tekuceY >= this.visinaRazgranicenja) jeDekor = true;
                if (this.imaVertikalnuZonu && tekuceX >= this.pocetakTrakeX && tekuceX <= (this.pocetakTrakeX + this.sirinaTrakeX)) jeDekor = true;

                let w = efektivnaSirina;
                let h = efektivnaVisina;

                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) { w = efektivnaSirina + tekuceX; } 
                else if (tekuceX + w > this.sirinaZida) { w = this.sirinaZida - tekuceX; }

                if (tekuceY + h > this.visinaZida) { h = this.visinaZida - tekuceY; }

                // --- MATEMATIKA KOLIZIJE S VRATIMA I PROZORIMA ---
                let plocicaPotpunoUnutarOtvora = false;
                let plocicaSijeceOtvor = false;

                for (let otvor of this.popisOtvora) {
                    // Provjera preklapanja geometrijskih pravokutnika
                    let xPreklapanje = Math.max(0, Math.min(stvarniX + w, otvor.x + otvor.w) - Math.max(stvarniX, otvor.x));
                    let yPreklapanje = Math.max(0, Math.min(tekuceY + h, otvor.y + otvor.h) - Math.max(tekuceY, otvor.y));
                    let povrsinaPreklapanja = xPreklapanje * yPreklapanje;

                    if (povrsinaPreklapanja > 0) {
                        let povrsinaPlocice = w * h;
                        // Ako preklapanje pokriva cijelu pločicu, preskoči njezinu ugradnju
                        if (Math.abs(povrsinaPreklapanja - povrsinaPlocice) < 1.0) {
                            plocicaPotpunoUnutarOtvora = true;
                        } else {
                            plocicaSijeceOtvor = true; // Pločica je na rubu otvora i mora se zarezati
                        }
                    }
                }

                // Ako na ovom mjestu nema zida (jer su tu vrata ili prozor), algoritam je briše iz troškovnika!
                if (plocicaPotpunoUnutarOtvora) {
                    tekuceX += efektivnaSirina;
                    continue;
                }

                let jeRezana = w < efektivnaSirina || h < efektivnaVisina || plocicaSijeceOtvor;
                let izOstatka = false;

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

                // CRTANJE PLOČICE
                const plocicaDiv = document.createElement('div');
                plocicaDiv.style.position = 'absolute';
                plocicaDiv.style.left = (stvarniX * skala) + 'px';
                plocicaDiv.style.bottom = (tekuceY * skala) + 'px';
                plocicaDiv.style.width = ((w - this.fuga) * skala) + 'px';
                plocicaDiv.style.height = ((h - this.fuga) * skala) + 'px';
                plocicaDiv.style.border = '1px solid #0A0C0E';
                
                if (izOstatka) {
                    plocicaDiv.style.backgroundColor = '#14281E';
                    plocicaDiv.style.border = '1px dashed #2E5C43';
                } else if (plocicaSijeceOtvor) {
                    plocicaDiv.style.backgroundColor = '#4C3319'; // Označavanje špaletnih rezova (Smeđe-narančasto)
                } else if (jeDekor) {
                    plocicaDiv.style.backgroundColor = '#1F2A33';
                } else if (jeRezana) {
                    plocicaDiv.style.backgroundColor = '#1A1D20';
                } else {
                    plocicaDiv.style.backgroundColor = '#22282C';
                }

                if (izOstatka) plocicaDiv.innerHTML = `<span style="position:absolute; top:2px; left:3px; font-size:9px; color:#4EFA9E;">♻</span>`;
                
                let trenutnoW = w - this.fuga;
                let trenutnoH = h - this.fuga;
                plocicaDiv.onclick = () => this.prikaži2DDetaljModal(trenutnoW, trenutnoH, jeRezana || plocicaSijeceOtvor, izOstatka);

                kontejner.appendChild(plocicaDiv);
                tekuceX += efektivnaSirina;
            }
            tekuceY += efektivnaVisina;
        }

        // --- ICRTAVANJE VIZUALNIH OTVORA (VRATA/PROZORI) NA PLATNO ---
        for (let otvor of this.popisOtvora) {
            const otvorDiv = document.createElement('div');
            otvorDiv.style.position = 'absolute';
            otvorDiv.style.left = (otvor.x * skala) + 'px';
            otvorDiv.style.bottom = (otvor.y * skala) + 'px';
            otvorDiv.style.width = (otvor.w * skala) + 'px';
            otvorDiv.style.height = (otvor.h * skala) + 'px';
            otvorDiv.style.backgroundColor = '#000000'; // Otvor je praznina na zidu
            otvorDiv.style.border = '2px solid #FF5555'; // Istaknuti crveni industrijski rub
            otvorDiv.style.display = 'flex';
            otvorDiv.style.alignItems = 'center';
            otvorDiv.style.justifyContent = 'center';
            otvorDiv.style.fontSize = '9px';
            otvorDiv.style.color = '#FF5555';
            otvorDiv.style.fontWeight = 'bold';
            otvorDiv.innerText = otvor.tip.toUpperCase();
            
            kontejner.appendChild(otvorDiv);
        }

        const statusTraka = document.getElementById('kamera-status');
        if (statusTraka) {
            statusTraka.innerHTML = `ZID: ${this.sirinaZida}x${this.visinaZida}cm | POTREBNO: <span style="color:#FFF;">${this.potrosenoCijelihPlocica} kom</span> | OTVORI: <span style="color:#FF5555;">${this.popisOtvora.length}</span>`;
        }
    },

    prikaži2DDetaljModal(w, h, jeRezana, izOstatka) {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();

        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed';
        modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';

        let statusTekst = izOstatka ? "ISKORISTI REZANI OSTATAK" : jeRezana ? "REZATI ZBOG RUBA / ŠPALETE" : "TVORNIČKA CIJELA PLOČICA";
        let statusBoja = izOstatka ? "#4EFA9E" : jeRezana ? "#FF5555" : "#8C9BA5";

        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
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
                    Mjere i izrezi špaleta preračunati su automatski od tvorničkih bridova.
                </div>

                <button class="gumb-ostri" style="margin:0; width:100%;" onclick="document.getElementById('broker-modal').remove()">POTVRDI I ZATVORI</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }
};

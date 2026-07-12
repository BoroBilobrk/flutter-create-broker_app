const MatematikaEngine = {
    trenutnaPovrsina: null,
    plocicaW: 120, plocicaH: 60, fuga: 0.2,
    odmakX: 0, 
    bazaOstataka: [], iskoristeniOstatciCount: 0, potrosenoCijelihPlocica: 0,

    osvjeziIzObjekta(povrsinaObj) {
        this.trenutnaPovrsina = povrsinaObj;
        
        this.plocicaW = parseFloat(this.trenutnaPovrsina.plocicaW) || 120;
        this.plocicaH = parseFloat(this.trenutnaPovrsina.plocicaH) || 60;
        this.fuga = (parseFloat(this.trenutnaPovrsina.fuga) || 2) / 10; 
        this.odmakX = parseFloat(this.trenutnaPovrsina.odmakX) || 0;
        
        const slider = document.getElementById('slider-odmak-x');
        const prikaza = document.getElementById('prikaz-odmaka');
        if (slider) {
            slider.max = this.plocicaW; 
            slider.value = this.odmakX;
        }
        if (prikaza) prikaza.innerText = this.odmakX.toFixed(1) + ' cm';

        this.iscrtajMrezuPlocica();
    },

    postaviOdmakX(vrijednost) {
        this.odmakX = parseFloat(vrijednost) || 0;
        const prikaza = document.getElementById('prikaz-odmaka');
        if (prikaza) prikaza.innerText = this.odmakX.toFixed(1) + ' cm';
        if (this.trenutnaPovrsina) this.trenutnaPovrsina.odmakX = this.odmakX;
        this.iscrtajMrezuPlocica();
    },

    nudgeRaster(iznos) {
        let noviOdmak = this.odmakX + iznos;
        if (noviOdmak < 0) noviOdmak = this.plocicaW + iznos; 
        if (noviOdmak > this.plocicaW) noviOdmak = 0; 
        const slider = document.getElementById('slider-odmak-x');
        if (slider) slider.value = noviOdmak;
        this.postaviOdmakX(noviOdmak);
    },

    prikaziDijalogZaOtvor() {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();
        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed'; modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999999';

        let jePod = this.trenutnaPovrsina.tip === 'Pod';
        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #FFF; text-transform: uppercase;">DODAJ OTVOR NA ZID</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="font-size:10px; color:#6C7A84; font-weight:bold; display:block; margin-bottom:4px;">TIP ELEMENTA</label>
                    <select id="modal-tip-otvora" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:10px;">
                        ${jePod ? `<option value="Slivnik">PODNI SLIVNIK / KANALICA</option>` : `<option value="Vrata">VRATA</option><option value="Prozor">PROZOR</option>`}
                    </select>
                </div>
                <div style="display:flex; gap:10px; margin-bottom:12px;">
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">SIRINA (cm)</label>
                        <input type="number" id="modal-otvor-w" value="70" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">VISINA (cm)</label>
                        <input type="number" id="modal-otvor-h" value="200" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
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
                <button class="gumb-ostri" style="margin:0; width:100%; background-color:#19242D; border-color:#34495C;" onclick="MatematikaEngine.zakljucajOtvorIzForme()">UBACI NA CRTEZ</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    zakljucajOtvorIzForme() {
        const tip = document.getElementById('modal-tip-otvora').value;
        const w = parseFloat(document.getElementById('modal-otvor-w').value) || 70;
        const h = parseFloat(document.getElementById('modal-otvor-h').value) || 200;
        const x = parseFloat(document.getElementById('modal-otvor-x').value) || 0;
        const y = parseFloat(document.getElementById('modal-otvor-y').value) || 0;
        
        this.trenutnaPovrsina.popisOtvora.push({ tip, w, h, x, y });
        document.getElementById('broker-modal').remove();
        this.iscrtajMrezuPlocica();
    },

    iscrtajMrezuPlocica() {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner || !this.trenutnaPovrsina) return;
        
        kontejner.innerHTML = ''; 
        this.bazaOstataka = []; this.iskoristeniOstatciCount = 0; this.potrosenoCijelihPlocica = 0;

        let sW = this.trenutnaPovrsina.w; let sH = this.trenutnaPovrsina.h;
        if (this.trenutnaPovrsina.tip === 'Sokl') { sW = this.trenutnaPovrsina.h; sH = this.trenutnaPovrsina.w; }

        const maxMoguciW = kontejner.parentElement.clientWidth;
        const skala = maxMoguciW / sW;

        kontejner.style.width = (sW * skala) + 'px';
        kontejner.style.height = (sH * skala) + 'px';
        kontejner.style.position = 'relative'; 

        let efektivnaSirina = this.plocicaW + this.fuga;
        let efektivnaVisina = (this.trenutnaPovrsina.tip === 'Sokl') ? sH : this.plocicaH + this.fuga;
        let minimalniRez = 8.0;

        let ostatakKuta = sW % efektivnaSirina;
        let pocetniPomakX = 0;
        if (ostatakKuta > 0 && ostatakKuta < minimalniRez) {
            pocetniPomakX = (efektivnaSirina - ostatakKuta) / 2;
        }

        let startnaTockaX = this.odmakX;
        while (startnaTockaX > 0) { startnaTockaX -= efektivnaSirina; }

        let tekuceY = 0;
        while (tekuceY < sH) {
            let tekuceX = startnaTockaX;
            while (tekuceX < sW) {
                let w = efektivnaSirina; let h = efektivnaVisina;
                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) { w = efektivnaSirina + tekuceX; } 
                else if (tekuceX + w > sW) { w = sW - tekuceX; }
                if (tekuceY + h > sH) h = sH - tekuceY;

                let unutarOtvora = false;
                let sijeceOtvor = false;
                let detaljiKrunice = null;

                if (this.trenutnaPovrsina.popisOtvora) {
                    for (let otvor of this.trenutnaPovrsina.popisOtvora) {
                        let xPrek = Math.max(0, Math.min(stvarniX + w, otvor.x + otvor.w) - Math.max(stvarniX, otvor.x));
                        let yPrek = Math.max(0, Math.min(tekuceY + h, otvor.y + otvor.h) - Math.max(tekuceY, otvor.y));
                        
                        if ((xPrek * yPrek) > 0) {
                            if (otvor.tip.includes("Kruna")) {
                                sijeceOtvor = true;
                                detaljiKrunice = {
                                    oznaka: otvor.tip,
                                    odmakLijevo: (otvor.x + (otvor.w / 2)) - tekuceX,
                                    odmakDno: (otvor.y + (otvor.h / 2)) - tekuceY
                                };
                            } else {
                                if (Math.abs((xPrek * yPrek) - (w * h)) < 1.0) unutarOtvora = true;
                                else sijeceOtvor = true;
                            }
                        }
                    }
                }

                if (unutarOtvora || w <= 0.1 || h <= 0.1) { tekuceX += efektivnaSirina; continue; }

                this.potrosenoCijelihPlocica++;

                const plocicaDiv = document.createElement('div');
                plocicaDiv.style.position = 'absolute';
                plocicaDiv.style.left = (stvarniX * skala) + 'px';
                plocicaDiv.style.bottom = (tekuceY * skala) + 'px';
                plocicaDiv.style.width = ((w - this.fuga) * skala) + 'px';
                plocicaDiv.style.height = ((h - this.fuga) * skala) + 'px';
                plocicaDiv.style.border = '1px solid #0A0C0E';
                
                if (detaljiKrunice) plocicaDiv.style.backgroundColor = '#4A1525'; 
                else if (sijeceOtvor) plocicaDiv.style.backgroundColor = '#4C3319';
                else plocicaDiv.style.backgroundColor = '#22282C';

                let trenutnoW = w - this.fuga; let trenutnoH = h - this.fuga;
                
                // POPRAVLJENO: Proslijedjena tocna varijabla "jeRezana" umjesto sijeceOtvor!
                let jeRezana = (w < (this.plocicaW - 0.5)) || (h < (this.plocicaH - 0.5)) || sijeceOtvor;
                plocicaDiv.onclick = () => this.prikazi2DDetaljModal(trenutnoW, trenutnoH, jeRezana, false, detaljiKrunice);
                
                kontejner.appendChild(plocicaDiv);
                tekuceX += efektivnaSirina;
            }
            tekuceY += efektivnaVisina;
        }
        this.trenutnaPovrsina.izracunCijelih = this.potrosenoCijelihPlocica;
    },

    prikazi2DDetaljModal(w, h, jeRezana, izOstatka, nalogKrunice) {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();
        
        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed'; modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999999';

        let naslov = jeRezana ? "RAVNI REZ NA STOLU" : "TVORNOVICKI ELEMENT";
        let uputeHtml = "";

        if (nalogKrunice) {
            naslov = "NACRT ZA BUSENJE PLOCICE";
            uputeHtml = `
                <div style="background:#2C141A; padding:12px; font-size:11px; color:#FF5555; border-left:4px solid #FF5555; margin-bottom:15px; text-align:left; line-height:1.6;">
                    <strong>🛠️ OPERACIJA: ${nalogKrunice.oznaka.toUpperCase()}</strong><br>
                    • Od lijevog brida plocice odmjeri: <strong>${nalogKrunice.odmakLijevo.toFixed(1)} cm</strong><br>
                    • Od donjeg brida plocice odmjeri: <strong>${nalogKrunice.odmakDno.toFixed(1)} cm</strong><br>
                </div>
            `;
        }

        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 11px; font-weight: 700; color: #4EFA9E; letter-spacing:1px; text-transform:uppercase;">${naslov}</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>
                ${uputeHtml}
                <div style="width: 100%; height: 180px; background-color: #0A0C0E; border: 1px dashed #343D44; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 20px;">
                    <div style="width: 160px; height: 100px; background-color: #22282C; border: 2px solid #FFFFFF; position: relative;">
                        ${nalogKrunice ? `<div style="position:absolute; left:${(nalogKrunice.odmakLijevo/w)*100}%; bottom:${(nalogKrunice.odmakDno/h)*100}%; transform:translate(-50%, 50%); width:12px; height:12px; color:#FF5555; font-weight:bold; font-size:14px;">✕</div>` : ''}
                        <span style="position: absolute; bottom: -22px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: #FFF;">${w.toFixed(1)} cm</span>
                        <span style="position: absolute; right: -55px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: bold; color: #FFF;">${h.toFixed(1)} cm</span>
                    </div>
                </div>
                <button class="gumb-ostri" style="margin:0; width:100%;" onclick="document.getElementById('broker-modal').remove()">ZATVORI</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    pokreniTihiZbirniProracun(p) {
        let sW = p.w; let sH = p.h;
        if (p.tip === 'Sokl') { sW = p.h; sH = p.w; }
        
        let pW = parseFloat(p.plocicaW) || (p.tip === 'Pod' ? 60 : 120);
        let pH = parseFloat(p.plocicaH) || (p.tip === 'Pod' ? 60 : 60);
        let f = (parseFloat(p.fuga) || 2) / 10;
        let efSirina = pW + f; let efVisina = (p.tip === 'Sokl') ? sH : pH + f;
        
        let odmakX = parseFloat(p.odmakX) || 0;
        let minimalniRez = 8.0;
        let ostatakKuta = sW % efSirina;
        let pocetniPomakX = 0;
        if (ostatakKuta > 0 && ostatakKuta < minimalniRez) {
            pocetniPomakX = (efSirina - ostatakKuta) / 2;
        }
        
        let startnaTockaX = (pocetniPomakX > 0 ? -pocetniPomakX : 0) + odmakX;
        while (startnaTockaX > 0) { startnaTockaX -= efSirina; }
        
        let komada = 0; let tekuceY = 0;
        while (tekuceY < sH) {
            let tekuceX = startnaTockaX;
            while (tekuceX < sW) {
                let w = efSirina; let h = efVisina;
                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) { w = efSirina + tekuceX; } 
                else if (tekuceX + w > sW) { w = sW - tekuceX; }
                if (tekuceY + h > sH) h = sH - tekuceY;
                let unutarOtvora = false;
                if (p.popisOtvora) {
                    for (let otv of p.popisOtvora) {
                        if (otv.tip.includes("Kruna")) continue;
                        let xPrek = Math.max(0, Math.min(stvarniX + w, otv.x + otv.w) - Math.max(stvarniX, otv.x));
                        let yPrek = Math.max(0, Math.min(tekuceY + h, otv.y + otv.h) - Math.max(tekuceY, otv.y));
                        if ((xPrek * yPrek) > 0 && Math.abs((xPrek * yPrek) - (w * h)) < 1.0) unutarOtvora = true;
                    }
                }
                if (!unutarOtvora && w > 0.1 && h > 0.1) komada++;
                tekuceX += efSirina;
            }
            tekuceY += efVisina;
        }
        p.izracunCijelih = komada; p.kvadratura = (sW * sH) / 10000;
    }
};

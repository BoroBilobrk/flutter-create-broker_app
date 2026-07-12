const MatematikaEngine = {
    trenutnaPovrsina: null,
    plocicaW: 60, plocicaH: 30, fuga: 0.2,
    odmakX: 0, 
    bazaOstataka: [], iskoristeniOstatciCount: 0, potrosenoCijelihPlocica: 0,

    osveziIzObjekta(povrsinaObj) {
        this.trenutnaPovrsina = povrsinaObj;
        
        this.plocicaW = parseFloat(this.trenutnaPovrsina.plocicaW) || 60;
        this.plocicaH = parseFloat(this.trenutnaPovrsina.plocicaH) || 30;
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

    prikažiDijalogZaOtvor() {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();
        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed'; modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';

        let jePod = this.trenutnaPovrsina.tip === 'Pod';
        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #FFF; text-transform: uppercase;">DODAJ OTVOR</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="font-size:10px; color:#6C7A84; font-weight:bold; display:block; margin-bottom:4px;">TIP ELEMENTA</label>
                    <select id="modal-tip-otvora" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:10px;">
                        ${jePod ? `<option value="Slivnik">PODNI SLIVNIK / KANALICA</option>` : `<option value="Vrata">VRATA (Krenite od poda Y=0)</option><option value="Prozor">PROZOR</option>`}
                    </select>
                </div>
                <div style="display:flex; gap:10px; margin-bottom:12px;">
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">ŠIRINA X (cm)</label>
                        <input type="number" id="modal-otvor-w" value="${jePod?30:70}" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">DUŽINA Y (cm)</label>
                        <input type="number" id="modal-otvor-h" value="${jePod?30:200}" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">POZICIJA OD LIJEVA X (cm)</label>
                        <input type="number" id="modal-otvor-x" value="40" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#6C7A84; font-weight:bold;">POZICIJA OD DNA Y (cm)</label>
                        <input type="number" id="modal-otvor-y" value="0" style="width:100%; background:#0A0C0E; border:1px solid #343D44; color:#FFF; padding:8px;">
                    </div>
                </div>
                <button class="gumb-ostri" style="margin:0; width:100%; background-color:#19242D; border-color:#34495C;" onclick="MatematikaEngine.zakljucajOtvorIzForme()">UBACI NA CRTEŽ</button>
            </div>
        `;
        document.body.appendChild(modalDiv);
    },

    zakljucajOtvorIzForme() {
        const tip = document.getElementById('modal-tip-otvora').value;
        const w = parseFloat(document.getElementById('modal-otvor-w').value) || 30;
        const h = parseFloat(document.getElementById('modal-otvor-h').value) || 30;
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

        let sW = this.trenutnaPovrsina.w;
        let sH = this.trenutnaPovrsina.h;

        if (this.trenutnaPovrsina.tip === 'Sokl') {
            sW = this.trenutnaPovrsina.h; 
            sH = this.trenutnaPovrsina.w; 
        }

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

        let startnaTockaX = (pocetniPomakX > 0 ? -pocetniPomakX : 0) + this.odmakX;
        while (startnaTockaX > 0) {
            startnaTockaX -= efektivnaSirina;
        }

        let tekuceY = 0;
        while (tekuceY < sH) {
            let tekuceX = startnaTockaX;
            while (tekuceX < sW) {
                let jeDekor = false;
                if (this.trenutnaPovrsina.tip === 'Zid') {
                    if (this.trenutnaPovrsina.hZona && tekuceY >= this.visinaRazgranicenja) jeDekor = true;
                    if (this.trenutnaPovrsina.vZona && tekuceX >= this.pocetakTrakeX && tekuceX <= (this.pocetakTrakeX + this.sirinaTrakeX)) jeDekor = true;
                }

                let w = efektivnaSirina; let h = efektivnaVisina;
                let stvarniX = tekuceX < 0 ? 0 : tekuceX;
                if (tekuceX < 0) { w = efektivnaSirina + tekuceX; } 
                else if (tekuceX + w > sW) { w = sW - tekuceX; }
                if (tekuceY + h > sH) h = sH - tekuceY;

                let plocicaPotpunoUnutarOtvora = false;
                let plocicaSijeceOtvor = false;
                let detaljiZubaOtvora = null;

                if (this.trenutnaPovrsina.popisOtvora) {
                    for (let otvor of this.trenutnaPovrsina.popisOtvora) {
                        let xPreklapanje = Math.max(0, Math.min(stvarniX + w, otvor.x + otvor.w) - Math.max(stvarniX, otvor.x));
                        let yPreklapanje = Math.max(0, Math.min(tekuceY + h, otvor.y + otvor.h) - Math.max(tekuceY, otvor.y));
                        let povrsinaPreklapanja = xPreklapanje * yPreklapanje;
                        
                        if (povrsinaPreklapanja > 0) {
                            if (Math.abs(povrsinaPreklapanja - (w * h)) < 1.0) {
                                plocicaPotpunoUnutarOtvora = true;
                            } else {
                                plocicaSijeceOtvor = true;
                                // GEOMETRIJA ZUBA: Računamo gdje točno otvor "grize" pločicu
                                detaljiZubaOtvora = {
                                    tip: otvor.tip,
                                    izrezW: xPreklapanje,
                                    izrezH: yPreklapanje,
                                    // Ako je početak preklapanja na početku pločice, izrez je s LIJEVE strane
                                    saLijeveStrane: (Math.abs(Math.max(stvarniX, otvor.x) - stvarniX) < 0.5)
                                };
                            }
                        }
                    }
                }

                if (plocicaPotpunoUnutarOtvora || w <= 0.1 || h <= 0.1) {
                    tekuceX += efektivnaSirina;
                    continue;
                }

                let jeRezana = w < efektivnaSirina || h < efektivnaVisina || plocicaSijeceOtvor;
                let izOstatka = false;

                if (!izOstatka) this.potrosenoCijelihPlocica++;

                const plocicaDiv = document.createElement('div');
                plocicaDiv.style.position = 'absolute';
                plocicaDiv.style.left = (stvarniX * skala) + 'px';
                plocicaDiv.style.bottom = (tekuceY * skala) + 'px';
                plocicaDiv.style.width = ((w - this.fuga) * skala) + 'px';
                plocicaDiv.style.height = (this.trenutnaPovrsina.tip === 'Sokl') ? (h * skala) + 'px' : ((h - this.fuga) * skala) + 'px';
                plocicaDiv.style.border = '1px solid #0A0C0E';
                
                if (this.trenutnaPovrsina.tip === 'Sokl') plocicaDiv.style.backgroundColor = '#343D44'; 
                else if (plocicaSijeceOtvor) plocicaDiv.style.backgroundColor = '#4C3319';
                else if (jeDekor) plocicaDiv.style.backgroundColor = '#1F2A33';
                else if (jeRezana) plocicaDiv.style.backgroundColor = '#1A1D20';
                else plocicaDiv.style.backgroundColor = '#22282C';

                let trenutnoW = w - this.fuga; let trenutnoH = (this.trenutnaPovrsina.tip === 'Sokl') ? h : h - this.fuga;
                
                // Slanje geometrije zuba izravno na klik prsta
                plocicaDiv.onclick = () => this.prikaži2DDetaljModal(trenutnoW, trenutnoH, jeRezana, izOstatka, detaljiZubaOtvora);
                kontejner.appendChild(plocicaDiv);
                tekuceX += efektivnaSirina;
            }
            tekuceY += efektivnaVisina;
        }

        if (this.trenutnaPovrsina.popisOtvora) {
            for (let otvor of this.trenutnaPovrsina.popisOtvora) {
                const otvorDiv = document.createElement('div');
                otvorDiv.style.position = 'absolute';
                otvorDiv.style.left = (otvor.x * skala) + 'px'; otvorDiv.style.bottom = (otvor.y * skala) + 'px';
                otvorDiv.style.width = (otvor.w * skala) + 'px'; otvorDiv.style.height = (otvor.h * skala) + 'px';
                otvorDiv.style.backgroundColor = '#000000'; otvorDiv.style.border = '2px solid #FF5555';
                otvorDiv.style.display = 'flex'; otvorDiv.style.alignItems = 'center'; otvorDiv.style.justifyContent = 'center';
                otvorDiv.style.fontSize = '9px'; otvorDiv.style.color = '#FF5555'; otvorDiv.style.fontWeight = 'bold';
                otvorDiv.innerText = otvor.tip.toUpperCase();
                kontejner.appendChild(otvorDiv);
            }
        }

        this.trenutnaPovrsina.izracunCijelih = this.potrosenoCijelihPlocica;
        this.trenutnaPovrsina.kvadratura = (sW * sH) / 10000;
    },

    prikaži2DDetaljModal(w, h, jeRezana, izOstatka, zubOtvora) {
        const stariModal = document.getElementById('broker-modal');
        if (stariModal) stariModal.remove();
        
        const modalDiv = document.createElement('div');
        modalDiv.id = 'broker-modal';
        modalDiv.style.position = 'fixed'; modalDiv.style.top = '0'; modalDiv.style.left = '0';
        modalDiv.style.width = '100%'; modalDiv.style.height = '100%';
        modalDiv.style.backgroundColor = 'rgba(10, 12, 14, 0.95)';
        modalDiv.style.display = 'flex'; modalDiv.style.alignItems = 'center'; modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '9999';

        let naslovModala = "TVORNIČKI ELEMENT";
        let podaciZubaHtml = "";
        let stilZubaHtml = "";

        if (zubOtvora) {
            naslovModala = `IZREZ L ZA ${zubOtvora.tip.toUpperCase()}`;
            let ostatakW = w - zubOtvora.izrezW;
            let ostatakH = h - zubOtvora.izrezH;

            podaciZubaHtml = `
                <div style="background:#1C2125; padding:10px; font-size:11px; color:#FF5555; font-weight:bold; margin-bottom:10px;">
                    ⚠️ DIMENZIJE L-ZUBA ZA REZANJE:<br>
                    • Širina zuba (X): ${zubOtvora.izrezW.toFixed(1)} cm<br>
                    • Visina zuba (Y): ${zubOtvora.izrezH.toFixed(1)} cm<br>
                    • Preostali dio ploče za ugradnju: ${ostatakW.toFixed(1)} cm
                </div>
            `;

            // CRTAMO VIZUALNI ZUB OVISNO O TOME JE LI LIJEVA ILI DESNA ŠPALETA
            if (zubOtvora.saLijeveStrane) {
                // Vrata su s lijeve strane pločice -> izrezujemo donji lijevi kut
                stilZubaHtml = `<div style="position:absolute; bottom:0; left:0; width:${(zubOtvora.izrezW/w)*100}%; height:${(zubOtvora.izrezH/h)*100}%; background:#000; border-right:1px dashed #FF5555; border-top:1px dashed #FF5555; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FF5555;">IZREZ</div>`;
            } else {
                // Vrata su s desne strane pločice -> izrezujemo donji desni kut
                stilZubaHtml = `<div style="position:absolute; bottom:0; right:0; width:${(zubOtvora.izrezW/w)*100}%; height:${(zubOtvora.izrezH/h)*100}%; background:#000; border-left:1px dashed #FF5555; border-top:1px dashed #FF5555; display:flex; align-items:center; justify-content:center; font-size:9px; color:#FF5555;">IZREZ</div>`;
            }
        } else if (jeRezana) {
            naslovModala = "RAVNI REZ NA STOLU";
        }

        modalDiv.innerHTML = `
            <div style="background-color: #111417; border: 1px solid #343D44; width: 90%; max-width: 360px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 11px; font-weight: 700; color: #4EFA9E; letter-spacing:1px; text-transform:uppercase;">${naslovModala}</span>
                    <span style="cursor: pointer; font-size: 20px; color: #6C7A84;" onclick="document.getElementById('broker-modal').remove()">✕</span>
                </div>

                ${podaciZubaHtml}

                <div style="width: 100%; height: 180px; background-color: #0A0C0E; border: 1px dashed #343D44; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 20px;">
                    <div style="width: 160px; height: 100px; background-color: #22282C; border: 2px solid #FFFFFF; position: relative;">
                        ${stilZubaHtml}
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
        let pW = parseFloat(p.plocicaW) || 60;
        let pH = parseFloat(p.plocicaH) || 30;
        let f = (parseFloat(p.fuga) || 2) / 10;

        let efSirina = pW + f;
        let efVisina = (p.tip === 'Sokl') ? sH : pH + f;
        
        let komada = 0; let tekuceY = 0;
        while (tekuceY < sH) {
            let tekuceX = 0;
            while (tekuceX < sW) {
                let w = efSirina; let h = efVisina;
                let stvarniX = tekuceX;
                if (tekuceX + w > sW) w = sW - tekuceX;
                if (tekuceY + h > sH) h = sH - tekuceY;

                let unutarOtvora = false;
                if (p.popisOtvora) {
                    for (let otv of p.popisOtvora) {
                        let xPrek = Math.max(0, Math.min(stvarniX + w, otv.x + otv.w) - Math.max(stvarniX, otv.x));
                        let yPrek = Math.max(0, Math.min(tekuceY + h, otv.y + otv.h) - Math.max(tekuceY, otv.y));
                        if ((xPrek * yPrek) > 0 && Math.abs((xPrek * yPrek) - (w * h)) < 1.0) {
                            unutarOtvora = true;
                        }
                    }
                }
                if (!unutarOtvora) komada++;
                tekuceX += efSirina;
            }
            tekuceY += efVisina;
        }
        p.izracunCijelih = komada;
        p.kvadratura = (sW * sH) / 10000;
    }
};

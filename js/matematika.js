const MatematikaEngine = {
    osvjeziIzObjekta(p) {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner) return;

        let w = p.w || 100;
        let h = p.h || 265;
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || h) : h;
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = (p.fuga || 0) / 10; // Fuga u centimetrima

        let scale = kontejner.parentElement.clientWidth / w;
        if (scale > 3) scale = 3;

        kontejner.style.width = (w * scale) + 'px';
        kontejner.style.height = (h * scale) + 'px';
        kontejner.style.position = 'relative';
        kontejner.style.backgroundColor = '#1A1D20'; 
        kontejner.style.border = '2px solid #343D44';
        kontejner.innerHTML = '';

        // 1. CRTANJE POZADINE (Zid ispod pločica)
        let pozadinaDiv = document.createElement('div');
        pozadinaDiv.style.position = 'absolute';
        pozadinaDiv.style.bottom = '0';
        pozadinaDiv.style.left = '0';
        pozadinaDiv.style.width = '100%';
        pozadinaDiv.style.height = (oblH * scale) + 'px';
        
        let bgX = (p.odmakX || 0) * scale;
        let bgY = -((p.odmakY || 0) * scale);
        
        if (p.slikaTeksture) {
            pozadinaDiv.style.backgroundImage = `url(${p.slikaTeksture})`;
            pozadinaDiv.style.backgroundSize = `${(plW + f) * scale}px ${(plH + f) * scale}px`;
            pozadinaDiv.style.backgroundPosition = `${bgX}px ${bgY}px`;
        } else {
            pozadinaDiv.style.backgroundColor = '#2C3236';
        }
        kontejner.appendChild(pozadinaDiv);

        // 2. GENERIRANJE PAMETNIH PLOČICA (Objekti koji znaju svoje mjere)
        let startX = -((p.odmakX || 0) % (plW + f));
        if (startX > 0) startX -= (plW + f);
        
        let startY = -((p.odmakY || 0) % (plH + f));
        if (startY > 0) startY -= (plH + f);

        let tiles = [];

        for (let y = startY; y < oblH; y += (plH + f)) {
            for (let x = startX; x < w; x += (plW + f)) {
                // Fizičke granice komada pločice
                let tLeft = Math.max(0, x);
                let tRight = Math.min(w, x + plW);
                let tBottom = Math.max(0, y);
                let tTop = Math.min(oblH, y + plH);

                let tWidth = tRight - tLeft;
                let tHeight = tTop - tBottom;

                if (tWidth > 0.1 && tHeight > 0.1) {
                    let tileObj = {
                        x: tLeft, y: tBottom, w: tWidth, h: tHeight,
                        holes: [], cutouts: []
                    };
                    tiles.push(tileObj);
                }
            }
        }

        // 3. MAPIRANJE OTVORA I RUPA NA POJEDINAČNE PLOČICE
        if (p.popisOtvora && p.popisOtvora.length > 0) {
            p.popisOtvora.forEach(otvor => {
                // Crtanje otvora na mapi zida
                let oDiv = document.createElement('div');
                oDiv.style.position = 'absolute';
                oDiv.style.left = (otvor.x * scale) + 'px';
                oDiv.style.bottom = (otvor.y * scale) + 'px';
                oDiv.style.width = (otvor.w * scale) + 'px';
                oDiv.style.height = (otvor.h * scale) + 'px';
                oDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
                oDiv.style.border = '1px solid #FF4C4C';
                oDiv.innerHTML = `<span style="color:#FF4C4C; font-size:9px; position:absolute; top:4px; left:4px; font-weight:bold;">${otvor.tip.toUpperCase()}</span>`;
                kontejner.appendChild(oDiv);

                if (otvor.tip === "Vrata / Prozor") {
                    // L-rezovi i U-rezovi
                    tiles.forEach(t => {
                        let ixLeft = Math.max(t.x, otvor.x);
                        let ixRight = Math.min(t.x + t.w, otvor.x + otvor.w);
                        let ixBottom = Math.max(t.y, otvor.y);
                        let ixTop = Math.min(t.y + t.h, otvor.y + otvor.h);
                        if (ixLeft < ixRight && ixBottom < ixTop) {
                            t.cutouts.push({ w: ixRight - ixLeft, h: ixTop - ixBottom, x: ixLeft, y: ixBottom });
                        }
                    });
                } else { 
                    // Rupe za instalacije (Kote)
                    let cx = otvor.x + (otvor.w / 2); // Centar rupe X
                    let cy = otvor.y + (otvor.h / 2); // Centar rupe Y
                    
                    tiles.forEach(t => {
                        if (cx >= t.x && cx <= t.x + t.w && cy >= t.y && cy <= t.y + t.h) {
                            t.holes.push({ cx: cx, cy: cy, promjer: otvor.w });
                        }
                    });
                    
                    // Vizualna točka na zidu
                    let rDiv = document.createElement('div');
                    rDiv.style.position = 'absolute';
                    rDiv.style.left = (cx * scale - 4) + 'px';
                    rDiv.style.bottom = (cy * scale - 4) + 'px';
                    rDiv.style.width = '8px'; rDiv.style.height = '8px';
                    rDiv.style.backgroundColor = '#4EFA9E';
                    rDiv.style.borderRadius = '50%';
                    rDiv.style.boxShadow = '0 0 4px #000';
                    kontejner.appendChild(rDiv);
                }
            });
        }

        // 4. CRTANJE PAMETNIH PLOČICA (Interaktivni blokovi)
        tiles.forEach(t => {
            let tDiv = document.createElement('div');
            tDiv.style.position = 'absolute';
            tDiv.style.left = (t.x * scale) + 'px';
            tDiv.style.bottom = (t.y * scale) + 'px';
            tDiv.style.width = (t.w * scale) + 'px';
            tDiv.style.height = (t.h * scale) + 'px';
            tDiv.style.border = `1px solid ${p.slikaTeksture ? 'rgba(0,0,0,0.3)' : '#111417'}`;
            tDiv.style.boxSizing = 'border-box';
            
            // Logika: Je li ovo kompliciran komad keramike koji treba mjere?
            let isCut = (t.w < plW - 0.5) || (t.h < plH - 0.5);
            let hasAction = isCut || t.holes.length > 0 || t.cutouts.length > 0;

            if (hasAction) {
                tDiv.style.cursor = 'pointer';
                tDiv.style.backgroundColor = 'rgba(14, 165, 233, 0.15)'; // Plavkasti indikator
                tDiv.style.border = '1px solid rgba(14, 165, 233, 0.8)';
                tDiv.innerHTML = '<span style="font-size:7px; color:#0EA5E9; position:absolute; bottom:2px; right:2px; font-weight:bold;">Mjere👆</span>';
                
                // --- MATEMATIKA KLIKA ---
                tDiv.onclick = () => {
                    let isBottomRow = (t.y < 0.1); // Je li ovo donji rub prve pločice s poda
                    
                    let msg = `📐 KROJNA LISTA KOMADA:\n`;
                    msg += `=========================\n`;
                    msg += `Reži pločicu na:\nŠirina (X): ${t.w.toFixed(1)} cm\nVisina (Y): ${t.h.toFixed(1)} cm\n`;
                    
                    if (t.cutouts.length > 0) {
                        msg += `\n✂️ L-REZ / OTVOR (Odbaci ovaj dio):\n`;
                        t.cutouts.forEach((c, idx) => {
                            let odLijevo = c.x - t.x;
                            let odDno = c.y - t.y;
                            msg += `Otvor [Širina: ${c.w.toFixed(1)} cm x Visina: ${c.h.toFixed(1)} cm]\n`;
                            msg += `-> Započinje ${odLijevo.toFixed(1)} cm od lijevog brida pločice.\n`;
                            msg += `-> Započinje ${odDno.toFixed(1)} cm od donjeg brida pločice.\n`;
                        });
                    }

                    if (t.holes.length > 0) {
                        msg += `\n🎯 INSTALACIJE (Centar bušenja):\n`;
                        t.holes.forEach((h, idx) => {
                            // X Računica: Mjeri se od onog ruba koji je bliže (majstorska logika)
                            let distLeft = h.cx - t.x;
                            let distRight = (t.x + t.w) - h.cx;
                            let refX = distLeft <= distRight ? `LIJEVOG brida: ${distLeft.toFixed(1)} cm ->` : `DESNOG brida: <- ${distRight.toFixed(1)} cm`;
                            
                            // Y Računica: Laser na prvi red, inače od donjeg brida
                            let refY;
                            if (isBottomRow) {
                                let distTop = (t.y + t.h) - h.cy;
                                refY = `GORNJEG brida (LASER): ${distTop.toFixed(1)} cm prema dolje ↓`;
                            } else {
                                let distBottom = h.cy - t.y;
                                refY = `DONJEG brida: ${distBottom.toFixed(1)} cm prema gore ↑`;
                            }

                            msg += `\nRupa ${idx+1}:\n1. Od ${refX}\n2. Od ${refY}\n`;
                        });
                    }
                    alert(msg);
                };
            }
            kontejner.appendChild(tDiv);
        });
    },

    // --- KLASIČNI REAL-CUT ALGORITAM (Zadržan) ---
    izracunajPrecizniSkart(p) {
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = p.fuga / 10; 
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || p.h) : p.h;

        let brojRedova = Math.ceil(oblH / (plH + f));
        let iskoristeniCijeliKomadi = 0;
        let ostatci = []; 
        let specifikacijaPoRedovima = []; 

        for (let r = 0; r < brojRedova; r++) {
            let odmakEfektivni = (p.odmakX || 0) % (plW + f);
            let prviRez = plW - odmakEfektivni;
            if (prviRez > p.w) prviRez = p.w;

            let preostaloS = p.w - prviRez;
            let brojCijelih = 0;
            let zadnjiRez = 0;
            
            if (preostaloS > 0) {
                brojCijelih = Math.floor(preostaloS / (plW + f));
                zadnjiRez = preostaloS - (brojCijelih * (plW + f));
            }

            let infoReda = [];

            const uzmiKomad = (potrebnaDuzina) => {
                if (potrebnaDuzina <= 1) return; 
                let nadjenIndeks = -1;
                
                ostatci.sort((a, b) => a - b);
                for (let i = 0; i < ostatci.length; i++) {
                    if (ostatci[i] >= potrebnaDuzina) {
                        nadjenIndeks = i;
                        break;
                    }
                }

                if (nadjenIndeks !== -1) {
                    let iskoristenoS = ostatci[nadjenIndeks];
                    let preostaloOdSkarta = iskoristenoS - potrebnaDuzina - f;
                    ostatci.splice(nadjenIndeks, 1); 
                    if (preostaloOdSkarta > 5) ostatci.push(preostaloOdSkarta); 
                    infoReda.push(`<b>${potrebnaDuzina.toFixed(1)}cm</b> <span style="color:#10B981;">(iz ostatka)</span>`);
                } else {
                    iskoristeniCijeliKomadi++;
                    let noviOstatak = plW - potrebnaDuzina - f;
                    if (noviOstatak > 5) ostatci.push(noviOstatak); 
                    infoReda.push(`<b>${potrebnaDuzina.toFixed(1)}cm</b> <span style="color:#0EA5E9;">(nova pločica)</span>`);
                }
            };

            if (prviRez > 0 && prviRez < (plW - 0.5)) {
                uzmiKomad(prviRez);
            } else if (prviRez >= (plW - 0.5)) {
                iskoristeniCijeliKomadi++;
                infoReda.push(`Cijela`);
            }

            if (brojCijelih > 0) {
                iskoristeniCijeliKomadi += brojCijelih;
                infoReda.push(`${brojCijelih}x Cijela`);
            }

            if (zadnjiRez > 0.5) {
                uzmiKomad(zadnjiRez);
            }
            
            specifikacijaPoRedovima.push(`R${r+1}: ` + infoReda.join(' + '));
        }
        
        p.listaRezova = specifikacijaPoRedovima;
        return iskoristeniCijeliKomadi;
    },
    
    pokreniTihiZbirniProracun(p) {
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || p.h) : p.h;
        
        let povrsinaZida = (p.w * oblH) / 10000;
        let dodatnePlociceTus = 0;
        
        if (p.tusZone) {
            p.tusZone.forEach(tz => {
                let vrhTusa = tz.y + tz.h;
                if (vrhTusa > oblH) {
                    let prebacajH = vrhTusa - Math.max(tz.y, oblH);
                    povrsinaZida += (tz.w * prebacajH) / 10000;
                    dodatnePlociceTus += Math.ceil((tz.w * prebacajH) / (plW * plH)); 
                }
            });
        }

        if (p.popisOtvora) {
            p.popisOtvora.forEach(o => {
                let dnoOtvor = o.y;
                let vrhOtvor = o.y + o.h;
                let efektivniVrh = Math.min(vrhOtvor, oblH);
                let efektivnoDno = Math.max(dnoOtvor, 0);
                let efektivnaVisina = efektivniVrh - efektivnoDno;
                
                if (efektivnaVisina > 0) {
                    povrsinaZida -= (o.w * efektivnaVisina) / 10000;
                }
            });
        }

        p.kvadratura = Math.max(povrsinaZida, 0);
        p.izracunCijelih = this.izracunajPrecizniSkart(p) + dodatnePlociceTus;
    },

    prikaziDijalogZaOtvor() {
        let odabir = prompt("ODABIR ELEMENTA:\n1 - Rupa u zidu (Vrata/Prozor)\n2 - Tuš Zona (Dodatna keramika na zidu)", "1");
        if (!odabir) return;
        
        let tip = odabir === "2" ? "Tuš Zona" : "Vrata / Prozor";
        
        let w = parseFloat(prompt(`Širina za ${tip} (cm):`, tip === "Tuš Zona" ? "90" : "80"));
        let h = parseFloat(prompt(`Visina za ${tip} (cm):`, tip === "Tuš Zona" ? "265" : "200"));
        let x = parseFloat(prompt("Pozicija X (udaljenost od lijevog kuta zida u cm):", "0"));
        let y = parseFloat(prompt("Pozicija Y (udaljenost od poda u cm):", "0"));

        if (isNaN(w) || isNaN(h) || isNaN(x) || isNaN(y)) {
            alert("Neispravan unos dimenzija. Unesite brojeve."); return;
        }

        if (!App.projektObjekt) return;
        const p = App.projektObjekt.povrsine[App.aktivnaPovrsinaKey];
        
        if (tip === "Tuš Zona") {
            if (!p.tusZone) p.tusZone = [];
            p.tusZone.push({tip, w, h, x, y});
        } else {
            if (!p.popisOtvora) p.popisOtvora = [];
            p.popisOtvora.push({tip, w, h, x, y});
        }
        
        App.sacuvajPoljaUObjekt();
    }
};
        

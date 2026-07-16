const MatematikaEngine = {
    osvjeziIzObjekta(p) {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner) return;

        let w = p.w || 100;
        let h = p.h || 265;
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || h) : h;
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = (p.fuga || 0) / 10; 

        let scale = kontejner.parentElement.clientWidth / w;
        if (scale > 3) scale = 3;

        kontejner.style.width = (w * scale) + 'px';
        kontejner.style.height = (h * scale) + 'px';
        kontejner.style.position = 'relative';
        kontejner.style.backgroundColor = '#1A1D20'; 
        kontejner.style.border = '2px solid #343D44';
        kontejner.innerHTML = '';

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

        let startX = -((p.odmakX || 0) % (plW + f));
        if (startX > 0) startX -= (plW + f);
        
        let startY = -((p.odmakY || 0) % (plH + f));
        if (startY > 0) startY -= (plH + f);

        let tiles = [];

        for (let y = startY; y < oblH; y += (plH + f)) {
            for (let x = startX; x < w; x += (plW + f)) {
                let tLeft = Math.max(0, x);
                let tRight = Math.min(w, x + plW);
                let tBottom = Math.max(0, y);
                let tTop = Math.min(oblH, y + plH);

                let reqLeft = tLeft;
                let reqRight = tRight;
                let isCompletelyHidden = false;
                let tileCutouts = [];

                if (p.popisOtvora) {
                    p.popisOtvora.forEach(otvor => {
                        if (otvor.tip === "Vrata / Prozor") {
                            let ixLeft = Math.max(tLeft, otvor.x);
                            let ixRight = Math.min(tRight, otvor.x + otvor.w);
                            let ixBottom = Math.max(tBottom, otvor.y);
                            let ixTop = Math.min(tTop, otvor.y + otvor.h);

                            if (ixLeft < ixRight && ixBottom < ixTop) {
                                if (ixLeft <= tLeft && ixRight >= tRight && ixBottom <= tBottom && ixTop >= tTop) {
                                    isCompletelyHidden = true;
                                }
                                if (ixBottom <= tBottom && ixTop >= tTop) {
                                    if (ixLeft <= reqLeft) reqLeft = Math.max(reqLeft, ixRight);
                                    if (ixRight >= reqRight) reqRight = Math.min(reqRight, ixLeft);
                                }
                                tileCutouts.push({ w: ixRight - ixLeft, h: ixTop - ixBottom, x: ixLeft, y: ixBottom });
                            }
                        }
                    });
                }

                if (isCompletelyHidden || reqRight <= reqLeft) continue;

                let tWidth = reqRight - reqLeft;
                let tHeight = tTop - tBottom; 

                if (tWidth > 0.1 && tHeight > 0.1) {
                    let tileObj = {
                        x: reqLeft, y: tBottom, w: tWidth, h: tHeight, 
                        origX: tLeft, holes: [], cutouts: tileCutouts
                    };
                    tiles.push(tileObj);
                }
            }
        }

        if (p.popisOtvora) {
            p.popisOtvora.forEach(otvor => {
                if (otvor.tip !== "Vrata / Prozor") {
                    let cx = otvor.x + (otvor.w / 2); 
                    let cy = otvor.y + (otvor.h / 2); 
                    
                    tiles.forEach(t => {
                        if (cx >= t.origX && cx <= t.origX + plW && cy >= t.y && cy <= t.y + t.h) {
                            t.holes.push({ cx: cx, cy: cy, promjer: otvor.w });
                        }
                    });
                }
            });
        }

        tiles.forEach(t => {
            let tDiv = document.createElement('div');
            tDiv.style.position = 'absolute';
            tDiv.style.left = (t.x * scale) + 'px';
            tDiv.style.bottom = (t.y * scale) + 'px';
            tDiv.style.width = (t.w * scale) + 'px';
            tDiv.style.height = (t.h * scale) + 'px';
            tDiv.style.border = `1px solid ${p.slikaTeksture ? 'rgba(0,0,0,0.3)' : '#111417'}`;
            tDiv.style.boxSizing = 'border-box';
            
            let isCut = (t.w < plW - 0.5) || (t.h < plH - 0.5);
            let hasAction = isCut || t.holes.length > 0 || t.cutouts.length > 0;

            if (hasAction) {
                tDiv.style.cursor = 'pointer';
                tDiv.style.backgroundColor = 'rgba(14, 165, 233, 0.15)'; 
                tDiv.style.border = '1px solid rgba(14, 165, 233, 0.8)';
                tDiv.innerHTML = '<span style="font-size:7px; color:#0EA5E9; position:absolute; bottom:2px; right:2px; font-weight:bold;">Mjere👆</span>';
                
                tDiv.onclick = () => {
                    let isBottomRow = (t.y < 0.1); 
                    
                    let msg = `📐 KROJNA LISTA KOMADA:\n=========================\n`;
                    msg += `Potreban komad:\nŠirina (X): ${t.w.toFixed(1)} cm\nVisina (Y): ${t.h.toFixed(1)} cm\n`;
                    
                    if (t.cutouts.length > 0) {
                        msg += `\n✂️ L-REZ (Odbaci ovaj dio):\n`;
                        t.cutouts.forEach((c) => {
                            let odLijevo = c.x - t.x;
                            let odDno = c.y - t.y;
                            msg += `Otvor [${c.w.toFixed(1)} x ${c.h.toFixed(1)} cm]\n`;
                            msg += `-> Započinje ${odLijevo.toFixed(1)} cm od lijevog brida pločice.\n`;
                            msg += `-> Započinje ${odDno.toFixed(1)} cm od donjeg brida pločice.\n`;
                        });
                    }

                    if (t.holes.length > 0) {
                        msg += `\n🎯 INSTALACIJE (Centar bušenja):\n`;
                        t.holes.forEach((h, idx) => {
                            let distLeft = h.cx - t.x;
                            let distRight = (t.x + t.w) - h.cx;
                            let refX = distLeft <= distRight ? `LIJEVOG brida: ${distLeft.toFixed(1)} cm ->` : `DESNOG brida: <- ${distRight.toFixed(1)} cm`;
                            
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

        if (p.popisOtvora) {
            p.popisOtvora.forEach(otvor => {
                let oDiv = document.createElement('div');
                oDiv.style.position = 'absolute';
                oDiv.style.left = (otvor.x * scale) + 'px';
                oDiv.style.bottom = (otvor.y * scale) + 'px';
                oDiv.style.width = (otvor.w * scale) + 'px';
                oDiv.style.height = (otvor.h * scale) + 'px';
                
                if (otvor.tip === "Vrata / Prozor") {
                    oDiv.style.backgroundColor = '#111417'; 
                    oDiv.style.border = '2px solid #FF4C4C';
                    oDiv.style.pointerEvents = 'none'; 
                    oDiv.innerHTML = `<span style="color:#FF4C4C; font-size:9px; position:absolute; top:4px; left:4px; font-weight:bold;">${otvor.tip.toUpperCase()}</span>`;
                } else {
                    oDiv.style.backgroundColor = '#4EFA9E';
                    oDiv.style.borderRadius = '50%';
                    oDiv.style.border = '1px solid #14281E';
                }
                kontejner.appendChild(oDiv);
            });
        }
    },

    izracunajPrecizniSkart(p) {
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = p.fuga / 10; 
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || p.h) : p.h;

        let startX = -((p.odmakX || 0) % (plW + f));
        if (startX > 0) startX -= (plW + f);
        
        let startY = -((p.odmakY || 0) % (plH + f));
        if (startY > 0) startY -= (plH + f);

        let iskoristeniCijeliKomadi = 0;
        let ostatci = [];
        let specifikacijaPoRedovima = [];
        let currentRed = 1;

        for (let y = startY; y < oblH; y += (plH + f)) {
            let infoReda = [];
            let redImaPlocica = false;

            for (let x = startX; x < p.w; x += (plW + f)) {
                let tLeft = Math.max(0, x);
                let tRight = Math.min(p.w, x + plW);
                let tBottom = Math.max(0, y);
                let tTop = Math.min(oblH, y + plH);

                let reqLeft = tLeft;
                let reqRight = tRight;
                let isCompletelyHidden = false;

                if (p.popisOtvora) {
                    for (let otvor of p.popisOtvora) {
                        if (otvor.tip === "Vrata / Prozor") {
                            let ixLeft = Math.max(tLeft, otvor.x);
                            let ixRight = Math.min(tRight, otvor.x + otvor.w);
                            let ixBottom = Math.max(tBottom, otvor.y);
                            let ixTop = Math.min(tTop, otvor.y + otvor.h);

                            if (ixLeft < ixRight && ixBottom < ixTop) {
                                if (ixLeft <= tLeft && ixRight >= tRight && ixBottom <= tBottom && ixTop >= tTop) {
                                    isCompletelyHidden = true;
                                    break;
                                }
                                if (ixBottom <= tBottom && ixTop >= tTop) {
                                    if (ixLeft <= reqLeft) reqLeft = Math.max(reqLeft, ixRight);
                                    if (ixRight >= reqRight) reqRight = Math.min(reqRight, ixLeft);
                                }
                            }
                        }
                    }
                }

                if (isCompletelyHidden || reqRight <= reqLeft) continue;

                let potrebnaSirina = reqRight - reqLeft;
                if (potrebnaSirina <= 0.1) continue;

                redImaPlocica = true;

                const uzmiKomad = (duzina) => {
                    if (duzina <= 1) return;
                    let nadjenIndeks = -1;
                    ostatci.sort((a, b) => a - b);
                    for (let i = 0; i < ostatci.length; i++) {
                        if (ostatci[i] >= duzina) {
                            nadjenIndeks = i; break;
                        }
                    }
                    if (nadjenIndeks !== -1) {
                        let iskoristenoS = ostatci[nadjenIndeks];
                        let preostalo = iskoristenoS - duzina - f;
                        ostatci.splice(nadjenIndeks, 1);
                        if (preostalo > 5) ostatci.push(preostalo);
                        infoReda.push(`<b>${duzina.toFixed(1)}cm</b> <span style="color:#10B981;">(iz ostatka)</span>`);
                    } else {
                        iskoristeniCijeliKomadi++;
                        let noviOstatak = plW - duzina - f;
                        if (noviOstatak > 5) ostatci.push(noviOstatak);
                        infoReda.push(`<b>${duzina.toFixed(1)}cm</b> <span style="color:#0EA5E9;">(nova pločica)</span>`);
                    }
                };

                if (potrebnaSirina >= plW - 0.5) {
                    iskoristeniCijeliKomadi++;
                    infoReda.push(`Cijela`);
                } else {
                    uzmiKomad(potrebnaSirina);
                }
            }

            if (redImaPlocica) {
                specifikacijaPoRedovima.push(`R${currentRed}: ` + infoReda.join(' + '));
            } else {
                if (y < oblH && (y + plH) > 0) {
                    specifikacijaPoRedovima.push(`R${currentRed}: <span style="color:#8C9BA5;">-- Prazno (Otvor) --</span>`);
                }
            }
            currentRed++;
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
                                          

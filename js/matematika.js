const MatematikaEngine = {
    osvjeziIzObjekta(p) {
        const kontejner = document.getElementById('mreza-zida');
        if (!kontejner) return;

        let w = p.w || 100;
        let h = p.h || 265;
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || h) : h;
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = p.fuga || 0;

        let scale = kontejner.parentElement.clientWidth / w;
        if (scale > 3) scale = 3;

        kontejner.style.width = (w * scale) + 'px';
        kontejner.style.height = (h * scale) + 'px';
        kontejner.style.position = 'relative';
        kontejner.style.backgroundColor = '#1A1D20'; 
        kontejner.style.border = '2px solid #343D44';
        kontejner.innerHTML = '';

        let keramikaDiv = document.createElement('div');
        keramikaDiv.style.position = 'absolute';
        keramikaDiv.style.bottom = '0';
        keramikaDiv.style.left = '0';
        keramikaDiv.style.width = '100%';
        keramikaDiv.style.height = (oblH * scale) + 'px';

        let bgX = p.odmakX * scale;
        let bgY = -(p.odmakY * scale);
        
        let gridLines = `
            linear-gradient(to right, #111417 ${f * scale / 10}px, transparent ${f * scale / 10}px),
            linear-gradient(to bottom, #111417 ${f * scale / 10}px, transparent ${f * scale / 10}px)
        `;

        if (p.slikaTeksture) {
            keramikaDiv.style.backgroundColor = 'transparent';
            keramikaDiv.style.backgroundImage = gridLines + `, url(${p.slikaTeksture})`;
            keramikaDiv.style.backgroundSize = `${(plW + f/10) * scale}px ${(plH + f/10) * scale}px`;
        } else {
            keramikaDiv.style.backgroundColor = '#2C3236';
            keramikaDiv.style.backgroundImage = gridLines;
            keramikaDiv.style.backgroundSize = `${(plW + f/10) * scale}px ${(plH + f/10) * scale}px`;
        }
        
        keramikaDiv.style.backgroundPosition = `${bgX}px ${bgY}px`;
        kontejner.appendChild(keramikaDiv);

        if (p.tusZone && p.tusZone.length > 0) {
            p.tusZone.forEach(tz => {
                let tzDiv = document.createElement('div');
                tzDiv.style.position = 'absolute';
                tzDiv.style.left = (tz.x * scale) + 'px';
                tzDiv.style.bottom = (tz.y * scale) + 'px';
                tzDiv.style.width = (tz.w * scale) + 'px';
                tzDiv.style.height = (tz.h * scale) + 'px';
                
                if (p.slikaTeksture) {
                    tzDiv.style.backgroundImage = gridLines + `, url(${p.slikaTeksture})`;
                    tzDiv.style.backgroundPosition = `${bgX - (tz.x * scale)}px ${bgY + (tz.y * scale)}px`;
                } else {
                    tzDiv.style.backgroundColor = '#3A4248';
                    tzDiv.style.backgroundImage = gridLines;
                    tzDiv.style.backgroundPosition = `${bgX}px ${bgY}px`;
                }
                
                tzDiv.style.backgroundSize = keramikaDiv.style.backgroundSize;
                tzDiv.style.border = '2px dashed #4EFA9E';
                kontejner.appendChild(tzDiv);
            });
        }

        if (p.popisOtvora && p.popisOtvora.length > 0) {
            p.popisOtvora.forEach(o => {
                let oDiv = document.createElement('div');
                oDiv.style.position = 'absolute';
                oDiv.style.left = (o.x * scale) + 'px';
                oDiv.style.bottom = (o.y * scale) + 'px';
                oDiv.style.width = (o.w * scale) + 'px';
                oDiv.style.height = (o.h * scale) + 'px';
                oDiv.style.backgroundColor = '#000000';
                oDiv.style.border = '1px solid #FF4C4C';
                oDiv.innerHTML = `<span style="color:#FF4C4C; font-size:9px; position:absolute; top:4px; left:4px; font-weight:bold; letter-spacing:1px;">${o.tip.toUpperCase()}</span>`;
                kontejner.appendChild(oDiv);
            });
        }
    },

    izracunajPrecizniSkart(p) {
        let plW = p.rotacija ? p.plocicaH : p.plocicaW;
        let plH = p.rotacija ? p.plocicaW : p.plocicaH;
        let f = p.fuga / 10; 
        let oblH = (p.tip === 'Zid') ? (p.visinaOblaganja || p.h) : p.h;

        let brojRedova = Math.ceil(oblH / (plH + f));
        let ukupnoPlocica = 0;

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

            let plocicaURedu = brojCijelih;
            
            // LOGIKA UŠTEDE: Ako se levi i desni rez mogu dobiti iz JEDNE fizičke pločice
            if (prviRez > 0 && zadnjiRez > 0) {
                if ((prviRez + zadnjiRez) <= plW) {
                    plocicaURedu += 1; 
                } else {
                    plocicaURedu += 2; 
                }
            } else {
                if (prviRez > 0) plocicaURedu += 1;
                if (zadnjiRez > 0) plocicaURedu += 1;
            }
            ukupnoPlocica += plocicaURedu;
        }
        return ukupnoPlocica;
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
                    dodatnePlociceTus += Math.ceil((tz.w * prebacajH) / (plW * plH)); // gruba procjena za vrh tuša
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
        
        // NOVO: Pozivamo precizni matematički engine za rezove umjesto "slijepih" 10%
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
                

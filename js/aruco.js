const ArucoModul = {
    aktivan: false,
    stvarneDimenzijeMarkera: 10.0,
    pikselPoCm: 0,
    aiInicijaliziran: false,
    aiSession: null,

    // --- Stabilizacija (novo) ---
    ALPHA_ZAGLADJIVANJA: 0.3,        // 0 = vrlo glatko/sporo, 1 = bez zaglađivanja
    PRAG_UZASTOPNIH_DETEKCIJA: 3,    // koliko dobrih frejmova prije "zaključavanja" ploče
    MAX_FREJMOVA_BEZ_DETEKCIJE: 10,  // tolerancija na kratke gubitke (trešnja ruke)
    PRAG_POTVRDE_RUPE: 4,            // koliko od zadnjih N frejmova rupa mora biti viđena
    N_FREJMOVA_ZA_RUPE: 6,

    zadnjiKutevi: null,              // zaglađeni [x0,y0,x1,y1,x2,y2,x3,y3]
    uzastopneDobreDetekcije: 0,
    frejmovaBezDetekcije: 0,
    tabelaZakljucana: false,

    zadnjiStvarniW: 0,
    zadnjiStvarniH: 0,
    kandidatiRupa: [],                // { x, y, r, vidjeno, zadnjiFrame }
    frameBroj: 0,

    odrediKrunu(promjerCm) {
        let mm = promjerCm * 10;
        if (mm <= 8) return { oznaka: "Svrdlo O 6-8 mm", kruna: 8 };
        if (mm <= 37) return { oznaka: "Kruna O 35 mm (Mijesalice)", kruna: 35 };
        if (mm <= 72) return { oznaka: "Kruna O 68 mm (Uticnice)", kruna: 68 };
        return { oznaka: "Kruna O 110 mm (WC odvod)", kruna: 110 };
    },

    async inicijalizirajEdgeAI() {
        if (this.aiInicijaliziran) return;
        try {
            this.aiInicijaliziran = true;
            console.log("Edge AI podsustav spreman (heuristicki mod - vidi napomenu u odgovoru o custom modelu za pravu AI detekciju).");
        } catch (e) { console.log(e.message); }
    },

    otpocniDetekciju() {
        this.aktivan = true;
        this.resetirajStabilizaciju();
        this.inicijalizirajEdgeAI();
        this.procesirajOkvir();
    },

    resetirajStabilizaciju() {
        this.zadnjiKutevi = null;
        this.uzastopneDobreDetekcije = 0;
        this.frejmovaBezDetekcije = 0;
        this.tabelaZakljucana = false;
        this.kandidatiRupa = [];
        this.frameBroj = 0;
    },

    // Uredi 4 tocke u konzistentan redoslijed (po kutu oko centroida),
    // pocevsi od one najblize gornjem-lijevom kutu. Bez ovoga EMA
    // zagladjivanje dolje moglo bi miješati različite fizičke kuteve
    // iz frejma u frejm ako approxPolyDP vrati drugaciji redoslijed.
    urediKuteve(pts) {
        let cx = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
        let cy = (pts[0].y + pts[1].y + pts[2].y + pts[3].y) / 4;
        pts.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
        let minIdx = 0, minZbroj = Infinity;
        for (let i = 0; i < 4; i++) {
            let z = pts[i].x + pts[i].y;
            if (z < minZbroj) { minZbroj = z; minIdx = i; }
        }
        return pts.slice(minIdx).concat(pts.slice(0, minIdx));
    },

    // Odbacuje četverokute koji nisu "dovoljno pravokutni" da bi bili
    // BRO-KER ploca - smanjuje lazne detekcije (vrata, tableti, ekrani...)
    jeValjaniPravokutnik(pts) {
        for (let i = 0; i < 4; i++) {
            let p0 = pts[(i + 3) % 4], p1 = pts[i], p2 = pts[(i + 1) % 4];
            let v1 = { x: p0.x - p1.x, y: p0.y - p1.y };
            let v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
            let dot = v1.x * v2.x + v1.y * v2.y;
            let mag1 = Math.hypot(v1.x, v1.y), mag2 = Math.hypot(v2.x, v2.y);
            if (mag1 < 1 || mag2 < 1) return false;
            let kutStupnjevi = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * 180 / Math.PI;
            if (Math.abs(kutStupnjevi - 90) > 25) return false; // tolerancija +-25 stupnjeva
        }
        return true;
    },

    procesirajOkvir() {
        if (!this.aktivan) return;
        this.frameBroj++;
        const video = document.getElementById('web-kamera');
        const canvas = document.getElementById('aruco-canvas');
        if (!video || !canvas) { requestAnimationFrame(() => this.procesirajOkvir()); return; }

        const ctx = canvas.getContext('2d');
        const status = document.getElementById('kamera-status');

        if (video.videoWidth > 0 && canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (typeof cv !== 'undefined' && cv.Mat) {
            try {
                let src = cv.imread(canvas);
                let siva = new cv.Mat(); let bluranaSiva = new cv.Mat(); let thresholded = new cv.Mat(); let cisceno = new cv.Mat();

                cv.cvtColor(src, siva, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(siva, bluranaSiva, new cv.Size(9, 9), 2, 2);

                // Adaptivni C ovisno o prosjecnoj osvijetljenosti kadra -
                // fiksna vrijednost je davala losije rezultate u mracnijim
                // kupaonicama nego pri dnevnom svjetlu.
                let prosjecnaSvjetlina = cv.mean(bluranaSiva)[0];
                let cVrijednost = prosjecnaSvjetlina < 80 ? 2 : (prosjecnaSvjetlina > 170 ? 6 : 4);

                cv.adaptiveThreshold(bluranaSiva, thresholded, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 21, cVrijednost);

                let M_mat = cv.Mat.ones(3, 3, cv.CV_8U);
                cv.morphologyEx(thresholded, cisceno, cv.MORPH_CLOSE, M_mat);

                let contours = new cv.MatVector(); let hierarchy = new cv.Mat();
                cv.findContours(cisceno, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let kandidatNadjen = false; let maksimalnaPovrsina = 0; let najboljiKutevi = null;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i); let area = cv.contourArea(cnt);
                    if (area > 1500 && area > maksimalnaPovrsina && area < (canvas.width * canvas.height * 0.90)) {
                        let approx = new cv.Mat();
                        cv.approxPolyDP(cnt, approx, 0.04 * cv.arcLength(cnt, true), true);
                        if (approx.rows === 4 && cv.isContourConvex(approx)) {
                            let pts = [];
                            for (let k = 0; k < 4; k++) pts.push({ x: approx.data32S[k * 2], y: approx.data32S[k * 2 + 1] });
                            let urednePts = this.urediKuteve(pts);
                            if (this.jeValjaniPravokutnik(urednePts)) {
                                maksimalnaPovrsina = area; kandidatNadjen = true;
                                najboljiKutevi = urednePts;
                            }
                        }
                        approx.delete();
                    }
                }

                if (kandidatNadjen && najboljiKutevi) {
                    let tockeZaKuteve = najboljiKutevi.map(p => ({ x: p.x, y: p.y }));

                    // Sub-pixel rafiniranje kuteva - bez ovoga se preciznost
                    // gubi na razini punog piksela, sto na 3-4m udaljenosti
                    // od zida moze znaciti par centimetara greske. Zaštićeno
                    // vlastitim try/catch jer API naziv za TermCriteria flagove
                    // zna varirati izmedju opencv.js buildova.
                    try {
                        let cornersMat = new cv.Mat(4, 1, cv.CV_32FC2);
                        for (let k = 0; k < 4; k++) {
                            cornersMat.data32F[k * 2] = tockeZaKuteve[k].x;
                            cornersMat.data32F[k * 2 + 1] = tockeZaKuteve[k].y;
                        }
                        let winSize = new cv.Size(5, 5);
                        let zeroZone = new cv.Size(-1, -1);
                        let criteriaTip = (typeof cv.TERM_CRITERIA_EPS !== 'undefined')
                            ? (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER) : 3;
                        let criteria = new cv.TermCriteria(criteriaTip, 40, 0.001);
                        cv.cornerSubPix(siva, cornersMat, winSize, zeroZone, criteria);
                        for (let k = 0; k < 4; k++) {
                            tockeZaKuteve[k].x = cornersMat.data32F[k * 2];
                            tockeZaKuteve[k].y = cornersMat.data32F[k * 2 + 1];
                        }
                        cornersMat.delete();
                    } catch (subErr) {
                        console.log("cornerSubPix preskocen (koristim piksel-precizne kuteve): " + subErr.message);
                    }

                    let sirovKutevi = [];
                    for (let k = 0; k < 4; k++) sirovKutevi.push(tockeZaKuteve[k].x, tockeZaKuteve[k].y);

                    // Eksponencijalno zagladjivanje kroz vrijeme (EMA) - guši
                    // skakanje rastera bez primjetnog kašnjenja pri stvarnom pomjeranju.
                    if (this.zadnjiKutevi) {
                        for (let k = 0; k < 8; k++) {
                            sirovKutevi[k] = this.ALPHA_ZAGLADJIVANJA * sirovKutevi[k] + (1 - this.ALPHA_ZAGLADJIVANJA) * this.zadnjiKutevi[k];
                        }
                    }
                    this.zadnjiKutevi = sirovKutevi;
                    this.uzastopneDobreDetekcije++;
                    this.frejmovaBezDetekcije = 0;
                    if (this.uzastopneDobreDetekcije >= this.PRAG_UZASTOPNIH_DETEKCIJA) this.tabelaZakljucana = true;
                } else {
                    this.uzastopneDobreDetekcije = 0;
                    this.frejmovaBezDetekcije++;
                    // Kratki gubitak (trešnja ruke) ne resetira odmah - drzimo
                    // zadnje poznato stanje jos par frejmova.
                    if (this.frejmovaBezDetekcije > this.MAX_FREJMOVA_BEZ_DETEKCIJE) {
                        this.tabelaZakljucana = false;
                        this.zadnjiKutevi = null;
                    }
                }

                if (this.tabelaZakljucana && this.zadnjiKutevi) {
                    let [x0, y0, x1, y1, x2, y2, x3, y3] = this.zadnjiKutevi;

                    ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = "#4EFA9E";
                    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.stroke();

                    let srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, [x0, y0, x1, y1, x2, y2, x3, y3]);
                    let dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, this.stvarneDimenzijeMarkera, 0, this.stvarneDimenzijeMarkera, this.stvarneDimenzijeMarkera, 0, this.stvarneDimenzijeMarkera]);
                    let homografijaMatrica = cv.getPerspectiveTransform(dstPts, srcPts);

                    let sirinaPiksela = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
                    this.pikselPoCm = sirinaPiksela / this.stvarneDimenzijeMarkera;
                    this.zadnjiStvarniW = Math.round(canvas.width / this.pikselPoCm);
                    this.zadnjiStvarniH = Math.round(canvas.height / this.pikselPoCm);

                    status.innerHTML = `💎 BRO-KER ACTIVE • STABILIZIRANO`;
                    status.style.color = "#4EFA9E";

                    // ISPRAVKA: prije se uvijek pisalo u zid1 bez obzira koja je
                    // povrsina aktivna. Sada koristi App.aktivnaPovrsinaKey.
                    let aktivniKljuc = (typeof App !== 'undefined' && App.aktivnaPovrsinaKey) ? App.aktivnaPovrsinaKey : 'zid1';
                    let aktivnaPovrsina = (typeof App !== 'undefined' && App.projektObjekt) ? App.projektObjekt.povrsine[aktivniKljuc] : null;
                    let pW = aktivnaPovrsina ? aktivnaPovrsina.plocicaW : 120;
                    let pH = aktivnaPovrsina ? aktivnaPovrsina.plocicaH : 60;
                    let f = (aktivnaPovrsina ? aktivnaPovrsina.fuga : 2) / 10;
                    let efW = pW + f; let efH = pH + f;

                    ctx.strokeStyle = "rgba(78, 250, 158, 0.45)"; ctx.lineWidth = 3;

                    let projektirajTocku = (realX, realY) => {
                        let data = homografijaMatrica.data64F;
                        let px = data[0] * realX + data[1] * realY + data[2];
                        let py = data[3] * realX + data[4] * realY + data[5];
                        let pz = data[6] * realX + data[7] * realY + data[8];
                        return { x: px / pz, y: py / pz };
                    };

                    for (let realX = 0; realX <= this.zadnjiStvarniW; realX += efW) {
                        let tStart = projektirajTocku(realX, 0); let tEnd = projektirajTocku(realX, this.zadnjiStvarniH);
                        ctx.beginPath(); ctx.moveTo(tStart.x, tStart.y); ctx.lineTo(tEnd.x, tEnd.y); ctx.stroke();
                    }
                    for (let realY = 0; realY <= this.zadnjiStvarniH; realY += efH) {
                        let tStart = projektirajTocku(0, realY); let tEnd = projektirajTocku(this.zadnjiStvarniW, realY);
                        ctx.beginPath(); ctx.moveTo(tStart.x, tStart.y); ctx.lineTo(tEnd.x, tEnd.y); ctx.stroke();
                    }

                    // --- Detekcija rupa s vremenskim glasanjem (temporal voting) ---
                    // Prije se lista otvora prepisivala svaki frejm (do 60x/sek),
                    // sto je davalo treperave/nestabilne rezultate. Sada gradimo
                    // povjerenje kroz vise frejmova; samo stabilni kandidati se
                    // crtaju i kasnije nude za zakljucavanje.
                    let krugovi = new cv.Mat();
                    cv.HoughCircles(bluranaSiva, krugovi, cv.HOUGH_GRADIENT, 1, 50, 100, 55, 12, 100);
                    let brojDetektiranih = Math.min(krugovi.cols, 8);

                    for (let i = 0; i < brojDetektiranih; ++i) {
                        let cx = krugovi.data32F[i * 3]; let cy = krugovi.data32F[i * 3 + 1]; let r = krugovi.data32F[i * 3 + 2];
                        let podudaranje = this.kandidatiRupa.find(k => Math.hypot(k.x - cx, k.y - cy) < 15);
                        if (podudaranje) {
                            podudaranje.x = cx; podudaranje.y = cy; podudaranje.r = r;
                            podudaranje.vidjeno++; podudaranje.zadnjiFrame = this.frameBroj;
                        } else {
                            this.kandidatiRupa.push({ x: cx, y: cy, r, vidjeno: 1, zadnjiFrame: this.frameBroj });
                        }
                    }
                    krugovi.delete();
                    // Ocisti kandidate koji se dugo nisu pojavili (sjene, odsjaji)
                    this.kandidatiRupa = this.kandidatiRupa.filter(k => (this.frameBroj - k.zadnjiFrame) < this.N_FREJMOVA_ZA_RUPE);

                    let potvrdeniKandidati = this.kandidatiRupa.filter(k => k.vidjeno >= this.PRAG_POTVRDE_RUPE);
                    for (let k of potvrdeniKandidati) {
                        ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, 2 * Math.PI); ctx.lineWidth = 4; ctx.strokeStyle = "#FF5555"; ctx.stroke();
                    }

                    srcPts.delete(); dstPts.delete(); homografijaMatrica.delete();
                } else {
                    status.innerText = "Uperite kameru u BRO-KER plocu za aktivaciju 3D AR kuta...";
                    status.style.color = "#6C7A84";
                }
                src.delete(); siva.delete(); bluranaSiva.delete(); thresholded.delete(); cisceno.delete(); contours.delete(); hierarchy.delete(); M_mat.delete();
            } catch (err) { console.log("AR greska: " + err.message); }
        }
        requestAnimationFrame(() => this.procesirajOkvir());
    },

    // Poziva se iz Kamera.uhvatiMjere() - eksplicitno "zakljucava" trenutno
    // stabilno stanje u projekt, umjesto da to AR petlja radi neprestano.
    zakljucajMjere() {
        if (!this.tabelaZakljucana || typeof App === 'undefined' || !App.projektObjekt) {
            return { uspjeh: false, poruka: "Ploca jos nije stabilno detektirana. Drzi kameru mirno par sekundi." };
        }
        let aktivniKljuc = App.aktivnaPovrsinaKey || 'zid1';
        const p = App.projektObjekt.povrsine[aktivniKljuc];
        p.w = this.zadnjiStvarniW;
        p.h = this.zadnjiStvarniH;
        MatematikaEngine.sirinaZida = this.zadnjiStvarniW;
        MatematikaEngine.visinaZida = this.zadnjiStvarniH;

        p.popisOtvora = (p.popisOtvora || []).filter(o => !o.tip.includes("Kruna") && !o.tip.includes("Svrdlo"));
        const canvas = document.getElementById('aruco-canvas');
        let potvrdeniKandidati = this.kandidatiRupa.filter(k => k.vidjeno >= this.PRAG_POTVRDE_RUPE);
        for (let k of potvrdeniKandidati) {
            let rupaPromjerCm = (k.r * 2) / this.pikselPoCm;
            let preporuka = this.odrediKrunu(rupaPromjerCm);
            let realnaPozicijaX = k.x / this.pikselPoCm;
            let realnaPozicijaY = (canvas.height - k.y) / this.pikselPoCm;
            p.popisOtvora.push({
                tip: preporuka.oznaka, w: rupaPromjerCm, h: rupaPromjerCm,
                x: realnaPozicijaX - (rupaPromjerCm / 2), y: realnaPozicijaY - (rupaPromjerCm / 2)
            });
        }

        return { uspjeh: true, w: this.zadnjiStvarniW, h: this.zadnjiStvarniH, brojRupa: potvrdeniKandidati.length };
    }
};

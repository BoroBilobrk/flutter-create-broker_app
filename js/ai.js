const AIModul = {
    ucitajSlikuZidaZaBusenje(input) {
        try {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imgObj = new Image();
                    imgObj.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 1200;
                        let width = imgObj.width;
                        let height = imgObj.height;

                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(imgObj, 0, 0, width, height);

                        const komprimiranaSlika = canvas.toDataURL('image/jpeg', 0.8);

                        const imgElement = document.getElementById('foto-zid');
                        imgElement.onload = () => {
                            const canvasOverlay = document.getElementById('ai-overlay');
                            if(canvasOverlay) {
                                canvasOverlay.width = imgElement.naturalWidth;
                                canvasOverlay.height = imgElement.naturalHeight;
                                canvasOverlay.getContext('2d').clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
                            }
                        };
                        imgElement.src = komprimiranaSlika;
                        
                        document.getElementById('modal-fotogrametrija').style.display = 'flex';
                        const zoomSl = document.getElementById('zoom-slider');
                        if(zoomSl) zoomSl.value = 1;
                        AIModul.zumirajSliku(1);
                    };
                    imgObj.src = e.target.result;
                };
                reader.readAsDataURL(input.files[0]);
            }
        } catch(err) {
            alert("Greška učitavanja slike: " + err.message);
        }
    },

    zatvoriFotogrametriju() {
        document.getElementById('modal-fotogrametrija').style.display = 'none';
        const inp = document.getElementById('input-slika-zida');
        if (inp) inp.value = '';
    },

    zumirajSliku(val) {
        const prikaz = document.getElementById('zoom-prikaz');
        if(prikaz) prikaz.innerText = parseFloat(val).toFixed(1) + 'x';
        const omotac = document.getElementById('zoom-wrapper');
        if(omotac) omotac.style.transform = `scale(${val})`;
    },

    klikniNaSliku(e) {
        const img = document.getElementById('foto-zid');
        const rect = img.getBoundingClientRect();
        const zoomSl = document.getElementById('zoom-slider');
        const zoomFaktor = zoomSl ? parseFloat(zoomSl.value) : 1;
        
        const klikX = (e.clientX - rect.left) / zoomFaktor;
        const klikY = (e.clientY - rect.top) / zoomFaktor;
        
        const stvarnaSirinaSlike = img.clientWidth;
        const stvarnaVisinaSlike = img.clientHeight;
        
        const postotakX = klikX / stvarnaSirinaSlike;
        const postotakY = klikY / stvarnaVisinaSlike;
        
        if(typeof App === 'undefined' || !App.projektObjekt) return;
        const p = App.projektObjekt.povrsine[App.aktivnaPovrsinaKey];
        const stvarniZidW = p.w || 240;
        const stvarniZidH = p.h || 265;
        
        let tockaX = postotakX * stvarniZidW;
        let tockaY = stvarniZidH - (postotakY * stvarniZidH);

        let rupW = parseFloat(prompt("Unesi širinu otvora za bušenje u cm (npr. dozna=5, odvod=10):", "5"));
        let rupH = parseFloat(prompt("Unesi visinu otvora za bušenje u cm:", "5"));

        if (!rupW || !rupH) return;

        let finalX = tockaX - (rupW / 2);
        let finalY = tockaY - (rupH / 2);

        if (!p.popisOtvora) p.popisOtvora = [];
        p.popisOtvora.push({ tip: "Ručna koda", w: rupW, h: rupH, x: finalX, y: finalY });
        
        App.sacuvajPoljaUObjekt();
        
        // Značajna promjena: Ne zatvaramo prozor! Možeš klikati dalje.
        alert(`Oznaka spremljena!\nCentar: X=${tockaX.toFixed(1)} cm, Y=${tockaY.toFixed(1)} cm.\n\nMožeš nastaviti klikati na iduću cijev. Kad završiš, stisni 'ZATVORI' na vrhu.`);
    },

    pokreniAIDetekciju() {
        if (typeof cv === 'undefined' || !cv.Mat) {
            alert("🧠 AI mozak se još budi... Pričekaj par sekundi pa pokušaj ponovno.");
            return;
        }

        const imgElement = document.getElementById('foto-zid');
        if (!imgElement || !imgElement.src || imgElement.src.endsWith('html')) {
            alert("Prvo odaberi sliku zida iz galerije!");
            return;
        }

        // ZONIRANJE ZIDA (NOVO)
        let stropPosto = prompt("ZONIRANJE ZIDA:\nKoliko % slike na vrhu (strop/cijevi) želiš da AI ignorira?\n(Unesi 0 ako želiš skenirati sve)", "20");
        if (stropPosto === null) return; 
        stropPosto = parseInt(stropPosto) || 0;

        let podPosto = prompt("Koliko % slike na dnu (pod/šuta) želiš da AI ignorira?", "10");
        if (podPosto === null) return;
        podPosto = parseInt(podPosto) || 0;

        const canvas = document.getElementById('ai-overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let mat = cv.imread(imgElement);
        let gray = new cv.Mat();
        
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);

        // Brisanje stropa iz pamćenja AI-a
        if (stropPosto > 0) {
            let startY = Math.floor(gray.rows * (stropPosto / 100));
            let rectStrop = new cv.Rect(0, 0, gray.cols, startY);
            let roiStrop = gray.roi(rectStrop);
            roiStrop.setTo(new cv.Scalar(255)); // Farba u bijelo
            roiStrop.delete();
            
            // Vizualizacija na ekranu da korisnik vidi što je odrezano
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height * (stropPosto / 100));
        }

        // Brisanje poda iz pamćenja AI-a
        if (podPosto > 0) {
            let startY = Math.floor(gray.rows * (1 - (podPosto / 100)));
            let h = gray.rows - startY;
            let rectPod = new cv.Rect(0, startY, gray.cols, h);
            let roiPod = gray.roi(rectPod);
            roiPod.setTo(new cv.Scalar(255)); 
            roiPod.delete();
            
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, canvas.height * (1 - (podPosto / 100)), canvas.width, canvas.height);
        }

        cv.GaussianBlur(gray, gray, new cv.Size(7, 7), 2, 2);
        cv.equalizeHist(gray, gray);

        let circles = new cv.Mat();
        let minR = Math.floor(mat.cols / 100); 
        let maxR = Math.floor(mat.cols / 15); 

        cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, mat.cols/25, 50, 14, minR, maxR);

        let pronadjeneKote = [];
        
        if (circles.cols > 0) {
            for (let i = 0; i < circles.cols; ++i) {
                let x = circles.data32F[i * 3];
                let y = circles.data32F[i * 3 + 1];
                let radius = circles.data32F[i * 3 + 2];

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#4EFA9E'; 
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI, false);
                ctx.fillStyle = '#FF4C4C';
                ctx.fill();

                const postotakX = x / imgElement.naturalWidth;
                const postotakY = y / imgElement.naturalHeight;

                const p = App.projektObjekt.povrsine[App.aktivnaPovrsinaKey];
                const stvarniZidW = p.w || 240;
                const stvarniZidH = p.h || 265;
                
                let tockaX = postotakX * stvarniZidW;
                let tockaY = stvarniZidH - (postotakY * stvarniZidH);

                pronadjeneKote.push({x: tockaX, y: tockaY});
            }
            
            setTimeout(() => {
                let potvrda = confirm(`🧠 AI JE PRONAŠAO ${circles.cols} INSTALACIJA!\nProvjeri neon zelene krugove na slici.\nZatamnjeni dijelovi gore i dolje su uspješno ignorirani.\n\nKlikni 'OK' da ih zapišem u mrežu pločica.`);
                if(potvrda) {
                    const p = App.projektObjekt.povrsine[App.aktivnaPovrsinaKey];
                    if (!p.popisOtvora) p.popisOtvora = [];
                    
                    pronadjeneKote.forEach(kota => {
                        let finalX = kota.x - 2.5; 
                        let finalY = kota.y - 2.5;
                        p.popisOtvora.push({ tip: "AI Kalibrirano", w: 5, h: 5, x: finalX, y: finalY });
                    });
                    
                    App.sacuvajPoljaUObjekt();
                    alert("✅ AI je uspješno kalibrirao rupe!");
                    AIModul.zatvoriFotogrametriju();
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); 
                }
            }, 300);

        } else {
            alert("⚠️ Žbuka je previše kamuflirala rupe.\n\nSavjet: Tapni prstom direktno na zeleni čep na ekranu (Ručna koda).");
            // Uklanjamo zatamnjenje da korisnik može ručno klikati ako treba
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
        }

        mat.delete(); gray.delete(); circles.delete();
    }
};

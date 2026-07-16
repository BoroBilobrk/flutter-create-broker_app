const AIModul = {
    rezimKalibracije: false,
    tockeZida: [],

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
                            
                            this.rezimKalibracije = true;
                            this.tockeZida = [];
                            alert("📍 KALIBRACIJA ZIDA:\nDa bismo izbjegli distorziju kamere, molim te tapni točno na 4 KUTA ZIDA na slici.\n\nKlikaj redom u krug:\n1. Gore-Lijevo\n2. Gore-Desno\n3. Dolje-Desno\n4. Dolje-Lijevo");
                        };
                        imgElement.src = komprimiranaSlika;
                        
                        document.getElementById('modal-fotogrametrija').style.display = 'flex';
                        const zoomSl = document.getElementById('zoom-slider');
                        if(zoomSl) zoomSl.value = 1;
                        this.zumirajSliku(1);
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
        this.rezimKalibracije = false;
        this.tockeZida = [];
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

        const canvasOverlay = document.getElementById('ai-overlay');
        const ctx = canvasOverlay.getContext('2d');

        if (this.rezimKalibracije) {
            this.tockeZida.push({x: klikX, y: klikY});
            
            ctx.beginPath();
            ctx.arc(klikX, klikY, 8, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#FF4C4C';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            if (this.tockeZida.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.tockeZida[this.tockeZida.length - 2].x, this.tockeZida[this.tockeZida.length - 2].y);
                ctx.lineTo(klikX, klikY);
                ctx.strokeStyle = '#FF4C4C';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            if (this.tockeZida.length === 4) {
                ctx.beginPath();
                ctx.moveTo(this.tockeZida[3].x, this.tockeZida[3].y);
                ctx.lineTo(this.tockeZida[0].x, this.tockeZida[0].y);
                ctx.stroke();

                setTimeout(() => {
                    this.izravnajSliku(img, stvarnaSirinaSlike, stvarnaVisinaSlike);
                }, 300);
            }
            return; 
        }

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
        
        ctx.beginPath();
        ctx.arc(klikX, klikY, 6, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#FF4C4C';
        ctx.fill();

        alert(`Oznaka spremljena!\nCentar: X=${tockaX.toFixed(1)} cm, Y=${tockaY.toFixed(1)} cm.\n\nMožeš nastaviti klikati na iduću cijev.`);
    },

    izravnajSliku(imgElement, trenutnaSirina, trenutnaVisina) {
        if (typeof cv === 'undefined' || !cv.Mat) {
            alert("OpenCV još nije spreman. Pokušaj ponovno.");
            return;
        }

        const p = App.projektObjekt.povrsine[App.aktivnaPovrsinaKey];
        const stvarniZidW = p.w || 240;
        const stvarniZidH = p.h || 265;

        const ratio = stvarniZidH / stvarniZidW;
        const finalnaSirina = 1000; 
        const finalnaVisina = Math.round(1000 * ratio);

        let mat = cv.imread(imgElement);

        let scaleX = mat.cols / trenutnaSirina;
        let scaleY = mat.rows / trenutnaVisina;

        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            this.tockeZida[0].x * scaleX, this.tockeZida[0].y * scaleY, 
            this.tockeZida[1].x * scaleX, this.tockeZida[1].y * scaleY, 
            this.tockeZida[2].x * scaleX, this.tockeZida[2].y * scaleY, 
            this.tockeZida[3].x * scaleX, this.tockeZida[3].y * scaleY  
        ]);

        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            finalnaSirina, 0,
            finalnaSirina, finalnaVisina,
            0, finalnaVisina
        ]);

        let M = cv.getPerspectiveTransform(srcTri, dstTri);
        let ravniZid = new cv.Mat();
        cv.warpPerspective(mat, ravniZid, M, new cv.Size(finalnaSirina, finalnaVisina));

        const canvasTmp = document.createElement('canvas');
        cv.imshow(canvasTmp, ravniZid);
        
        imgElement.onload = () => {
            const canvasOverlay = document.getElementById('ai-overlay');
            if(canvasOverlay) {
                canvasOverlay.width = imgElement.naturalWidth;
                canvasOverlay.height = imgElement.naturalHeight;
                canvasOverlay.getContext('2d').clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
            }
            this.rezimKalibracije = false; 
            alert("🛠️ Zid je uspješno izravnat u savršen 2D tlocrt!\n\nSada možeš stisnuti AI skeniranje ili ručno tapkati instalacije.");
        };
        
        imgElement.src = canvasTmp.toDataURL('image/jpeg', 0.9);

        mat.delete(); srcTri.delete(); dstTri.delete(); M.delete(); ravniZid.delete();
    },

    pokreniAIDetekciju() {
        if (this.rezimKalibracije) {
            alert("Prvo moraš dovršiti kalibraciju zida (označiti sva 4 kuta)!");
            return;
        }

        if (typeof cv === 'undefined' || !cv.Mat) {
            alert("🧠 AI mozak se još budi... Pričekaj par sekundi pa pokušaj ponovno.");
            return;
        }

        const imgElement = document.getElementById('foto-zid');
        if (!imgElement || !imgElement.src || imgElement.src.endsWith('html')) {
            alert("Prvo odaberi sliku zida iz galerije!");
            return;
        }

        alert("🧠 AI pokreće skeniranje instalacija na izravnatom zidu...");

        const canvas = document.getElementById('ai-overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let mat = cv.imread(imgElement);
        let gray = new cv.Mat();
        
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);
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
                let potvrda = confirm(`🧠 AI JE PRONAŠAO ${circles.cols} INSTALACIJA!\nProvjeri neon zelene krugove na slici.\n\nKlikni 'OK' da ih zapišem u mrežu pločica.`);
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
                    this.zatvoriFotogrametriju();
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height); 
                }
            }, 300);

        } else {
            alert("⚠️ Žbuka je previše kamuflirala rupe.\n\nSavjet: Tapni prstom direktno na zeleni čep na ekranu (Ručna koda).");
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
        }

        mat.delete(); gray.delete(); circles.delete();
    }
};

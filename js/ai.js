const AIModul = {
    ucitajSlikuZidaZaBusenje(input) {
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
                    document.getElementById('zoom-slider').value = 1;
                    this.zumirajSliku(1);
                };
                imgObj.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    zatvoriFotogrametriju() {
        document.getElementById('modal-fotogrametrija').style.display = 'none';
        document.getElementById('input-slika-zida').value = '';
    },

    zumirajSliku(val) {
        document.getElementById('zoom-prikaz').innerText = parseFloat(val).toFixed(1) + 'x';
        document.getElementById('zoom-wrapper').style.transform = `scale(${val})`;
    },

    klikniNaSliku(e) {
        const img = document.getElementById('foto-zid');
        const rect = img.getBoundingClientRect();
        const zoomFaktor = parseFloat(document.getElementById('zoom-slider').value);
        
        const klikX = (e.clientX - rect.left) / zoomFaktor;
        const klikY = (e.clientY - rect.top) / zoomFaktor;
        
        const stvarnaSirinaSlike = img.clientWidth;
        const stvarnaVisinaSlike = img.clientHeight;
        
        const postotakX = klikX / stvarnaSirinaSlike;
        const postotakY = klikY / stvarnaVisinaSlike;
        
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
        alert(`Oznaka spremljena! Centar rupe: X=${tockaX.toFixed(1)} cm, Y=${tockaY.toFixed(1)} cm.`);
        this.zatvoriFotogrametriju();
    },

        pokreniAIDetekciju() {
        if (typeof cv === 'undefined' || !cv.Mat) {
            alert("🧠 AI mozak se još budi... Pričekaj par sekundi pa pokušaj ponovno.");
            return;
        }

        const imgElement = document.getElementById('foto-zid');
        if (!imgElement || !imgElement.src) {
            alert("Prvo odaberi sliku zida iz galerije!");
            return;
        }

        alert("🧠 AI pokreće dubinsko skeniranje...\nUključujem agresivni filter za žbuku!");

        const canvas = document.getElementById('ai-overlay');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let mat = cv.imread(imgElement);
        let gray = new cv.Mat();
        
        // 1. Pretvori u crno-bijelo
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);
        
        // 2. KLJUČNO: Gaussovo zamućenje. Ovo "pegla" grubu žbuku tako da robot 
        // prestane halucinirati od svake sitne sjene i fokusira se na veće oblike.
        cv.GaussianBlur(gray, gray, new cv.Size(7, 7), 2, 2);
        
        // 3. Brutalni kontrast da rupe postanu jako crne, a zid jako bijel
        cv.equalizeHist(gray, gray);

        let circles = new cv.Mat();
        
        // Proširujemo domet: tražimo i jako male zelene čepove (1/2 cola) i veće odvode (50mm+)
        let minR = Math.floor(mat.cols / 100); 
        let maxR = Math.floor(mat.cols / 15); 

        // POJAČANJE: 
        // param1 = 50 (bilo je 100). Smanjili smo prag za oštrinu ruba.
        // param2 = 14 (bilo je 20). Ovo je osjetljivost. 14 znači da hvata i nesavršene, 
        // malo oštećene rupe koje nisu idealan krug!
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
                ctx.strokeStyle = '#4EFA9E'; // Promijenio sam u neon zelenu da lakše vidiš!
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
        }

        mat.delete(); gray.delete(); circles.delete();
        }
    

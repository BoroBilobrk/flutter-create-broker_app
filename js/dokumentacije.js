const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        const p = projekt.povrsine;

        // SIGURNOSNA PROVJERA: Ako se povlače podaci iz neotvorenih tabova, izračunaj ih na licu mjesta
        let qZid1 = p.zid1.kvadratura || ((p.zid1.w * p.zid1.h) / 10000);
        let qZid2 = p.zid2.kvadratura || ((p.zid2.w * p.zid2.h) / 10000);
        let qZid3 = p.zid3.kvadratura || ((p.zid3.w * p.zid3.h) / 10000);
        let qZid4 = p.zid4.kvadratura || ((p.zid4.w * p.zid4.h) / 10000);

        let cZid1 = p.zid1.izracunCijelih || Math.ceil(qZid1 / ((p.zid1.plocicaW * p.zid1.plocicaH) / 10000));
        let cZid2 = p.zid2.izracunCijelih || Math.ceil(qZid2 / ((p.zid2.plocicaW * p.zid2.plocicaH) / 10000));
        let cZid3 = p.zid3.izracunCijelih || Math.ceil(qZid3 / ((p.zid3.plocicaW * p.zid3.plocicaH) / 10000));
        let cZid4 = p.zid4.izracunCijelih || Math.ceil(qZid4 / ((p.zid4.plocicaW * p.zid4.plocicaH) / 10000));

        let m2Zidovi = qZid1 + qZid2 + qZid3 + qZid4;
        let komZidovi = cZid1 + cZid2 + cZid3 + cZid4;

        let m2Pod = p.pod.kvadratura || ((p.pod.w * p.pod.h) / 10000);
        let komPod = p.pod.izracunCijelih || Math.ceil(m2Pod / ((p.pod.plocicaW * p.pod.plocicaH) / 10000));

        // Automatsko računanje opsega ako sokl tab nije bio otvoren
        let opseg = p.zid1.w + p.zid2.w + p.zid3.w + p.zid4.w;
        let dužinaSokla = p.sokl.h || opseg; 
        let komSokla = p.sokl.izracunCijelih || Math.ceil(dužinaSokla / p.sokl.plocicaW);

        const pdfProzor = window.open('', '_blank');
        if (!pdfProzor) {
            alert("Preglednik na mobitelu je blokirao skočne prozore. Molimo dopustite 'Pop-ups' u postavkama preglednika za izvoz PDF-a.");
            return;
        }

        pdfProzor.document.write(`
            <!DOCTYPE html>
            <html lang="hr">
            <head>
                <meta charset="UTF-8">
                <title>BRO-KER | Zbirna Specifikacija</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A1D20; padding: 40px; margin: 0; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2C3236; padding-bottom: 20px; }
                    .logo { font-weight: bold; font-size: 26px; letter-spacing: 2px; color: #2C3236; }
                    .info-blok { margin: 30px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 35px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E0E0E0; font-size: 13px; }
                    th { background-color: #2C3236; color: #FFFFFF; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
                    .istaknuto { background-color: #EAEDEF; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">BRO-KER</div>
                    <div style="text-transform:uppercase; font-size:12px; font-weight:bold; color:#8A959E;">ZBIRNI TROŠKOVNIK PROSTORIJE</div>
                </div>
                
                <div class="info-blok">
                    <strong>KLIJENT: ${projekt.klijent.toUpperCase()}</strong><br>
                    Objekt / Prostorija: ${projekt.prostorija}<br>
                    Sustav: BRO-KER Multi-Surface CAD Proračun
                </div>

                <h3>1. SPECIFIKACIJA ZIDOVA (Format: ${p.zid1.plocicaW}x${p.zid1.plocicaH} cm | Fuga: ${p.zid1.fuga} mm)</h3>
                <table>
                    <thead>
                        <tr><th>Opis površine</th><th>Neto kvadratura</th><th>Potrebno pločica (kom)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Zid 1 (Prednji)</td><td>${qZid1.toFixed(2)} m²</td><td>${cZid1} kom</td></tr>
                        <tr><td>Zid 2 (Desni)</td><td>${qZid2.toFixed(2)} m²</td><td>${cZid2} kom</td></tr>
                        <tr><td>Zid 3 (Stražnji)</td><td>${qZid3.toFixed(2)} m²</td><td>${cZid3} kom</td></tr>
                        <tr><td>Zid 4 (Lijevi)</td><td>${qZid4.toFixed(2)} m²</td><td>${cZid4} kom</td></tr>
                        <tr class="istaknuto"><td>UKUPNO ZIDOVI</td><td>${m2Zidovi.toFixed(2)} m²</td><td>${komZidovi} kom</td></tr>
                    </tbody>
                </table>

                <h3>2. SPECIFIKACIJA PODA I SOKLA (Format poda: ${p.pod.plocicaW}x${p.pod.plocicaH} cm | Fuga: ${p.pod.fuga} mm)</h3>
                <table>
                    <thead>
                        <tr><th>Tip površine</th><th>Dimenzija / Opseg</th><th>Potrebna količina</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Podna površina (Neto)</td><td>${p.pod.w} x ${p.pod.h} cm</td><td>${m2Pod.toFixed(2)} m² (${komPod} kom)</td></tr>
                        <tr><td>Sokl (Linearni metri dužina)</td><td>Opseg sobe: ${(dužinaSokla/100).toFixed(2)} m</td><td>${komSokla} komada (Visina sokla: ${p.sokl.w} cm)</td></tr>
                    </tbody>
                </table>

                <div style="background-color:#2C3236; color:#FFF; padding:15px; font-weight:bold; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
                    ZAKLJUČAK NARUDŽBENICE ZA SALON KERAMIKE
                </div>
                <div style="border:2px solid #2C3236; padding:20px; font-size:15px; line-height:2;">
                    • Ukupno zidne keramike za narudžbu: <strong>${m2Zidovi.toFixed(2)} m² (${komZidovi} komada)</strong><br>
                    • Ukupno podne keramike za narudžbu: <strong>${m2Pod.toFixed(2)} m² (${komPod} komada)</strong><br>
                    • Ukupno elemenata za rezanje sokla: <strong>${komSokla} elemenata</strong>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        pdfProzor.document.close();
    }
};


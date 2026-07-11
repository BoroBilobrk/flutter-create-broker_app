const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        const p = projekt.povrsines;

        // Izračuni po stavkama
        let m2Zidovi = p.zid1.kvadratura + p.zid2.kvadratura + p.zid3.kvadratura + p.zid4.kvadratura;
        let komZidovi = p.zid1.izracunCijelih + p.zid2.izracunCijelih + p.zid3.izracunCijelih + p.zid4.izracunCijelih;

        let m2Pod = p.pod.kvadratura;
        let komPod = p.pod.izracunCijelih;

        let dužinaSokla = p.sokl.h; // opseg u cm
        let komSokla = p.sokl.izracunCijelih;

        const pdfProzor = window.open('', '_blank');
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
                    .ukupno-box { background-color: #111417; color: #4EFA9E; padding: 20px; text-align: right; font-weight: bold; font-size: 18px; }
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

                <h3>1. SPECIFIKACIJA ZIDOVA (Zid 1 + Zid 2 + Zid 3 + Zid 4)</h3>
                <table>
                    <thead>
                        <tr><th>Opis površine</th><th>Neto kvadratura</th><th>Potrebno pločica (kom)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Zid 1 (Prednji)</td><td>${p.zid1.kvadratura.toFixed(2)} m²</td><td>${p.zid1.izracunCijelih} kom</td></tr>
                        <tr><td>Zid 2 (Desni)</td><td>${p.zid2.kvadratura.toFixed(2)} m²</td><td>${p.zid2.izracunCijelih} kom</td></tr>
                        <tr><td>Zid 3 (Stražnji)</td><td>${p.zid3.kvadratura.toFixed(2)} m²</td><td>${p.zid3.izracunCijelih} kom</td></tr>
                        <tr><td>Zid 4 (Lijevi)</td><td>${p.zid4.kvadratura.toFixed(2)} m²</td><td>${p.zid4.izracunCijelih} kom</td></tr>
                        <tr class="istaknuto"><td>UKUPNO ZIDOVI</td><td>${m2Zidovi.toFixed(2)} m²</td><td>${komZidovi} kom</td></tr>
                    </tbody>
                </table>

                <h3>2. SPECIFIKACIJA PODA I SOKLA</h3>
                <table>
                    <thead>
                        <tr><th>Tip površine</th><th>Dimenzija / Opseg</th><th>Potrebna količina</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Podna površina (Neto)</td><td>${p.pod.w} x ${p.pod.h} cm</td><td>${m2Pod.toFixed(2)} m² (${komPod} kom)</td></tr>
                        <tr><td>Sokl (Linearni metri dužina)</td><td>Opseg sobe: ${(dužinaSokla/100).toFixed(2)} m</td><td>${komSokla} komada (Visina: ${p.sokl.w} cm)</td></tr>
                    </tbody>
                </table>

                <div style="background-color:#2C3236; color:#FFF; padding:15px; font-weight:bold; font-size:14px; text-transform:uppercase; letter-spacing:1px;">
                    ZAKLJUČAK NARUDŽBENICE ZA SALON KERAMIKE
                </div>
                <div style="border:2px solid #2C3236; padding:20px; font-size:15px; line-height:2;">
                    • Ukupno zidne keramike za narudžbu: <strong>${(komZidovi * 0.18).toFixed(2)} m² (${komZidovi} komada)</strong><br>
                    • Ukupno podne keramike za narudžbu: <strong>${(komPod * 0.18).toFixed(2)} m² (${komPod} komada)</strong><br>
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

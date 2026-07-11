const DokumentacijaModul = {
    generisiTroskovnik() {
        // Povlačenje živih, stvarnih podataka iz matematičkog engine-a
        const sirina = MatematikaEngine.sirinaZida;
        const visina = MatematikaEngine.visinaZida;
        const cijele = MatematikaEngine.potrosenoCijelihPlocica;
        const ostatci = MatematikaEngine.iskoristeniOstatciCount;
        const plocicaW = MatematikaEngine.plocicaW;
        const plocicaH = MatematikaEngine.plocicaH;
        const fugaMm = MatematikaEngine.fuga * 10;

        // Izračun točne kvadrature
        const kvadraturaZida = (sirina * visina) / 10000;
        const m2JednePlocice = (plocicaW * plocicaH) / 10000;
        const ukupnoM2ZaNarudzbu = cijele * m2JednePlocice;

        // Otvaranje novog čistog prozora u pregledniku koji je optimiziran za PDF/tisak
        const pdfProzor = window.open('', '_blank');
        
        pdfProzor.document.write(`
            <!DOCTYPE html>
            <html lang="hr">
            <head>
                <meta charset="UTF-8">
                <title>BRO-KER | Specifikacija Materijala</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A1D20; padding: 40px; margin: 0; background-color: #FFFFFF; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2C3236; padding-bottom: 20px; }
                    .logo { font-weight: bold; font-size: 26px; letter-spacing: 2px; color: #2C3236; }
                    .naslov { font-size: 13px; text-transform: uppercase; font-weight: bold; color: #8A959E; text-align: right; letter-spacing: 1px; }
                    .info-blok { margin: 30px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236; }
                    .info-blok strong { font-size: 16px; color: #2C3236; }
                    h3 { margin-top: 40px; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; color: #2C3236; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { padding: 14px; text-align: left; border-bottom: 1px solid #E0E0E0; font-size: 14px; }
                    th { background-color: #2C3236; color: #FFFFFF; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
                    .istaknuto { background-color: #EAEDEF; font-weight: bold; color: #000000; }
                    .zeleno { background-color: #E8F5E9; color: #1B5E20; font-weight: bold; }
                    .napomena { margin-top: 60px; font-size: 11px; color: #8A959E; border-top: 1px dashed #3A4349; padding-top: 20px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">BRO-KER</div>
                    <div class="naslov">Službena Specifikacija Naloga</div>
                </div>
                
                <div class="info-blok">
                    <strong>PROJEKT: KUPAONICA (GLAVNI ZID)</strong><br>
                    Datum kalkulacije: ${new Date().toLocaleDateString('hr-HR')}<br>
                    Metoda mjerenja: Automatska kalibracija (ArUco Marker 10x10 cm)
                </div>

                <h3>Izračun materijala za salon keramike</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Opis stavke proračuna</th>
                            <th>Izračunata vrijednost</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Dimenzije skenirane površine zida:</td>
                            <td>${sirina} x ${visina} cm</td>
                        </tr>
                        <tr>
                            <td>Format pločice i debljina fuge:</td>
                            <td>${plocicaW} x ${plocicaH} cm (Fuga: ${fugaMm} mm)</td>
                        </tr>
                        <tr>
                            <td>Čista (neto) kvadratura zida:</td>
                            <td>${kvadraturaZida.toFixed(2)} m²</td>
                        </tr>
                        <tr class="zeleno">
                            <td>Ušteda recikliranjem ostataka (Isti uzorak):</td>
                            <td>-${ostatci} komada ušteđeno na rezovima</td>
                        </tr>
                        <tr class="istaknuto">
                            <td>Stvarna količina za kupovinu (Cijele ploče):</td>
                            <td>${cijele} komada</td>
                        </tr>
                        <tr class="istaknuto">
                            <td>Ukupna kvadratura za narudžbu (s uračunatim rezanjem):</td>
                            <td>${ukupnoM2ZaNarudzbu.toFixed(2)} m²</td>
                        </tr>
                    </tbody>
                </table>

                <div class="napomena">
                    *Ovaj dokument je pravovaljana specifikacija generirana automatski putem mobilne aplikacije BRO-KER. 
                    Matematički algoritam optimizira raspored pločica kako bi se izbjegli uski rezovi na rubovima zida, 
                    dok sustav provjere uzorka (orijentacije) jamči točnost iskorištavanja odrezanih elemenata.
                </div>

                <script>
                    // Čim se stranica učita, automatski otvori sistemski prozor za ispis/PDF spremanje
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        pdfProzor.document.close();
    }
};

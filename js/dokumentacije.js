const DokumentacijaModul = {
    generisiZbirniTroskovnik(projekt) {
        const p = projekt.povrsine;

        // Sigurnosni proračun u slučaju da neki tabovi na zidu još nisu ručno pokrenuti
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

        let opseg = p.zid1.w + p.zid2.w + p.zid3.w + p.zid4.w;
        let dužinaSokla = p.sokl.h || opseg; 
        let komSokla = p.sokl.izracunCijelih || Math.ceil(dužinaSokla / p.sokl.plocicaW);

        // Ako stari prikaz već negdje postoji na ekranu, ukloni ga
        const stariPrikaz = document.getElementById('print-overlay');
        if (stariPrikaz) stariPrikaz.remove();

        // STVARANJE OVERLAY KONTEJNERA (Prikazuje se unutar istog prozora)
        const overlay = document.createElement('div');
        overlay.id = 'print-overlay';
        
        // Stilovi koji pretvaraju ekran u čist bijeli list papira
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.backgroundColor = '#FFFFFF';
        overlay.style.color = '#1A1D20';
        overlay.style.zIndex = '99999';
        overlay.style.overflowY = 'auto';
        overlay.style.padding = '24px';
        overlay.style.boxSizing = 'border-box';

        overlay.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #print-overlay, #print-overlay * { visibility: visible; }
                    #print-overlay { position: absolute; left: 0; top: 0; width: 100%; height: auto; padding: 0; }
                    .no-print { display: none !important; }
                }
            </style>

            <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:30px; background:#111417; padding:12px; margin:-24px -24px 24px -24px; border-bottom:1px solid #22282C;">
                <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px 20px; font-weight:bold; font-size:11px; letter-spacing:1px; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PRINT / PDF</button>
                <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px 20px; font-weight:bold; font-size:11px; letter-spacing:1px; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2C3236; padding-bottom: 15px;">
                <div style="font-weight: bold; font-size: 26px; letter-spacing: 2px; color: #2C3236;">BRO-KER</div>
                <div style="text-transform:uppercase; font-size:11px; font-weight:bold; color:#8A959E; text-align:right; letter-spacing:0.5px;">Zbirna Specifikacija Naloga</div>
            </div>
            
            <div style="margin: 24px 0; background-color: #F5F6F7; padding: 20px; border-left: 5px solid #2C3236; font-size:13px; line-height:1.6; color:#333;">
                <strong>PROJEKTNI NALOG: ${projekt.prostorija.toUpperCase()}</strong><br>
                Klijent / Lokacija: ${projekt.klijent}<br>
                Datum proračuna: ${new Date().toLocaleDateString('hr-HR')}<br>
                Sustav optimizacije: BRO-KER Multi-Surface 3D CAD Engine
            </div>

            <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px; color:#111; letter-spacing:0.5px;">1. SPECIFIKACIJA ZIDOVA (Format: ${p.zid1.plocicaW}x${p.zid1.plocicaH} cm)</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px;">
                <thead>
                    <tr style="background:#2C3236; color:#FFFFFF; text-transform:uppercase; font-size:10px; letter-spacing:0.5px;"><th style="padding:10px; text-align:left;">Opis površine</th><th style="padding:10px; text-align:left;">Neto kvadratura</th><th style="padding:10px; text-align:left;">Potrebno pločica</th></tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 1 (Prednji / Glavni)</td><td style="padding:10px;">${qZid1.toFixed(2)} m²</td><td style="padding:10px;">${cZid1} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 2 (Desni)</td><td style="padding:10px;">${qZid2.toFixed(2)} m²</td><td style="padding:10px;">${cZid2} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 3 (Stražnji)</td><td style="padding:10px;">${qZid3.toFixed(2)} m²</td><td style="padding:10px;">${cZid3} kom</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Zid 4 (Lijevi)</td><td style="padding:10px;">${qZid4.toFixed(2)} m²</td><td style="padding:10px;">${cZid4} kom</td></tr>
                    <tr style="background:#EAEDEF; font-weight:bold; color:#000;"><td style="padding:10px;">UKUPNO ZIDOVI</td><td style="padding:10px;">${m2Zidovi.toFixed(2)} m²</td><td style="padding:10px;">${komZidovi} kom</td></tr>
                </tbody>
            </table>

            <h3 style="font-size:13px; text-transform:uppercase; margin-top:30px; color:#111; letter-spacing:0.5px;">2. SPECIFIKACIJA PODA I SOKLA</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; margin-bottom:40px;">
                <thead>
                    <tr style="background:#2C3236; color:#FFFFFF; text-transform:uppercase; font-size:10px; letter-spacing:0.5px;"><th style="padding:10px; text-align:left;">Tip površine</th><th style="padding:10px; text-align:left;">Dimenzije / Opseg</th><th style="padding:10px; text-align:left;">Izračunata količina</th></tr>
                </thead>
                <tbody>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Podna površina (Neto format: ${p.pod.plocicaW}x${p.pod.plocicaH} cm)</td><td style="padding:10px;">${p.pod.w} x ${p.pod.h} cm</td><td style="padding:10px;">${m2Pod.toFixed(2)} m² (${komPod} kom)</td></tr>
                    <tr style="border-bottom:1px solid #E0E0E0;"><td style="padding:10px;">Sokl (Linearni metri oko sobe)</td><td style="padding:10px;">Opseg kupaonice: ${(dužinaSokla/100).toFixed(2)} m</td><td style="padding:10px;">${komSokla} komada (Visina: ${p.sokl.w} cm)</td></tr>
                </tbody>
            </table>

            <div style="background-color:#2C3236; color:#FFF; padding:12px; font-weight:bold; font-size:13px; text-transform:uppercase; letter-spacing:1px;">
                ZAKLJUČAK SPECIJALIZIRANE NARUDŽBE
            </div>
            <div style="border:2px solid #2C3236; padding:20px; font-size:14px; line-height:1.9; color:#000;">
                • Ukupno zidne keramike za salon (format ${p.zid1.plocicaW}x${p.zid1.plocicaH} cm): <strong>${m2Zidovi.toFixed(2)} m² (${komZidovi} kom)</strong><br>
                • Ukupno podne keramike za salon (format ${p.pod.plocicaW}x${p.pod.plocicaH} cm): <strong>${m2Pod.toFixed(2)} m² (${komPod} kom)</strong><br>
                • Ukupno komada za rezanje sokla: <strong>${komSokla} kom</strong>
            </div>
        `;

        document.body.appendChild(overlay);
    }
};

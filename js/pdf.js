const DokumentacijaModul = {
    generirajSVGZid(p) {
        if (!p) return '';
        let mjerilo = 0.5;
        let w = p.w * mjerilo;
        let h = (p.tip === 'Zid' ? p.h : p.h) * mjerilo;
        let oblH = (p.tip === 'Zid' ? p.visinaOblaganja : p.h) * mjerilo;
        
        let plW = (p.rotacija ? p.plocicaH : p.plocicaW) * mjerilo;
        let plH = (p.rotacija ? p.plocicaW : p.plocicaH) * mjerilo;
        
        let bgX = (p.odmakX || 0) * mjerilo;
        let bgY = (p.odmakY || 0) * mjerilo; 

        let rId = 'pat-' + Math.random().toString(36).substr(2, 9);
        
        return `
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="background:#F5F6F7; border:1px solid #CBD5E1; display:block; margin:auto;">
            <defs>
                <pattern id="${rId}" patternUnits="userSpaceOnUse" width="${plW}" height="${plH}" x="${bgX}" y="${h - bgY}">
                    <rect x="0" y="0" width="${plW}" height="${plH}" fill="#94A3B8" stroke="#1E293B" stroke-width="0.5"/>
                </pattern>
            </defs>
            <rect x="0" y="${h - oblH}" width="${w}" height="${oblH}" fill="url(#${rId})" />
        </svg>`;
    },

    generisiZbirniTroskovnik(projekt) {
        if (!projekt) return;
        const p = App.osvjeziSveKvadraturneProracune(projekt);

        const generirajRedTable = (naziv, zid) => {
            let kom = zid.izracunCijelih || 0;
            let m2 = (zid.kvadratura || 0).toFixed(2);
            let rezoviHtml = (zid.listaRezova && zid.listaRezova.length > 0) 
                ? `<div style="font-size:9px; color:#475569; margin-top:6px; padding:6px; background:#F8FAFC; border-left:3px solid #0EA5E9; line-height:1.4;">
                     <b style="color:#0F172A;">SPECIFIKACIJA REZANJA:</b><br>${zid.listaRezova.join('<br>')}
                   </div>` 
                : '';
            
            return `
                <tr style="border-bottom:1px solid #E0E0E0;">
                    <td style="padding:12px 8px; vertical-align:top;"><b>${naziv}</b>${rezoviHtml}</td>
                    <td style="padding:12px 8px; vertical-align:top; font-size:14px;">${m2} m2</td>
                    <td style="padding:12px 8px; vertical-align:top; font-weight:bold; font-size:14px;">${kom}</td>
                </tr>
            `;
        };

        let htmlZidovi = '';
        if (projekt.konfiguracija.zidovi) {
            let m2Zidovi = (p.zid1.kvadratura||0) + (p.zid2.kvadratura||0) + (p.zid3.kvadratura||0) + (p.zid4.kvadratura||0);
            let komZidovi = (p.zid1.izracunCijelih||0) + (p.zid2.izracunCijelih||0) + (p.zid3.izracunCijelih||0) + (p.zid4.izracunCijelih||0);
            
            htmlZidovi = `
                <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
                    <thead>
                        <tr style="background:#2C3236; color:#FFFFFF;">
                            <th style="padding:10px 8px; text-align:left;">Površina / Krojna Lista</th>
                            <th style="padding:10px 8px; text-align:left; width:80px;">Neto kv.</th>
                            <th style="padding:10px 8px; text-align:left; width:90px;">Naručiti (kom)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generirajRedTable('Zid 1 (Glavni)', p.zid1)}
                        ${generirajRedTable('Zid 2 (Desni)', p.zid2)}
                        ${generirajRedTable('Zid 3 (Stražnji)', p.zid3)}
                        ${generirajRedTable('Zid 4 (Lijevi)', p.zid4)}
                        <tr style="background:#EAEDEF; font-weight:bold;">
                            <td style="padding:12px 8px; text-align:right;">UKUPNO ZIDOVI:</td>
                            <td style="padding:12px 8px; font-size:14px;">${m2Zidovi.toFixed(2)} m2</td>
                            <td style="padding:12px 8px; color:#0EA5E9; font-size:15px;">${komZidovi} kom</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        let htmlPod = '';
        if (projekt.konfiguracija.pod || projekt.konfiguracija.sokl) {
            htmlPod = `<table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:20px;"><tbody>`;
            if (projekt.konfiguracija.pod) {
                htmlPod += generirajRedTable('Pod kupaonice', p.pod);
            }
            if (projekt.konfiguracija.sokl) {
                htmlPod += `<tr><td style="padding:12px 8px; font-weight:bold;">Sokl / Cokl</td><td style="padding:12px 8px;">${((p.sokl.h||0)/100).toFixed(2)} m</td><td style="padding:12px 8px; font-weight:bold; color:#0EA5E9;">${p.sokl.izracunCijelih||0} kom</td></tr>`;
            }
            htmlPod += `</tbody></table>`;
        }

        let krizniPrikaz = '';
        if (projekt.konfiguracija.zidovi && projekt.konfiguracija.pod) {
            krizniPrikaz = `
            <h3 style="font-size:12px; text-transform:uppercase; margin-top:30px; text-align:center; color:#64748B;">KRIŽNI PRIKAZ (UNFOLD) - PREMA SLIDER ODMACIMA</h3>
            <div style="display:table; margin: 0 auto; border-spacing:10px;">
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 3 (Stražnji)</div>
                        ${this.generirajSVGZid(p.zid3)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                </div>
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 4 (Lijevi)</div>
                        ${this.generirajSVGZid(p.zid4)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle; background:#ECFDF5; border:2px solid #0EA5E9; padding:5px;">
                        <div style="font-size:9px; font-weight:bold; color:#0EA5E9;">POD (Centar)</div>
                        ${this.generirajSVGZid(p.pod)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 2 (Desni)</div>
                        ${this.generirajSVGZid(p.zid2)}
                    </div>
                </div>
                <div style="display:table-row;">
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;">
                        <div style="font-size:9px; font-weight:bold;">ZID 1 (Glavni)</div>
                        ${this.generirajSVGZid(p.zid1)}
                    </div>
                    <div style="display:table-cell; width:150px; text-align:center; vertical-align:middle;"></div>
                </div>
            </div>`;
        }

        const stariPrikaz = document.getElementById('print-overlay');
        if (stariPrikaz) stariPrikaz.remove();

        const overlay = document.createElement('div');
        overlay.id = 'print-overlay';
        
        overlay.innerHTML = `
            <style>
                @media print {
                    html, body { background-color: #FFFFFF !important; color: #000000 !important; margin: 0 !important; padding: 0 !important; height: auto !important; overflow: visible !important; }
                    body > *:not(#print-overlay) { display: none !important; }
                    #print-overlay { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; min-height: 100vh !important; background-color: #FFFFFF !important; margin: 0 !important; padding: 0 !important; z-index: 999999; }
                    .no-print { display: none !important; }
                    @page { margin: 1cm; }
                }
            </style>
            <div id="print-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background-color:#FFFFFF; color:#1A1D20; z-index:99999999; overflow-y:auto; padding:24px; box-sizing:border-box;">
                <div class="no-print" style="display:flex; justify-content:space-between; margin-bottom:20px; background:#111417; padding:12px; margin:-24px -24px 20px -24px;">
                    <button style="background:#14281E; color:#4EFA9E; border:1px solid #2E5C43; padding:12px; font-weight:bold; cursor:pointer;" onclick="window.print()">🖨️ POKRENI PDF</button>
                    <button style="background:#2C3236; color:#8C9BA5; border:1px solid #343D44; padding:12px; font-weight:bold; cursor:pointer;" onclick="document.getElementById('print-overlay').remove()">✕ ZATVORI</button>
                </div>
                <div style="font-weight: bold; font-size: 20px; border-bottom: 2px solid #2C3236; padding-bottom: 10px;">BRO-KER Zbirni Troškovnik (Real-Cut)</div>
                <div style="margin: 15px 0; background-color: #F5F6F7; padding: 15px; border-left: 5px solid #0EA5E9;">
                    <strong>KLIJENT: ${projekt.klijent.toUpperCase()} | PROSTORIJA: ${projekt.prostorija}</strong>
                </div>
                ${htmlZidovi} ${htmlPod}
                ${krizniPrikaz}
            </div>
        `;
        document.body.appendChild(overlay.firstElementChild.nextElementSibling);
        document.body.appendChild(document.getElementById('print-overlay'));
    }
};

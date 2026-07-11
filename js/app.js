const App = {
    init() {
        // Početne radnje aplikacije
        console.log("BRO-KER Sustav Inicijaliziran.");
    },

    promijeniZaslon(idZaslona) {
        // Sakrij sve zaslone
        document.querySelectorAll('.zaslon').forEach(z => z.classList.remove('aktivni-zaslon'));
        
        // Prikaži ciljani zaslon
        const cilj = document.getElementById(idZaslona);
        if (cilj) {
            cilj.classList.add('aktivni-zaslon');
        }

        // Specifične akcije ovisno o zaslonu koji se otvara
        if (idZaslona === 'zaslon-kamera') {
            document.getElementById('naslov-prikaza').innerText = "Skeniranje prostora";
            Kamera.pokreni();
        } else if (idZaslona === 'zaslon-radni') {
            document.getElementById('naslov-prikaza').innerText = "Mreža slaganja";
            // Poziv matematičkog enginea iz druge datoteke
            MatematikaEngine.iscrtajMrezuPlocica();
        } else if (idZaslona === 'zaslon-izbornik') {
            document.getElementById('naslov-prikaza').innerText = "Glavni Izbornik";
        }
    },

    otvoriDokumentaciju() {
        alert("Generiranje troškovnika na temelju izračuna...");
    }
};

// Pokretanje sustava pri učitavanju stranice
window.onload = () => App.init();

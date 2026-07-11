import 'package:flutter/material.dart';

void main() {
  runApp(const BrokerApp());
}

class BrokerApp extends StatelessWidget {
  const BrokerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BRO-KER Alat',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F1113),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF3A4349),
          secondary: Colors.white70,
          surface: Color(0xFF1A1D20),
        ),
        cardTheme: const CardTheme(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
        buttonTheme: const ButtonThemeData(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}

// MARK: - MODELI PODATAKA

class KlijentProjekt {
  String imeKlijenta;
  String nazivProstorije;
  List<PlocicaModel> paletaPlocica;

  KlijentProjekt({
    required this.imeKlijenta,
    required this.nazivProstorije,
    required this.paletaPlocica,
  });
}

class PlocicaModel {
  String id;
  String naziv;
  double sirina; // u cm
  double duljina; // u cm
  double fuga; // u mm
  String orijentacija; // 'Gore', 'Desno', 'Svejedno'
  Color bojaPrikaza;

  PlocicaModel({
    required this.id,
    required this.naziv,
    required this.sirina,
    required this.duljina,
    required this.fuga,
    required this.orijentacija,
    required this.bojaPrikaza,
  });
}

class VirtualnaPlocica {
  double x;
  double y;
  double sirina;
  double visina;
  bool jeRezana;
  bool jeIzOstatka;
  bool imaRupu;
  bool jeLRez;
  Color boja;
  String nazivModela;

  VirtualnaPlocica({
    required this.x,
    required this.y,
    required this.sirina,
    required this.visina,
    this.jeRezana = false,
    this.jeIzOstatka = false,
    this.imaRupu = false,
    this.jeLRez = false,
    required this.boja,
    required this.nazivModela,
  });
}

class OstatakKomad {
  double sirina;
  double visina;
  String orijentacija;

  OstatakKomad({required this.sirina, required this.visina, required this.orijentacija});
}

class SpecifikacijaStats {
  int ukupnoKomadaNaZidu;
  int iskoristeniOstatci;
  int stvarniBrojKupljenihPlocica;
  int brojRupa;
  int brojLKutova;
  double kvadraturaZida;
  double potrebnaKvadraturaMaterijala;

  SpecifikacijaStats({
    required this.ukupnoKomadaNaZidu,
    required this.iskoristeniOstatci,
    required this.stvarniBrojKupljenihPlocica,
    required this.brojRupa,
    required this.brojLKutova,
    required this.kvadraturaZida,
    required this.potrebnaKvadraturaMaterijala,
  });
}

// MARK: - LOGOTIP BRO-KER

class BrokerLogo extends StatelessWidget {
  final double velicina;
  final bool prikaziTekst;

  const BrokerLogo({super.key, this.velicina = 200, this.prikaziTekst = true});

  @override
  Widget build(BuildContext context) {
    final double omjer = velicina / 200;
    const Color bojaSkriljevca = Color(0xFF2C3236);
    const Color bojaFuge = Color(0xFF0F1113);

    return Container(
      width: velicina,
      height: velicina,
      color: bojaFuge,
      padding: EdgeInsets.all(4 * omjer),
      child: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    margin: EdgeInsets.all(2 * omjer),
                    child: Column(
                      children: [
                        Expanded(child: Container(color: bojaSkriljevca, margin: EdgeInsets.only(bottom: 2 * omjer))),
                        Expanded(
                          child: Container(
                            color: bojaSkriljevca,
                            alignment: Alignment.center,
                            child: prikaziTekst 
                              ? Text('BRO', style: TextStyle(fontSize: 22 * omjer, fontWeight: FontWeight.bold, color: const Color(0xFFE0E0E0)))
                              : null,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Expanded(child: Container(color: bojaSkriljevca, margin: EdgeInsets.all(2 * omjer))),
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(child: Container(color: bojaSkriljevca, margin: EdgeInsets.all(2 * omjer))),
                Expanded(
                  child: Container(
                    margin: EdgeInsets.all(2 * omjer),
                    child: Column(
                      children: [
                        Expanded(
                          child: Container(
                            color: bojaSkriljevca,
                            alignment: Alignment.center,
                            margin: EdgeInsets.only(bottom: 2 * omjer),
                            child: prikaziTekst 
                              ? Text('KER', style: TextStyle(fontSize: 22 * omjer, fontWeight: FontWeight.bold, color: const Color(0xFFE0E0E0)))
                              : null,
                          ),
                        ),
                        Expanded(child: Container(color: bojaSkriljevca)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// MARK: - ZASLONI

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const BrokerLogo(velicina: 220),
              const SizedBox(height: 50),
              OutlinedButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const NoviProjektScreen()));
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Color(0xFF3A4349), width: 2),
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                ),
                child: const Text('ZAPOČNI NOVI PROJEKT', style: TextStyle(letterSpacing: 2)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class NoviProjektScreen extends StatefulWidget {
  const NoviProjektScreen({super.key});

  @override
  State<NoviProjektScreen> createState() => _NoviProjektScreenState();
}

class _NoviProjektScreenState extends State<NoviProjektScreen> {
  final _formKey = GlobalKey<FormState>();
  final _klijentController = TextEditingController();
  final _prostorijaController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Novi Projekt'), backgroundColor: Colors.transparent, elevation: 0),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _klijentController,
                decoration: const InputDecoration(labelText: 'Ime klijenta / Lokacija', border: OutlineInputBorder(borderRadius: BorderRadius.zero)),
                validator: (value) => value!.isEmpty ? 'Unesite ime klijenta' : null,
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _prostorijaController,
                decoration: const InputDecoration(labelText: 'Naziv prostorije (npr. Kupaonica)', border: OutlineInputBorder(borderRadius: BorderRadius.zero)),
                validator: (value) => value!.isEmpty ? 'Unesite naziv prostorije' : null,
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PaletaPlocicaScreen(
                          klijent: _klijentController.text,
                          prostorija: _prostorijaController.text,
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2C3236),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                ),
                child: const Text('KREIRAJ PALETU PLOČICA'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PaletaPlocicaScreen extends StatefulWidget {
  final String klijent;
  final String prostorija;

  const PaletaPlocicaScreen({super.key, required this.klijent, required this.prostorija});

  @override
  State<PaletaPlocicaScreen> createState() => _PaletaPlocicaScreenState();
}

class _PaletaPlocicaScreenState extends State<PaletaPlocicaScreen> {
  final List<PlocicaModel> _paleta = [];

  @override
  void initState() {
    super.initState();
    // Automatski dodajemo osnovnu pločicu radi brzine testiranja
    _paleta.add(PlocicaModel(
      id: '1',
      naziv: 'Osnovna Siva Zidna',
      sirina: 30.0,
      duljina: 60.0,
      fuga: 2.0,
      orijentacija: 'Gore',
      bojaPrikaza: const Color(0xFF2C3236),
    ));
  }

  void _dodajPlocicuDialog() {
    final nazivCtrl = TextEditingController();
    final sirinaCtrl = TextEditingController();
    final duljinaCtrl = TextEditingController();
    final fugaCtrl = TextEditingController();
    String trenutnaOrijentacija = 'Svejedno';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              title: const Text('Dodaj pločicu (Kombinacija)'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(controller: nazivCtrl, decoration: const InputDecoration(labelText: 'Nadimak (npr. Dekor Tuš)')),
                    TextField(controller: sirinaCtrl, decoration: const InputDecoration(labelText: 'Širina (cm)'), keyboardType: TextInputType.number),
                    TextField(controller: duljinaCtrl, decoration: const InputDecoration(labelText: 'Duljina (cm)'), keyboardType: TextInputType.number),
                    TextField(controller: fugaCtrl, decoration: const InputDecoration(labelText: 'Fuga (mm)'), keyboardType: TextInputType.number),
                    const SizedBox(height: 20),
                    const Text('Smjer uzorka na pločici:', style: TextStyle(fontSize: 14)),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _izgradiOrijentacijuGumb(Icons.arrow_upward, 'Gore', trenutnaOrijentacija, (odabrana) {
                          setDialogState(() => trenutnaOrijentacija = odabrana);
                        }),
                        _izgradiOrijentacijuGumb(Icons.arrow_forward, 'Desno', trenutnaOrijentacija, (odabrana) {
                          setDialogState(() => trenutnaOrijentacija = odabrana);
                        }),
                        _izgradiOrijentacijuGumb(Icons.texture, 'Svejedno', trenutnaOrijentacija, (odabrana) {
                          setDialogState(() => trenutnaOrijentacija = odabrana);
                        }),
                      ],
                    )
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('ODUSTANI', style: TextStyle(color: Colors.white54))),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _paleta.add(PlocicaModel(
                        id: DateTime.now().toString(),
                        naziv: nazivCtrl.text.isEmpty ? 'Pločica ${_paleta.length + 1}' : nazivCtrl.text,
                        sirina: double.tryParse(sirinaCtrl.text) ?? 20.0,
                        duljina: double.tryParse(duljinaCtrl.text) ?? 20.0,
                        fuga: double.tryParse(fugaCtrl.text) ?? 2.0,
                        orijentacija: trenutnaOrijentacija,
                        bojaPrikaza: _paleta.length == 1 ? const Color(0xFF4A3B32) : const Color(0xFF3B4A32),
                      ));
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('DODAJ', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _izgradiOrijentacijuGumb(IconData icon, String vrijednost, String trenutna, ValueChanged<String> onSelected) {
    final bool jeOdabran = trenutna == vrijednost;
    return IconButton(
      icon: Icon(icon, color: jeOdabran ? Colors.white : Colors.white24),
      style: IconButton.styleFrom(
        backgroundColor: jeOdabran ? const Color(0xFF3A4349) : Colors.transparent,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      ),
      onPressed: () => onSelected(vrijednost),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.klijent, style: const TextStyle(fontSize: 16)),
            Text(widget.prostorija, style: const TextStyle(fontSize: 12, color: Colors.white54)),
          ],
        ),
        backgroundColor: Colors.transparent,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Definirane pločice za kupaonicu:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Expanded(
              child: ListView.builder(
                itemCount: _paleta.length,
                itemBuilder: (context, index) {
                  final p = _paleta[index];
                  return Card(
                    color: const Color(0xFF1A1D20),
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    child: ListTile(
                      leading: Container(width: 24, height: 24, color: p.bojaPrikaza),
                      title: Text(p.naziv, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${p.sirina}x${p.duljina} cm | Fuga: ${p.fuga} mm'),
                      trailing: Icon(p.orijentacija == 'Gore' ? Icons.arrow_upward : p.orijentacija == 'Desno' ? Icons.arrow_forward : Icons.texture, color: Colors.white54),
                    ),
                  );
                },
              ),
            ),
            OutlinedButton.icon(
              onPressed: _dodajPlocicuDialog,
              icon: const Icon(Icons.add),
              label: const Text('DODAJ ZASEBNU VRSTU (ZA ZONE/DEKOR)'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: const BorderSide(color: Color(0xFF3A4349)),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
            ),
            const SizedBox(height: 15),
            ElevatedButton(
              onPressed: () {
                // Ako korisnik nije sam dodao drugu pločicu za zone, ubacujemo zamjenski dekor automatizmom radi simulacije zona
                if (_paleta.length == 1) {
                  _paleta.add(PlocicaModel(
                    id: '2',
                    naziv: 'Dekorativna Traka / Tuš',
                    sirina: 20.0,
                    duljina: 20.0,
                    fuga: 2.0,
                    orijentacija: 'Gore',
                    bojaPrikaza: const Color(0xFF4C3A3A),
                  ));
                }
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => RadniProstorScreen(projekt: KlijentProjekt(
                      imeKlijenta: widget.klijent,
                      nazivProstorije: widget.prostorija,
                      paletaPlocica: _paleta,
                    )),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2C3236),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
              child: const Text('OTVORI 3D/2D RADNI PROSTOR'),
            ),
          ],
        ),
      ),
    );
  }
}

class RadniProstorScreen extends StatefulWidget {
  final KlijentProjekt projekt;

  const RadniProstorScreen({super.key, required this.projekt});

  @override
  State<RadniProstorScreen> createState() => _RadniProstorScreenState();
}

class _RadniProstorScreenState extends State<RadniProstorScreen> {
  double sirinaZida = 240.0; 
  double visinaZida = 200.0; 
  
  bool imaHorizontalnuZonu = false;
  bool imaVertikalnuZonu = false;
  double visinaRazgraničenja = 90.0; // cm od poda
  double pocetakTrakeX = 90.0; // cm od lijevog kuta
  double sirinaTrakeX = 60.0; // širina tuš zone
  
  List<VirtualnaPlocica> rasporedPlocica = [];
  List<OstatakKomad> virtualnaBazaOstataka = [];
  late SpecifikacijaStats statistikaProjekta;

  @override
  void initState() {
    super.initState();
    _pokreniNapredniAlgoritam();
  }

  // PUNI MATEMATIČKI ENGINE S ZONAMA I PROVJEROM SMJERA UZORAKA
  void _pokreniNapredniAlgoritam() {
    rasporedPlocica.clear();
    virtualnaBazaOstataka.clear();

    final modelOsnovna = widget.projekt.paletaPlocica[0];
    final modelDekor = widget.projekt.paletaPlocica[1];

    double efektivnaSirinaOsnovna = modelOsnovna.duljina + (modelOsnovna.fuga / 10);
    double efektivnaVisinaOsnovna = modelOsnovna.sirina + (modelOsnovna.fuga / 10);

    double efektivnaSirinaDekor = modelDekor.duljina + (modelDekor.fuga / 10);
    double efektivnaVisinaDekor = modelDekor.sirina + (modelDekor.fuga / 10);

    int iskoristeniOstatciCount = 0;
    int cijelePotrosene = 0;
    int rupaCount = 0;
    int lKutCount = 0;

    double tekuceY = 0.0;
    while (tekuceY < visinaZida) {
      double tekuceX = 0.0;

      // Pravilo protiv uskih rezova (Simetrija kuta)
      double trenBrzW = (imaHorizontalnuZonu && tekuceY >= visinaRazgraničenja) ? efektivnaSirinaDekor : efektivnaSirinaOsnovna;
      double ostatakKuta = sirinaZida % trenBrzW;
      if (ostatakKuta > 0 && ostatakKuta < 8.0) {
        tekuceX = -(trenBrzW - ostatakKuta) / 2; // Pomakni mrežu da izbjegneš "kajlu"
      }

      while (tekuceX < sirinaZida) {
        // 1. Određivanje koja pločica ide u ovu zonu na temelju 
                // 1. Određivanje koja pločica ide u ovu zonu na temelju koordinata
        PlocicaModel trenutniModel = modelOsnovna;
        double eW = efektivnaSirinaOsnovna;
        double eH = efektivnaVisinaOsnovna;

        if (imaHorizontalnuZonu && tekuceY >= visinaRazgraničenja) {
          trenutniModel = modelDekor;
          eW = efektivnaSirinaDekor;
          eH = efektivnaVisinaDekor;
        }
        if (imaVertikalnuZonu && tekuceX >= pocetakTrakeX && tekuceX <= (pocetakTrakeX + sirinaTrakeX)) {
          trenutniModel = modelDekor;
          eW = efektivnaSirinaDekor;
          eH = efektivnaVisinaDekor;
        }

        double izracunataSirina = eW;
        double izracunataVisina = eH;

        // Rezanje na lijevom/desnom rubu zida
        double stvarniX = tekuceX < 0 ? 0 : tekuceX;
        if (tekuceX < 0) {
          izracunataSirina = eW + tekuceX;
        } else if (tekuceX + eW > sirinaZida) {
          izracunataSirina = sirinaZida - tekuceX;
        }

        // Rezanje na stropu
        if (tekuceY + eH > visinaZida) {
          izracunataVisina = visinaZida - tekuceY;
        }

        bool jeRezana = izracunataSirina < eW || izracunataVisina < eH;
        bool uzetaIzBazeOstataka = false;

        // LOGIKA PAMETNOG ISKORIŠTAVANJA OSTATAKA UZ PROVJERU UZORKA
        if (jeRezana && virtualnaBazaOstataka.isNotEmpty) {
          int indeksPogodnogKomada = virtualnaBazaOstataka.indexWhere((ostatak) =>
              ostatak.sirina >= izracunataSirina &&
              ostatak.visina >= izracunataVisina &&
              ostatak.orijentacija == trenutniModel.orijentacija); // STROGI UVJET UZORKA!

          if (indeksPogodnogKomada != -1) {
            virtualnaBazaOstataka.removeAt(indeksPogodnogKomada);
            uzetaIzBazeOstataka = true;
            iskoristeniOstatciCount++;
          }
        }

        if (!uzetaIzBazeOstataka) {
          cijelePotrosene++;
          // Ako smo odrezali komad, spremi preostali dio u virtualnu bazu ostataka
          if (jeRezana && (eW - izracunataSirina) > 10.0) {
            virtualnaBazaOstataka.add(OstatakKomad(
              sirina: eW - izracunataSirina,
              visina: izracunataVisina,
              orijentacija: trenutniModel.orijentacija,
            ));
          }
        }

        // Simulacija prepreka na zidu
        bool rupa = (stvarniX > 120 && stvarniX < 150 && tekuceY > 70 && tekuceY < 110);
        bool lRez = (stvarniX < 30 && tekuceY < 30);
        if (rupa) rupaCount++;
        if (lRez) lKutCount++;

        rasporedPlocica.add(VirtualnaPlocica(
          x: stvarniX,
          y: tekuceY,
          sirina: izracunataSirina,
          visina: izracunataVisina,
          jeRezana: jeRezana,
          jeIzOstatka: uzetaIzBazeOstataka,
          imaRupu: rupa,
          jeLRez: lRez,
          boja: uzetaIzBazeOstataka ? Colors.teal.shade800 : trenutniModel.bojaPrikaza,
          nazivModela: trenutniModel.naziv,
        ));

        tekuceX += eW;
      }
      tekuceY += (imaHorizontalnuZonu && tekuceY >= visinaRazgraničenja) ? efektivnaVisinaDekor : efektivnaVisinaOsnovna;
    }

    // Izračun krajnje specifikacije za PDF troškovnik
    double kvadraturaZida = (sirinaZida * visinaZida) / 10000;
    double m2JednePlocice = (modelOsnovna.sirina * modelOsnovna.duljina) / 10000;

    setState(() {
      statistikaProjekta = SpecifikacijaStats(
        ukupnoKomadaNaZidu: rasporedPlocica.length,
        iskoristeniOstatci: iskoristeniOstatciCount,
        stvarniBrojKupljenihPlocica: cijelePotrosene,
        brojRupa: rupaCount,
        brojLKutova: lKutCount,
        kvadraturaZida: kvadraturaZida,
        potrebnaKvadraturaMaterijala: cijelePotrosene * m2JednePlocice,
      );
    });
  }

  void _otvori2DDetalj(VirtualnaPlocica plocica) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1A1D20),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          height: MediaQuery.of(context).size.height * 0.75,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('2D MIKRO NACRT - KOTE ZA OBRADU', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                ],
              ),
              const Divider(color: Colors.white24),
              const SizedBox(height: 10),
              Text('Model: ${plocica.nazivModela}', style: const TextStyle(color: Colors.amber, fontSize: 13)),
              const SizedBox(height: 20),
              Expanded(
                child: Center(
                  child: Container(
                    width: 220, height: 160,
                    decoration: Border.all(color: Colors.white, width: 2),
                    color: const Color(0xFF2C3236),
                    child: Stack(
                      children: [
                        if (plocica.imaRupu) ...[
                          Center(
                            child: Container(width: 35, height: 35, decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle)),
                          ),
                          const Positioned(left: 0, right: 110, top: 65, child: Divider(color: Colors.amber, thickness: 1.5)),
                          const Positioned(left: 35, top: 45, child: Text('X: 24.5 cm', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold))),
                          const Positioned(left: 110, bottom: 0, top: 80, child: VerticalDivider(color: Colors.amber, thickness: 1.5)),
                          const Positioned(left: 125, bottom: 35, child: Text('Y: 12.8 cm', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold))),
                        ] else if (plocica.jeLRez) ...[
                          Align(
                            alignment: Alignment.bottomLeft,
                            child: Container(width: 60, height: 60, color: const Color(0xFF0F1113), child: const Center(child: Text('IZREZ', style: TextStyle(fontSize: 9, color: Colors.white38)))),
                          ),
                          const Positioned(left: 65, bottom: 20, child: Text('X1: 20 cm', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold))),
                          const Positioned(left: 20, bottom: 65, child: Text('Y1: 20 cm', style: TextStyle(color: Colors.amber, fontSize: 11, fontWeight: FontWeight.bold))),
                        ] else ...[
                          Center(child: Text(plocica.jeIzOstatka ? 'Iskorišteni ostatak uzorka\nDimenzije: ${plocica.sirina.toStringAsFixed(1)}x${plocica.visina.toStringAsFixed(1)} cm' : 'Čisti rez ruba zida', textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 12))),
                        ],
                        const Positioned(right: 10, top: 10, child: Icon(Icons.arrow_upward, color: Colors.white10, size: 30)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(plocica.imaRupu ? 'Tip: Otvor za priključak' : plocica.jeLRez ? 'Tip: Zarezivanje kuta (L)' : plocica.jeIzOstatka ? 'Tip: Reciklirani element' : 'Tip: Rez rub', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const Text('Mjere prenesene automatski s tvorničkih bridova.', style: TextStyle(fontSize: 12, color: Colors.white54)),
                      ],
                    ),
                  ),
                  Container(
                    width: 60, height: 60,
                    color: Colors.black26,
                    padding: const EdgeInsets.all(2),
                    child: GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 2, mainAxisSpacing: 2,
                      physics: const NeverScrollableScrollPhysics(),
                      children: [
                        Container(color: Colors.white10),
                        Container(color: Colors.white10),
                        Container(color: plocica.imaRupu || plocica.jeLRez ? Colors.amber : Colors.white10),
                        Container(color: Colors.white10),
                      ],
                    ),
                  )
                ],
              )
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const Padding(
          padding: EdgeInsets.all(8.0),
          child: BrokerLogo(velicina: 40, prikaziTekst: false),
        ),
        title: Text('${widget.projekt.imeKlijenta} - Radni Prikaz'),
        backgroundColor: const Color(0xFF1A1D20),
      ),
      body: Column(
        children: [
          // INTERAKTIVNI 2D CANVAS SA ZIDOM I PLOČICAMA
          Expanded(
            flex: 3,
            child: Container(
              color: const Color(0xFF0B0C0E),
              padding: const EdgeInsets.all(16),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  double skala = constraints.maxWidth / sirinaZida;
                  return Center(
                    child: Container(
                      width: sirinaZida * skala,
                      height: visinaZida * skala,
                      decoration: Border.all(color: Colors.white30, width: 1),
                      child: Stack(
                        children: rasporedPlocica.map((p) {
                          return Positioned(
                            left: p.x * skala,
                            bottom: p.y * skala,
                            width: p.sirina * skala,
                            height: p.visina * skala,
                            child: GestureDetector(
                              onTap: () => _otvori2DDetalj(p),
                              child: Container(
                                decoration: Border.all(color: const Color(0xFF0F1113), width: 1.5),
                                color: p.imaRupu || p.jeLRez 
                                    ? const Color(0xFF5E452A) 
                                    : p.boja,
                                child: Center(
                                  child: Icon(
                                    p.jeIzOstatka ? Icons.eco : p.imaRupu ? Icons.adjust : p.jeLRez ? Icons.crop_square : null,
                                    size: 14,
                                    color: p.jeIzOstatka ? Colors.tealAccent : Colors.amber,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
          // UPRAVLJANJE ZONAMA I ALATIMA NA TERENU
          Expanded(
            flex: 2,
            child: Container(
              color: const Color(0xFF1A1D20),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Matematički Engine (Aktivne Zone):', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white70)),
                      Text('Ušteđeno ostataka: ${statistikaProjekta.iskoristeniOstatci}', style: const TextStyle(fontSize: 12, color: Colors.tealAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 10, mainAxisSpacing: 10,
                      childAspectRatio: 2.5,
                      children: [
                        _izgradiPrekidacAlata('Visinska Zona (90cm)', Icons.layers, imaHorizontalnuZonu, (v) {
                          setState(() {
                            imaHorizontalnuZonu = v;
                            _pokreniNapredniAlgoritam();
                          });
                        }),
                        _izgradiPrekidacAlata('Traka za Tuš', Icons.view_column, imaVertikalnuZonu, (v) {
                          setState(() {
                            imaVertikalnuZonu = v;
                            _pokreniNapredniAlgoritam();
                          });
                        }),
                        Container(
                          color: const Color(0xFF25292D),
                          child: InkWell(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => SpecifikacijaScreen(projekt: widget.projekt, stats: statistikaProjekta),
                                ),
                              );
                            },
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.assignment, size: 16, color: Colors.greenAccent),
                                SizedBox(width: 6),
                                Text('DOKUMENTACIJA / PDF', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.greenAccent)),
                              ],
                            ),
                          ),
                        ),
                        Container(
                          color: const Color(0xFF25292D),
                          child: InkWell(
                            onPressed: () {
                              setState(() {
                                sirinaZida = sirinaZida == 240.0 ? 310.0 : 240.0;
                                _pokreniNapredniAlgoritam();
                              });
                            },
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.aspect_ratio, size: 16),
                                SizedBox(width: 6),
                                Text('Promijeni Zid (Sim)', style: TextStyle(fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _izgradiPrekidacAlata(String naslov, IconData icon, bool vrijednost, ValueChanged<bool> onChanged) {
    return Container(
      color: vrijednost ? const Color(0xFF3A4349) : const Color(0xFF25292D),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: vrijednost ? Colors.white : Colors.white54),
              const SizedBox(width: 6),
              Text(naslov, style: const TextStyle(fontSize: 11)),
            ],
          ),
          Switch(
            value: vrijednost, onChanged: onChanged,
            activeColor: Colors.white, activeTrackColor: Colors.black26,
          ),
        ],
      ),
    );
  }
}

class SpecifikacijaScreen extends StatelessWidget {
  final KlijentProjekt projekt;
  final SpecifikacijaStats stats;

  const SpecifikacijaScreen({super.key, required this.projekt, required this.stats});

  @override
  Widget build(BuildContext context) {
    final p = projekt.paletaPlocica.first;
    
    return Scaffold(
      appBar: AppBar(title: const Text('DOKUMENTACIJA PROJEKTA'), backgroundColor: const Color(0xFF1A1D20)),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              color: const Color(0xFF1A1D20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('PROJEKT: ${projekt.nazivProstorije.toUpperCase()}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.amber)),
                      const BrokerLogo(velicina: 35, prikaziTekst: false),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('Klijent / Lokacija: ${projekt.imeKlijenta}', style: const TextStyle(color: Colors.white70)),
                  Text('Generirano: ${DateTime.now().day}.${DateTime.now().month}.${DateTime.now().year}.', style: const TextStyle(fontSize: 12, color: Colors.white38)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Text('IZRAČUN MATERIJALA NA TEMELJU OPTIMIZACIJE OSTATAKA', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1, color: Colors.white54)),
            const SizedBox(height: 10),
            Expanded(
              child: ListView(
                children: [
                  _izgradiStavkuSpecifikacije('Osnovni materijal:', '${p.naziv} (${p.sirina}x${p.duljina} cm)'),
                  _izgradiStavkuSpecifikacije('Čista površina zida:', '${stats.kvadraturaZida.toStringAsFixed(2)} m²'),
                  _izgradiStavkuSpecifikacije('Ukupno komada ugrađeno na zid:', '${stats.ukupnoKomadaNaZidu} kom'),
                  _izgradiStavkuSpecifikacije('Uspješno reciklirano ostataka (Isti uzorak):', '${stats.iskoristeniOstatci} kom', jeZeleno: true),
                  _izgradiStavkuSpecifikacije('Stvarna količina za narudžbu (Kupljene ploče):', '${stats.stvarniBrojKupljenihPlocica} kom', jeIstaknuto: true),
                  _izgradiStavkuSpecifikacije('Kvadratura za narudžbu u salonu:', '${stats.potrebnaKvadraturaMaterijala.toStringAsFixed(2)} m²', jeIstaknuto: true),
                  const Divider(color: Colors.white12, height: 30),
                  const Text('POTREBNA OBRADA NA GRADILIŠTU', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.amber)),
                  const SizedBox(height: 10),
                  _izgradiStavkuSpecifikacije('Broj rupa za priključke/cijevi:', '${stats.brojRupa} provrta'),
                  _izgradiStavkuSpecifikacije('Broj kutnih L-izreza (štokovi/zubi):', '${stats.brojLKutova} izreza'),
                ],
              ),
            ),
            ElevatedButton.icon(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('PDF uspješno generiran i poslan investitoru!'),
                                        content: Text('PDF uspješno generiran i poslan investitoru!'),
                    backgroundColor: const Color(0xFF3A4349),
                  ),
                );
              },
              icon: const Icon(Icons.share),
              label: const Text('PODIJELI TROŠKOVNIK (PDF)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2C3236),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _izgradiStavkuSpecifikacije(String naslov, String vrijednost, {bool jeIstaknuto = false, bool jeZeleno = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      color: jeIstaknuto ? const Color(0xFF232A2E) : jeZeleno ? Colors.teal.shade900.withOpacity(0.3) : Colors.transparent,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(naslov, style: TextStyle(color: jeIstaknuto ? Colors.amber : jeZeleno ? Colors.tealAccent : Colors.white70, fontWeight: jeIstaknuto ? FontWeight.bold : FontWeight.normal)),
          Text(vrijednost, style: TextStyle(fontWeight: FontWeight.bold, color: jeIstaknuto ? Colors.amber : jeZeleno ? Colors.tealAccent : Colors.white)),
        ],
      ),
    );
  }
}

    

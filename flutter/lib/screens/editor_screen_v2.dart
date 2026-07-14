import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import '../services/pdf_service.dart';
import '../widgets/tile_grid_widget.dart';
import 'camera_screen.dart';

class EditorScreen extends StatefulWidget {
  const EditorScreen({Key? key}) : super(key: key);

  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  late TextEditingController _wallWidthController;
  late TextEditingController _wallHeightController;
  late TextEditingController _sliderController;
  double _offsetX = 0;

  @override
  void initState() {
    super.initState();
    final project = context.read<ProjectProvider>().currentProject;
    _wallWidthController = TextEditingController(text: '240');
    _wallHeightController = TextEditingController(text: '265');
    _sliderController = TextEditingController(text: '0.0');
  }

  @override
  void dispose() {
    _wallWidthController.dispose();
    _wallHeightController.dispose();
    _sliderController.dispose();
    super.dispose();
  }

  void _saveProject() {
    context.read<ProjectProvider>().saveProject().then((_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Projekt je spremljen!')),
      );
    });
  }

  void _generateReport() {
    final project = context.read<ProjectProvider>().currentProject;
    if (project == null) return;
    
    PdfService.generateAndPrintProjectReport(project);
  }

  void _updateOffset(double value) {
    setState(() {
      _offsetX = value;
      _sliderController.text = value.toStringAsFixed(1);
    });
  }

  @override
  Widget build(BuildContext context) {
    final project = context.watch<ProjectProvider>().currentProject;
    
    if (project == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Greška')),
        body: const Center(child: Text('Nema aktivnog projekta')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('${project.clientName} - Rad'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Grid Preview
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF07080A),
                border: Border.all(color: const Color(0xFF161A1D)),
              ),
              child: TileGridWidget(
                surfaceWidth: double.tryParse(_wallWidthController.text) ?? 240,
                surfaceHeight: double.tryParse(_wallHeightController.text) ?? 265,
                tileWidth: project.tileWidth,
                tileHeight: project.tileHeight,
                grout: project.grout,
                offsetX: _offsetX,
              ),
            ),
            const SizedBox(height: 20),
            
            // Wall Dimensions
            const Text(
              'AKTIVNA POVRŠINA ZA OBRADU',
              style: TextStyle(fontSize: 10, color: Color(0xFF6C7A84)),
            ),
            const SizedBox(height: 12),
            DropdownButton<String>(
              value: 'wall1',
              isExpanded: true,
              items: const [
                DropdownMenuItem(value: 'wall1', child: Text('ZID 1 (Prednji / Glavni)')),
                DropdownMenuItem(value: 'wall2', child: Text('ZID 2 (Desni)')),
                DropdownMenuItem(value: 'wall3', child: Text('ZID 3 (Stražnji)')),
                DropdownMenuItem(value: 'wall4', child: Text('ZID 4 (Lijevi)')),
                DropdownMenuItem(value: 'floor', child: Text('POD KUPAONICE')),
              ],
              onChanged: (val) {},
            ),
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _wallWidthController,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'SIRINA ZIDA (cm)',
                      filled: true,
                      fillColor: Color(0xFF0A0C0E),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _wallHeightController,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'VISINA ZIDA (cm)',
                      filled: true,
                      fillColor: Color(0xFF0A0C0E),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Offset slider
            const Text(
              'RUČNO PORAVNANJE MREŽE',
              style: TextStyle(fontSize: 10, color: Color(0xFF6C7A84)),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () => _updateOffset((_offsetX - 0.5).clamp(0, project.tileWidth)),
                  child: const Text('◀'),
                ),
                Expanded(
                  child: Slider(
                    value: _offsetX,
                    max: project.tileWidth,
                    onChanged: _updateOffset,
                  ),
                ),
                ElevatedButton(
                  onPressed: () => _updateOffset((_offsetX + 0.5).clamp(0, project.tileWidth)),
                  child: const Text('▶'),
                ),
                SizedBox(
                  width: 60,
                  child: Text('${_offsetX.toStringAsFixed(1)} cm'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Checkboxes
            CheckboxListTile(
              title: const Text('Visinska Zona'),
              value: false,
              onChanged: (val) => setState(() {}),
            ),
            CheckboxListTile(
              title: const Text('Traka za Tuš'),
              value: false,
              onChanged: (val) => setState(() {}),
            ),
            const SizedBox(height: 20),
            
            // Buttons
            ElevatedButton(
              onPressed: _saveProject,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF14281E),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('💾 SPREMI PROJEKT U MEMORIJU'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _generateReport,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4EFA9E),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('📄 ZBIRNI TROŠKOVNIK (PDF)'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const CameraScreen()),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF19242D),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('📷 AR SKENIRANJE'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF161A1D),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('ZATVORI'),
            ),
          ],
        ),
      ),
    );
  }
}

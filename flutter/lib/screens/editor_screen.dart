import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';

class EditorScreen extends StatefulWidget {
  const EditorScreen({Key? key}) : super(key: key);

  @override
  State<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends State<EditorScreen> {
  late TextEditingController _wallWidthController;
  late TextEditingController _wallHeightController;

  @override
  void initState() {
    super.initState();
    _wallWidthController = TextEditingController(text: '240');
    _wallHeightController = TextEditingController(text: '265');
  }

  @override
  void dispose() {
    _wallWidthController.dispose();
    _wallHeightController.dispose();
    super.dispose();
  }

  void _saveProject() {
    context.read<ProjectProvider>().saveProject().then((_) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Projekt je spremljen!')),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Radni Prostor'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Grid Preview
            Container(
              height: 300,
              decoration: BoxDecoration(
                color: const Color(0xFF07080A),
                border: Border.all(color: const Color(0xFF161A1D)),
              ),
              child: Center(
                child: Text(
                  'AR MREZA PRIKAZ',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            // Wall Dimensions
            TextField(
              controller: _wallWidthController,
              decoration: const InputDecoration(
                labelText: 'SIRINA ZIDA (cm)',
                filled: true,
                fillColor: Color(0xFF0A0C0E),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _wallHeightController,
              decoration: const InputDecoration(
                labelText: 'VISINA ZIDA (cm)',
                filled: true,
                fillColor: Color(0xFF0A0C0E),
              ),
            ),
            const SizedBox(height: 20),
            
            // Save Button
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

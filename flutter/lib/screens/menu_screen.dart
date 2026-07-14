import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import 'editor_screen.dart';

class MenuScreen extends StatefulWidget {
  const MenuScreen({Key? key}) : super(key: key);

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  late TextEditingController _clientController;
  late TextEditingController _roomController;
  late TextEditingController _widthController;
  late TextEditingController _heightController;
  late TextEditingController _groutController;

  @override
  void initState() {
    super.initState();
    _clientController = TextEditingController();
    _roomController = TextEditingController();
    _widthController = TextEditingController(text: '120');
    _heightController = TextEditingController(text: '60');
    _groutController = TextEditingController(text: '2');
    
    Future.microtask(() {
      context.read<ProjectProvider>().loadProjects();
    });
  }

  @override
  void dispose() {
    _clientController.dispose();
    _roomController.dispose();
    _widthController.dispose();
    _heightController.dispose();
    _groutController.dispose();
    super.dispose();
  }

  void _createProject() {
    if (_clientController.text.isEmpty || _roomController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Molimo unesite ime klijenta i prostoriju')),
      );
      return;
    }

    context.read<ProjectProvider>().createProject(
      _clientController.text,
      _roomController.text,
      double.tryParse(_widthController.text) ?? 120,
      double.tryParse(_heightController.text) ?? 60,
      double.tryParse(_groutController.text) ?? 2,
    );

    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const EditorScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BRO-KER'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Logo & Title
            const SizedBox(height: 20),
            const Icon(Icons.home, size: 100, color: Color(0xFF4EFA9E)),
            const SizedBox(height: 16),
            const Text(
              'AUGMENTED REALITY COATING SYSTEM',
              style: TextStyle(fontSize: 10, color: Color(0xFF6C7A84)),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            
            // Input Fields
            TextField(
              controller: _clientController,
              decoration: InputDecoration(
                hintText: 'Ime klijenta / Lokacija',
                filled: true,
                fillColor: const Color(0xFF0A0C0E),
                border: OutlineInputBorder(
                  borderSide: const BorderSide(color: Color(0xFF343D44)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _roomController,
              decoration: InputDecoration(
                hintText: 'Prostorija (npr. Kupaonica)',
                filled: true,
                fillColor: const Color(0xFF0A0C0E),
                border: OutlineInputBorder(
                  borderSide: const BorderSide(color: Color(0xFF343D44)),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text('DIMENZIJE KERAMIKE', style: TextStyle(fontSize: 10, color: Color(0xFF6C7A84))),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _widthController,
                    decoration: const InputDecoration(
                      labelText: 'DULJINA (cm)',
                      filled: true,
                      fillColor: Color(0xFF0A0C0E),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _heightController,
                    decoration: const InputDecoration(
                      labelText: 'SIRINA (cm)',
                      filled: true,
                      fillColor: Color(0xFF0A0C0E),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _groutController,
                    decoration: const InputDecoration(
                      labelText: 'FUGA (mm)',
                      filled: true,
                      fillColor: Color(0xFF0A0C0E),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Create Project Button
            ElevatedButton(
              onPressed: _createProject,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF19242D),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('📷 POKRENI AR LIVE SKENIRANJE'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _createProject,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF161A1D),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('📐 RUČNI RADNI PROSTOR'),
            ),
            const SizedBox(height: 30),
            
            // Saved Projects
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('SPREMLJENI PROJEKTI', style: TextStyle(fontSize: 10, color: Color(0xFF6C7A84))),
            ),
            const SizedBox(height: 12),
            Consumer<ProjectProvider>(
              builder: (context, provider, _) {
                if (provider.projects.isEmpty) {
                  return const Text('Nema spremljenih projekata');
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: provider.projects.length,
                  itemBuilder: (context, index) {
                    final project = provider.projects[index];
                    return Card(
                      color: const Color(0xFF111417),
                      child: ListTile(
                        title: Text(project.clientName),
                        subtitle: Text(project.room),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete),
                          onPressed: () => provider.deleteProject(project.id),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

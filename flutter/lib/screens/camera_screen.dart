import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/project_provider.dart';
import '../services/camera_service.dart';
import '../widgets/tile_grid_widget.dart';
import '../services/pdf_service.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({Key? key}) : super(key: key);

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  late CameraService _cameraService;
  bool _isCalibrating = false;

  @override
  void initState() {
    super.initState();
    _cameraService = CameraService();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      await _cameraService.initializeCameras();
      await _cameraService.startDetection();
      setState(() {});
    } catch (e) {
      print('Greška pri inicijalizaciji kamere: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Greška pri pokretanju kamere: $e')),
      );
    }
  }

  void _switchCamera() {
    final newIndex = (_cameraService._currentCameraIndex + 1) % _cameraService._cameras.length;
    _cameraService.switchToCamera(newIndex);
    setState(() {});
  }

  void _calibrateMarker() {
    setState(() => _isCalibrating = !_isCalibrating);
    
    if (_isCalibrating) {
      // Simulacija kalibracije
      _cameraService.calibrateWithMarker(
        markerWidthPixels: 100,
        markerWidthCm: 10,
      );
    }
  }

  void _captureAndProceed() {
    final project = context.read<ProjectProvider>().currentProject;
    if (project == null) return;
    
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Mjere su zaključane')),
    );
  }

  @override
  void dispose() {
    _cameraService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AR Live Skeniranje'),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          // Kamera preview
          if (_cameraService.isInitialized)
            CameraPreview(_cameraService.controller!)
          else
            const Center(child: CircularProgressIndicator()),
          
          // Status i kontrole
          Positioned(
            top: 20,
            left: 16,
            right: 16,
            child: Column(
              children: [
                // Status
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _cameraService.isCalibrated
                        ? '💎 BRO-KER ACTIVE • 3D ACCELERATED'
                        : 'Uperite kameru u BRO-KER ploču...',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, color: Colors.green),
                  ),
                ),
                const SizedBox(height: 12),
                
                // Dugmadi
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: _switchCamera,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF161A1D),
                        ),
                        child: const Text('🔄 PROMIJENI LEĆU'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Bottom controls
          Positioned(
            bottom: 20,
            left: 16,
            right: 16,
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                    child: const Text('✕ PREKINI'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _captureAndProceed,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                    ),
                    child: const Text('💾 ZAKLJUČAJ'),
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

import 'dart:io';
import 'package:camera/camera.dart';
import 'package:image/image.dart' as img;

class CameraService {
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  int _currentCameraIndex = 0;
  bool _isDetecting = false;
  
  // ArUco marker detection
  static const double markerSize = 10.0; // cm
  double pixelsPerCm = 0;
  bool isCalibrated = false;

  Future<void> initializeCameras() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) throw Exception('Nema dostupnih kamera');
      
      // Pronađi stražnju kameru
      final backCamera = _cameras.firstWhere(
        (camera) => camera.lensDirection == CameraLensDirection.back,
        orElse: () => _cameras.first,
      );
      
      await switchToCamera(_cameras.indexOf(backCamera));
    } catch (e) {
      print('Greška pri inicijalizaciji kamera: $e');
    }
  }

  Future<void> switchToCamera(int index) async {
    if (index < 0 || index >= _cameras.length) return;
    
    _currentCameraIndex = index;
    await _cameraController?.dispose();
    
    _cameraController = CameraController(
      _cameras[index],
      ResolutionPreset.high,
      enableAudio: false,
    );
    
    await _cameraController!.initialize();
    isCalibrated = false;
  }

  Future<void> startDetection() async {
    if (_cameraController == null) return;
    
    _isDetecting = true;
    await _cameraController!.startImageStream(_processImage);
  }

  void _processImage(CameraImage image) {
    if (!_isDetecting) return;
    
    try {
      // Konvertiraj CameraImage u img.Image
      img.Image convertedImage = _convertCameraImage(image);
      
      // Detektiraj ArUco marker
      _detectArucoMarker(convertedImage);
    } catch (e) {
      print('Greška pri obradi slike: $e');
    }
  }

  img.Image _convertCameraImage(CameraImage image) {
    // Konvertiraj NV21 u RGB format
    const int shift = (0xFF << 24) | (0xFF << 16) | (0xFF << 8) | 0xFF;
    
    final int width = image.width;
    final int height = image.height;
    final int uvPixelStride = image.planes[1].bytesPerPixel ?? 1;
    final int uvRowStride = image.planes[1].bytesPerRow;
    final int uvBufferImageRowStride = (uvRowStride / uvPixelStride).ceil();
    
    final img.Image convertImage = img.Image(width: width, height: height);
    
    for (int w = 0; w < width; w++) {
      for (int h = 0; h < height; h++) {
        final int uvIndex = uvPixelStride * (w / 2).floor() + uvRowStride * (h / 2).floor();
        final int index = h * width + w;
        
        final yp = image.planes[0].bytes[index];
        final u = image.planes[1].bytes[uvIndex];
        final v = image.planes[2].bytes[uvIndex];
        
        convertImage.data![index] = ImageColorUtils.yuv2rgb(yp, u, v) | shift;
      }
    }
    
    return convertImage;
  }

  void _detectArucoMarker(img.Image image) {
    // Osnovna detekcija - pronađi temno-bijele rubove
    // U produkciji koristiti OpenCV Dart binding
    
    // Simulacija detektiranja markera
    // Pravi kod bi koristio: flutter_opencv ili opencv dart binding
    
    // Za sada:
    // 1. Greyscale konverzija
    // 2. Adaptive threshold
    // 3. Pronađi contours
    // 4. Filtriraj po veličini i obliku
  }

  void calibrateWithMarker({
    required double markerWidthPixels,
    required double markerWidthCm,
  }) {
    pixelsPerCm = markerWidthPixels / markerWidthCm;
    isCalibrated = true;
  }

  Future<void> stopDetection() async {
    _isDetecting = false;
    await _cameraController?.stopImageStream();
  }

  CameraController? get controller => _cameraController;
  bool get isInitialized => _cameraController?.value.isInitialized ?? false;

  Future<void> dispose() async {
    await stopDetection();
    await _cameraController?.dispose();
  }
}

class ImageColorUtils {
  static int yuv2rgb(int y, int u, int v) {
    // Konvertuj YUV u RGB
    int r = (y + v * 1436 / 1024 - 179).clamp(0, 255).toInt();
    int g = (y - u * 46549 / 131072 + 44 - v * 93604 / 131072 + 91).clamp(0, 255).toInt();
    int b = (y + u * 1814 / 1024 - 227).clamp(0, 255).toInt();
    
    return (0xFF000000) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF);
  }
}

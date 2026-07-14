import 'package:flutter/material.dart';
import '../services/calculation_service.dart';

class TileGridWidget extends StatelessWidget {
  final double surfaceWidth;    // cm
  final double surfaceHeight;   // cm
  final double tileWidth;       // cm
  final double tileHeight;      // cm
  final double grout;           // mm
  final double offsetX;         // cm
  final List<OpeningRect>? openings;
  final VoidCallback? onTileTap;

  const TileGridWidget({
    Key? key,
    required this.surfaceWidth,
    required this.surfaceHeight,
    required this.tileWidth,
    required this.tileHeight,
    required this.grout,
    this.offsetX = 0,
    this.openings,
    this.onTileTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: TileGridPainter(
        surfaceWidth: surfaceWidth,
        surfaceHeight: surfaceHeight,
        tileWidth: tileWidth,
        tileHeight: tileHeight,
        grout: grout,
        offsetX: offsetX,
        openings: openings,
      ),
      size: const Size(double.infinity, 300),
    );
  }
}

class TileGridPainter extends CustomPainter {
  final double surfaceWidth;
  final double surfaceHeight;
  final double tileWidth;
  final double tileHeight;
  final double grout;
  final double offsetX;
  final List<OpeningRect>? openings;

  TileGridPainter({
    required this.surfaceWidth,
    required this.surfaceHeight,
    required this.tileWidth,
    required this.tileHeight,
    required this.grout,
    required this.offsetX,
    this.openings,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Izračunaj skalu - prilagodi cm na piksel
    double scale = size.width / surfaceWidth;
    
    // Generiraj grid pločica
    List<TileRect> tiles = CalculationService.generateTileGrid(
      surfaceWidth: surfaceWidth,
      surfaceHeight: surfaceHeight,
      tileWidth: tileWidth,
      tileHeight: tileHeight,
      grout: grout,
      offsetX: offsetX,
      openings: openings,
    );
    
    // Nacrtaj pozadinu
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..color = const Color(0xFF07080A),
    );
    
    // Nacrtaj pločice
    for (var tile in tiles) {
      Rect tileRect = Rect.fromLTWH(
        tile.x * scale,
        tile.y * scale,
        tile.width * scale,
        tile.height * scale,
      );
      
      // Boja prema tipu
      Color tileColor = tile.isCut 
          ? const Color(0xFF4C3319)  // Rezana - smeđa
          : const Color(0xFF22282C); // Cijela - siva
      
      Paint tilePaint = Paint()
        ..color = tileColor
        ..strokeWidth = 1
        ..style = PaintingStyle.fill;
      
      canvas.drawRect(tileRect, tilePaint);
      
      // Nacrtaj rub
      Paint borderPaint = Paint()
        ..color = const Color(0xFF0A0C0E)
        ..strokeWidth = 1
        ..style = PaintingStyle.stroke;
      
      canvas.drawRect(tileRect, borderPaint);
    }
  }

  @override
  bool shouldRepaint(TileGridPainter oldDelegate) {
    return oldDelegate.offsetX != offsetX ||
        oldDelegate.tileWidth != tileWidth ||
        oldDelegate.tileHeight != tileHeight ||
        oldDelegate.grout != grout;
  }
}

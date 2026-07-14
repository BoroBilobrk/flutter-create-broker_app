class CalculationService {
  /// Izračuna broj cijelih pločica za površinu
  static int calculateTileCount({
    required double surfaceWidth,      // cm
    required double surfaceHeight,     // cm
    required double tileWidth,         // cm
    required double tileHeight,        // cm
    required double grout,             // mm
  }) {
    double groutCm = grout / 10;
    double effectiveWidth = tileWidth + groutCm;
    double effectiveHeight = tileHeight + groutCm;
    
    int tilesX = (surfaceWidth / effectiveWidth).ceil();
    int tilesY = (surfaceHeight / effectiveHeight).ceil();
    
    return tilesX * tilesY;
  }

  /// Izračuna kvadraturu površine
  static double calculateSquareMeters({
    required double width,   // cm
    required double height,  // cm
  }) {
    return (width * height) / 10000;
  }

  /// Generiraj grid sa pločicama za renderiranje
  static List<TileRect> generateTileGrid({
    required double surfaceWidth,
    required double surfaceHeight,
    required double tileWidth,
    required double tileHeight,
    required double grout,
    required double offsetX,
    List<OpeningRect>? openings,
  }) {
    List<TileRect> tiles = [];
    double groutCm = grout / 10;
    double effectiveWidth = tileWidth + groutCm;
    double effectiveHeight = tileHeight + groutCm;
    
    double minimalCut = 8.0; // cm
    double remainder = surfaceWidth % effectiveWidth;
    double startOffset = 0;
    
    if (remainder > 0 && remainder < minimalCut) {
      startOffset = (effectiveWidth - remainder) / 2;
    }
    
    double startX = offsetX - startOffset;
    while (startX > 0) startX -= effectiveWidth;
    
    double currentY = 0;
    while (currentY < surfaceHeight) {
      double currentX = startX;
      
      while (currentX < surfaceWidth) {
        double w = effectiveWidth;
        double h = effectiveHeight;
        double actualX = currentX < 0 ? 0 : currentX;
        
        if (currentX < 0) {
          w = effectiveWidth + currentX;
        } else if (currentX + w > surfaceWidth) {
          w = surfaceWidth - currentX;
        }
        
        if (currentY + h > surfaceHeight) {
          h = surfaceHeight - currentY;
        }
        
        // Provjeri je li pločica u otvoru
        bool insideOpening = false;
        bool cutsOpening = false;
        OpeningRect? openingDetails;
        
        if (openings != null) {
          for (var opening in openings) {
            double overlapX = (actualX + w).clamp(opening.x, opening.x + opening.width) -
                actualX.clamp(opening.x, opening.x + opening.width);
            double overlapY = (currentY + h).clamp(opening.y, opening.y + opening.height) -
                currentY.clamp(opening.y, opening.y + opening.height);
            
            if (overlapX > 0 && overlapY > 0) {
              if ((overlapX * overlapY - w * h).abs() < 1.0) {
                insideOpening = true;
              } else {
                cutsOpening = true;
              }
            }
          }
        }
        
        if (!insideOpening && w > 0.1 && h > 0.1) {
          tiles.add(TileRect(
            x: actualX,
            y: currentY,
            width: w - groutCm,
            height: h - groutCm,
            isCut: (w < tileWidth - 0.5) || (h < tileHeight - 0.5) || cutsOpening,
          ));
        }
        
        currentX += effectiveWidth;
      }
      currentY += effectiveHeight;
    }
    
    return tiles;
  }
}

class TileRect {
  final double x;
  final double y;
  final double width;
  final double height;
  final bool isCut;
  
  TileRect({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.isCut = false,
  });
}

class OpeningRect {
  final String type;  // 'Door', 'Window', 'Drain'
  final double x;
  final double y;
  final double width;
  final double height;
  
  OpeningRect({
    required this.type,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
  });
}

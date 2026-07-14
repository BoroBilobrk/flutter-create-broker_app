import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/project_model.dart';
import '../services/calculation_service.dart';

class PdfService {
  static Future<void> generateAndPrintProjectReport(ProjectModel project) async {
    final pdf = pw.Document();
    
    // Izračunaj kvadrature
    final wall1Sqm = CalculationService.calculateSquareMeters(
      width: 240,
      height: 265,
    );
    
    final wall2Sqm = CalculationService.calculateSquareMeters(
      width: 200,
      height: 265,
    );
    
    final floorSqm = CalculationService.calculateSquareMeters(
      width: 240,
      height: 200,
    );
    
    // Izračunaj broj pločica
    final wall1Tiles = CalculationService.calculateTileCount(
      surfaceWidth: 240,
      surfaceHeight: 265,
      tileWidth: project.tileWidth,
      tileHeight: project.tileHeight,
      grout: project.grout,
    );
    
    final wall2Tiles = CalculationService.calculateTileCount(
      surfaceWidth: 200,
      surfaceHeight: 265,
      tileWidth: project.tileWidth,
      tileHeight: project.tileHeight,
      grout: project.grout,
    );
    
    final floorTiles = CalculationService.calculateTileCount(
      surfaceWidth: 240,
      surfaceHeight: 200,
      tileWidth: project.tileWidth,
      tileHeight: project.tileHeight,
      grout: project.grout,
    );
    
    final totalWallSqm = (wall1Sqm + wall1Sqm + wall2Sqm + wall2Sqm) / 10000;
    final totalWallTiles = (wall1Tiles * 2) + (wall2Tiles * 2);
    
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) => pw.Column(
          children: [
            // Zaglavlje
            pw.Text(
              'BRO-KER',
              style: pw.TextStyle(
                fontSize: 28,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.Text(
              'Augmented Reality Coating System',
              style: const pw.TextStyle(fontSize: 10),
            ),
            pw.Divider(),
            pw.SizedBox(height: 12),
            
            // Projektni nalog
            pw.Text(
              'PROJEKTNI NALOG',
              style: pw.TextStyle(
                fontSize: 14,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Text('Klijent: ${project.clientName}'),
            pw.Text('Prostorija: ${project.room}'),
            pw.Text('Datum: ${DateTime.now().toString().split(' ')[0]}'),
            pw.SizedBox(height: 16),
            
            // Specifikacija keramike
            pw.Text(
              'SPECIFIKACIJA KERAMIKE',
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Text('Format: ${project.tileWidth.toStringAsFixed(0)}x${project.tileHeight.toStringAsFixed(0)} cm'),
            pw.Text('Fuga: ${project.grout.toStringAsFixed(1)} mm'),
            pw.SizedBox(height: 16),
            
            // Tablica - Zidovi
            pw.Text(
              '1. ZIDOVI',
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Table(
              border: pw.TableBorder.all(),
              children: [
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFF111417)),
                  children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text('Površina', style: const pw.TextStyle(color: PdfColors.white)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text('Kvadratura (m²)', style: const pw.TextStyle(color: PdfColors.white)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text('Komadi', style: const pw.TextStyle(color: PdfColors.white)),
                    ),
                  ],
                ),
                pw.TableRow(
                  children: [
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('Zid 1 (Prednji)')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall1Sqm.toStringAsFixed(2))),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall1Tiles.toString())),
                  ],
                ),
                pw.TableRow(
                  children: [
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('Zid 2 (Stražnji)')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall1Sqm.toStringAsFixed(2))),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall1Tiles.toString())),
                  ],
                ),
                pw.TableRow(
                  children: [
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('Zid 3 (Desni)')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall2Sqm.toStringAsFixed(2))),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall2Tiles.toString())),
                  ],
                ),
                pw.TableRow(
                  children: [
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('Zid 4 (Lijevi)')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall2Sqm.toStringAsFixed(2))),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text(wall2Tiles.toString())),
                  ],
                ),
                pw.TableRow(
                  decoration: const pw.BoxDecoration(color: PdfColor.fromInt(0xFFEAEDEF)),
                  children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text('UKUPNO', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text(totalWallSqm.toStringAsFixed(2), style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(8),
                      child: pw.Text(totalWallTiles.toString(), style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
            pw.SizedBox(height: 16),
            
            // Tablica - Pod
            pw.Text(
              '2. POD',
              style: pw.TextStyle(
                fontSize: 12,
                fontWeight: pw.FontWeight.bold,
              ),
            ),
            pw.SizedBox(height: 8),
            pw.Table(
              border: pw.TableBorder.all(),
              children: [
                pw.TableRow(
                  children: [
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('Pod')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('${floorSqm.toStringAsFixed(2)} m²')),
                    pw.Padding(padding: const pw.EdgeInsets.all(8), child: pw.Text('$floorTiles kom')),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
    
    // Ispis ili preuzimanje
    await Printing.layoutPdf(
      onLayout: (_) => pdf.save(),
      name: '${project.clientName}_${project.room}.pdf',
    );
  }
}

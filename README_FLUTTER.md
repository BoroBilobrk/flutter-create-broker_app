# BRO-KER Flutter APK

## Struktura Projekta

```
flutter/
├── lib/
│   ├── main.dart                 # Glavna aplikacija
│   ├── screens/                  # Ekrani
│   │   ├── menu_screen.dart
│   │   ├── editor_screen.dart
│   │   └── camera_screen.dart
│   ├── providers/                # State management (Provider)
│   │   └── project_provider.dart
│   ├── models/                   # Data modeli
│   │   ├── project_model.dart
│   │   └── surface_model.dart
│   ├── services/                 # Poslovne logike
│   │   ├── storage_service.dart
│   │   ├── camera_service.dart
│   │   └── calculation_service.dart
│   └── widgets/                  # Ponovno iskoristivi widgeti
│       └── tile_grid_widget.dart
├── android/
│   ├── app/
│   │   └── build.gradle        # Android build konfiguracija
│   └── settings.gradle
├── ios/
│   └── Runner/                  # iOS build fajlovi
├── pubspec.yaml                 # Dependencije
├── pubspec.lock                 # Lock datoteka
└── README_FLUTTER.md            # Ovaj fajl

```

## Instalacija

### Prerequirements
```bash
# Instaliraj Flutter SDK
# https://flutter.dev/docs/get-started/install

flutter --version
flutter doctor
```

### Setup Projekta
```bash
cd flutter
flutter pub get
flutter pub upgrade
```

## Razvoj

### Hot Reload
```bash
flutter run
```

### Debug na Uređaju
```bash
flutter run -d <device-id>
```

## Build APK

### Release APK
```bash
flutter build apk --release
```

**Output:** `flutter/build/app/outputs/flutter-apk/app-release.apk`

### Split APK (po arhitekturi)
```bash
flutter build apk --release --split-per-abi
```

### AppBundle (za Google Play)
```bash
flutter build appbundle --release
```

## Android Setup

### Konfiguracija za Kameru i AR

Azuriraj `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## iOS Setup

Azuriraj `ios/Runner/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>BRO-KER koristi kameru za AR mjerenje</string>
```

## Konverzija iz Web Koda

### Mapiranje:
- `index.html` → `lib/screens/*.dart`
- `js/app.js` → `lib/providers/project_provider.dart`
- `js/matematika.js` → `lib/services/calculation_service.dart`
- `js/aruco.js` → `lib/services/camera_service.dart`
- `css/stil.css` → `lib/theme/app_theme.dart` + Flutter styling

## Sljedeće Korake

1. ✅ Kreiraj Flutter projekt
2. ⬜ Implementiraj Camera & AR logiku
3. ⬜ Konvertiraj Tile Grid iz SVG u Canvas/CustomPaint
4. ⬜ Implementiraj PDF generiranje
5. ⬜ Test na fizičkom uređaju
6. ⬜ Generiraj signed APK za distribuciju

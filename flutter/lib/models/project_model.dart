class ProjectModel {
  final String id;
  final String clientName;
  final String room;
  final double tileWidth;    // cm
  final double tileHeight;   // cm
  final double grout;        // mm
  final DateTime createdAt;
  final Map<String, SurfaceModel> surfaces;

  ProjectModel({
    required this.id,
    required this.clientName,
    required this.room,
    required this.tileWidth,
    required this.tileHeight,
    required this.grout,
    required this.createdAt,
    this.surfaces = const {},
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'clientName': clientName,
    'room': room,
    'tileWidth': tileWidth,
    'tileHeight': tileHeight,
    'grout': grout,
    'createdAt': createdAt.toIso8601String(),
  };

  factory ProjectModel.fromJson(Map<String, dynamic> json) => ProjectModel(
    id: json['id'],
    clientName: json['clientName'],
    room: json['room'],
    tileWidth: json['tileWidth'],
    tileHeight: json['tileHeight'],
    grout: json['grout'],
    createdAt: DateTime.parse(json['createdAt']),
  );
}

class SurfaceModel {
  final String type;      // 'Wall', 'Floor', 'Trim'
  final double width;     // cm
  final double height;    // cm
  final List<OpeningModel> openings;
  final bool heightZone;
  final bool showerZone;

  SurfaceModel({
    required this.type,
    required this.width,
    required this.height,
    this.openings = const [],
    this.heightZone = false,
    this.showerZone = false,
  });
}

class OpeningModel {
  final String type;  // 'Door', 'Window', 'Drain', etc.
  final double width;
  final double height;
  final double x;
  final double y;

  OpeningModel({
    required this.type,
    required this.width,
    required this.height,
    required this.x,
    required this.y,
  });
}

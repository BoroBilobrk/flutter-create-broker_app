import 'package:flutter/foundation.dart';
import '../models/project_model.dart';
import '../services/storage_service.dart';

class ProjectProvider extends ChangeNotifier {
  final StorageService _storageService = StorageService();
  ProjectModel? _currentProject;
  List<ProjectModel> _projects = [];

  ProjectModel? get currentProject => _currentProject;
  List<ProjectModel> get projects => _projects;

  Future<void> loadProjects() async {
    _projects = await _storageService.getProjects();
    notifyListeners();
  }

  Future<void> createProject(String clientName, String room, double tileW, double tileH, double grout) async {
    _currentProject = ProjectModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      clientName: clientName,
      room: room,
      tileWidth: tileW,
      tileHeight: tileH,
      grout: grout,
      createdAt: DateTime.now(),
    );
    notifyListeners();
  }

  Future<void> saveProject() async {
    if (_currentProject != null) {
      await _storageService.saveProject(_currentProject!);
      await loadProjects();
      notifyListeners();
    }
  }

  Future<void> deleteProject(String projectId) async {
    await _storageService.deleteProject(projectId);
    await loadProjects();
    notifyListeners();
  }
}

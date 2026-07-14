import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/project_model.dart';

class StorageService {
  static const String _projectsKey = 'BROKER_PROJECTS';

  Future<void> saveProject(ProjectModel project) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> projects = prefs.getStringList(_projectsKey) ?? [];
    
    projects.removeWhere((p) => jsonDecode(p)['id'] == project.id);
    projects.add(jsonEncode(project.toJson()));
    
    await prefs.setStringList(_projectsKey, projects);
  }

  Future<List<ProjectModel>> getProjects() async {
    final prefs = await SharedPreferences.getInstance();
    final projects = prefs.getStringList(_projectsKey) ?? [];
    
    return projects
        .map((p) => ProjectModel.fromJson(jsonDecode(p)))
        .toList();
  }

  Future<void> deleteProject(String projectId) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> projects = prefs.getStringList(_projectsKey) ?? [];
    
    projects.removeWhere((p) => jsonDecode(p)['id'] == projectId);
    await prefs.setStringList(_projectsKey, projects);
  }
}

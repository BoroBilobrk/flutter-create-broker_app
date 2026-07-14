import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/menu_screen.dart';
import 'providers/project_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProjectProvider()),
      ],
      child: MaterialApp(
        title: 'BRO-KER',
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0A0C0E),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF111417),
            elevation: 4,
          ),
        ),
        home: const MenuScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

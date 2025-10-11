import 'package:flutter/material.dart';
import 'pages/login_page.dart';
import 'pages/products_page.dart';
import 'widgets/topbar.dart';
import 'widgets/sidebar.dart';
import 'pages/home_page.dart';
import 'pages/deployment_page.dart';
import 'pages/contact_page.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'config/amplify_configuration.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    final auth = AmplifyAuthCognito();
    await Amplify.addPlugin(auth);
    await Amplify.configure(amplifyconfig);
  } catch (e) {
    print("Amplify already configured or error: $e");
  }

  runApp(CpsLabApp(key: appKey));
}

//  global key to reset the app on logout
final GlobalKey<_CpsLabState> appKey = GlobalKey<_CpsLabState>();
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class CpsLabApp extends StatefulWidget {
  const CpsLabApp({super.key});

  @override
  _CpsLabState createState() => _CpsLabState();
}

class _CpsLabState extends State<CpsLabApp> {
  Key _appKey = UniqueKey();

  void resetApp() {
    setState(() {
      _appKey = UniqueKey();
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      key: _appKey,
      navigatorKey: navigatorKey,

      debugShowCheckedModeBanner: false,
      home: const CpsLab(),
    );
  }
}

// ------------------ MAIN APP -------------------
class CpsLab extends StatefulWidget {
  const CpsLab({super.key});

  @override
  CpsLabState createState() => CpsLabState();
}

class CpsLabState extends State<CpsLab> {
  Widget _selectedPage = const HomePage();
  bool _isDarkTheme = false;
  String _currentPageName = "Home";
  String? loggedInEmail;
  bool _isCheckingUser = true;

  @override
  void initState() {
    super.initState();
    _checkUser();
  }

  void _checkUser() async {
    try {
      final user = await Amplify.Auth.getCurrentUser();

      setState(() {
        loggedInEmail = user.username;
      });
    } catch (e) {
      setState(() {
        loggedInEmail = null;
      });
    } finally {
      setState(() {
        _isCheckingUser = false;
      });
    }
  }

  void _onPageSelected(String page) {
    setState(() {
      _currentPageName = page;
      switch (page) {
        case 'Home':
          _selectedPage = const HomePage();
          break;
        case 'Deployments':
          _selectedPage = const DeploymentPage();
          break;
        case 'Products':
          _selectedPage = ProductsPage(userEmail: loggedInEmail);
          break;
        case 'Contact':
          _selectedPage = const ContactPage();
          break;
      }
    });
  }

  void _toggleTheme() => setState(() => _isDarkTheme = !_isDarkTheme);
  void _setUser(String? email) => setState(() => loggedInEmail = email);

  void _logoutAndReset() async {
    try {
      await Amplify.Auth.signOut();
    } catch (e) {
      print("Signout error: $e");
    }
    setState(() {
      loggedInEmail = null;
      _selectedPage = const HomePage();
      _currentPageName = "Home";
    });
    appKey.currentState?.resetApp();
  }

  @override
  Widget build(BuildContext context) {
    if (_isCheckingUser) {
      return const MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: _isDarkTheme ? ThemeData.dark() : ThemeData.light(),
      home: loggedInEmail == null
          ? LoginPage(onLogin: _setUser)
          : LayoutBuilder(
              builder: (context, constraints) {
                bool isMobile = constraints.maxWidth < 900;
                return Scaffold(
                  appBar: isMobile
                      ? AppBar(
                          backgroundColor: Colors.transparent,
                          elevation: 0,
                          iconTheme: IconThemeData(
                            color: _isDarkTheme ? Colors.white : Colors.black,
                          ),
                          title: Text(
                            loggedInEmail != null
                                ? "Hi, ${loggedInEmail!.split('@')[0]}"
                                : "Guest",
                            style: TextStyle(
                              color: _isDarkTheme ? Colors.white : Colors.black,
                              fontSize: 16,
                            ),
                          ),
                          actions: [
                            IconButton(
                              icon: Icon(
                                _isDarkTheme
                                    ? Icons.light_mode
                                    : Icons.dark_mode,
                                color: _isDarkTheme
                                    ? Colors.white
                                    : Colors.black,
                              ),
                              onPressed: _toggleTheme,
                            ),
                            const SizedBox(width: 8),

                            TextButton.icon(
                              onPressed: () {
                                if (loggedInEmail != null) {
                                  _logoutAndReset();
                                } else {
                                  setState(() {
                                    _selectedPage = LoginPage(
                                      onLogin: _setUser,
                                    );
                                    _currentPageName = "Login";
                                  });
                                }
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: _isDarkTheme
                                    ? Colors.white
                                    : Colors.black,
                              ),

                              label: Text(
                                loggedInEmail == "Guest" ? "Login" : "Logout",
                                style: const TextStyle(fontSize: 14),
                              ),
                            ),
                            const SizedBox(width: 8),
                          ],
                        )
                      : null,

                  drawer: isMobile
                      ? SizedBox(
                          width: MediaQuery.of(context).size.width * 0.75 > 300
                              ? 300
                              : MediaQuery.of(context).size.width * 0.75,
                          child: Sidebar(
                            onPageSelected: _onPageSelected,
                            selectedPage: _currentPageName,
                            isDarkTheme: _isDarkTheme,
                          ),
                        )
                      : null,
                  body: Row(
                    children: [
                      if (!isMobile)
                        Sidebar(
                          onPageSelected: _onPageSelected,
                          selectedPage: _currentPageName,
                          isDarkTheme: _isDarkTheme,
                        ),
                      Expanded(
                        child: Column(
                          children: [
                            if (!isMobile)
                              TopBar(
                                onToggleTheme: _toggleTheme,
                                isDarkTheme: _isDarkTheme,
                                userEmail: loggedInEmail ?? "Guest",
                                onLogout: _logoutAndReset,
                              ),
                            Expanded(child: _selectedPage),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';  
import '../providers/theme_provider.dart';  

class TopBar extends StatelessWidget {
  final String userEmail;
  final VoidCallback onLogout;

  const TopBar({
    super.key,
    required this.userEmail,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context); 
    final bool isDark = themeProvider.isDark;  

    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "Hi: $userEmail",
            style: TextStyle(
              color: isDark ? Colors.yellow.shade200 : Colors.deepPurple,
              fontWeight: FontWeight.bold,
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: Icon(
                  isDark ? Icons.dark_mode : Icons.light_mode,  
                  color: isDark ? Colors.white : Colors.black,
                ),
                onPressed: () => themeProvider.toggleTheme(),  
              ),
              TextButton(
                onPressed: onLogout,
                child: Text(
                  userEmail == 'Guest' ? 'Login' : 'Logout',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
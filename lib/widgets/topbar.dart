import 'package:flutter/material.dart';

class TopBar extends StatelessWidget {
  final VoidCallback onToggleTheme;
  final bool isDarkTheme;
  final String userEmail;
  final VoidCallback onLogout;

  const TopBar({
    super.key,
    required this.onToggleTheme,
    required this.isDarkTheme,
    required this.userEmail,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            "Hi: $userEmail",
            style: TextStyle(
              color: isDarkTheme ? Colors.yellow.shade200 : Colors.deepPurple,
              fontWeight: FontWeight.bold,
            ),
          ),
          Row(
            children: [
              IconButton(
                icon: Icon(
                  isDarkTheme ? Icons.dark_mode : Icons.light_mode,
                  color: isDarkTheme ? Colors.white : Colors.black,
                ),
                onPressed: onToggleTheme,
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

import 'dart:ui';

import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class LoginPage extends StatefulWidget {
  final Function(String?) onLogin;
  const LoginPage({super.key, required this.onLogin});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with TickerProviderStateMixin {
  // ────────────────────── STATE ──────────────────────
  bool isLogin = true;
  bool _isPasswordObscured = true;
  bool _isConfirmPasswordObscured = true;
  bool _isLoading = false;
  bool _isDarkMode = false;
  bool showConfirmCodeField = false;

  late final AnimationController _formCtrl;
  late final AnimationController _pageCtrl;
  late final AnimationController _pulseCtrl;
  late final AnimationController _neonCtrl;
  late final Animation<double> _pageFade;
  late final Animation<Offset> _pageSlide;

  // Controllers
  final usernameCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final passwordCtrl = TextEditingController();
  final confirmPasswordCtrl = TextEditingController();
  final confirmCodeCtrl = TextEditingController();

  // Errors
  String? usernameError,
      emailError,
      phoneError,
      passwordError,
      confirmPasswordError;

  // ────────────────────── INIT / DISPOSE ──────────────────────
  @override
  void initState() {
    super.initState();

    _formCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _pageCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _neonCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _pageFade = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _pageCtrl, curve: Curves.easeOut));
    _pageSlide = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _pageCtrl, curve: Curves.easeOutCubic));

    _pageCtrl.forward();
  }

  @override
  void dispose() {
    _formCtrl.dispose();
    _pageCtrl.dispose();
    _pulseCtrl.dispose();
    _neonCtrl.dispose();
    usernameCtrl.dispose();
    emailCtrl.dispose();
    phoneCtrl.dispose();
    passwordCtrl.dispose();
    confirmPasswordCtrl.dispose();
    confirmCodeCtrl.dispose();
    super.dispose();
  }

  // ────────────────────── TOGGLE ──────────────────────
  void toggleMode() {
    setState(() {
      isLogin = !isLogin;
      showConfirmCodeField = false;
      _clearErrors();
      isLogin ? _formCtrl.reverse() : _formCtrl.forward();
    });
  }

  void _clearErrors() {
    usernameError = emailError = phoneError = passwordError =
        confirmPasswordError = null;
  }

  // ────────────────────── VALIDATION ──────────────────────
  bool validateUsername() {
    final v = usernameCtrl.text.trim();
    if (v.isEmpty) {
      usernameError = "Username cannot be empty";
      return false;
    }
    if (v.contains('@')) {
      usernameError = "Username cannot be an email";
      return false;
    }
    usernameError = null;
    return true;
  }

  bool validateEmail() {
    final v = emailCtrl.text.trim();
    if (v.isEmpty) {
      emailError = "Email cannot be empty";
      return false;
    }
    if (!RegExp(r"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$").hasMatch(v)) {
      emailError = "Invalid email format";
      return false;
    }
    emailError = null;
    return true;
  }

  bool validatePhone() {
    final v = phoneCtrl.text.trim();
    if (v.isEmpty) {
      phoneError = "Phone cannot be empty";
      return false;
    }
    if (!RegExp(r'^\+?[0-9]{10,15}$').hasMatch(v)) {
      phoneError = "Valid phone (e.g. +919876543210)";
      return false;
    }
    phoneError = null;
    return true;
  }

  bool validatePassword({bool checkConfirm = false}) {
    final p = passwordCtrl.text.trim();
    if (p.isEmpty) {
      passwordError = "Password cannot be empty";
      return false;
    }
    if (!RegExp(
      r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$&*~]).{8,}$',
    ).hasMatch(p)) {
      passwordError = "8+ chars, upper, lower, number & special char";
      return false;
    }
    passwordError = null;
    if (checkConfirm && p != confirmPasswordCtrl.text.trim()) {
      confirmPasswordError = "Passwords do not match";
      return false;
    }
    confirmPasswordError = null;
    return true;
  }

  // ────────────────────── AUTH LOGIC ──────────────────────
  Future<void> login() async {
    if (!validateUsername() || !validatePassword()) {
      setState(() {});
      return;
    }
    setState(() => _isLoading = true);
    try {
      final res = await Amplify.Auth.signIn(
        username: usernameCtrl.text.trim(),
        password: passwordCtrl.text.trim(),
      );
      if (res.isSignedIn) {
        widget.onLogin(usernameCtrl.text.trim());
        _showSnack("Login successful!");
      } else {
        setState(() => showConfirmCodeField = true);
        _showSnack("Verify your account first.");
      }
    } on AuthException catch (e) {
      if (e.message.contains('not confirmed')) {
        setState(() => showConfirmCodeField = true);
        _showSnack("Enter verification code.");
      } else {
        _showSnack("Login failed: ${e.message}");
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> signUp() async {
    if (!validateUsername() ||
        !validateEmail() ||
        !validatePhone() ||
        !validatePassword(checkConfirm: true)) {
      setState(() {});
      return;
    }
    setState(() => _isLoading = true);
    try {
      final res = await Amplify.Auth.signUp(
        username: usernameCtrl.text.trim(),
        password: passwordCtrl.text.trim(),
        options: CognitoSignUpOptions(
          userAttributes: {
            CognitoUserAttributeKey.email: emailCtrl.text.trim(),
            CognitoUserAttributeKey.phoneNumber: phoneCtrl.text.trim(),
            CognitoUserAttributeKey.preferredUsername: usernameCtrl.text.trim(),
          },
        ),
      );

      if (res.isSignUpComplete) {
        _showSnack("Signup successful! Please login.");
        setState(() {
          isLogin = true;
          showConfirmCodeField = false;
        });
      } else {
        setState(() => showConfirmCodeField = true);
        _showSnack("Verification code sent.");
      }
    } on AuthException catch (e) {
      if (e.message.toLowerCase().contains("exists")) {
        try {
          final si = await Amplify.Auth.signIn(
            username: usernameCtrl.text.trim(),
            password: passwordCtrl.text.trim(),
          );
          if (si.isSignedIn) {
            widget.onLogin(usernameCtrl.text.trim());
            _showSnack("Account exists – logging in.");
          } else {
            setState(() => showConfirmCodeField = true);
          }
        } on UserNotConfirmedException {
          setState(() => showConfirmCodeField = true);
          _showSnack("Account not verified – enter code.");
        }
      } else {
        _showSnack("Signup failed: ${e.message}");
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> confirmCode() async {
    setState(() => _isLoading = true);
    try {
      final res = await Amplify.Auth.confirmSignUp(
        username: usernameCtrl.text.trim(),
        confirmationCode: confirmCodeCtrl.text.trim(),
      );
      if (res.isSignUpComplete) {
        _showSnack("Verification successful! Login now.");
        setState(() {
          showConfirmCodeField = false;
          isLogin = true;
        });
      }
    } on AuthException catch (e) {
      _showSnack("Verification failed: ${e.message}");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> resendCode() async {
    try {
      await Amplify.Auth.resendSignUpCode(username: usernameCtrl.text.trim());
      _showSnack("Code resent.");
    } on AuthException catch (e) {
      _showSnack("Resend failed: ${e.message}");
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // ────────────────────── FORGOT PASSWORD DIALOG ──────────────────────
  Future<void> showForgotPasswordDialog() async {
    final emailCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();

    bool codeSent = false;
    bool loading = false;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: Text(
            codeSent ? "Reset Password" : "Forgot Password",
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: emailCtrl,
                readOnly: codeSent,
                decoration: const InputDecoration(
                  labelText: "Registered Email",
                  prefixIcon: Icon(Icons.email_outlined),
                ),
              ),
              if (codeSent) ...[
                const SizedBox(height: 12),
                TextField(
                  controller: codeCtrl,
                  decoration: const InputDecoration(
                    labelText: "Verification Code",
                    prefixIcon: Icon(Icons.verified_outlined),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newPassCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: "New Password",
                    prefixIcon: Icon(Icons.lock_reset_outlined),
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: loading
                  ? null
                  : () async {
                      setState(() => loading = true);
                      try {
                        if (!codeSent) {
                          await Amplify.Auth.resetPassword(
                            username: emailCtrl.text.trim(),
                          );
                          setState(() => codeSent = true);
                          _showSnack("Code sent to email.");
                        } else {
                          await Amplify.Auth.confirmResetPassword(
                            username: emailCtrl.text.trim(),
                            newPassword: newPassCtrl.text.trim(),
                            confirmationCode: codeCtrl.text.trim(),
                          );
                          Navigator.pop(ctx);
                          _showSnack("Password reset! Login again.");
                        }
                      } on AuthException catch (e) {
                        _showSnack(e.message);
                      } finally {
                        setState(() => loading = false);
                      }
                    },
              child: loading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(codeSent ? "Reset" : "Send Code"),
            ),
          ],
        ),
      ),
    );
  }

  void continueAsGuest() => widget.onLogin("Guest");

  // ────────────────────── UI ──────────────────────
  @override
  @override
  Widget build(BuildContext context) {
    final bool dark = _isDarkMode;
    final Color primary = dark ? Colors.yellow[300]! : Colors.deepPurple;

    // DARK MODE: Soft neon
    final List<Color> neonColors = dark
        ? [
            Colors.yellow[200]!.withOpacity(0.7),
            Colors.cyan[300]!.withOpacity(0.6),
          ]
        : [Colors.deepPurple, const Color.fromARGB(255, 3, 100, 226)!];

    final Color leftBg = dark
        ? const Color(0xFF1A1A2E)
        : const Color.fromARGB(255, 175, 202, 243);
    final Color rightBg = dark
        ? const Color(0xFF0F0F1B)
        : const Color.fromARGB(255, 204, 218, 240);
    final Color cardBg = dark
        ? Colors.black.withOpacity(0.4)
        : Colors.white.withOpacity(0.8);

    return AnimatedTheme(
      data: ThemeData.from(
        colorScheme: ColorScheme.fromSeed(
          seedColor: primary,
          brightness: dark ? Brightness.dark : Brightness.light,
        ),
      ),
      duration: const Duration(milliseconds: 400),
      child: Scaffold(
        body: Stack(
          children: [
            _DiagonalBackground(left: leftBg, right: rightBg),

            Center(
              child: FadeTransition(
                opacity: _pageFade,
                child: SlideTransition(
                  position: _pageSlide,
                  child: AnimatedBuilder(
                    animation: _neonCtrl,
                    builder: (_, __) {
                      final neonOpacity = (0.4 + _neonCtrl.value * 0.3);

                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 40,
                        ),
                        child: Container(
                          constraints: const BoxConstraints(maxWidth: 400),
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(34),
                            gradient: LinearGradient(
                              colors: [
                                neonColors[0].withOpacity(neonOpacity),
                                neonColors[1].withOpacity(neonOpacity),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              color: cardBg,
                              borderRadius: BorderRadius.circular(31),
                              // NO SHADOW HERE
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(31),
                              child: BackdropFilter(
                                filter: ImageFilter.blur(
                                  sigmaX: 12,
                                  sigmaY: 12,
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(26),
                                  child: _cardContent(
                                    primary,
                                    dark,
                                    neonColors,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),

            // Dark-mode toggle
            Positioned(
              top: 40,
              right: 20,
              child: IconButton(
                icon: Icon(
                  dark ? Icons.wb_sunny_rounded : Icons.nights_stay_rounded,
                  color: primary,
                  size: 30,
                ),
                onPressed: () => setState(() => _isDarkMode = !_isDarkMode),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── CARD CONTENT ──
  Widget _cardContent(Color primary, bool dark, List<Color> neonColors) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      child: Column(
        children: [
          Shimmer.fromColors(
            baseColor: primary,
            highlightColor: Colors.white,
            period: const Duration(milliseconds: 1400),
            child: Text(
              isLogin ? "Welcome Back!" : "Create Account",
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 24),

          _field(
            usernameCtrl,
            "Username",
            Icons.person_outline,
            usernameError,
            neonColors,
          ),
          const SizedBox(height: 14),

          if (!isLogin) ...[
            _field(
              emailCtrl,
              "Email",
              Icons.email_outlined,
              emailError,
              neonColors,
            ),
            const SizedBox(height: 14),
            _field(
              phoneCtrl,
              "Phone (+91...)",
              Icons.phone_android,
              phoneError,
              neonColors,
            ),
            const SizedBox(height: 14),
          ],

          _field(
            passwordCtrl,
            "Password",
            Icons.lock_outline,
            passwordError,
            neonColors,
            obscure: _isPasswordObscured,
            isPass: true,
            onToggle: () =>
                setState(() => _isPasswordObscured = !_isPasswordObscured),
          ),
          const SizedBox(height: 14),

          if (!isLogin)
            SizeTransition(
              sizeFactor: _formCtrl,
              child: FadeTransition(
                opacity: _formCtrl,
                child: _field(
                  confirmPasswordCtrl,
                  "Confirm Password",
                  Icons.lock_person_outlined,
                  confirmPasswordError,
                  neonColors,
                  obscure: _isConfirmPasswordObscured,
                  isPass: true,
                  onToggle: () => setState(
                    () => _isConfirmPasswordObscured =
                        !_isConfirmPasswordObscured,
                  ),
                ),
              ),
            ),

          if (showConfirmCodeField) ...[
            const SizedBox(height: 14),
            _field(
              confirmCodeCtrl,
              "Verification Code",
              Icons.verified_outlined,
              null,
              neonColors,
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _isLoading ? null : confirmCode,
              child: const Text("Verify"),
            ),
            TextButton(onPressed: resendCode, child: const Text("Resend Code")),
          ],

          const SizedBox(height: 16),

          if (isLogin && !showConfirmCodeField)
            TextButton(
              onPressed: showForgotPasswordDialog,
              child: const Text("Forgot Password?"),
            ),

          const SizedBox(height: 20),

          Center(
            child: AnimatedBuilder(
              animation: _pulseCtrl,
              builder: (_, __) => Transform.scale(
                scale: 1 + _pulseCtrl.value * 0.06,
                child: SizedBox(
                  width: 180,
                  height: 44,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(22),
                      ),
                      elevation: 12,
                      shadowColor: primary.withOpacity(0.6),
                    ),
                    onPressed: _isLoading ? null : (isLogin ? login : signUp),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            isLogin ? "Login" : "Sign Up",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: dark ? Colors.black87 : Colors.white,
                              shadows: [
                                Shadow(
                                  offset: const Offset(0, 1.5),
                                  blurRadius: 6,
                                  color: dark ? Colors.black45 : Colors.black38,
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          TextButton(
            onPressed: toggleMode,
            child: Text(
              isLogin ? "No account? Sign Up" : "Have account? Log In",
              style: TextStyle(color: primary),
            ),
          ),

          TextButton(
            onPressed: continueAsGuest,
            child: Text(
              "Continue as Guest",
              style: TextStyle(
                color: dark ? Colors.white70 : Colors.grey[800]!,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── REUSABLE TEXT FIELD ──
  Widget _field(
    TextEditingController ctrl,
    String label,
    IconData icon,
    String? err,
    List<Color> neonColors, {
    bool obscure = false,
    bool isPass = false,
    VoidCallback? onToggle,
  }) {
    final Color iconColor = _isDarkMode ? neonColors[0] : neonColors[0];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: ctrl,
          obscureText: obscure,
          decoration: InputDecoration(
            labelText: label,
            prefixIcon: Icon(icon, color: iconColor),
            suffixIcon: isPass
                ? IconButton(
                    icon: Icon(
                      obscure ? Icons.visibility_off : Icons.visibility,
                      color: iconColor,
                    ),
                    onPressed: onToggle,
                  )
                : null,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(color: iconColor, width: 2.5),
            ),
          ),
        ),
        if (err != null)
          Padding(
            padding: const EdgeInsets.only(top: 4, left: 8),
            child: Text(
              err,
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
      ],
    );
  }
}

// ────────────────────── DIAGONAL BACKGROUND ──────────────────────
class _DiagonalBackground extends StatelessWidget {
  final Color left, right;
  const _DiagonalBackground({required this.left, required this.right});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: MediaQuery.of(context).size,
      painter: _DiagonalPainter(left, right),
    );
  }
}

class _DiagonalPainter extends CustomPainter {
  final Color left, right;
  _DiagonalPainter(this.left, this.right);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    final path = Path();

    paint.color = left;
    path.moveTo(0, 0);
    path.lineTo(size.width * 0.55, 0);
    path.lineTo(size.width * 0.45, size.height);
    path.lineTo(0, size.height);
    path.close();
    canvas.drawPath(path, paint);

    paint.color = right;
    path.reset();
    path.moveTo(size.width * 0.55, 0);
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(size.width * 0.45, size.height);
    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  final Function(String?) onLogin;
  const LoginPage({super.key, required this.onLogin});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with TickerProviderStateMixin {
  bool isLogin = true;
  bool _isPasswordObscured = true;
  bool _isConfirmPasswordObscured = true;
  bool _isLoading = false;
  bool _isDarkMode = false;
  bool showConfirmCodeField = false;
  bool showResetPasswordField = false;

  late AnimationController _formController;
  late AnimationController _pageLoadController;
  late Animation<double> _pageFadeAnimation;
  late Animation<Offset> _pageSlideAnimation;

  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final confirmCodeController = TextEditingController();
  final newPasswordController = TextEditingController();

  String? usernameError;
  String? emailError;
  String? phoneError;
  String? passwordError;
  String? confirmPasswordError;

  @override
  void initState() {
    super.initState();
    _formController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 400));
    _pageLoadController =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 800));

    _pageFadeAnimation = Tween<double>(begin: 0.0, end: 1.0)
        .animate(CurvedAnimation(parent: _pageLoadController, curve: Curves.easeOut));
    _pageSlideAnimation = Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero)
        .animate(CurvedAnimation(parent: _pageLoadController, curve: Curves.easeOutCubic));

    _pageLoadController.forward();
  }

  @override
  void dispose() {
    _formController.dispose();
    _pageLoadController.dispose();
    usernameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    confirmCodeController.dispose();
    newPasswordController.dispose();
    super.dispose();
  }

  void toggleMode() {
    setState(() {
      isLogin = !isLogin;
      showConfirmCodeField = false;
      showResetPasswordField = false;
      usernameError = null;
      emailError = null;
      phoneError = null;
      passwordError = null;
      confirmPasswordError = null;
      if (isLogin) {
        _formController.reverse();
      } else {
        _formController.forward();
      }
    });
  }

  // ---------- VALIDATION ----------
  bool validateUsername() {
    final username = usernameController.text.trim();
    if (username.isEmpty) {
      usernameError = "Username cannot be empty";
      return false;
    }
    if (username.contains('@')) {
      usernameError = "Username cannot be an email format";
      return false;
    }
    usernameError = null;
    return true;
  }

  bool validateEmail() {
    final email = emailController.text.trim();
    if (email.isEmpty) {
      emailError = "Email cannot be empty";
      return false;
    }
    final regex = RegExp(r"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$");
    if (!regex.hasMatch(email)) {
      emailError = "Invalid email format";
      return false;
    }
    emailError = null;
    return true;
  }

  bool validatePhone() {
    final phone = phoneController.text.trim();
    if (phone.isEmpty) {
      phoneError = "Phone number cannot be empty";
      return false;
    }
    final regex = RegExp(r'^\+?[0-9]{10,15}$');
    if (!regex.hasMatch(phone)) {
      phoneError = "Enter valid phone number (e.g. +919876543210)";
      return false;
    }
    phoneError = null;
    return true;
  }

  bool validatePassword({bool checkConfirm = false}) {
    final password = passwordController.text.trim();
    if (password.isEmpty) {
      passwordError = "Password cannot be empty";
      return false;
    }
    final regex =
        RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$&*~]).{8,}$');
    if (!regex.hasMatch(password)) {
      passwordError =
          "Password must be 8+ chars, include uppercase, lowercase, number & special char";
      return false;
    }
    passwordError = null;
    if (checkConfirm && password != confirmPasswordController.text.trim()) {
      confirmPasswordError = "Passwords do not match";
      return false;
    }

    confirmPasswordError = null;
    return true;
  }
// ........................LOGIN..................
 Future<void> login() async {
  if (!validateUsername() || !validatePassword()) {
    setState(() {});
    return;
  }

  setState(() => _isLoading = true);
  try {
   final result = await Amplify.Auth.signIn(
  username: usernameController.text.trim(),
  password: passwordController.text.trim(),
);


    if (result.isSignedIn) {
      widget.onLogin(usernameController.text.trim());
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text("Login successful!")));
    } else {
      setState(() => showConfirmCodeField = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please verify your account first.")),
      );
    }
  } on AuthException catch (e) {
    if (e.message.contains('not confirmed')) {
      setState(() => showConfirmCodeField = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("User not verified. Please enter code to verify.")),
      );
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("Login failed: ${e.message}")));
    }
  } finally {
    setState(() => _isLoading = false);
  }
}


  // ---------- SIGNUP ----------
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
    final result = await Amplify.Auth.signUp(
      username: usernameController.text.trim(), 
      password: passwordController.text.trim(),
      options: CognitoSignUpOptions(userAttributes: {
        CognitoUserAttributeKey.email: emailController.text.trim(),
        CognitoUserAttributeKey.phoneNumber: phoneController.text.trim(),
        CognitoUserAttributeKey.preferredUsername: usernameController.text.trim(),
      }),
    );

    if (result.isSignUpComplete) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Signup successful! Please login.")),
      );
      setState(() {
        isLogin = true;
        showConfirmCodeField = false;
      });
    } else {
      setState(() => showConfirmCodeField = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Verification code sent to your email.")),
      );
    }
  } on AuthException catch (e) {
  
    if (e.message.contains("already exists")) {
      setState(() => showConfirmCodeField = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            "Account already exists. Please enter code or resend verification email.",
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("Signup failed: ${e.message}")));
    }
  } finally {
    setState(() => _isLoading = false);
  }
}

  // ---------- CONFIRM CODE ----------
  Future<void> confirmCode() async {
  setState(() => _isLoading = true);
  try {
    final res = await Amplify.Auth.confirmSignUp(
      username: usernameController.text.trim(),
      confirmationCode: confirmCodeController.text.trim(),
    );

    if (res.isSignUpComplete) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Verification successful! Please login.")),
      );

      setState(() {
        showConfirmCodeField = false;
        isLogin = true; 
      });
    }
  } on AuthException catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Verification failed: ${e.message}")),
    );
  } finally {
    setState(() => _isLoading = false);
  }
}

  Future<void> resendCode() async {
    try {
      await Amplify.Auth.resendSignUpCode(username: usernameController.text.trim());
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Verification code resent successfully.")));
    } on AuthException catch (e) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text("Resend failed: ${e.message}")));
    }
  }

  // ---------- FORGOT PASSWORD ----------
    Future<void> showForgotPasswordDialog() async {
    final emailCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();

    bool codeSent = false;
    bool isLoading = false;

    final rootContext = context;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              title: Text(
                codeSent ? "Reset Your Password" : "Forgot Password",
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
                    const SizedBox(height: 10),
                    TextField(
                      controller: codeCtrl,
                      decoration: const InputDecoration(
                        labelText: "Verification Code",
                        prefixIcon: Icon(Icons.verified_outlined),
                      ),
                    ),
                    const SizedBox(height: 10),
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
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Cancel"),
                ),
                ElevatedButton(
                  onPressed: isLoading
                      ? null
                      : () async {
                          setState(() => isLoading = true);
                          try {
                            if (!codeSent) {
                              await Amplify.Auth.resetPassword(
                                username: emailCtrl.text.trim(),
                              );
                              setState(() => codeSent = true);

                              ScaffoldMessenger.of(
                                rootContext,
                              ).hideCurrentSnackBar();

                              ScaffoldMessenger.of(rootContext).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    "Reset code sent to your email.",
                                  ),
                                ),
                              );
                            } else {
                              await Amplify.Auth.confirmResetPassword(
                                username: emailCtrl.text.trim(),
                                newPassword: newPassCtrl.text.trim(),
                                confirmationCode: codeCtrl.text.trim(),
                              );

                              Navigator.pop(context);

                              ScaffoldMessenger.of(
                                rootContext,
                              ).hideCurrentSnackBar();

                              ScaffoldMessenger.of(rootContext).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    "Password reset successful! Please login again.",
                                  ),
                                ),
                              );
                            }
                          } on AuthException catch (e) {
                            String errorMsg;

                            if (e.recoverySuggestion != null &&
                                e.recoverySuggestion!.toLowerCase().contains(
                                  'code',
                                )) {
                              errorMsg =
                                  "Wrong verification code. Please check your email.";
                            } else if (e.recoverySuggestion != null &&
                                e.recoverySuggestion!.toLowerCase().contains(
                                  'expired',
                                )) {
                              errorMsg =
                                  "Your code has expired. Please request a new one.";
                            } else if (e.message.toLowerCase().contains(
                              'password',
                            )) {
                              errorMsg =
                                  "Password doesn’t meet security rules.";
                            } else {
                              errorMsg = e.message;
                            }

                            // hide previous snackbar if any
                            ScaffoldMessenger.of(
                              rootContext,
                            ).hideCurrentSnackBar();

                            ScaffoldMessenger.of(
                              rootContext,
                            ).showSnackBar(SnackBar(content: Text(errorMsg)));
                          } finally {
                            setState(() => isLoading = false);
                          }
                        },

                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(codeSent ? "Reset Password" : "Send Code"),
                ),
              ],
            );
          },
        );
      },
    );
  }
  void continueAsGuest() => widget.onLogin("Guest");

  // ---------- UI ----------
  @override
  Widget build(BuildContext context) {
    final theme = _isDarkMode
        ? ThemeData.from(
            colorScheme:
                ColorScheme.fromSeed(seedColor: Colors.deepPurple, brightness: Brightness.dark))
        : ThemeData.from(
            colorScheme:
                ColorScheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.light));
    final colorScheme = theme.colorScheme;

    return AnimatedTheme(
      data: theme,
      duration: const Duration(milliseconds: 400),
      child: Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        body: Stack(
          children: [
            Center(
              child: FadeTransition(
                opacity: _pageFadeAnimation,
                child: SlideTransition(
                  position: _pageSlideAnimation,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 500),
                    width: 350,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: theme.cardColor,
                      borderRadius: BorderRadius.circular(25),
                      boxShadow: [
                        BoxShadow(
                          color: _isDarkMode
                              ? Colors.black.withOpacity(0.5)
                              : Colors.grey.withOpacity(0.2),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          Text(isLogin ? "Welcome Back!" : "Create Your Account",
                              style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: colorScheme.primary)),
                          const SizedBox(height: 25),
                         
                            _buildTextField(
                                controller: usernameController,
                                labelText: "Username",
                                icon: Icons.person_outline,
                                errorText: usernameError),
                          const SizedBox(height: 15),
                           if (!isLogin)
                          _buildTextField(
                              controller: emailController,
                              labelText: "Email",
                              icon: Icons.email_outlined,
                              errorText: emailError),
                          const SizedBox(height: 15),
                          if (!isLogin)
                            _buildTextField(
                                controller: phoneController,
                                labelText: "Phone (+91...)",
                                icon: Icons.phone_android,
                                errorText: phoneError),
                          const SizedBox(height: 15),
                          _buildTextField(
                              controller: passwordController,
                              labelText: "Password",
                              icon: Icons.lock_outline,
                              obscureText: _isPasswordObscured,
                              isPassword: true,
                              onVisibilityToggle: () {
                                setState(() =>
                                    _isPasswordObscured = !_isPasswordObscured);
                              },
                              errorText: passwordError),
                          if (!isLogin)
                            SizeTransition(
                              sizeFactor: _formController,
                              axisAlignment: -1.0,
                              child: FadeTransition(
                                opacity: _formController,
                                child: Column(children: [
                                  const SizedBox(height: 15),
                                  _buildTextField(
                                      controller: confirmPasswordController,
                                      labelText: "Confirm Password",
                                      icon: Icons.lock_person_outlined,
                                      obscureText: _isConfirmPasswordObscured,
                                      isPassword: true,
                                      onVisibilityToggle: () {
                                        setState(() => _isConfirmPasswordObscured =
                                            !_isConfirmPasswordObscured);
                                      },
                                      errorText: confirmPasswordError),
                                ]),
                              ),
                            ),
                          if (showConfirmCodeField) ...[
                            const SizedBox(height: 15),
                            _buildTextField(
                                controller: confirmCodeController,
                                labelText: "Enter Verification Code",
                                icon: Icons.verified_outlined),
                            const SizedBox(height: 10),
                            ElevatedButton(
                                onPressed: _isLoading ? null : confirmCode,
                                child: const Text("Verify Account")),
                            TextButton(
                                onPressed: resendCode,
                                child: const Text("Resend Code")),
                          ],
                          const SizedBox(height: 20),
                          if (isLogin && !showConfirmCodeField)
                            TextButton(
                                onPressed: showForgotPasswordDialog,
                                child: const Text("Forgot Password?")),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: _isLoading ? null : (isLogin ? login : signUp),
                            style: ElevatedButton.styleFrom(
                                backgroundColor: colorScheme.primary,
                                foregroundColor: colorScheme.onPrimary,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15)),
                                minimumSize: const Size(double.infinity, 50)),
                            child: _isLoading
                                ? const SizedBox(
                                    height: 24,
                                    width: 24,
                                    child: CircularProgressIndicator(
                                        color: Colors.white, strokeWidth: 2.5))
                                : Text(isLogin ? "Login" : "Sign Up",
                                    style: const TextStyle(
                                        fontSize: 16, fontWeight: FontWeight.bold)),
                          ),
                          TextButton(
                              onPressed: toggleMode,
                              child: Text(
                                  isLogin
                                      ? "Don't have an account? Sign Up"
                                      : "Already have an account? Log In",
                                  style: TextStyle(color: colorScheme.primary))),
                          TextButton(
                              onPressed: continueAsGuest,
                              child: Text("Continue as Guest",
                                  style: TextStyle(
                                      color: theme.textTheme.bodySmall?.color))),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 30,
              right: 20,
              child: IconButton(
                  icon: Icon(
                      _isDarkMode
                          ? Icons.wb_sunny_rounded
                          : Icons.nights_stay_rounded,
                      color: _isDarkMode
                          ? Colors.amberAccent
                          : Colors.deepPurpleAccent,
                      size: 28),
                  onPressed: () =>
                      setState(() => _isDarkMode = !_isDarkMode)),
            ),
          ],
        ),
      ),
    );
  }




  Widget _buildTextField({
    required TextEditingController controller,
    required String labelText,
    required IconData icon,
    bool obscureText = false,
    bool isPassword = false,
    VoidCallback? onVisibilityToggle,
    String? errorText,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: controller,
          obscureText: obscureText,
          decoration: InputDecoration(
            labelText: labelText,
            prefixIcon: Icon(icon, color: theme.colorScheme.primary),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      obscureText ? Icons.visibility_off : Icons.visibility,
                      color: theme.colorScheme.primary,
                    ),
                    onPressed: onVisibilityToggle,
                  )
                : null,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(15)),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide(
                color: theme.colorScheme.primary,
                width: 2,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(15),
              borderSide: BorderSide(color: theme.dividerColor),
            ),
          ),
        ),
        if (errorText != null)
          Padding(
            padding: const EdgeInsets.only(top: 4.0, left: 8.0),
            child: Text(
              errorText,
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
      ],
    );
  }
}

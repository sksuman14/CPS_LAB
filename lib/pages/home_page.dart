import 'package:flutter/material.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'dart:ui';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  final List<Map<String, dynamic>> objectives = const [
    {
      "icon": Icons.science,
      "title": "Research",
      "description": "To perform advanced research in CPS systems.",
    },
    {
      "icon": Icons.lightbulb,
      "title": "Innovation",
      "description": "To develop innovative CPS lab solutions.",
    },
    {
      "icon": Icons.business,
      "title": "Industry Collaboration",
      "description": "To collaborate with industry for practical CPS projects.",
    },
  ];

  final List<String> sliderImages = const [
    "assets/images/1.png",
    "assets/images/2.png",
    "assets/images/3.png",
    "assets/images/4.png",
    "assets/images/5.png",
    "assets/images/6.png",
    "assets/images/7.png",
    "assets/images/8.png",
    "assets/images/9.png",
    "assets/images/10.png",
    "assets/images/11.png",
    "assets/images/12.png",
    "assets/images/13.png",
    "assets/images/14.png",
    "assets/images/15.png",
    "assets/images/16.png",
    "assets/images/17.png",
  ];

  @override
  Widget build(BuildContext context) {
    final bool isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDarkTheme
          ? Colors.grey.shade900
          : const Color(0xFFF7F8F8),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(10.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              "CPS Lab Highlights",
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: isDarkTheme ? Colors.yellow.shade300 : Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 20),
            LayoutBuilder(
              builder: (context, constraints) {
                final screenWidth = MediaQuery.of(context).size.width;

                double aspectRatio = screenWidth < 600 ? (3 / 2) : (5 / 2);

                return AspectRatio(
                  aspectRatio: aspectRatio,
                  child: CarouselSlider(
                    options: CarouselOptions(
                      viewportFraction: screenWidth < 600 ? 0.9 : 0.6,
                      autoPlay: true,
                      autoPlayInterval: const Duration(seconds: 3),
                      enlargeCenterPage: true,
                      enableInfiniteScroll: true,
                    ),
                    items: sliderImages.map((imgPath) {
                      return Builder(
                        builder: (BuildContext context) {
                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 6),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(16),
                              child: Image.asset(
                                imgPath,
                                fit: BoxFit.contain,
                                width: double.infinity,
                              ),
                            ),
                          );
                        },
                      );
                    }).toList(),
                  ),
                );
              },
            ),
            const SizedBox(height: 50),

            /// -------- Intro Paragraph with card + gradient --------
            Container(
              padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDarkTheme
                      ? [Colors.grey.shade800, Colors.grey.shade700]
                      : [Colors.deepPurple.shade200, Colors.deepPurple.shade50],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "IIT Ropar Cyber-Physical Systems (CPS) Lab",
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      color: isDarkTheme
                          ? Colors.yellow.shade300
                          : Colors.deepPurple,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 80,
                    height: 3,
                    decoration: BoxDecoration(
                      color: isDarkTheme
                          ? Colors.yellow.shade300
                          : Colors.deepPurple,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 20),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: TextStyle(
                        fontSize: 18,
                        height: 1.6,
                        color: isDarkTheme ? Colors.white70 : Colors.black87,
                        fontWeight: FontWeight.w500,
                      ),
                      children: [
                        const TextSpan(
                          text:
                              "Powered by NM-ICPS, the lab serves as a premier hub for ",
                        ),
                        TextSpan(
                          text:
                              "research, development, and deployment of CPS technologies",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isDarkTheme
                                ? Colors.yellow.shade300
                                : Colors.deepPurple,
                          ),
                        ),
                        const TextSpan(
                          text:
                              ". It collaborates with partner institutes to drive innovation and provide hands-on experience to ",
                        ),
                        TextSpan(
                          text: "students, entrepreneurs, and researchers",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isDarkTheme
                                ? Colors.yellow.shade300
                                : Colors.deepPurple,
                          ),
                        ),
                        const TextSpan(
                          text:
                              ", empowering them to excel in this transformative field.",
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 50),

            /// -------- Objectives Section with hover effect --------
            Text(
              "Our Objectives",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: isDarkTheme ? Colors.yellow.shade300 : Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 20),
            LayoutBuilder(
              builder: (context, constraints) {
                int crossAxisCount = 1;
                if (constraints.maxWidth > 600) crossAxisCount = 2;
                if (constraints.maxWidth > 900) crossAxisCount = 3;
                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: objectives.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    mainAxisSpacing: 20,
                    crossAxisSpacing: 20,
                    childAspectRatio: 1.8,
                  ),
                  itemBuilder: (context, index) {
                    final obj = objectives[index];
                    return TweenAnimationBuilder(
                      tween: Tween<double>(begin: 1.0, end: 1.0),
                      duration: const Duration(milliseconds: 200),
                      builder: (context, double scale, child) {
                        return MouseRegion(
                          onEnter: (_) {},
                          child: Transform.scale(
                            scale: scale,
                            child: Card(
                              elevation: 8,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                              color: isDarkTheme
                                  ? Colors.grey.shade800
                                  : Colors.white,
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      obj["icon"] as IconData,
                                      size: 50,
                                      color: isDarkTheme
                                          ? Colors.yellow.shade300
                                          : Colors.deepPurple,
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      obj["title"] as String,
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: isDarkTheme
                                            ? Colors.white
                                            : Colors.black87,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      obj["description"] as String,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: isDarkTheme
                                            ? Colors.white70
                                            : Colors.black54,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    );
                  },
                );
              },
            ),
            const SizedBox(height: 30),

            LayoutBuilder(
              builder: (context, constraints) {
                bool isLargeScreen = constraints.maxWidth >= 800;

                final deploymentImages = [
                  "assets/images/deploy.png",
                  "assets/images/IMPACT.png",
                ];

                Widget buildImage(String imgPath) {
                  return GestureDetector(
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) {
                          return Dialog(
                            backgroundColor: Colors.black87,
                            insetPadding: const EdgeInsets.all(10),
                            child: InteractiveViewer(
                              panEnabled: true,
                              minScale: 0.5,
                              maxScale: 4,
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: Image.asset(
                                  imgPath,
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          );
                        },
                      );
                    },
                    child: Card(
                      elevation: 8,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: AspectRatio(
                        aspectRatio: 9 / 9,
                        child: Image.asset(
                          imgPath,
                          fit: BoxFit.cover,
                          width: double.infinity,
                        ),
                      ),
                    ),
                  );
                }

                if (isLargeScreen) {
                  // Large screen: show in row
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: deploymentImages.map((imgPath) {
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: buildImage(imgPath),
                        ),
                      );
                    }).toList(),
                  );
                } else {
                  return Column(
                    children: deploymentImages.map((imgPath) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.0),
                        child: buildImage(imgPath),
                      );
                    }).toList(),
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

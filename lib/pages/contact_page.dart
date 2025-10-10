import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

class ContactPage extends StatelessWidget {
  const ContactPage({super.key});

  final LatLng iitRopar = const LatLng(30.9694, 76.4737);

  @override
  Widget build(BuildContext context) {
    final mapController = MapController();
    final bool isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDarkTheme
          ? Colors.grey.shade900
          : const Color.fromARGB(255, 247, 248, 248),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ---- CONTACT US HEADER ---
            Center(
              child: Text(
                "Contact Us",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isDarkTheme
                      ? Colors.yellow.shade300
                      : Colors.deepPurple,
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ---- CONTACT CARDS ----
            LayoutBuilder(
              builder: (context, constraints) {
                int crossAxisCount = 1;
                if (constraints.maxWidth > 900)
                  crossAxisCount = 3;
                else if (constraints.maxWidth > 600)
                  crossAxisCount = 2;

                return GridView.count(
                  crossAxisCount: crossAxisCount,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 3.0,
                  children: [
                    _buildContactCard(
                      "Contact",
                      "📞 01881 - 232601 ",
                      isDarkTheme,
                    ),
                    _buildContactCard(
                      "General Queries",
                      "✉ contact.awadh@iitrpr.ac.in",
                      isDarkTheme,
                    ),
                    _buildContactCard(
                      "Technical Queries",
                      "📩 oitc@ihub-awadh.in ",
                      isDarkTheme,
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: 24),

            // ---- OUR LOCATION HEADER ----
            Center(
              child: Text(
                "Our Location",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isDarkTheme
                      ? Colors.yellow.shade300
                      : Colors.deepPurple,
                ),
              ),
            ),
            const SizedBox(height: 12),

            // ---- MAP ----
            SizedBox(
              height: 320,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: FlutterMap(
                  mapController: mapController,
                  options: MapOptions(
                    initialCenter: iitRopar,
                    initialZoom: 8,
                    minZoom: 0.8,
                    maxZoom: 18,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.none,
                    ),
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      subdomains: const ['a', 'b', 'c'],
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: iitRopar,
                          width: 100,
                          height: 80,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.location_on,
                                color: Colors.red,
                                size: 38,
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(6),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 3,
                                      offset: const Offset(1, 2),
                                    ),
                                  ],
                                ),
                                child: const Text(
                                  "iHub AWaDH",
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    // Zoom buttons
                    Align(
                      alignment: Alignment.bottomRight,
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            FloatingActionButton(
                              heroTag: "zoomIn",
                              mini: true,
                              onPressed: () {
                                mapController.move(
                                  mapController.camera.center,
                                  mapController.camera.zoom + 1,
                                );
                              },
                              child: const Icon(Icons.add),
                            ),
                            const SizedBox(height: 8),
                            FloatingActionButton(
                              heroTag: "zoomOut",
                              mini: true,
                              onPressed: () {
                                mapController.move(
                                  mapController.camera.center,
                                  mapController.camera.zoom - 1,
                                );
                              },
                              child: const Icon(Icons.remove),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 8),

            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () async {
                  final url = Uri.parse(
                    "https://www.google.com/maps/dir/?api=1&destination=${iitRopar.latitude},${iitRopar.longitude}",
                  );
                  if (await canLaunchUrl(url)) {
                    await launchUrl(url, mode: LaunchMode.externalApplication);
                  }
                },
                child: Text(
                  " Open in Google Maps",
                  style: TextStyle(
                    color: isDarkTheme
                        ? Colors.yellow.shade300
                        : Colors.deepPurple,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // ---- ADDRESS ----
            Center(
              child: Text(
                "IIT Ropar TIF (AWaDH), 214 / M. Visvesvaraya Block,\n Indian Institute of Technology Ropar,\n Rupnagar - 140001, Punjab",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: isDarkTheme
                      ? Colors.yellow.shade300
                      : Colors.deepPurple,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard(String title, String detail, bool isDarkTheme) {
    return Card(
      elevation: 3,
      color: isDarkTheme
          ? Colors.grey.shade800
          : const Color.fromARGB(255, 220, 222, 223), // theme-based background
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDarkTheme ? Colors.white : Colors.black, // title color
              ),
            ),
            const SizedBox(height: 6),
            Text(
              detail,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: isDarkTheme
                    ? Colors.yellow.shade300
                    : Colors.deepPurple, // phone/email color
              ),
            ),
          ],
        ),
      ),
    );
  }
}

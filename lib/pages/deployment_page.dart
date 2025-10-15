import 'package:flutter/material.dart';
import 'dart:ui';

class DeploymentPage extends StatelessWidget {
  const DeploymentPage({super.key});

  final List<Map<String, String>> deployments = const [
    {
      "image": "assets/images/1.png",
      "title": "Deployment 1",
      "description":
          "AWaDH CPS Lab launched at National Institute of Technology Delhi.",
      "longDescription":
          "The inauguration of the AWaDH CPS Lab, graced by Dr. Ekta Kapoor, Mission Director of NM-ICPS, in the august presence of the Prof Ajay K Sharma, Director; Dr Ravinder Kumar, Registrar; Dr Anurag Singh, Dean R&C from NIT Delhi; and Dean R&D, IIT Ropar; Dr Suman Kuman, Assistant Professor & IoT Domain Coordinator; Dr Brijesh Kumbhani, Assistant Professor IIT Ropar and other team members from iHubAWaDHsignifies the commencement of a collaborative effort to establish a CPS skilling platform. This initiative is designed to empower young graduates, postgraduates, researchers, faculty, and startups to delve into the realm of Cyber-Physical Systems (CPS) and incorporate these interventions into their daily activities.",
    },
    {
      "image": "assets/images/2.png",
      "title": "Deployment 2",
      "description": "AWaDH CPS lab at Dr. BR Ambedkar Institute Jalandhar.",
      "longDescription":
          "AWaDH has inaugurated the AWaDH CPS Lab at the Dr B R Ambedkar National Institute of Technology Jalandhar in its Electronics and Communication Engineering Department. This lab serves as a platform for education, research, prototyping, testing, and collaboration. The event included an inauguration ceremony, a keynote address by Professor Binod Kumar Kanaujia, Director, Dr B R Ambedkar National Institute of Technology Jalandhar along with Team from IIT Ropar Dr Suman Kumar, Associate Professor, IIT Ropar; Dr Radhika Trikha, COO, IIT Ropar TIF AWaDH; Mr Mukesh Kestwal, CIO, IIT Ropar TIF AWaDH along with the technical team from AWaDH on the Occasion, and a tour of the lab. ",
    },
    {
      "image": "assets/images/3.png",
      "title": "Deployment 3",
      "description": "AWaDH CPS Lab launched at Tula’s Institute Dehradun.",
      "longDescription":
          "The inauguration of the AWaDH CPS Lab, graced by IIT Ropar representatives and leadership team from Tula’s institute Ms Silky Jain Marwah, Executive Director, Tula’s Institute; Raunak Jain, Vice President, Tula’s Group; Dr Raghav Garg, Vice President Technology Tula’s Institute and Dr Sandip Vijay, Director, Tula’s Institute and PI of the initiative Dr Sunil Semwal, Dean R&D, Tula’s Institute and Co PI Dr Nishant Saxena, Dean Academics, Tula’s Institute signifies the commencement of a collaborative effort to establish a CPS skilling platform. This initiative is designed to empower young graduates, postgraduates, researchers, faculty, and startups to delve into the realm of Cyber-Physical Systems (CPS) and incorporate these interventions into their daily activities. The lab features cutting-edge IoT kits developed by IIT Ropar, providing a 24X7 plug-and-play module for hands-on experimentation and exploration of the IoT landscape",
    },
    {
      "image": "assets/images/4.png",
      "title": "Deployment 4",
      "description":
          "AWaDH CPS Lab launched at Thapar Institute of Engineering and Technology, Patiala.",
      "longDescription":
          "The AWaDH CPS Lab at TIET is part of the larger network of CPS labs under the National Mission on Interdisciplinary Cyber-Physical Systems (NM ICPS), Government of India. These labs are dedicated to promoting research, development, and deployment of CPS technologies, providing students, entrepreneurs, and researchers with the hands-on experience and expertise needed in this transformative field.",
    },
    {
      "image": "assets/images/5.png",
      "title": "Deployment 5",
      "description": "AWaDH CPS Lab launched at Chitkara University, Punjab.",
      "longDescription":
          "The Skilling for Emerging Technologies under the National Mission on Interdisciplinary Cyber-Physical Systems (NM ICPS), Department of Science and Technology, the Indian Institute of Technology (IIT) Ropar, through its Technology and Innovation Foundation (iHub-AWaDH), inaugurated the AWaDH CPS Lab, the state-of-the-art facility to provide an integrated platform for Cyber Physical Systems education, skilling, research and collaboration at Chitkara University.",
    },
    {
      "image": "assets/images/8.png",
      "title": "Deployment 6",
      "description":
          "AWaDH CPS Lab launched at Baba Farid College of Engineering & Technology, Bhatinda ",
      "longDescription":
          "In a significant step towards advancing technical education and innovation, the National Mission on Interdisciplinary Cyber-Physical Systems (NM ICPS) has launched a series of skilling initiatives focused on emerging technologies. This initiative, spearheaded by the Department of Science and Technology, Government of India, aims to equip students, researchers, and professionals with the expertise required to excel in the rapidly evolving field of Cyber-Physical Systems (CPS). By establishing state-of-the-art labs and providing cutting-edge resources, it is committed to fostering a robust ecosystem of technological advancement and skill development.",
    },
    {
      "image": "assets/images/6.png",
      "title": "Deployment 7",
      "description":
          "AWaDH CPS Lab launched at University of Ladakh, Leh Campus, Taru.",
      "longDescription":
          "The seventh Cyber-Physical Systems (CPS) Lab has been established at the University of Ladakh through the initiative of IIT Ropar’s AWaDH, marking a significant step in advancing technology education across India, including the country’s most remote and challenging regions. This milestone reflects the impact of collaboration and the potential of emerging technologies to drive meaningful change.",
    },
    {
      "image": "assets/images/9.png",
      "title": "Deployment 8",
      "description":
          "AWaDH CPS Lab launched at Centre for Computers and Communication Technology, Chisopani, Sikkim.",
      "longDescription":
          "iHub – AWaDH @ IIT Ropar has taken a bold step forward by launching its 8th Cyber-Physical Systems (CPS) Lab at the Centre for Computers and Communication Technology (CCCT) in Chisopani, Sikkim. This initiative isn’t just about technology; it’s about breaking barriers. In a region where slow or non-existent internet can delay even the simplest digital task, the CPS Lab aims to create a bridge between innovation and accessibility.",
    },
    {
      "image": "assets/images/10.png",
      "title": "Deployment 9",
      "description":
          "AWaDH CPS Lab launched at Khalsa College of Engineering and Technology (KCET), Amritsar.",
      "longDescription":
          "In the heart of the holy city of Amritsar, renowned for its heritage and spirituality, a new chapter in technological education began with the inauguration of the 9th Cyber-Physical Systems (CPS) Lab by iHub – AWaDH @ IIT Ropar. Hosted at the prestigious Khalsa College of Engineering and Technology (KCET), a NAAC Grade A institution, this event marked a significant leap forward in innovation and education, setting the stage for a brighter, tech-driven future.",
    },
    {
      "image": "assets/images/11.png",
      "title": "Deployment 10",
      "description":
          "AWaDH CPS Lab launched at Indian Institute of Information Technology (IIIT), Una.",
      "longDescription":
          "Nestled in the serene hills of Himachal Pradesh, innovation took a bold step forward with the launch of the 10th Cyber-Physical Systems (CPS) Lab by iHub – AWaDH @ IIT Ropar at the Indian Institute of Information Technology (IIIT), Una. This achievement isn’t just about state-of-the-art facilities—it’s about creating a thriving ecosystem of collaboration, creativity, and transformative technologies.",
    },
    {
      "image": "assets/images/12.png",
      "title": "Deployment 11",
      "description":
          "AWaDH CPS Lab launched at Chamber of Industrial & Commercial Undertakings (CICU), Ludhiana.",
      "longDescription":
          "In the heart of Punjab’s industrial hub, a new chapter in technology and innovation unfolded as iHub – AWaDH @ IIT Ropar inaugurated its 11th Cyber-Physical Systems (CPS) Lab at the Chamber of Industrial & Commercial Undertakings (CICU), Ludhiana. This milestone marks not just another lab opening but a significant step in strengthening the bridge between academia and industry.",
    },
    {
      "image": "assets/images/14.png",
      "title": "Deployment 12",
      "description":
          "AWaDH CPS Lab launched at IILM University, Greater Noida.",
      "longDescription":
          "IIT Ropar TIF AWaDH is thrilled to announce the inauguration of its 12th Cyber-Physical Systems (CPS) Lab, marking a significant milestone as the first CPS Lab in Uttar Pradesh. Located at IILM University, Greater Noida, this cutting-edge facility is designed to serve as a central hub for Artificial Intelligence (AI), Internet of Things (IoT), and CPS technologies. The lab will provide students and researchers with hands-on training and practical experience, fostering advancements in deep-tech applications and research.",
    },
    {
      "image": "assets/images/7.png",
      "title": "Deployment 13",
      "description": "AWaDH CPS Lab launched at HRIT University, Ghaziabad.",
      "longDescription":
          "The Indian Institute of Technology (IIT) Ropar continues its commitment to advancing India’s Cyber-Physical Systems (CPS) ecosystem with the launch of its 13th CPS Lab, powered by the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS). This new lab, located at HRIT University in Ghaziabad, marks another significant step in democratizing access to next-generation technologies and equipping students with the skills needed for real-time, tech-driven innovation.",
    },
    {
      "image": "assets/images/13.png",
      "title": "Deployment 14",
      "description":
          "AWaDH CPS Lab launched at Sardar Vallabhbhai Patel University of Agriculture and Technology, Meerut.",
      "longDescription":
          "The launch of the Agri-Tech Innovation Hub at Sardar Vallabhbhai Patel University of Agriculture and Technology (SVPUAT), Meerut, in collaboration with IIT Ropar, marked a significant milestone in India’s agricultural transformation. This event brought together policymakers, academic leaders, scientists, innovators, and startups, all united by a shared vision: to revolutionize Indian agriculture through technology, research, and entrepreneurship.",
    },
    {
      "image": "assets/images/15.png",
      "title": "Deployment 15",
      "description":
          "AWaDH CPS Lab launched at Acropolis Institute of Technology and Research, Indore.",
      "longDescription":
          "On 26 August 2025, the Indian Institute of Technology, Ropar, through its iHub – AWaDH initiative, inaugurated its 15th Cyber-Physical Systems (CPS) Lab under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS) at the Acropolis Institute of Technology and Research, Indore. Marking the first CPS lab in Madhya Pradesh, this facility represents a significant step in decentralizing advanced technological research and innovation across India.",
    },
    {
      "image": "assets/images/17.png",
      "title": "Deployment 16",
      "description":
          "AWaDH CPS Lab launched at Hindustan Institute of Technology and Science, Chennai.",
      "longDescription":
          "On 20 September 2025, the Indian Institute of Technology (IIT) Ropar – iHub AWaDH inaugurated its 16th Cyber-Physical Systems (CPS) Laboratory at the Hindustan Institute of Technology and Science (HITS), Chennai, Tamil Nadu, under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS), Department of Science & Technology (DST). This landmark event marks the establishment of the first-ever CPS Lab in South India, expanding the national CPS Lab network and strengthening India’s mission to decentralize deep-tech innovation. A Milestone for Tamil Nadu and South India.",
    },
    {
      "image": "assets/images/16.png",
      "title": "Deployment 17",
      "description":
          "AWaDH CPS Lab launched at Model Institute of Engineering and Technology, Jammu.",
      "longDescription":
          "Innovation has reached the Himalayas. On 25 September 2025, the Indian Institute of Technology (IIT) Ropar – Technology and Innovation Foundation, iHub AWaDH, inaugurated its 17th Cyber-Physical Systems (CPS) Laboratory at the Model Institute of Engineering and Technology (MIET), Jammu. This marks a historic milestone — the first-ever CPS Lab in Jammu & Kashmir under the Government of India’s National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS), Department of Science & Technology (DST). A Landmark for Deep-Tech in J&K The establishment of this CPS Lab extends the nationwide CPS Lab network to the Union Territory of Jammu & Kashmir, bringing deep-tech research, skilling, and innovation infrastructure closer to students, researchers, and entrepreneurs in the region.",
    },
  ];

  @override
  Widget build(BuildContext context) {
    final bool isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDarkTheme
          ? Colors.grey.shade900
          : const Color(0xFFF7F8F8),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Center(
              child: Text(
                "Deployments",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: isDarkTheme
                      ? Colors.yellow.shade300
                      : Colors.deepPurple,
                ),
              ),
            ),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: deployments.length,
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 485,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemBuilder: (context, index) {
                final deployment = deployments[index];
                return _buildDeploymentCard(context, deployment, isDarkTheme);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeploymentCard(
    BuildContext context,
    Map<String, String> deployment,
    bool isDarkTheme,
  ) {
    bool isHovered = false;

    return StatefulBuilder(
      builder: (context, setState) => MouseRegion(
        onEnter: (_) => setState(() => isHovered = true),
        onExit: (_) => setState(() => isHovered = false),
        child: GestureDetector(
          onTap: () {
            bool showDescription = false;

            showDialog(
              context: context,
              barrierColor: Colors.black.withOpacity(0.3),
              builder: (_) => StatefulBuilder(
                builder: (context, setState) {
                  return BackdropFilter(
                    filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                    child: Dialog(
                      backgroundColor: Colors.transparent,
                      insetPadding: const EdgeInsets.all(10),
                      child: Container(
                        width: MediaQuery.of(context).size.width * 0.9,
                        constraints: BoxConstraints(
                          maxWidth: 800,
                          maxHeight: MediaQuery.of(context).size.height * 0.95,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isDarkTheme
                                ? [
                                    Colors.grey.shade900.withOpacity(0.9),
                                    Colors.grey.shade800.withOpacity(0.6),
                                  ]
                                : [
                                    Colors.white.withOpacity(0.95),
                                    Colors.deepPurple.shade50.withOpacity(0.7),
                                  ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: isDarkTheme
                                  ? Colors.yellow.shade200.withOpacity(0.15)
                                  : Colors.deepPurple.withOpacity(0.2),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Image section
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 400),
                              curve: Curves.easeInOut,
                              height: showDescription
                                  ? MediaQuery.of(context).size.height * 0.4
                                  : MediaQuery.of(context).size.height * 0.6,
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                // <<< START OF CHANGE
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    InteractiveViewer(
                                      panEnabled: true,
                                      minScale: 1.0,
                                      maxScale: 4.0,
                                      child: Image.asset(
                                        deployment["image"]!,
                                        fit: BoxFit.contain,
                                        width: double.infinity,
                                      ),
                                    ),
                                    Positioned(
                                      bottom: 10,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withOpacity(0.6),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: const Text(
                                          "Pinch to Zoom Image",
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                // <<< END OF CHANGE
                              ),
                            ),

                            const SizedBox(height: 8),

                            // Down / Up arrow
                            IconButton(
                              icon: Icon(
                                showDescription
                                    ? Icons.keyboard_arrow_up
                                    : Icons.keyboard_arrow_down,
                                size: 32,
                                color: isDarkTheme
                                    ? Colors.yellow.shade300
                                    : Colors.deepPurple,
                              ),
                              onPressed: () {
                                setState(() {
                                  showDescription = !showDescription;
                                });
                              },
                            ),

                            // Description section
                            AnimatedSize(
                              duration: const Duration(milliseconds: 400),
                              curve: Curves.easeInOut,
                              child: showDescription
                                  ? Container(
                                      height:
                                          MediaQuery.of(context).size.height *
                                              0.3,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                      ),
                                      child: SingleChildScrollView(
                                        child: Text(
                                          deployment["longDescription"] ??
                                              deployment["description"]!,
                                          style: TextStyle(
                                            fontSize: 16,
                                            height: 1.4,
                                            fontWeight: FontWeight.w500,
                                            color: isDarkTheme
                                                ? Colors.yellow.shade300
                                                : Colors.deepPurple.shade700,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                                    )
                                  : const SizedBox.shrink(),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            );
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            transform: isHovered
                ? (Matrix4.identity()..scale(1.05))
                : Matrix4.identity(),
            decoration: BoxDecoration(
              boxShadow: [
                if (isHovered)
                  const BoxShadow(
                    color: Colors.black26,
                    blurRadius: 12,
                    offset: Offset(0, 6),
                  ),
              ],
            ),
            child: Card(
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              color: isDarkTheme
                  ? Colors.grey.shade800
                  : const Color(0xFFDCDEDF),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: AspectRatio(
                        aspectRatio: 14 / 9,
                        child: Image.asset(
                          deployment["image"]!,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      deployment["title"]!,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isDarkTheme
                            ? Colors.yellow.shade200
                            : Colors.deepPurple,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      deployment["description"]!,
                      style: TextStyle(
                        fontSize: 14,
                        color: isDarkTheme
                            ? Colors.yellow.shade100
                            : Colors.black87,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const BASE_URL = "https://cpslabhub-assets.s3.ap-south-1.amazonaws.com";

const deployments = [
  {
    "image": `${BASE_URL}/images/1.png`,
    "title": "Deployment 1",
    "description": "AWaDH CPS Lab launched at National Institute of Technology Delhi.",
    "longDescription": "The inauguration of the AWaDH CPS Lab, graced by Dr. Ekta Kapoor, Mission Director of NM-ICPS, in the august presence of the Prof Ajay K Sharma, Director; Dr Ravinder Kumar, Registrar; Dr Anurag Singh, Dean R&C from NIT Delhi... signifies the commencement of a collaborative effort to establish a CPS skilling platform.",
  },
  {
    "image": `${BASE_URL}/images/2.png`,
    "title": "Deployment 2",
    "description": "AWaDH CPS lab at Dr. BR Ambedkar Institute Jalandhar.",
    "longDescription": "AWaDH has inaugurated the AWaDH CPS Lab at the Dr B R Ambedkar National Institute of Technology Jalandhar. This lab serves as a platform for education, research, prototyping, testing, and collaboration.",
  },
  {
    "image": `${BASE_URL}/images/3.png`,
    "title": "Deployment 3",
    "description": "AWaDH CPS Lab launched at Tula's Institute Dehradun.",
    "longDescription": "The inauguration of the AWaDH CPS Lab... The lab features cutting-edge IoT kits developed by IIT Ropar, providing a 24X7 plug-and-play module for hands-on experimentation and exploration of the IoT landscape.",
  },
  {
    "image": `${BASE_URL}/images/4.png`,
    "title": "Deployment 4",
    "description": "AWaDH CPS Lab launched at Thapar Institute of Engineering and Technology, Patiala.",
    "longDescription": "The AWaDH CPS Lab at TIET is part of the larger network of CPS labs under the National Mission on Interdisciplinary Cyber-Physical Systems (NM ICPS). Dedicated to promoting research, development, and deployment of CPS technologies.",
  },
  {
    "image": `${BASE_URL}/images/5.png`,
    "title": "Deployment 5",
    "description": "AWaDH CPS Lab launched at Chitkara University, Punjab.",
    "longDescription": "The Skilling for Emerging Technologies... inaugurated the AWaDH CPS Lab, the state-of-the-art facility to provide an integrated platform for Cyber Physical Systems education, skilling, research and collaboration at Chitkara University.",
  },
  {
    "image": `${BASE_URL}/images/8.png`,
    "title": "Deployment 6",
    "description": "AWaDH CPS Lab launched at Baba Farid College of Engineering & Technology, Bhatinda",
    "longDescription": "In a significant step towards advancing technical education and innovation, the National Mission on Interdisciplinary Cyber-Physical Systems has launched a series of skilling initiatives focused on emerging technologies.",
  },
  {
    "image": `${BASE_URL}/images/6.png`,
    "title": "Deployment 7",
    "description": "AWaDH CPS Lab launched at University of Ladakh, Leh Campus, Taru.",
    "longDescription": "The seventh CPS Lab has been established at the University of Ladakh... marking a significant step in advancing technology education across India, including the country's most remote and challenging regions.",
  },
  {
    "image": `${BASE_URL}/images/9.png`,
    "title": "Deployment 8",
    "description": "AWaDH CPS Lab launched at Centre for Computers and Communication Technology, Chisopani, Sikkim.",
    "longDescription": "iHub – AWaDH has taken a bold step forward by launching its 8th CPS Lab at CCCT in Sikkim. In a region where slow or non-existent internet can delay even the simplest digital task, the CPS Lab aims to create a bridge between innovation and accessibility.",
  },
  {
    "image": `${BASE_URL}/images/10.png`,
    "title": "Deployment 9",
    "description": "AWaDH CPS Lab launched at Khalsa College of Engineering and Technology, Amritsar.",
    "longDescription": "In the heart of the holy city of Amritsar... this event marked a significant leap forward in innovation and education, setting the stage for a brighter, tech-driven future.",
  },
  {
    "image": `${BASE_URL}/images/11.png`,
    "title": "Deployment 10",
    "description": "AWaDH CPS Lab launched at Indian Institute of Information Technology (IIIT), Una.",
    "longDescription": "Nestled in the serene hills of Himachal Pradesh, innovation took a bold step forward... This achievement isn't just about state-of-the-art facilities—it's about creating a thriving ecosystem of collaboration.",
  },
  {
    "image": `${BASE_URL}/images/12.png`,
    "title": "Deployment 11",
    "description": "AWaDH CPS Lab launched at Chamber of Industrial & Commercial Undertakings (CICU), Ludhiana.",
    "longDescription": "In the heart of Punjab's industrial hub... This milestone marks not just another lab opening but a significant step in strengthening the bridge between academia and industry.",
  },
  {
    "image": `${BASE_URL}/images/14.png`,
    "title": "Deployment 12",
    "description": "AWaDH CPS Lab launched at IILM University, Greater Noida.",
    "longDescription": "IIT Ropar TIF AWaDH is thrilled to announce the inauguration of its 12th CPS Lab... serving as a central hub for AI, IoT, and CPS technologies.",
  },
  {
    "image": `${BASE_URL}/images/7.png`,
    "title": "Deployment 13",
    "description": "AWaDH CPS Lab launched at HRIT University, Ghaziabad.",
    "longDescription": "This new lab, located at HRIT University in Ghaziabad, marks another significant step in democratizing access to next-generation technologies and equipping students with the skills needed for real-time tech-driven innovation.",
  },
  {
    "image": `${BASE_URL}/images/13.png`,
    "title": "Deployment 14",
    "description": "AWaDH CPS Lab launched at Sardar Vallabhbhai Patel University, Meerut.",
    "longDescription": "The launch of the Agri-Tech Innovation Hub at Sardar Vallabhbhai Patel University of Agriculture and Technology... united by a shared vision: to revolutionize Indian agriculture through technology.",
  },
  {
    "image": `${BASE_URL}/images/15.png`,
    "title": "Deployment 15",
    "description": "AWaDH CPS Lab launched at Acropolis Institute of Technology and Research, Indore.",
    "longDescription": "Marking the first CPS lab in Madhya Pradesh, this facility represents a significant step in decentralizing advanced technological research and innovation across India.",
  },
  {
    "image": `${BASE_URL}/images/17.png`,
    "title": "Deployment 16",
    "description": "AWaDH CPS Lab launched at Hindustan Institute of Technology and Science, Chennai.",
    "longDescription": "This landmark event marks the establishment of the first-ever CPS Lab in South India, expanding the national CPS Lab network and strengthening India's mission to decentralize deep-tech innovation.",
  },
  {
    "image": `${BASE_URL}/images/16.png`,
    "title": "Deployment 17",
    "description": "AWaDH CPS Lab launched at Model Institute of Engineering and Technology, Jammu.",
    "longDescription": "Innovation has reached the Himalayas. This marks a historic milestone — the first-ever CPS Lab in Jammu & Kashmir.",
  },
  {
    "image": `${BASE_URL}/images/18.png`,
    "title": "Deployment 18",
    "description": "AWaDH CPS Lab launched Shoolini University, Solan, Himachal Pradesh.",
    "longDescription": "The CPS Lab at Shoolini University features over 100 hands-on experiments in cutting-edge fields like sensors, embedded systems, 3D printing, and advanced components.",
  },
  {
    "image": `${BASE_URL}/images/19.jpg`,
    "title": "Deployment 19",
    "description": "AWaDH CPS Lab launched at Ambala College of Engineering & Applied Research, Haryana.",
    "longDescription": "Located at EPIC (Entrepreneurship Promotion and Incubation Council) within the Ambala College of Engineering & Applied Research, this facility represents the first NM-ICPS-powered lab in Haryana.",
  },
  {
    "image": `${BASE_URL}/images/21.jpeg`,
    "title": "Deployment 20",
    "description": "AWaDH CPS Lab launched at Government Polytechnic College Bhikhiwind.",
    "longDescription": "Under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS), officially inaugurated its 20th Cyber-Physical Systems (CPS) Lab.",
  },
  {
    "image": `${BASE_URL}/images/22.jpeg`,
    "title": "Deployment 21",
    "description": "AWaDH CPS Lab launched at SBAS Government Polytechnic College Badbar, Barnala.",
    "longDescription": "Officially inaugurated its 21st Cyber-Physical Systems (CPS) Lab at SBAS Government Polytechnic College in Badbar (Barnala), Punjab.",
  },
  {
    "image": `${BASE_URL}/images/23.jpeg`,
    "title": "Deployment 22",
    "description": "AWaDH CPS Lab launched at MIT WPU Pune.",
    "longDescription": "Officially inaugurated its 22nd Cyber-Physical Systems (CPS) Lab at MIT WPU Pune.",
  },
  {
    "image": `${BASE_URL}/images/24.jpeg`,
    "title": "Deployment 23",
    "description": "AWaDH CPS Lab launched at Government Polytechnic College, Batala",
    "longDescription": "Indian Institute of Technology, Ropar Expands CPS Lab Network With 23rd Lab Under NMICPS. Officially inaugurated its 23rd Cyber-Physical Systems (CPS) Lab at at Government Polytechnic College Batala Punjab.",
  },
  {
    "image": `${BASE_URL}/images/25.jpeg`,
    "title": "Deployment 24",
    "description": "AWaDH CPS Lab launched at  Government Polytechnic College, Amritsar.",
    "longDescription": "Indian Institute of Technology, Ropar Expands Deep-Tech Footprint with 24th CPS Lab at Government Polytechnic College, Amritsar, Punjab.",
  },
  {
    "image": `${BASE_URL}/images/26.jpeg`,
    "title": "Deployment 25",
    "description": "AWaDH CPS Lab launched at NIT Sikkim",
    "longDescription": "Indian Institute of Technology, Ropar Expands Deep-Tech Footprint with 25th CPS Lab at NIT Sikkim",
  },
  {
    "image": `${BASE_URL}/images/27.jpeg`,
    "title": "Deployment 26",
    "description": "AWaDH CPS Lab launched at GPC KOTKAPURA",
    "longDescription": "Indian Institute of Technology, Ropar Expands Deep-Tech Footprint with 26th CPS Lab at GPC KOTKAPURA",
  },
  {
    "image": `${BASE_URL}/images/28.jpeg`,
    "title": "Deployment 27",
    "description": "AWaDH CPS Lab launched at Government ITI, Ropar",
    "longDescription": "Indian Institute of Technology, Ropar strengthens Punjab's innovation ecosystem with its 27th CPS Lab at Government ITI, Ropar, advancing deep-tech skilling, innovation-driven R&D, and entrepreneurship."
  },
  {
    "image": `${BASE_URL}/images/29.jpeg`,
    "title": "Deployment 28",
    "description": "AWaDH CPS Lab launched at Chandigarh University",
    "longDescription": "Indian Institute of Technology, Ropar Expands Deep-Tech Footprint with 28th CPS Lab at Chandigarh University."
  },
  {
    "image": `${BASE_URL}/images/SRM+Deployment.JPG`,
    "title": "Deployment 29",
    "description": "AWaDH CPS Lab launched at SRM IST Chennai",
    "longDescription": "Indian Institute of Technology, Ropar Expands Deep-Tech Footprint with 29th CPS Lab at SRM IST Chennai."
  },
  {
    "image": `${BASE_URL}/images/30..jpeg`,
    "title": "Deployment 30",
    "description": "AWaDH CPS Lab launched at Government Polytechnic College Mohali (Khunimajra)",
    "longDescription": "Fostering next-generation skill development and deep-tech innovation, IIT Ropar's AWaDH establishes its 30th Cyber-Physical Systems Lab at Government Polytechnic College Mohali (Khunimajra)."
  }
];

// Helper Component for Text Block
function DeploymentTextBlock({ data, index, setActiveIndex }: { data: any, index: number, setActiveIndex: (i: number) => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (isInView) {
      setActiveIndex(index);
    }
  }, [isInView, index, setActiveIndex]);

  return (
    <div
      ref={ref}
      className="min-h-[80vh] flex flex-col justify-center py-20 relative group"
    >
      <div className={`transition-all duration-700 ${isInView ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
        {/* Mobile Image (Only visible on small screens) */}
        <div className="lg:hidden w-full h-[300px] dark:bg-[#111827] bg-surface-container rounded-3xl overflow-hidden shadow-2xl mb-8 relative border dark:border-white/10 border-black/10">
          <img
            src={data.image}
            alt={data.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>

        <div className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-label font-bold mb-6 tracking-widest uppercase">
          {data.title}
        </div>
        <h3 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-6 leading-tight drop-shadow-md">
          {data.description}
        </h3>
        <p className="font-body text-lg text-on-surface-variant leading-relaxed max-w-2xl bg-surface-container/50 backdrop-blur-sm p-6 rounded-2xl border dark:border-white/5 border-black/5 shadow-xl">
          {data.longDescription}
        </p>

        {/* Glow effect that tracks the active item */}
        <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-32 rounded-full transition-all duration-700 ${isInView ? 'bg-primary shadow-[0_0_20px_rgba(37,99,235,1)] opacity-100' : 'dark:bg-white/10 bg-black/10 opacity-0'}`}></div>
      </div>
    </div>
  );
}

export default function DeploymentsPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-20"></div>

        {/* Dynamic glow tracking the active image dominantly */}
        <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full transition-colors duration-1000"></div>
      </div>

      <main className="relative z-10 pt-40 pb-32">
        {/* Header Section */}
        <section className="max-w-7xl mx-auto px-8 mb-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tighter text-on-surface drop-shadow-2xl">
              Nationwide<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent [text-shadow:0_0_1px_rgba(var(--on-surface-rgb),0.3)]">Deployments</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto">
              Mapping our journey across India: Building the future of intelligent systems state by state.
            </p>
          </motion.div>
        </section>

        {/* Parallax Content Container */}
        <section className="max-w-7xl mx-auto px-8 relative">
          <div className="flex flex-col lg:flex-row gap-16 relative">

            {/* Left Column: Scrolling Text */}
            <div className="w-full lg:w-1/2 relative z-10 pl-4 lg:pl-12 border-l dark:border-white/5 border-black/5">
              {deployments.map((deployment, index) => (
                <DeploymentTextBlock
                  key={index}
                  data={deployment}
                  index={index}
                  setActiveIndex={setActiveIndex}
                />
              ))}
            </div>

            {/* Right Column: Sticky Image (Desktop Only) */}
            <div className="hidden lg:block w-1/2 relative">
              <div className="sticky top-40 h-[70vh] w-full flex items-center justify-center p-8 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 40, rotateX: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: -10, scale: 0.9 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full relative rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border dark:border-white/10 border-black/10 group bg-surface-container flex items-center justify-center p-4 bg-gradient-to-br from-surface-container dark:to-[#000] to-surface-container-low"
                  >
                    <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <img
                      src={deployments[activeIndex].image}
                      alt={deployments[activeIndex].title}
                      className="object-contain w-full h-full relative z-10 drop-shadow-2xl"
                    />

                    {/* Glassmorphism Title Overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="absolute bottom-8 left-8 right-8 bg-surface-container/60 backdrop-blur-md border dark:border-white/20 border-black/20 p-4 rounded-2xl z-20 text-center"
                    >
                      <span className="text-on-surface font-headline font-bold text-lg">{deployments[activeIndex].title}</span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

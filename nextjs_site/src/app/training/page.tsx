'use client';

import { motion, Variants, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Shared data
const stats = [
  { icon: 'science', count: 28, label: 'Established CPS Labs', suffix: '' },
  { icon: 'school', count: 24, label: 'CPS Lab Trainings', suffix: '+' },
  { icon: 'groups', count: 400, label: 'Faculty Trained', suffix: '+' },
  { icon: 'psychology', count: 800, label: 'Students Trained', suffix: '+' },
];

const BASE_URL = "https://cpslabhub-assets.s3.ap-south-1.amazonaws.com";

const workshops = [
  {
    "title": "Strengthening Punjab’s Innovation Ecosystem Through CPS Lab at ITI Ropar",
    "description": "iHub – AWaDH @ IIT Ropar inaugurated a CPS Lab at Government ITI, Ropar to promote deep-tech skilling, innovation-driven R&D, and entrepreneurship at the grassroots.",
    "image": `${BASE_URL}/images/ITI_Ropar.jpeg`,
    "location": "Government ITI, Ropar",
    "date": "April 2026",
    "participants": "20+ Students "
  },
  {
    'title': "Hands-on Cyber-Physical Systems (CPS) training at GPC KOTKAPURA.",
    'description':
      "iHub – AWaDH @ IIT Ropar conducted a hands-on Cyber-Physical Systems (CPS) training at GPC KOTKAPURA.",
    'image': `${BASE_URL}/images/gpc.jpeg`,
    'location': 'GPC KOTKAPURA',
    'date': 'APRIL 10',
    'participants': '',
  },
  {
    'title': "Hands-on Cyber-Physical Systems (CPS) training at MIT-WPU PUNE.",
    'description':
      "iHub – AWaDH @ IIT Ropar conducted a two-day hands-on Cyber-Physical Systems (CPS) training at MIT-WPU PUNE.",
    'image': `${BASE_URL}/images/MIT.jpeg`,
    'location': 'MIT-WPU PUNE',
    'date': '',
    'participants': '',
  },
  {
    'title': "Hands-on Cyber-Physical Systems (CPS) training at SBPUAT, Meerut.",
    'description':
      "iHub – AWaDH @ IIT Ropar conducted a hands-on CPS training at Sardar Vallabhbhai Patel University of Agriculture and Technology, Meerut.",
    'image': `${BASE_URL}/images/SBPUAT.jpeg`,
    'location': 'SBPUAT, Meerut.',
    'date': '',
    'participants': '',
  },
  {
    'title': "Workshop Training on BLE & CPS at HRIT University, Ghaziabad.",
    'description':
      "iHub – AWaDH @ IIT Ropar conducted a two-day hands-on BLE & Cyber-Physical Systems (CPS) training at HRIT University, Ghaziabad.",
    'image': `${BASE_URL}/images/HRIT.jpeg`,
    'location': 'HRIT University, Ghaziabad.',
    'date': '',
    'participants': '',
  },
  {
    title: "Empowering Students through IoT Training at AWaDH CPS Lab, NIT Delhi",
    description: "iHub – AWaDH @ IIT Ropar conducted a hands-on Internet of Things (IoT) training session at the AWaDH CPS Lab in NIT Delhi. Students explored IoT fundamentals and real-time applications.",
    image: `${BASE_URL}/images/NIT_Delhi.png`,
    location: "NIT Delhi",
    date: "Mar 2023",
    participants: "45 Students",
  },
  {
    title: "Empowering Innovation: AI & IoT Workshop at AWaDH CPS Lab, NIT Jalandhar",
    description: "A two-day workshop on AI and IoT conducted under the AWaDH CPS Lab initiative at NIT Jalandhar, empowering students with hands-on learning.",
    image: `${BASE_URL}/images/NIT_jalandhar.png`,
    location: "NIT Jalandhar",
    date: "Feb 2023",
    participants: "60 Students",
  },
  {
    title: "Hands-On Learning: CPS Workshop at Chitkara University",
    description: "A two-day CPS Workshop at Chitkara University, engaging 19 students in hands-on learning and innovation.",
    image: `${BASE_URL}/images/Chitkara_University.png`,
    location: "Chitkara University",
    date: "Jan 2023",
    participants: "19 Students",
  },
  {
    title: "Empowering Northeast Youth: CPS Training for CCCT Sikkim at IIT Ropar",
    description: "A month-long hands-on CPS training for 30+ students from CCCT Sikkim hosted at IIT Ropar.",
    image: `${BASE_URL}/images/CICU_Ludhiana.png`,
    location: "IIT Ropar",
    date: "Dec 2022",
    participants: "30+ Students",
  },
  {
    title: "AI Workshop on Sustainable Agriculture (PI-RAHI & iHub AWaDH)",
    description: "Workshop conducted at Panjab University focusing on AI for agriculture, health, and ecosystem resilience.",
    image: `${BASE_URL}/images/PI-RAHI.png`,
    location: "Panjab University",
    date: "Nov 2022",
    participants: "50 Participants",
  },
  {
    title: "Empowering Educators: Faculty Workshop on CPS at Thapar Institute",
    description: "A faculty development workshop on CPS processes and applications, conducted at Thapar University.",
    image: `${BASE_URL}/images/Thapar_Institute.png`,
    location: "Thapar University",
    date: "Oct 2022",
    participants: "25 Faculty",
  },
  {
    title: "CPS Skilling with AI Workshop at Govt. Mahila Engineering College, Ajmer",
    description: "AI workshop conducted by iHub – AWaDH, training students in generative AI and CPS fundamentals.",
    image: `${BASE_URL}/images/Ajmer.png`,
    location: "Govt. Mahila College",
    date: "Sep 2022",
    participants: "40 Students",
  },
  {
    title: "Short-Term Course on IoT at NIT Delhi under AWaDH CPS Lab",
    description: "A short-term course on IoT covering sensors, gateways, and real-world IoT implementations.",
    image: `${BASE_URL}/images/NIT_Delhi_Short.png`,
    location: "NIT Delhi",
    date: "Aug 2022",
    participants: "35 Students",
  },
  {
    title: "CPS & IoT Training at CICU Ludhiana by iHub – AWaDH",
    description: "Hands-on training empowering 40+ participants with IoT, BLE, sensors, and automation skills.",
    image: `${BASE_URL}/images/CICU_Ludhiana.png`,
    location: "CICU Ludhiana",
    date: "Jul 2022",
    participants: "40+ Participants",
  },
  {
    title: "National Science Day – Generative AI Workshop by AWaDH",
    description: "Conducted in collaboration with Terafac and NCSTC, focusing on Generative AI applications.",
    image: `${BASE_URL}/images/National_Science_Day.png`,
    location: "Multiple Locations",
    date: "Feb 2023",
    participants: "100+ Participants",
  },
  {
    title: "CPS & IoT Workshop at Baba Farid College",
    description: "A two-day workshop training 55+ students and 5 faculty members.",
    image: `${BASE_URL}/images/Baba_Farid.png`,
    location: "Baba Farid College",
    date: "Jun 2022",
    participants: "60 Participants",
  },
  {
    title: "Hands-on Training at NIT Delhi (BLE & 3D Printing)",
    description: "Two-day hands-on workshop training students on BLE Development Kits and 3D printing.",
    image: `${BASE_URL}/images/BLE_3D.png`,
    location: "NIT Delhi",
    date: "May 2022",
    participants: "30 Students",
  },
  {
    title: "Workshop Training on BLE & 3D Printing at IIIT Una",
    description: "Training 35+ students in BLE applications, sensors, and rapid prototyping.",
    image: `${BASE_URL}/images/IIIT_Una.png`,
    location: "IIIT Una",
    date: "Apr 2022",
    participants: "35+ Students",
  },
  {
    title: "Hands-on CPS & BLE Training at Khalsa College, Amritsar",
    description: "Training 120+ students on CPS Lab modules, BLE tech, sensor applications, and gateway integration.",
    image: `${BASE_URL}/images/Ajmer.png`,
    location: "Khalsa College",
    date: "Mar 2022",
    participants: "120+ Students",
  },
  {
    title: "Hands-On Skilling and Applied Innovation in Haryana Through CPS Training Programme.",
    description: "iHub – AWaDH @ IIT Ropar conducted a two-day hands-on CPS skilling programme at EPIC, Ambala College of Engineering.",
    image: `${BASE_URL}/images/Haryana.jpg`,
    location: "EPIC, Ambala",
    date: " ",
    participants: "53 Students",
  },
  {
    title: "Strengthens CPS Capacity Through Advanced Training at HITS, Chennai",
    description: "iHub – AWaDH @ IIT Ropar conducted a two-day hands-on Cyber-Physical Systems (CPS) training at HITS, Chennai.",
    image: `${BASE_URL}/images/Chennai.jpg`,
    location: "HITS, Chennai",
    date: " ",
    participants: " ",
  },
  {
    title: "Hands-on Cyber-Physical Systems (CPS) training at Chandigarh University.",
    description: "iHub - AWaDH established a dynamic hub for innovation and advanced learning to empower students through hands-on Cyber-Physical Systems training.",
    image: `${BASE_URL}/images/ChandigarhUniversity.jpeg`,
    location: "Chandigarh University",
    date: " ",
    participants: " ",
  },
  {
    title: "Advanced Cyber-Physical Systems Workshop at SRM IST Chennai",
    description: "Empowering next-generation engineers with practical, hands-on Cyber-Physical Systems training and advanced IoT applications.",
    image: `${BASE_URL}/images/SRM+Training.jpeg`,
    location: "SRM IST Chennai",
    date: " ",
    participants: " ",
  }
];

// Reusable Counter Component
function AnimatedCounter({ to, suffix }: { to: number, suffix: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  return (
    <motion.span
      viewport={{ once: true }}
      onViewportEnter={() => {
        animate(count, to, { duration: 2, ease: "easeOut" });
      }}
      className="inline-flex"
    >
      <motion.span>{rounded}</motion.span>
      {suffix}
    </motion.span>
  );
}

export default function TrainingAndWorkshopPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-20"></div>
      </div>

      <main className="relative z-10 flex-grow pt-32 pb-32">
        {/* Our Impact Section with Animated Counters */}
        <section className="bg-surface-container-low border-y border-white/5 py-24 mb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-[500px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>

          <div className="max-w-7xl mx-auto px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="font-headline text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tighter text-white drop-shadow-lg">
                Our <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent [text-shadow:0_0_1px_rgba(255,255,255,0.3)]">Impact</span>
              </h1>
              <p className="font-body text-xl text-on-surface-variant font-medium max-w-2xl mx-auto">
                Empowering minds through innovative training programs and state-of-the-art infrastructure.
              </p>
            </motion.div>

            <div className="relative">
              {/* Ambient Glow immediately behind the container */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-[40px] pointer-events-none"></div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="relative bg-surface-container/40 backdrop-blur-3xl border border-white/20 rounded-[40px] p-8 md:p-16 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-1 ring-white/10"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                  {stats.map((stat, i) => (
                    <motion.div key={i} variants={itemVariants} className="flex flex-col items-center justify-center group relative z-10">
                      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 shadow-inner border border-primary/30 group-hover:border-primary/60 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                        <span className="material-symbols-outlined text-primary text-4xl drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]">{stat.icon}</span>
                      </div>
                      <h3 className="font-headline text-4xl md:text-5xl font-black bg-gradient-to-b from-white via-blue-100 to-primary bg-clip-text text-transparent mb-2 drop-shadow-lg flex items-center justify-center gap-1">
                        <AnimatedCounter to={stat.count} suffix={stat.suffix} />
                      </h3>
                      <p className="font-label text-on-surface-variant uppercase tracking-widest text-sm font-bold group-hover:text-white transition-colors">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Dynamic Draggable Slider for Workshops */}
        <section className="w-full relative py-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 mb-4"
            >
              <div className="w-2 h-12 bg-gradient-to-b from-primary to-accent rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Workshops & Trainings
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-body text-xl text-on-surface-variant font-medium pl-8"
            >
              Swipe to explore our comprehensive training programs and expert-led sessions globally.
            </motion.p>
          </div>

          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
              {workshops.map((workshop, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.1 }}
                  className="bg-surface-container rounded-[32px] border border-white/5 overflow-hidden flex flex-col group relative shadow-xl hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:border-white/20 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                  <div className="h-56 relative overflow-hidden bg-[#111827]">
                    <img
                      src={workshop.image}
                      alt={workshop.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 mix-blend-screen"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/50 to-transparent"></div>

                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 bg-surface-container/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span className="text-xs font-bold leading-none tracking-wide">{workshop.location}</span>
                    </div>
                    {workshop.date && workshop.date.trim() !== "" && (
                      <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full flex items-center shadow-[0_5px_15px_rgba(37,99,235,0.4)]">
                        <span className="text-xs font-bold leading-none tracking-widest uppercase">{workshop.date}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-surface-container to-[#0A0A0A] relative z-10">
                    <h3 className="font-headline text-xl font-bold text-white mb-4 line-clamp-3 leading-snug drop-shadow-sm group-hover:text-primary-light transition-colors">
                      {workshop.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[16px]">group</span>
                      </div>
                      <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface transition-colors font-bold">
                        {workshop.participants}
                      </span>
                    </div>

                    <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3 mt-auto relative z-10 group-hover:text-white/90 transition-colors">
                      {workshop.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const IndiaMap = dynamic(() => import('@/components/IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container/50 animate-pulse rounded-2xl border border-white/5 shadow-inner">
      <span className="material-symbols-outlined text-4xl text-primary mb-4 animate-[spin_3s_linear_infinite]">public</span>
      <p className="font-label text-white/50 text-sm tracking-widest uppercase font-bold">Initializing Geodatabase</p>
    </div>
  )
});

import CyberBackground from '@/components/CyberBackground';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, googleUser, isLoading: authLoading, checkUserSession } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      const isGuest = typeof window !== 'undefined' ? sessionStorage.getItem('guestMode') === 'true' : false;
      if (!user && !googleUser && !isGuest) {
        router.push('/login');
      }
    }
  }, [user, googleUser, authLoading, router]);

  const heroImages = [
    "/assets/images/1.png", "/assets/images/2.png", "/assets/images/3.png",
    "/assets/images/4.png", "/assets/images/5.png", "/assets/images/6.png",
    "/assets/images/7.png", "/assets/images/8.png", "/assets/images/9.png",
    "/assets/images/10.png", "/assets/images/11.png", "/assets/images/12.png",
    "/assets/images/13.png", "/assets/images/14.png", "/assets/images/15.png",
    "/assets/images/16.png", "/assets/images/17.png", "/assets/images/18.png",
    "/assets/images/19.jpg", "/assets/images/20.jpeg", "/assets/images/21.jpeg",
    "/assets/images/22.jpeg"
  ];

  const marqueeImages1 = heroImages.slice(0, 11);
  const marqueeImages2 = heroImages.slice(11, 22);

  const apps = [
    {
      title: "Serial Monitor",
      desc: "Real-time robust data visualization with IoT bounds.",
      path: "/assets/images/serialmonitor.jpeg",
      downloadLink: "https://iot-serial-communication-app.s3.us-east-1.amazonaws.com/IOT+Serial+Monitor+Setup+1.0.0.exe",
      platform: ".exe"
    },
    {
      title: "BLE Sense",
      desc: "Wireless sensor monitoring app over Bluetooth protocols.",
      path: "/assets/images/blsesense.jpeg",
      downloadLink: "https://play.google.com/store/apps/details?id=com.blesense.app",
      platform: "Android"
    },
    {
      title: "Cloud Sense",
      desc: "Platform for real-time monitoring of weather and environmental sensor data.",
      path: "/assets/images/cloudsense.png",
      downloadLink: "https://play.google.com/store/apps/details?id=com.CloudSenseVis",
      platform: "Android"
    }
  ];

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0.3, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative flex flex-col min-h-screen text-on-surface">

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-2"></div>
      </div>

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <section className="relative w-full pt-16 pb-10 mb-8 overflow-hidden flex flex-col items-center justify-center text-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-4xl mx-auto px-8 relative z-20">
            <motion.h1 variants={fadeIn} className="font-headline text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-6 tracking-tighter text-white drop-shadow-2xl">
              Cyber Physical<br />System <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent [text-shadow:0_0_1px_rgba(255,255,255,0.3)]">Laboratory</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="font-body text-lg text-on-surface-variant font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              Empowering schools and colleges by advancing research and innovation in Cyber-Physical Systems, IoT, AI, and intelligent automation through cutting-edge industry collaboration.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLSeDJHnUKcgVFHHAooXa47MoyhKmg_R_xmkoQJWhQ_XND_FA1g/viewform" target="_blank" className="bg-primary/90 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Expression of Interest (College)
                <span className="material-symbols-outlined uppercase group-hover:translate-x-1 transition-transform text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
              </Link>
              <Link href="https://docs.google.com/forms/d/17OmpfmPfYMbMlVwMZ0Upej00dqJfq8AvhVCMDrESueM/viewform" target="_blank" className="bg-primary/90 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Expression of Interest (School)
                <span className="material-symbols-outlined uppercase group-hover:translate-x-1 transition-transform text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
              </Link>
            </motion.div>
          </motion.div>

          <div className="absolute top-[60%] sm:top-[50%] left-0 right-0 w-full z-0 flex flex-col gap-6 opacity-40 blur-[1px] md:blur-none md:opacity-80 pointer-events-none transform -rotate-3 scale-110">
            <div className="flex overflow-hidden relative w-full">
              <motion.div className="flex gap-6 min-w-max" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 40, ease: "linear", repeat: Infinity }}>
                {[...marqueeImages1, ...marqueeImages1].map((src, idx) => (
                  <div key={idx} className="w-64 h-44 sm:w-80 sm:h-52 relative rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                    <img src={src} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="flex overflow-hidden relative w-full">
              <motion.div className="flex gap-6 min-w-max" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 45, ease: "linear", repeat: Infinity }}>
                {[...marqueeImages2, ...marqueeImages2].map((src, idx) => (
                  <div key={idx} className="w-64 h-44 sm:w-80 sm:h-52 relative rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl">
                    <img src={src} className="absolute inset-0 w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/60 to-surface z-10 pointer-events-none"></div>
        </section>

        {/* About iHub-AWaDH Section */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-[#0f172a]/80 dark:to-[#020617]/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-black/5 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-2xl"
          >
            {/* Ambient glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-[2px] bg-secondary" />
                <span className="text-secondary font-mono text-sm uppercase tracking-widest font-bold">About</span>
              </div>

              <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface dark:text-white mb-6 leading-tight">
                IIT Ropar – Technology & Innovation Foundation{" "}
                <span className="text-primary">(iHub-AWaDH)</span>
              </h2>

              <p className="font-body text-base md:text-lg text-on-surface-variant leading-relaxed mb-8 max-w-5xl">
                IIT Ropar-Technology and Innovation Foundation (iHub-AWaDH) is one of the <strong className="text-on-surface dark:text-white">25 Technology Innovation Hubs</strong> established under the National Mission on Interdisciplinary Cyber Physical Systems (NM-ICPS) of the Department of Science and Technology, Government of India, and hosted at IIT Ropar. The Foundation works across <span className="text-primary font-semibold">AI, IoT, robotics, drones, embedded systems, data analytics, entrepreneurship</span> and technology commercialisation.
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { value: "196+", label: "Supported Startups" },
                  { value: "220+", label: "Academic, Industry & Govt Partners" },
                  { value: "32", label: "CPS Labs as Spoke Centres" },
                  { value: "8,000+", label: "Students, Researchers & Professionals Trained" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 md:p-5 border border-black/5 dark:border-white/10 text-center">
                    <div className="font-headline text-2xl md:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="font-body text-xs text-on-surface-variant leading-snug">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[2px] bg-secondary"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-widest font-bold">What Makes Us Different</span>
            </div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface dark:text-white mb-6 max-w-4xl leading-tight">
              Bridging the gap between theoretical research and real-world application <span className="text-on-surface-variant">through innovation and collaboration.</span>
            </h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6 h-auto">
            
            {/* End-to-End CPS Approach Card */}
            <motion.div variants={fadeIn} className="md:col-span-8 md:row-span-2 bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-[#0f172a]/80 dark:to-[#020617]/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-black/5 dark:border-white/10 hover:border-primary/50 relative overflow-hidden flex flex-col group transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
                  </div>
                  <h3 className="font-headline text-xl font-bold text-on-surface dark:text-white">End-to-End CPS Approach</h3>
                </div>
                <p className="font-body text-sm text-on-surface-variant mb-8 max-w-lg">Complete stack from hardware and firmware through connectivity, cloud, and AI analytics, to dashboards — not isolated kits.</p>
                
                <div className="flex-grow flex flex-col justify-between relative md:pr-12">
                  <div className="absolute left-[1.5rem] top-6 bottom-6 w-[1px] bg-gradient-to-b from-surface-variant via-primary/30 to-transparent z-0"></div>

                  {[
                    { title: "Hardware", desc: "sensors • actuators • boards", icon: "extension", color: "text-gray-400" },
                    { title: "Firmware", desc: "embedded control logic", icon: "memory", color: "text-secondary" },
                    { title: "Connectivity", desc: "Wi-Fi • BLE • MQTT", icon: "satellite_alt", color: "text-blue-300" },
                    { title: "Cloud", desc: "ingestion • storage", icon: "cloud", color: "text-purple-100" },
                    { title: "AI Analytics", desc: "models • inference", icon: "psychology", color: "text-pink-400" },
                    { title: "Dashboards", desc: "live decisions", icon: "insert_chart", color: "text-blue-300" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between relative z-10 mb-6 last:mb-0">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-surface-container border border-black/5 dark:border-white/5 flex items-center justify-center shadow-lg z-10 hover:border-black/10 dark:group-hover:border-white/10 transition-colors">
                          <span className={`material-symbols-outlined ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-on-surface dark:text-white font-bold text-sm leading-tight mb-1">{item.title}</h4>
                          <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">{item.desc}</p>
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-black/40 dark:text-white/30 border border-black/10 dark:border-white/5 px-2 py-1 rounded-full bg-black/5 dark:bg-white/5">
                        0{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Continuous Engagement Card */}
            <motion.div variants={fadeIn} className="md:col-span-4 bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-[#1e1b4b]/60 dark:to-[#020617]/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-black/5 dark:border-white/10 hover:border-purple-500/50 relative overflow-hidden flex flex-col group transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700"></div>
              <div className="relative z-10 w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <span className="material-symbols-outlined text-purple-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>all_inclusive</span>
              </div>
              <h3 className="relative z-10 font-headline text-lg font-bold text-on-surface dark:text-white mb-2">Continuous Engagement</h3>
              <p className="relative z-10 font-body text-xs text-on-surface-variant/80 mb-6 max-w-sm">Ongoing upgrades, new experiments, internships, and collaborations — not a one-time setup.</p>
              
              <div className="mt-auto flex items-center gap-6">
                <motion.div 
                  className="w-14 h-14 rounded-full border border-dashed border-black/20 dark:border-white/20 relative flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute top-1/2 -left-[3px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></div>
                </motion.div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[11px] text-on-surface-variant/60">
                    <span className="text-on-surface dark:text-white/80">v1 &rarr; v2 &rarr; v3</span> upgrades
                  </div>
                  <div className="font-mono text-[11px] text-on-surface-variant/60">new cohorts, quarterly</div>
                </div>
              </div>
            </motion.div>

            {/* Hands-On Involvement Card */}
            <motion.div variants={fadeIn} className="md:col-span-4 bg-gradient-to-br from-teal-50/80 to-teal-100/50 dark:from-[#042f2e]/60 dark:to-[#020617]/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-black/5 dark:border-white/10 hover:border-secondary/50 relative overflow-hidden flex flex-col group transition-all duration-500 shadow-xl dark:shadow-2xl">
              <div className="absolute bottom-[-20%] right-[-20%] w-[120%] h-[120%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-secondary/20 transition-all duration-700"></div>
              <div className="relative z-10 w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 mb-6 shadow-[0_0_15px_rgba(15,118,110,0.4)]">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              </div>
              <h3 className="relative z-10 font-headline text-lg font-bold text-on-surface dark:text-white mb-2">Hands-On Involvement</h3>
              <p className="relative z-10 font-body text-xs text-on-surface-variant/80 mb-6 max-w-sm">Students actively connect devices, test them, and see results — not just observe demonstrations.</p>
              
              <div className="mt-auto flex items-center justify-between relative w-full pt-6 px-2">
                <div className="absolute left-8 right-8 top-[38px] h-[1px] border-b border-dashed border-black/20 dark:border-white/20 z-0"></div>
                <div className="absolute left-8 right-8 top-[38px] h-[1px] z-0 overflow-hidden">
                  <motion.div 
                    className="absolute top-0 h-full w-[50%] bg-gradient-to-r from-transparent via-[#80d5cb] to-transparent opacity-70"
                    animate={{ left: ["-50%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                <div className="w-8 h-8 rounded-lg bg-surface border border-white/10 flex items-center justify-center z-10 relative">
                  <span className="material-symbols-outlined text-purple-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>electrical_services</span>
                </div>
                
                <div className="w-8 h-8 rounded-lg bg-surface border border-[#80d5cb]/40 flex items-center justify-center z-10 relative">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>laptop_mac</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Location Section */}
        <section className="py-8">
          <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-3">CPS Labs in Schools and Colleges Across India</h2>
              <p className="font-body text-base text-on-surface-variant mb-8">Our network of research centers spans across educational institutions nationwide.</p>
              <div className="h-[400px] md:h-[600px] w-full rounded-3xl bg-surface-container-lowest border border-black/10 dark:border-white/10 relative overflow-hidden group shadow-xl dark:shadow-2xl hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] hover:border-primary/40 transition-all duration-500">
                <IndiaMap />
                <div className="absolute bottom-6 right-6 z-30 bg-primary/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border border-white/20 flex flex-col items-center group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-[0_15px_40px_rgba(37,99,235,0.6)] transition-all duration-500">
                  <span className="font-headline text-2xl font-black leading-none drop-shadow-md mb-1 text-white">32+</span>
                  <span className="font-label text-[10px] uppercase tracking-widest font-bold opacity-90">Live Locations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Apps Section */}
        <section id="apps" className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-white mb-3">Our Applications</h2>
            <p className="font-body text-lg text-on-surface-variant max-w-3xl">Software suites tailored for Cyber Physical interaction.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {apps.map((app, idx) => (
              <motion.div key={app.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="bg-surface-container rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 group flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 dark:hover:shadow-primary/20 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-500 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
                <div className="h-56 overflow-hidden bg-surface-container-lowest flex items-center justify-center p-4 relative z-10">
                  <img src={app.path} alt={app.title} className="max-h-full max-w-full object-contain rounded-md shadow-sm group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-headline font-bold text-lg text-white">{app.title}</h3>
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">{app.platform}</span>
                  </div>
                  <p className="font-body text-xs text-on-surface-variant mb-4">{app.desc}</p>
                  <Link href={app.downloadLink} download className="mt-auto relative z-10 inline-flex items-center gap-2 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-primary text-primary hover:text-white px-3 py-1.5 rounded-lg transition-all w-full justify-center group/btn shadow-sm hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                    <span className="material-symbols-outlined text-lg group-hover/btn:-translate-y-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
                    <span className="font-body text-xs font-semibold">Download APK</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 text-center">
            <p className="text-on-surface-variant text-xs">All applications are compatible with Android devices. iOS versions coming soon.</p>
          </motion.div>
        </section>



                        {/* CTA */}
        <section className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 mb-12">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-[#0f172a]/80 dark:to-[#020617]/80 backdrop-blur-md rounded-3xl p-12 md:p-16 border border-black/5 dark:border-white/10 relative overflow-hidden text-center shadow-xl dark:shadow-2xl hover:border-primary/50 transition-all duration-500 group">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface dark:text-white mb-6">Ready to define the future?</h2>
              <p className="font-body text-base text-on-surface-variant mb-8">We are always looking for passionate researchers, engineers, and collaborators to join our ecosystem at IIT Ropar.</p>
              <div className="flex flex-row flex-wrap justify-center gap-4">
                <Link href="/contact" className="bg-primary text-white dark:bg-white dark:text-surface px-6 py-3 rounded-full font-headline font-bold text-sm hover:bg-primary/90 dark:hover:bg-gray-200 hover:scale-105 transition-all whitespace-nowrap">Contact Us</Link>
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLSeDJHnUKcgVFHHAooXa47MoyhKmg_R_xmkoQJWhQ_XND_FA1g/viewform" target="_blank" className="bg-transparent border border-black/20 dark:border-white/20 text-on-surface dark:text-white px-6 py-3 rounded-full font-headline font-bold text-sm hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 transition-all whitespace-nowrap">EOI (College)</Link>
                <Link href="https://docs.google.com/forms/d/17OmpfmPfYMbMlVwMZ0Upej00dqJfq8AvhVCMDrESueM/viewform" target="_blank" className="bg-transparent border border-black/20 dark:border-white/20 text-on-surface dark:text-white px-6 py-3 rounded-full font-headline font-bold text-sm hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 transition-all whitespace-nowrap">EOI (School)</Link>
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-all duration-700"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none group-hover:bg-secondary/30 transition-all duration-700"></div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
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
    <div className="relative flex flex-col min-h-screen bg-surface text-on-surface">

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-2"></div>
      </div>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="relative w-full pt-16 pb-32 mb-20 overflow-hidden flex flex-col items-center justify-center text-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-4xl mx-auto px-8 relative z-20">
            <motion.h1 variants={fadeIn} className="font-headline text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tighter text-white drop-shadow-2xl">
              Cyber Physical<br />System <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent [text-shadow:0_0_1px_rgba(255,255,255,0.3)]">Laboratory</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="font-body text-xl text-on-surface-variant font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Advancing research and innovation in Cyber-Physical Systems, IoT, AI, and intelligent automation through cutting-edge industry collaboration.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="https://docs.google.com/forms/d/e/1FAIpQLSeDJHnUKcgVFHHAooXa47MoyhKmg_R_xmkoQJWhQ_XND_FA1g/viewform" target="_blank" className="bg-primary/90 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:bg-primary transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Expression of Interest
                <span className="material-symbols-outlined uppercase group-hover:translate-x-1 transition-transform" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
              </Link>
              <Link href="#apps" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-headline font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                View Applications
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

        {/* Bento Grid */}
        <section className="max-w-7xl mx-auto px-8 mb-40">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[2px] bg-secondary"></div>
              <span className="text-secondary font-mono text-sm uppercase tracking-widest font-bold">What Makes Us Different</span>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-8 max-w-4xl leading-tight">
              Bridging the gap between theoretical research and real-world application <span className="text-on-surface-variant">through innovation and collaboration.</span>
            </h2>
          </motion.div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-6 h-auto">
            
            {/* End-to-End CPS Approach Card */}
            <motion.div variants={fadeIn} className="md:col-span-8 md:row-span-2 bg-gradient-to-br from-[#121626] to-[#0D101C] rounded-2xl p-8 md:p-10 border border-white/5 relative overflow-hidden flex flex-col group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white">End-to-End CPS Approach</h3>
                </div>
                <p className="font-body text-on-surface-variant mb-12 max-w-lg">Complete stack from hardware and firmware through connectivity, cloud, and AI analytics, to dashboards — not isolated kits.</p>
                
                <div className="flex-grow flex flex-col justify-between relative md:pr-12">
                  <div className="absolute left-[1.5rem] top-6 bottom-6 w-[1px] bg-gradient-to-b from-surface-variant via-primary/30 to-transparent z-0"></div>

                  {[
                    { title: "Hardware", desc: "sensors • actuators • boards", icon: "extension", color: "text-gray-400" },
                    { title: "Firmware", desc: "embedded control logic", icon: "memory", color: "text-[#A3E635]" },
                    { title: "Connectivity", desc: "Wi-Fi • BLE • MQTT", icon: "satellite_alt", color: "text-blue-300" },
                    { title: "Cloud", desc: "ingestion • storage", icon: "cloud", color: "text-purple-100" },
                    { title: "AI Analytics", desc: "models • inference", icon: "psychology", color: "text-pink-400" },
                    { title: "Dashboards", desc: "live decisions", icon: "insert_chart", color: "text-blue-300" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between relative z-10 mb-6 last:mb-0">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center shadow-lg z-10 group-hover:border-white/10 transition-colors">
                          <span className={`material-symbols-outlined ${item.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base leading-tight mb-1">{item.title}</h4>
                          <p className="font-mono text-[11px] text-on-surface-variant/60 uppercase tracking-widest">{item.desc}</p>
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-white/30 border border-white/5 px-2 py-1 rounded-full bg-white/5">
                        0{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Continuous Engagement Card */}
            <motion.div variants={fadeIn} className="md:col-span-4 bg-gradient-to-br from-[#181525] to-[#100D16] rounded-2xl p-8 border border-white/5 relative overflow-hidden flex flex-col group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <span className="material-symbols-outlined text-purple-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>all_inclusive</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-3">Continuous Engagement</h3>
              <p className="font-body text-sm text-on-surface-variant/80 mb-8 max-w-sm">Ongoing upgrades, new experiments, internships, and collaborations — not a one-time setup.</p>
              
              <div className="mt-auto flex items-center gap-6">
                <motion.div 
                  className="w-14 h-14 rounded-full border border-dashed border-white/20 relative flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute top-1/2 -left-[3px] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></div>
                </motion.div>
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[11px] text-on-surface-variant/60">
                    <span className="text-white/80">v1 &rarr; v2 &rarr; v3</span> upgrades
                  </div>
                  <div className="font-mono text-[11px] text-on-surface-variant/60">new cohorts, quarterly</div>
                </div>
              </div>
            </motion.div>

            {/* Hands-On Involvement Card */}
            <motion.div variants={fadeIn} className="md:col-span-4 bg-gradient-to-br from-[#111A1B] to-[#0A1010] rounded-2xl p-8 border border-white/5 relative overflow-hidden flex flex-col group">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-6">
                <span className="material-symbols-outlined text-[#80d5cb] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>build</span>
              </div>
              <h3 className="font-headline text-xl font-bold text-white mb-3">Hands-On Involvement</h3>
              <p className="font-body text-sm text-on-surface-variant/80 mb-8 max-w-sm">Students actively connect devices, test them, and see results — not just observe demonstrations.</p>
              
              <div className="mt-auto flex items-center justify-between relative w-full pt-6 px-2">
                <div className="absolute left-8 right-8 top-[38px] h-[1px] border-b border-dashed border-white/20 z-0"></div>
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
                  <span className="material-symbols-outlined text-[#80d5cb] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>laptop_mac</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Location Section */}
        <section className="bg-surface-container-low py-24 border-y border-white/5 shadow-inner">
          <div className="max-w-7xl mx-auto px-8 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">CPS Labs Across India</h2>
              <p className="font-body text-lg text-on-surface-variant mb-12">Our network of research centers spans across the country.</p>
              <div className="h-[400px] md:h-[600px] w-full rounded-3xl bg-[#111827] border border-white/10 relative overflow-hidden group shadow-2xl">
                <IndiaMap />
                <div className="absolute bottom-6 right-6 z-30 bg-primary/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] border border-white/20 flex flex-col items-center">
                  <span className="font-headline text-3xl font-black leading-none drop-shadow-md mb-1 text-white">22+</span>
                  <span className="font-label text-[10px] uppercase tracking-widest font-bold opacity-90">Live Locations</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Apps Section */}
        <section id="apps" className="max-w-7xl mx-auto px-8 py-24 border-b border-white/5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">Our Applications</h2>
            <p className="font-body text-lg text-on-surface-variant max-w-3xl">Software suites tailored for Cyber Physical interaction.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {apps.map((app, idx) => (
              <motion.div key={app.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="bg-surface-container rounded-xl overflow-hidden border border-white/5 group flex flex-col">
                <div className="h-56 overflow-hidden bg-[#EAEAEA] flex items-center justify-center p-4">
                  <img src={app.path} alt={app.title} className="max-h-full max-w-full object-contain rounded-md shadow-sm group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-headline font-bold text-xl text-white">{app.title}</h3>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-mono">{app.platform}</span>
                  </div>
                  <p className="font-body text-sm text-on-surface-variant mb-6">{app.desc}</p>
                  <Link href={app.downloadLink} download className="mt-auto inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-4 py-2 rounded-lg transition-all w-full justify-center">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
                    <span className="font-body text-sm font-semibold">Download APK</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-12 text-center">
            <p className="text-on-surface-variant text-sm">All applications are compatible with Android devices. iOS versions coming soon.</p>
          </motion.div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-8 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-6 border border-white/5 transition-colors hover:bg-surface-container/80">
              <h3 className="font-headline font-bold text-white text-lg mb-2">How can I collaborate with CPS Lab?</h3>
              <p className="font-body text-on-surface-variant">We are open to academic and industrial collaborations. Reach out to us via the contact form or email our partnership team directly.</p>
            </div>
            <div className="bg-surface-container rounded-xl p-6 border border-white/5 transition-colors hover:bg-surface-container/80">
              <h3 className="font-headline font-bold text-white text-lg mb-2">What kind of technologies are available in the lab?</h3>
              <p className="font-body text-on-surface-variant">AI, IoT, CPS, etc.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-8 mb-40">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-primary-container/20 to-secondary-container/20 rounded-3xl p-12 md:p-24 border border-white/5 relative overflow-hidden text-center shadow-2xl">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mb-8">Ready to define the future?</h2>
              <p className="font-body text-lg text-on-surface-variant mb-12">We are always looking for passionate researchers, engineers, and collaborators to join our ecosystem at IIT Ropar.</p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/contact" className="bg-white text-surface px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-gray-200 hover:scale-105 transition-all">Contact Us</Link>
                <Link href="https://docs.google.com/forms/d/e/1FAIpQLSeDJHnUKcgVFHHAooXa47MoyhKmg_R_xmkoQJWhQ_XND_FA1g/viewform" target="_blank" className="bg-transparent border border-white/20 text-white px-10 py-4 rounded-full font-headline font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all">Expression of Interest</Link>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
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
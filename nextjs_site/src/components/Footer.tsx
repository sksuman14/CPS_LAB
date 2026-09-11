"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Linkedin,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const quickLinks = [
    { name: "Home", path: "/home" },
    { name: "Device Management", path: "/device" },
    { name: "Products & Sensors", path: "/products" },
    { name: "Live Deployments", path: "/deployments" },
    { name: "Training & Workshops", path: "/training" },
    { name: "Contact Support", path: "/contact" },
    { name: "FAQ", path: "/faq" },
  ];

  const resourceLinks = [
    {
      name: "College EOI Application",
      path: "https://docs.google.com/forms/d/e/1FAIpQLSeDJHnUKcgVFHHAooXa47MoyhKmg_R_xmkoQJWhQ_XND_FA1g/viewform",
      external: true,
    },
    {
      name: "School EOI Application",
      path: "https://docs.google.com/forms/d/17OmpfmPfYMbMlVwMZ0Upej00dqJfq8AvhVCMDrESueM/viewform",
      external: true,
    },
    { name: "Admin Portal", path: "/admin", external: false },
  ];

  if (pathname === "/" || pathname === "/login") return null;

  return (
    <footer className="bg-surface-container-lowest/95 backdrop-blur-xl border-t border-white/10 pt-12 md:pt-16 pb-8 relative z-20 overflow-hidden text-on-surface">
      {/* Top Cyber Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(37,99,235,0.8)]" />

      {/* Ambient background glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* COLUMN 1: Branding & Mission (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shadow-md">
                <Image
                  src="/images/app_logo.png"
                  alt="CPS Lab Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="font-headline text-2xl font-black text-white leading-none tracking-tight">
                  <span className="tracking-widest">CPS</span>{" "}
                  <span className="text-primary tracking-widest">LAB</span>
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-secondary font-bold">
                  iHub-AWaDH • IIT Ropar
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-90 max-w-md">
              IIT Ropar – Technology & Innovation Foundation (iHub-AWaDH) is one of the 25 Technology Innovation Hubs established under the National Mission on Interdisciplinary Cyber-Physical Systems (NM-ICPS), DST, Govt. of India.
            </p>

            {/* Quick Metrics Badge */}
            {/* <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-semibold">
                <Cpu className="w-3 h-3" /> 196+ Startups
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-mono font-semibold">
                <Sparkles className="w-3 h-3" /> 32 CPS Labs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-mono font-semibold">
                <BookOpen className="w-3 h-3" /> 8,000+ Trained
              </span>
            </div> */}

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://www.linkedin.com/company/ihub-awadh/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary/20 hover:border-primary/40 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.iitrpr.ac.in/awadh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Official Website"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary/20 hover:border-primary/40 transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="mailto:oitc@ihub-awadh.in"
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-primary/20 hover:border-primary/40 transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 flex flex-col items-start gap-4">
            <h3 className="font-headline text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 w-full">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="group flex items-center gap-1.5 font-body text-xs text-on-surface-variant hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Applications & Forms (3 cols) */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <h3 className="font-headline text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Applications & Forms
            </h3>
            <ul className="flex flex-col gap-2.5 w-full">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 font-body text-xs text-on-surface-variant hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      <span>{link.name}</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <Link
                      href={link.path}
                      className="group flex items-center gap-1.5 font-body text-xs text-on-surface-variant hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      <span>{link.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 w-full">
              <div className="flex items-center gap-2 text-white text-xs font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>DST Supported Hub</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Empowering IoT, Robotics & Embedded Systems under NM-ICPS, Government of India.
              </p>
            </div>
          </div>

          {/* COLUMN 4: Visit Us & Contact (3 cols) */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <h3 className="font-headline text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Contact Us
            </h3>

            <div className="flex flex-col gap-3.5 w-full">
              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="font-body text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-white block font-medium">IIT Ropar Campus</strong>
                  214 / M. Visvesvaraya Block, Rupnagar, Punjab – 140001, India
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col gap-1.5 font-body text-xs">
                  <a
                    href="tel:01881232601"
                    className="text-on-surface-variant hover:text-white transition-colors"
                  >
                    01881 - 232601 (HR)
                  </a>
                  <a
                    href="tel:+917986006349"
                    className="text-on-surface-variant hover:text-white transition-colors"
                  >
                    +91 7986006349 (Tech Team)
                  </a>
                  <a
                    href="tel:+917267012486"
                    className="text-on-surface-variant hover:text-white transition-colors"
                  >
                    +91 7267012486 (Tech Team)
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col gap-1 font-body text-xs">
                  <a
                    href="mailto:awadhropar@gmail.com"
                    className="text-on-surface-variant hover:text-white transition-colors truncate"
                  >
                    awadhropar@gmail.com
                  </a>
                  <a
                    href="mailto:oitc@ihub-awadh.in"
                    className="text-on-surface-variant hover:text-white transition-colors truncate text-[11px]"
                  >
                    oitc@ihub-awadh.in
                  </a>
  <a
                    href="mailto:vikash.hardwareengineer@ihub-awadh.in"
                    className="text-on-surface-variant hover:text-white transition-colors truncate text-[11px]"
                  >
                    vikash.hardwareengineer@ihub-awadh.in
                  </a>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-on-surface-variant">
          <p className="text-center sm:text-left">
            <strong className="text-white font-medium">CPS LAB</strong>, iHub-AWaDH (IIT Ropar). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
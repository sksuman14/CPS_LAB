"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Phone, ArrowUp } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const sitemapLinks = [
    { name: "Home", path: "/home" },
    { name: "Device", path: "/device" },
    { name: "Products", path: "/products" },
    { name: "Deployments", path: "/deployments" },
    { name: "Training & Workshop", path: "/training" },
    { name: "Contact", path: "/contact" },
  ];

  if (pathname === "/" || pathname === "/login") return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black/90 backdrop-blur-md border-t border-white/10 pt-12 md:pt-16 pb-8 mt-8 relative z-10 overflow-hidden">
      {/* Cyber/Tech Glow Top Border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-16 mb-10 w-full">
          {/* LEFT: Branding & Description */}
          <div className="flex flex-col items-start gap-4 md:max-w-sm w-full">
            <div className="flex items-center gap-3">
              <Image
                src="/images/app_logo.png"
                alt="CPS Lab Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <h2 className="font-headline text-2xl font-black text-white leading-none">
                <span className="tracking-widest">CPS</span>{" "}
                <span className="text-primary tracking-widest">LAB</span>
              </h2>
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed opacity-80 mt-1">
              Building the future of intelligent systems through rigorous
              research and open innovation.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-16 w-full md:w-auto">
            {/* MIDDLE: Sitemap Section */}
            <div className="flex flex-col items-start gap-4">
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-widest">
                Sitemap
              </h3>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                {sitemapLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.path}
                      className="group flex items-center gap-2 font-body text-xs text-on-surface-variant hover:text-white transition-colors"
                    >
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Visit Us Section */}
            <div className="flex flex-col items-start gap-4">
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-widest">
                Visit Us
              </h3>

              <div className="flex flex-col gap-4">
                {/* Address */}
                <div className="group flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    214 / M. Visvesvaraya Block<br />
                    IIT Ropar, Rupnagar<br />
                    Punjab - 140001, India
                  </p>
                </div>

                {/* Phone */}
                <div className="group flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-300" />
                  </div>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-1">
                    +91 70870 32853
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="w-full h-px bg-white/10 mb-4"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label text-xs text-on-surface-variant/60 uppercase tracking-widest text-center md:text-left">
            IIT Ropar – Cyber Physical System Lab
          </p>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all duration-300"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-primary" />
          </button>
        </div>
      </div>
    </footer>
  );
}

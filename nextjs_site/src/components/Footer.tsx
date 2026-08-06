'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, ArrowUp } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  
  const sitemapLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Device', path: '/device' },
    { name: 'Products', path: '/products' },
    { name: 'Deployments', path: '/deployments' },
    { name: 'Training & Workshop', path: '/training' },
    { name: 'Contact', path: '/contact' },
  ];

  if (pathname === '/' || pathname === '/login') return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-surface-container-low pt-16 pb-12 mt-4 relative z-10 overflow-hidden">
      {/* Cyber/Tech Glow Top Border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(37,99,235,0.5)]" />

      <div className="max-w-6xl mx-auto px-8 relative">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12 w-full">
          {/* LEFT: Branding & Description */}
          <div className="flex flex-col items-start gap-4 max-w-sm">
            <div className="flex items-center gap-3">
              <Image 
                src="/images/app_logo.png"
                alt="CPS Lab Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h2 className="font-headline text-3xl font-black text-white leading-none">
                <span className="tracking-widest">CPS</span> <span className="text-primary tracking-widest">LAB</span>
              </h2>
            </div>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed opacity-80 mt-2">
              Building the future of intelligent systems through rigorous research and open innovation.
            </p>
          </div>

          {/* MIDDLE: Sitemap Section */}
          <div className="flex flex-col items-start gap-6 min-w-[140px]">
            <h3 className="font-headline text-base font-bold text-white uppercase tracking-widest">Sitemap</h3>
            <ul className="flex flex-col gap-3">
              {sitemapLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="group flex items-center gap-2 font-body text-sm text-on-surface-variant hover:text-white transition-colors"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{link.name}</span>
                    <span className="opacity-0 -translate-x-2 text-primary transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: Visit Us Section */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="font-headline text-base font-bold text-white uppercase tracking-widest">Visit Us</h3>
            
            <div className="flex flex-col gap-6">
              {/* Address */}
              <div className="group flex items-start gap-4 cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110 shadow-[0_0_0_rgba(37,99,235,0)] group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <MapPin className="w-5 h-5 text-blue-300 transition-colors duration-300 group-hover:text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-sm font-bold text-white transition-colors duration-300 group-hover:text-primary">Address</h4>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed whitespace-nowrap transition-colors duration-300 group-hover:text-white">
                    214 / M. Visvesvaraya Block<br />
                    IIT Ropar, Rupnagar<br />
                    Punjab - 140001, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="group flex items-start gap-4 cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-110 shadow-[0_0_0_rgba(37,99,235,0)] group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                  <Phone className="w-5 h-5 text-blue-300 transition-colors duration-300 group-hover:text-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-sm font-bold text-white transition-colors duration-300 group-hover:text-primary">Phone</h4>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed transition-colors duration-300 group-hover:text-white">
                    +91 70870 32853
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="w-full h-px bg-white/10 mb-6"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-label text-sm text-on-surface-variant/60 uppercase tracking-widest">
            IIT Ropar – Cyber Physical System Lab
          </p>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-on-surface-variant text-sm font-bold uppercase tracking-widest hover:bg-primary/20 hover:text-white hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:text-primary" />
          </button>
        </div>
      </div>
    </footer>
  );
}
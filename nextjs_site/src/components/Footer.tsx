'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  
  const sitemapLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Products', path: '/products' },
    { name: 'Deployments', path: '/deployments' },
    { name: 'Training & Workshop', path: '/training' },
    { name: 'Contact', path: '/contact' },
  ];

  if (pathname === '/' || pathname === '/login') return null;

  return (
    <footer className="bg-surface-container-low border-t border-white/5 py-10 mt-12 relative z-10">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-8 w-full">
          {/* LEFT: Branding & Description */}
          <div className="flex flex-col items-start gap-4 max-w-sm">
            <h2 className="font-headline text-2xl font-black text-white leading-none">
              <span className="text-white tracking-widest">CPS</span> <span className="text-white tracking-widest">LAB</span>
            </h2>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed opacity-80">
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
                    className="font-body text-sm text-on-surface-variant hover:text-white transition-colors"
                  >
                    {link.name}
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
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-sm font-bold text-white">Address</h4>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed whitespace-nowrap">
                    214 / M. Visvesvaraya Block<br />
                    IIT Ropar, Rupnagar<br />
                    Punjab - 140001, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-300" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-headline text-sm font-bold text-white">Phone</h4>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                    +91 70870 32853
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="w-full h-px bg-white/10 mb-6"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label text-sm text-on-surface-variant/60 uppercase tracking-widest">
            © 2026 IIT Ropar – Cyber Physical System Lab
          </p>
        </div>
      </div>
    </footer>
  );
}
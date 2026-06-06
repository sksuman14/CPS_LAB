'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { user, isAdmin, logout, googleUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  console.log('Navbar Auth State:', {
    isLoggedIn: !!(user || googleUser),
    user: user ? user.username : 'null',
    googleUser: googleUser ? googleUser.email : 'null',
    isLoading
  });

  // Unified display: works for both Amplify user and Google OAuth user
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogged = !!(user || googleUser);
    const hasCookie = typeof document !== 'undefined' && document.cookie.includes('cps_logged_in=true');
    setIsLoggedIn(checkLogged || hasCookie);
  }, [user, googleUser]);

  const displayName = user
    ? (user.username || 'User')
    : googleUser
      ? (googleUser.name && !googleUser.name.startsWith('google_') ? googleUser.name : (googleUser.email || 'User'))
      : 'User';
  const displayEmail = user
    ? (user.attributes?.email)
    : googleUser
      ? (googleUser.email)
      : null;
  const displayPicture = googleUser?.picture || null;

  const handleLogout = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('guestMode');
    }
    setIsMenuOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Deployments', path: '/deployments' },
    { name: 'Products', path: '/products' },
    { name: 'Training & Workshop', path: '/training' },
    { name: 'Contact', path: '/contact' },
  ];

  // Don't show navbar on login page or root
  if (pathname === '/' || pathname === '/login') return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 shadow-[0_8px_32px_0_rgba(180,197,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <Link href="/home" className="group flex items-center gap-2">
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/app_logo.png"
                alt="CPS Lab Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-headline text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-primary/80 tracking-tighter whitespace-nowrap">
              CPS Lab
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links - Desktop */}
        <div 
          className="hidden lg:flex items-center justify-center flex-1 px-4 gap-2 xl:gap-4 text-xs xl:text-sm font-medium"
          onMouseLeave={() => setHoveredLink(null)}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const isHovered = hoveredLink === link.name;
            return (
              <Link
                key={link.name}
                href={link.path}
                onMouseEnter={() => setHoveredLink(link.name)}
                className={`relative px-4 py-2 font-bold uppercase tracking-wide whitespace-nowrap transition-colors duration-300 ${isActive
                  ? 'text-primary'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                {/* Static Active Pill */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                )}
                
                {/* Fluid Sliding Hover Pill */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="sliding-hover-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className="text-primary hover:bg-primary/10 rounded-full px-3 xl:px-4 py-2 text-xs xl:text-sm font-bold uppercase tracking-widest border border-primary/20 whitespace-nowrap"
            >
              Admin
            </Link>
          )}
        </div>

        {/* RIGHT: User Actions */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 bg-white/10 animate-pulse rounded-full" />
            ) : isLoggedIn ? (
              <div className="group/profile flex items-center gap-3 bg-white/5 hover:bg-white/10 pl-2 pr-1 py-1 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                {/* Avatar: Google profile picture or initials */}
                {displayPicture ? (
                  <img
                    src={displayPicture}
                    alt={displayName || 'User'}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-primary/30 group-hover/profile:border-primary/60 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 group-hover/profile:border-primary/60 transition-colors flex items-center justify-center">
                    <span className="text-primary font-bold text-xs uppercase">
                      {displayName?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex flex-col leading-tight max-w-[120px] xl:max-w-[180px]">
                  <p className="text-white text-xs font-bold truncate">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-white/40 group-hover/profile:text-white/60 transition-colors text-[10px] truncate">{displayEmail}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 transition-all duration-300 hover:border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] text-[10px] font-bold uppercase tracking-wider text-red-500 ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-7 py-2 rounded-full border border-primary/50 bg-primary/10 transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] text-xs font-bold uppercase tracking-widest text-primary"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="material-symbols-outlined text-2xl">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`block px-4 py-3 rounded-xl text-base font-bold transition-colors ${isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="block px-4 py-3 rounded-xl text-base font-bold text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              {isLoading ? (
                <div className="pt-4 space-y-3">
                  <div className="h-20 bg-white/10 animate-pulse rounded-xl" />
                  <div className="h-12 bg-white/10 animate-pulse rounded-full" />
                </div>
              ) : isLoggedIn ? (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl">
                    {displayPicture ? (
                      <img
                        src={displayPicture}
                        alt={displayName || 'User'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-primary font-bold text-base uppercase">
                          {displayName?.[0] || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {displayName}
                      </p>
                      {displayEmail && (
                        <p className="text-white/50 text-xs truncate">
                          {displayEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center bg-red-600/10 text-red-500 font-headline font-bold px-6 py-3 rounded-full border border-red-500/20 hover:bg-red-600/20 transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center mt-4 bg-primary hover:bg-primary/90 text-white font-headline font-bold px-6 py-3 rounded-full transition-all shadow-md"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
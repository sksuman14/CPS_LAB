'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { fetchAllRequests } from '@/lib/api/admin';
import { AccessRequest } from '@/types/admin';
import { allSensors } from '@/data/products';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { user, isAdmin, logout, googleUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<AccessRequest[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

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

  useEffect(() => {
    async function loadNotifications() {
      const email = user?.attributes?.email || googleUser?.email;
      if (email) {
        try {
          const reqs = await fetchAllRequests(email);
          // 1. Strictly filter by user email to ensure we only see THIS user's requests.
          // 2. Only show updates (GRANTED or REVOKED/REJECTED)
          const updates = reqs.filter(r => 
            r.userEmail === email && 
            (r.status === 'GRANTED' || r.status === 'REVOKED' || r.status === 'REJECTED')
          );
          // Sort by processedDate descending if exists, else requestDate
          updates.sort((a, b) => new Date(b.processedDate || b.requestDate).getTime() - new Date(a.processedDate || a.requestDate).getTime());
          
          setNotifications(updates);
          
          // Check for unread notifications using a signature of current states
          const currentSignature = updates.map(u => `${u.id}:${u.status}`).join(',');
          const savedSignature = typeof window !== 'undefined' ? localStorage.getItem('cps_notif_signature') : null;
          
          if (savedSignature !== currentSignature && updates.length > 0) {
            setHasUnread(true);
          } else {
            setHasUnread(false);
          }
        } catch (e) {
          console.error("Failed to load notifications", e);
        }
      } else {
        setNotifications([]);
      }
    }
    loadNotifications();
  }, [user, googleUser]);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Mark as read
      setHasUnread(false);
      if (typeof window !== 'undefined') {
        const currentSignature = notifications.map(u => `${u.id}:${u.status}`).join(',');
        localStorage.setItem('cps_notif_signature', currentSignature);
      }
    }
  };

  const formatNotifDate = (dateStr?: string, fallbackStr?: string) => {
    let d = new Date(dateStr || '');
    if (isNaN(d.getTime())) d = new Date(fallbackStr || '');
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString();
  };

  // Helper to get product title from datasheetKey
  const getProductTitle = (key: string) => {
    const sensor = allSensors.find(s => s.datasheetKey === key);
    return sensor ? `${sensor.title} ${sensor.highlightText}`.trim() : key;
  };

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
    <nav className="fixed top-0 left-0 right-0 z-50 dark:bg-black/90 bg-white/90 backdrop-blur-md border-b border-outline/20 shadow-[0_8px_32px_0_rgba(180,197,255,0.06)]">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex-1 flex items-center justify-start gap-3">
          <Link href="/home" className="group flex items-center gap-2">
            <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/images/app_logo.png"
                alt="CPS Lab Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-headline text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-white from-slate-800 to-primary/80 tracking-tighter whitespace-nowrap">
              CPS Lab
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links - Desktop */}
        <div 
          className="hidden lg:flex items-center justify-center px-4 gap-2 xl:gap-4 text-xs xl:text-sm font-medium"
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
                  : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                {/* Static Active Pill */}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full border border-primary/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                )}
                
                {/* Static Hover Pill (No Sliding) */}
                {isHovered && !isActive && (
                  <div className="absolute inset-0 dark:bg-white/10 bg-black/5 rounded-full border dark:border-white/20 border-black/10 animate-in fade-in duration-150" />
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

        {/* RIGHT: User Actions & Notifications */}
        <div className="flex-1 flex items-center justify-end gap-4">
          
          <ThemeToggle />

          {/* Notifications Icon (Visible when logged in) */}
          {isLoggedIn && !isLoading && (
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors dark:hover:bg-white/10 hover:bg-black/10 rounded-full"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 bg-surface-container-high/95 backdrop-blur-xl border dark:border-white/10 border-black/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col max-h-[400px]"
                  >
                    <div className="px-4 py-3 border-b dark:border-white/10 border-black/10 dark:bg-white/5 bg-black/5 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-on-surface tracking-widest uppercase">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif, idx) => (
                          <div key={idx} className="p-4 border-b dark:border-white/5 border-black/5 dark:hover:bg-white/5 hover:bg-black/5 transition-colors flex gap-3 items-start">
                            <div className={`mt-0.5 rounded-full p-1 border ${notif.status === 'GRANTED' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                              <span className={`material-symbols-outlined text-sm ${notif.status === 'GRANTED' ? 'text-green-400' : 'text-red-400'}`}>
                                {notif.status === 'GRANTED' ? 'check_circle' : 'cancel'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-on-surface/90 mb-1 leading-relaxed">
                                Your access request for <span className="font-bold text-primary">{getProductTitle(notif.documentName)}</span> has been <strong className={notif.status === 'GRANTED' ? 'text-green-400' : 'text-red-400'}>{notif.status === 'GRANTED' ? 'Approved' : 'Rejected'}</strong>.
                              </p>
                              <p className="text-[10px] text-on-surface/40">
                                {formatNotifDate(notif.processedDate, notif.requestDate)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-on-surface-variant text-xs">
                          No updates on your requests yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-10 dark:bg-white/10 bg-black/10 animate-pulse rounded-full" />
            ) : isLoggedIn ? (
              <div className="group/profile flex items-center gap-3 dark:bg-white/5 bg-black/5 dark:hover:bg-white/10 hover:bg-black/10 pl-2 pr-1 py-1 rounded-full border dark:border-white/10 border-black/10 dark:hover:border-white/20 hover:border-black/20 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
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
                  <p className="text-on-surface text-xs font-bold truncate">
                    {displayName}
                  </p>
                  {displayEmail && (
                    <p className="text-on-surface-variant group-hover/profile:text-on-surface transition-colors text-[10px] truncate">{displayEmail}</p>
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
            className="lg:hidden text-on-surface p-2 dark:hover:bg-white/10 hover:bg-black/10 rounded-lg transition-colors"
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
            className="lg:hidden dark:bg-black/95 bg-white/95 backdrop-blur-md border-t dark:border-white/10 border-black/10 overflow-hidden"
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
                      : 'text-on-surface-variant hover:text-on-surface dark:hover:bg-white/5 hover:bg-black/5'
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
                  <div className="h-20 dark:bg-white/10 bg-black/10 animate-pulse rounded-xl" />
                  <div className="h-12 dark:bg-white/10 bg-black/10 animate-pulse rounded-full" />
                </div>
              ) : isLoggedIn ? (
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 dark:bg-white/5 bg-black/5 rounded-xl">
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
                      <p className="text-on-surface text-sm font-medium">
                        {displayName}
                      </p>
                      {displayEmail && (
                        <p className="text-on-surface-variant text-xs truncate">
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
                  className="block text-center mt-4 bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold px-6 py-3 rounded-full transition-all shadow-md"
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
'use client';

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { allSensors } from '@/data/products';
import ModelViewer from '@/components/ModelViewer';

// LazyModel removed for performance (rendering static images instead)

function TiltCard({ children, href }: { children: React.ReactNode, href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-full cursor-pointer relative group"
    >
      <Link href={href}>
        {/* Glow behind the card that activates on hover */}
        <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>

        <div
          className="bg-surface-container h-full rounded-2xl border border-white/5 overflow-hidden flex flex-col group-hover:border-white/20 transition-colors shadow-xl group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]"
          style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </Link>
    </motion.div>
  );
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = allSensors.filter(item => {
    const fullTitle = `${item.title.trim()} ${item.highlightText.trim()}`.replace(/\s+/g, ' ');
    return fullTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedItems = filteredItems;

  return (
    <div className="relative flex flex-col min-h-screen bg-surface text-on-surface">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ambient-glow-2 opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ambient-glow-1 opacity-30"></div>
      </div>

      <main className="relative z-10 flex-grow pt-40 pb-32">
        <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tighter text-white drop-shadow-2xl">
              Cutting-Edge<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent [text-shadow:0_0_1px_rgba(255,255,255,0.3)]">Products</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-on-surface-variant font-medium max-w-2xl mx-auto mb-12">
              Explore our range of high-performance sensors, boards, and development kits designed for robust Cyber Physical Systems.
            </p>

            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative group">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors z-10">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, spec, or application..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-surface-container/80 backdrop-blur-xl border border-white/10 rounded-full py-5 pl-14 pr-6 text-white text-lg placeholder-white/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all font-body shadow-2xl relative z-0"
              />
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-8">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 text-on-surface-variant font-body text-xl bg-surface-container/30 rounded-3xl border border-white/5"
            >
              No products match your search. Try different keywords.
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item, index) => {
                  const fullTitle = `${item.title.trim()} ${item.highlightText.trim()}`.replace(/\s+/g, ' ');
                  const slug = fullTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                  return (
                    <TiltCard key={slug + index} href={`/products/${slug}`}>
                      <div className="h-60 bg-gradient-to-br from-gray-400 to-gray-500 relative overflow-hidden flex items-center justify-center transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <img
                          src={`/${item.imagePath}`}
                          alt={fullTitle}
                          className="w-full h-full object-contain transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 drop-shadow-xl relative z-10"
                        />
                        
                        {/* 3D Available Badge */}
                        {((item as any).modelPath || item.imagePath.toLowerCase().endsWith('.glb')) && (
                          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 z-20 shadow-lg">
                            <span className="material-symbols-outlined text-primary text-[14px]">3d_rotation</span>
                            <span className="text-[10px] font-bold text-white tracking-widest uppercase">3D</span>
                          </div>
                        )}
                      </div>
                      <div
                        className="p-8 flex flex-col flex-grow bg-gradient-to-b from-surface-container to-[#111827] relative z-20"
                        style={{ transform: "translateZ(40px)" }}
                      >
                        <h3 className="font-headline text-xl font-bold text-white mb-3 line-clamp-2 leading-tight drop-shadow-sm">
                          {fullTitle}
                        </h3>
                        <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-8 flex-grow">
                          {item.subtitle}
                        </p>
                        <div className="w-full py-3 rounded-xl bg-primary/10 text-primary font-label font-bold text-center text-sm group-hover:bg-primary transition-all group-hover:text-white uppercase tracking-wider relative overflow-hidden shadow-inner border border-primary/20">
                          <span className="relative z-10">Read More</span>
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
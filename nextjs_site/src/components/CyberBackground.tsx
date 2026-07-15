'use client';

import { motion } from 'framer-motion';

export default function CyberBackground({ variant = 'primary' }: { variant?: 'primary' | 'secondary' | 'tertiary' }) {
  const themes = {
    primary: {
      bg: 'bg-background',
      gridColor: '56, 189, 248',
      dot1: 'bg-blue-400 shadow-[0_0_12px_rgba(56,189,248,1)]',
      dot2: 'bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,1)]',
      glow1: 'bg-blue-500/10',
      glow2: 'bg-indigo-500/10'
    },
    secondary: {
      bg: 'bg-surface-container',
      gridColor: '167, 139, 250',
      dot1: 'bg-purple-400 shadow-[0_0_12px_rgba(167,139,250,1)]',
      dot2: 'bg-purple-300 shadow-[0_0_10px_rgba(196,181,253,1)]',
      glow1: 'bg-purple-500/10',
      glow2: 'bg-fuchsia-500/10'
    },
    tertiary: {
      bg: 'bg-surface-container',
      gridColor: '52, 211, 153',
      dot1: 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]',
      dot2: 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,1)]',
      glow1: 'bg-emerald-500/10',
      glow2: 'bg-teal-500/10'
    }
  };

  const t = themes[variant];

  // Adjust timing and paths slightly per variant for a more organic feel
  const path1 = variant === 'secondary' 
    ? { x: [0, -100, -100, 0, 0], y: [0, 50, 50, 0, 0] } 
    : variant === 'tertiary' 
      ? { x: [0, 80, 80, 0, 0], y: [0, -60, -60, 0, 0] }
      : { x: [0, 120, 120, 0, 0], y: [0, 0, -80, -80, 0] };

  const path2 = variant === 'secondary'
    ? { x: [0, 80, 80, 0, 0], y: [0, 0, -80, -80, 0] }
    : variant === 'tertiary'
      ? { x: [0, -60, -60, 0, 0], y: [0, 60, 60, 0, 0] }
      : { x: [0, -100, -100, 0, 0], y: [0, 0, 100, 100, 0] };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden w-full h-full ${t.bg}`}>
      {/* Futuristic Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(${t.gridColor}, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(${t.gridColor}, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 80%)'
        }}
      />

      {/* Translating Grid Effect for movement */}
      <motion.div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(${t.gridColor}, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(${t.gridColor}, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 30% 70%, black 10%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at 30% 70%, black 10%, transparent 60%)'
        }}
      />

      {/* Floating Network Nodes (IoT/CPS vibe) */}
      <motion.div
        className={`absolute w-2 h-2 rounded-full blur-[1px] ${t.dot1}`}
        animate={{
          ...path1,
          scale: [1, 1.5, 1, 1.5, 1],
          opacity: [0, 1, 1, 1, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ top: '60%', left: '30%' }}
      />
      <motion.div
        className={`absolute w-1.5 h-1.5 rounded-full blur-[1px] ${t.dot2}`}
        animate={{
          ...path2,
          scale: [1, 1.2, 1, 1.2, 1],
          opacity: [0, 0.8, 0.8, 0.8, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          delay: 2
        }}
        style={{ top: '40%', right: '30%' }}
      />

      {/* Soft abstract data glow */}
      <motion.div
        className={`absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px] z-0 pointer-events-none ${t.glow1}`}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 30, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-[100px] z-0 pointer-events-none ${t.glow2}`}
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -30, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}


'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ label, value, icon: Icon, color }: StatsCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-surface-container/80 backdrop-blur-xl border border-white/5 p-6 rounded-2xl flex items-center gap-6 shadow-xl relative overflow-hidden group"
    >
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h4 className="font-label text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mb-1 opacity-70">
          {label}
        </h4>
        <p className="font-headline text-2xl font-black text-white drop-shadow-sm">
          {value}
        </p>
      </div>
      
      {/* Decorative background glow */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[40px] opacity-10 ${color}`}></div>
    </motion.div>
  );
}

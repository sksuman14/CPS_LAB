
'use client';

import { motion } from 'framer-motion';

export type FilterStatus = 'ALL' | 'PENDING' | 'GRANTED' | 'REVOKED' | 'REJECTED';

interface StatusFilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Granted', value: 'GRANTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Revoked', value: 'REVOKED' },
];

export default function StatusFilter({ currentFilter, onFilterChange }: StatusFilterProps) {
  return (
    <div className="flex bg-surface-container-low border border-white/5 p-1 rounded-2xl md:min-w-[400px] overflow-hidden">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`relative px-4 py-2.5 rounded-xl font-label text-[10px] uppercase tracking-widest font-bold flex-grow transition-all flex items-center justify-center`}
        >
          {currentFilter === filter.value && (
            <motion.div 
              layoutId="filter-pill"
              className="absolute inset-0 bg-primary/20 border border-primary/20"
              style={{ borderRadius: '0.75rem' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className={`relative z-10 ${currentFilter === filter.value ? 'text-primary' : 'text-on-surface-variant hover:text-white'}`}>
            {filter.label}
          </span>
        </button>
      ))}
    </div>
  );
}

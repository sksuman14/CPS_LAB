'use client';

import React from 'react';

interface BreadboardProps {
  type: 'half' | 'full' | 'mini';
  rotation?: number;
  isSelected?: boolean;
}

export default function Breadboard({ type = 'half', rotation = 0, isSelected = false }: BreadboardProps) {
  const width = type === 'full' ? 640 : type === 'half' ? 440 : 280;
  const height = 180;
  const cols = type === 'full' ? 60 : type === 'half' ? 30 : 17;

  return (
    <div
      className={`relative rounded-xl p-3 bg-[#fdfdfd] border-2 shadow-lg select-none transition-all ${
        isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-300'
      }`}
      style={{
        width,
        height,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Silkscreen text */}
      <div className="absolute top-2 left-4 text-[10px] font-bold text-slate-400 tracking-wider">
        {type === 'full' ? 'FULL BREADBOARD (830 TIE-POINTS)' : type === 'half' ? 'HALF BREADBOARD (400 TIE-POINTS)' : 'MINI BREADBOARD'}
      </div>

      {/* Top Power Rails (+ and -) */}
      <div className="mt-4 flex flex-col gap-1 border-b border-slate-200 pb-2">
        {/* Red + Rail */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-rose-500 w-3">+</span>
          <div className="flex-1 flex justify-between px-1">
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={`p-plus-${i}`}
                className="w-2 h-2 rounded-full bg-slate-300 hover:bg-rose-400 transition-colors cursor-pointer border border-slate-400/50"
                title={`Power + (Rail Pin ${i + 1})`}
              />
            ))}
          </div>
        </div>

        {/* Blue - Rail */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-blue-500 w-3">-</span>
          <div className="flex-1 flex justify-between px-1">
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={`p-minus-${i}`}
                className="w-2 h-2 rounded-full bg-slate-300 hover:bg-blue-400 transition-colors cursor-pointer border border-slate-400/50"
                title={`GND - (Rail Pin ${i + 1})`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Strips (ABCDE) */}
      <div className="my-1.5 flex flex-col gap-1">
        {['a', 'b', 'c', 'd', 'e'].map((row) => (
          <div key={`row-${row}`} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase w-3">{row}</span>
            <div className="flex-1 flex justify-between px-1">
              {Array.from({ length: cols }).map((_, i) => (
                <div
                  key={`hole-${row}-${i}`}
                  className="w-2 h-2 rounded-sm bg-slate-200 hover:bg-amber-400 transition-colors cursor-pointer border border-slate-400/40"
                  title={`Pin ${row.toUpperCase()}${i + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Central Divider Notch */}
      <div className="w-full h-2 bg-slate-200/80 rounded my-1 border-t border-b border-slate-300 flex items-center justify-center">
        <span className="text-[8px] font-mono text-slate-400 tracking-widest">CPS LAB PROTOTYPE CHANNEL</span>
      </div>

      {/* Terminal Strips (FGHIJ) */}
      <div className="my-1.5 flex flex-col gap-1">
        {['f', 'g', 'h', 'i', 'j'].map((row) => (
          <div key={`row-${row}`} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase w-3">{row}</span>
            <div className="flex-1 flex justify-between px-1">
              {Array.from({ length: cols }).map((_, i) => (
                <div
                  key={`hole-${row}-${i}`}
                  className="w-2 h-2 rounded-sm bg-slate-200 hover:bg-amber-400 transition-colors cursor-pointer border border-slate-400/40"
                  title={`Pin ${row.toUpperCase()}${i + 1}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

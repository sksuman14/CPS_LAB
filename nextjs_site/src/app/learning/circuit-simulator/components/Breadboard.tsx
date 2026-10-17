'use client';

import React from 'react';

interface BreadboardProps {
  instanceId?: string;
  type: 'half' | 'full' | 'mini';
  rotation?: number;
  isSelected?: boolean;
  onPinClick?: (pinId: string, relX: number, relY: number, label: string) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export default function Breadboard({
  instanceId = 'bb-1',
  type = 'half',
  rotation = 0,
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: BreadboardProps) {
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
            {Array.from({ length: cols }).map((_, i) => {
              const pinKey = `${instanceId}:p_plus_${i}`;
              const isSelectedPin = selectedPinId === pinKey;
              const isConnected = connectedPinIds.includes(pinKey);

              return (
                <div
                  key={`p-plus-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const bounds = e.currentTarget.getBoundingClientRect();
                    onPinClick?.(pinKey, 20 + i * ((width - 40) / cols), 28, `Power + (${i + 1})`);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer border ${
                    isSelectedPin
                      ? 'bg-sky-400 border-white ring-2 ring-sky-400 scale-125'
                      : isConnected
                      ? 'bg-rose-500 border-rose-600 ring-1 ring-rose-400'
                      : 'bg-slate-300 hover:bg-rose-400 border-slate-400/50'
                  }`}
                  title={`Power + (Rail Pin ${i + 1})`}
                />
              );
            })}
          </div>
        </div>

        {/* Blue - Rail */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-blue-500 w-3">-</span>
          <div className="flex-1 flex justify-between px-1">
            {Array.from({ length: cols }).map((_, i) => {
              const pinKey = `${instanceId}:p_minus_${i}`;
              const isSelectedPin = selectedPinId === pinKey;
              const isConnected = connectedPinIds.includes(pinKey);

              return (
                <div
                  key={`p-minus-${i}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPinClick?.(pinKey, 20 + i * ((width - 40) / cols), 42, `GND - (${i + 1})`);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer border ${
                    isSelectedPin
                      ? 'bg-sky-400 border-white ring-2 ring-sky-400 scale-125'
                      : isConnected
                      ? 'bg-blue-600 border-blue-700 ring-1 ring-blue-400'
                      : 'bg-slate-300 hover:bg-blue-400 border-slate-400/50'
                  }`}
                  title={`GND - (Rail Pin ${i + 1})`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Terminal Strips (ABCDE) */}
      <div className="my-1.5 flex flex-col gap-1">
        {['a', 'b', 'c', 'd', 'e'].map((row, rIdx) => (
          <div key={`row-${row}`} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase w-3">{row}</span>
            <div className="flex-1 flex justify-between px-1">
              {Array.from({ length: cols }).map((_, i) => {
                const pinKey = `${instanceId}:${row}_${i}`;
                const isSelectedPin = selectedPinId === pinKey;
                const isConnected = connectedPinIds.includes(pinKey);

                return (
                  <div
                    key={`hole-${row}-${i}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick?.(pinKey, 20 + i * ((width - 40) / cols), 65 + rIdx * 10, `${row.toUpperCase()}${i + 1}`);
                    }}
                    className={`w-2.5 h-2.5 rounded-xs transition-all cursor-pointer border ${
                      isSelectedPin
                        ? 'bg-sky-400 border-white ring-2 ring-sky-400 scale-125'
                        : isConnected
                        ? 'bg-emerald-500 border-emerald-600 ring-1 ring-emerald-400'
                        : 'bg-slate-200 hover:bg-amber-400 border-slate-400/40'
                    }`}
                    title={`Pin ${row.toUpperCase()}${i + 1}`}
                  />
                );
              })}
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
        {['f', 'g', 'h', 'i', 'j'].map((row, rIdx) => (
          <div key={`row-${row}`} className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-400 uppercase w-3">{row}</span>
            <div className="flex-1 flex justify-between px-1">
              {Array.from({ length: cols }).map((_, i) => {
                const pinKey = `${instanceId}:${row}_${i}`;
                const isSelectedPin = selectedPinId === pinKey;
                const isConnected = connectedPinIds.includes(pinKey);

                return (
                  <div
                    key={`hole-${row}-${i}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPinClick?.(pinKey, 20 + i * ((width - 40) / cols), 130 + rIdx * 10, `${row.toUpperCase()}${i + 1}`);
                    }}
                    className={`w-2.5 h-2.5 rounded-xs transition-all cursor-pointer border ${
                      isSelectedPin
                        ? 'bg-sky-400 border-white ring-2 ring-sky-400 scale-125'
                        : isConnected
                        ? 'bg-emerald-500 border-emerald-600 ring-1 ring-emerald-400'
                        : 'bg-slate-200 hover:bg-amber-400 border-slate-400/40'
                    }`}
                    title={`Pin ${row.toUpperCase()}${i + 1}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

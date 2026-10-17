'use client';

import React from 'react';
import Link from 'next/link';
import { CPSSensorDefinition, SensorPin } from '../data/cpsSensors';

interface SensorModuleCardProps {
  sensor: CPSSensorDefinition;
  instanceId: string;
  position: { x: number; y: number };
  values?: Record<string, any>;
  onValueChange?: (instanceId: string, key: string, value: any) => void;
  onPinClick: (instanceId: string, pin: SensorPin) => void;
  onRemove: (instanceId: string) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
  isSimulating?: boolean;
}

export default function SensorModuleCard({
  sensor,
  instanceId,
  position,
  onPinClick,
  onRemove,
  selectedPinId,
  connectedPinIds = [],
  isSimulating = false,
}: SensorModuleCardProps) {
  // Format image path safely
  const imageSrc = sensor.imagePath.startsWith('/')
    ? sensor.imagePath
    : `/${sensor.imagePath}`;

  return (
    <div
      className="absolute bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md w-[300px] overflow-hidden select-none group transition-shadow hover:shadow-cyan-500/10 hover:border-cyan-500/40"
      style={{ left: position.x, top: position.y }}
    >
      {/* 1. Sensor Header (Height: 52px) */}
      <div className="h-[52px] flex items-center justify-between px-3.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0">
            {sensor.icon}
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 truncate">
              <span className="truncate">{sensor.title}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono shrink-0">
                CPS Lab
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 truncate">{sensor.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/products/${sensor.productSlug}`}
            target="_blank"
            title="View Product Datasheet"
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
          <button
            onClick={() => onRemove(instanceId)}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Remove from Canvas"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* 2. Sensor Product Photo Container (Height: 160px) */}
      <div className="h-[160px] relative bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/90 border-b border-slate-800/80 flex items-center justify-center p-3 overflow-hidden group/img">
        {/* Subtle grid backdrop pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56, 189, 248, 0.3) 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }}
        />

        {/* Real Product Photo */}
        <img
          src={imageSrc}
          alt={sensor.title}
          className="max-h-[136px] max-w-[250px] w-auto h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] group-hover/img:scale-105 transition-transform duration-300 pointer-events-none"
          onError={(e) => {
            // Fallback image if file not found
            (e.target as HTMLImageElement).src = '/assets/images/blegateway.png';
          }}
        />

        {/* Category Pill */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-[9px] font-mono text-cyan-300 backdrop-blur-sm shadow">
          {sensor.category}
        </div>

        {/* Simulation Active Status */}
        {isSimulating && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-400 flex items-center gap-1 backdrop-blur-sm shadow animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            LIVE
          </div>
        )}
      </div>

      {/* 3. Connector Pinout Section (Height: 68px, Pin Socket center at Y = 244px) */}
      <div className="h-[68px] relative bg-slate-950/90 px-2 pt-1.5 pb-2">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
          Connector Pinout (Click to Wire)
        </div>

        {/* Pins Row placed with exact percentage left to match canvas coordinate wire calculation */}
        <div className="relative h-9 w-full">
          {sensor.pins.map((pin) => {
            const isPinSelected = selectedPinId === `${instanceId}:${pin.id}`;
            const isConnected = connectedPinIds.includes(`${instanceId}:${pin.id}`);

            return (
              <div
                key={pin.id}
                onClick={() => onPinClick(instanceId, pin)}
                style={{ left: `${pin.x}%`, transform: 'translateX(-50%)' }}
                className={`absolute top-0 flex flex-col items-center cursor-pointer group/pin p-0.5 rounded-lg transition-all ${
                  isPinSelected
                    ? 'bg-cyan-500/20 ring-2 ring-cyan-400'
                    : isConnected
                    ? 'bg-emerald-500/10'
                    : 'hover:bg-slate-800/80'
                }`}
                title={`Connect ${pin.name} (Suggested MCU: ${pin.suggestedMcuPin || 'Any'})`}
              >
                {/* Pin Terminal Socket */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    isPinSelected
                      ? 'border-white bg-cyan-400 scale-125 shadow-[0_0_10px_#38bdf8]'
                      : isConnected
                      ? 'border-emerald-400 bg-emerald-500 shadow-[0_0_8px_#22c55e]'
                      : 'border-slate-500 bg-slate-800 group-hover/pin:border-cyan-400'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>

                <span
                  className={`text-[9px] font-bold font-mono tracking-tight mt-0.5 ${
                    isPinSelected
                      ? 'text-cyan-400'
                      : isConnected
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {pin.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

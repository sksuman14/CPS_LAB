'use client';

import React from 'react';
import Link from 'next/link';
import { CPSSensorDefinition, SensorPin } from '../data/cpsSensors';

interface SensorModuleCardProps {
  sensor: CPSSensorDefinition;
  instanceId: string;
  position: { x: number; y: number };
  values: Record<string, any>;
  onValueChange: (instanceId: string, key: string, value: any) => void;
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
  values,
  onValueChange,
  onPinClick,
  onRemove,
  selectedPinId,
  connectedPinIds = [],
  isSimulating = false,
}: SensorModuleCardProps) {
  const currentRead = sensor.readFormula(values);

  return (
    <div
      className="absolute bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md w-[300px] overflow-visible select-none group transition-shadow hover:shadow-cyan-500/10 hover:border-cyan-500/40"
      style={{ left: position.x, top: position.y }}
    >
      {/* Sensor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-xl">
            {sensor.icon}
          </span>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              {sensor.title}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                CPS Lab
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 line-clamp-1">{sensor.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
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

      {/* Sensor Interactive Controls */}
      <div className="p-4 space-y-3 bg-slate-900/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex justify-between items-center">
          <span>Physical Environment Input</span>
          {isSimulating && (
            <span className="flex items-center gap-1 text-emerald-400 font-mono animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live ADC
            </span>
          )}
        </div>

        {sensor.controls.map((control) => {
          const val = values[control.key] ?? sensor.defaultValues[control.key];

          if (control.type === 'slider') {
            return (
              <div key={control.key} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{control.label}</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {val} {control.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={val}
                  onChange={(e) =>
                    onValueChange(instanceId, control.key, parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                />
              </div>
            );
          }

          if (control.type === 'toggle') {
            return (
              <div key={control.key} className="flex items-center justify-between py-1">
                <span className="text-xs font-medium text-slate-300">{control.label}</span>
                <button
                  type="button"
                  onClick={() => onValueChange(instanceId, control.key, !val)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    val
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  {val ? 'ACTIVE / ON' : 'OFF'}
                </button>
              </div>
            );
          }

          if (control.type === 'button') {
            return (
              <div key={control.key} className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onValueChange(instanceId, control.key, true);
                    // increment total tips if rain gauge
                    if (instanceId.includes('rain') || sensor.id === 'rain-gauge') {
                      onValueChange(instanceId, 'totalTips', (values.totalTips || 0) + 1);
                    }
                    setTimeout(() => {
                      onValueChange(instanceId, control.key, false);
                    }, 400);
                  }}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                  {control.label}
                </button>
              </div>
            );
          }

          return null;
        })}

        {/* Real-time Telemetry Preview */}
        {isSimulating && (
          <div className="mt-2 p-2 rounded-lg bg-black/50 border border-slate-800 text-[10px] font-mono text-emerald-400 line-clamp-2">
            {currentRead.serialString || `ADC: ${currentRead.analogVal ?? 'N/A'}`}
          </div>
        )}
      </div>

      {/* Pin Connection Header at Bottom */}
      <div className="px-4 py-3 bg-slate-950/80 border-t border-slate-800 rounded-b-2xl">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Connector Pinout (Click to Wire)
        </div>
        <div className="flex items-center justify-around gap-2">
          {sensor.pins.map((pin) => {
            const isPinSelected = selectedPinId === `${instanceId}:${pin.id}`;
            const isConnected = connectedPinIds.includes(`${instanceId}:${pin.id}`);

            return (
              <div
                key={pin.id}
                onClick={() => onPinClick(instanceId, pin)}
                className={`flex flex-col items-center gap-1 cursor-pointer group/pin relative p-1 rounded-lg transition-all ${
                  isPinSelected
                    ? 'bg-cyan-500/20 ring-2 ring-cyan-400'
                    : isConnected
                    ? 'bg-emerald-500/10'
                    : 'hover:bg-slate-800'
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
                  className={`text-[9px] font-bold font-mono tracking-tight ${
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

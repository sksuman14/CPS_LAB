'use client';

import React, { useState } from 'react';
import { CPSSensorDefinition } from '../data/cpsSensors';
import { WireConnection } from './WiresLayer';

interface CodeAndTerminalPanelProps {
  activeCode: string;
  onCodeChange?: (code: string) => void;
  serialLogs: string[];
  onClearLogs: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSim: () => void;
  placedSensors: { instanceId: string; sensor: CPSSensorDefinition }[];
  wires: WireConnection[];
}

export default function CodeAndTerminalPanel({
  activeCode,
  onCodeChange,
  serialLogs,
  onClearLogs,
  isSimulating,
  onToggleSimulate,
  onResetSim,
  placedSensors,
  wires,
}: CodeAndTerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<'serial' | 'code' | 'bom'>('serial');
  const [serialInput, setSerialInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-l border-slate-800 select-none">
      {/* Top Simulation Control Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSimulate}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isSimulating ? 'pause' : 'play_arrow'}
            </span>
            {isSimulating ? 'Pause Simulation' : 'Run Simulation'}
          </button>

          <button
            onClick={onResetSim}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset Board & Simulation"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isSimulating ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <span className={isSimulating ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {isSimulating ? 'SIMULATION RUNNING' : 'STOPPED'}
          </span>
        </div>
      </div>

      {/* Panel Navigation Tabs */}
      <div className="flex items-center px-3 border-b border-slate-800 bg-slate-900/60">
        <button
          onClick={() => setActiveTab('serial')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'serial'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">terminal</span>
          Serial Monitor
          {serialLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-400 font-mono">
              {serialLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'code'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">code</span>
          Arduino Sketch (.ino)
        </button>

        <button
          onClick={() => setActiveTab('bom')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'bom'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          CPS Parts & BOM ({placedSensors.length + 1})
        </button>
      </div>

      {/* Tab 1: Serial Monitor */}
      {activeTab === 'serial' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
          <div className="p-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-400">
              Baud: <span className="text-cyan-400 font-bold">9600 baud</span> | COM Port: <span className="text-emerald-400">Virtual CPS MCU</span>
            </span>
            <button
              onClick={onClearLogs}
              className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              Clear Output
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 text-slate-300 select-text">
            {serialLogs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center text-xs">
                No serial data yet. Click &quot;Run Simulation&quot; to begin polling the virtual hardware.
              </div>
            ) : (
              serialLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed hover:bg-slate-900/40 px-1 rounded flex gap-2">
                  <span className="text-slate-600 select-none text-[10px] w-8">{idx + 1}</span>
                  <span className={log.includes('ALERT') || log.includes('EVENT') ? 'text-amber-400 font-bold' : log.includes('---') ? 'text-cyan-400' : 'text-emerald-400'}>
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-900/40 flex gap-2">
            <input
              type="text"
              placeholder="Send command to Serial (e.g., READ, CALIBRATE)..."
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && serialInput.trim()) {
                  serialLogs.push(`> User: ${serialInput}`);
                  setSerialInput('');
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={() => {
                if (serialInput.trim()) {
                  serialLogs.push(`> User: ${serialInput}`);
                  setSerialInput('');
                }
              }}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Arduino Sketch Code */}
      {activeTab === 'code' && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]">
          <div className="p-2 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Sketch: <span className="text-white font-bold">CPS_Sensors_Demo.ino</span>
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-xs">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy Sketch'}
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre select-text">
            {activeCode}
          </div>
        </div>
      )}

      {/* Tab 3: BOM / Bill of Materials */}
      {activeTab === 'bom' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950 text-xs">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Bill of Materials (BOM)</h4>
            <p className="text-slate-400 text-xs">
              List of CPS Lab products currently placed in this simulated circuit.
            </p>
          </div>

          <div className="space-y-2">
            {/* Arduino Board Entry */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-white text-xs">Arduino Uno Rev3 (Virtual MCU)</h5>
                <p className="text-[10px] text-slate-400">Microcontroller Processing Unit • 16MHz ATmega328P</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">QTY: 1</span>
            </div>

            {/* Placed Sensors Entries */}
            {placedSensors.map((item, idx) => (
              <div
                key={item.instanceId}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-white text-xs flex items-center gap-2">
                    {item.sensor.title}
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {item.sensor.category}
                    </span>
                  </h5>
                  <p className="text-[10px] text-slate-400">{item.sensor.subtitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-cyan-400 font-bold block">QTY: 1</span>
                  <a
                    href={`/products/${item.sensor.productSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Datasheet ↗
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Wire Connections List */}
          <div className="pt-2">
            <h5 className="font-bold text-slate-300 text-xs mb-2">
              Active Wire Connections ({wires.length})
            </h5>
            {wires.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">No wires connected yet. Click any sensor pin then an Arduino pin to wire.</p>
            ) : (
              <div className="space-y-1 font-mono text-[11px]">
                {wires.map((w, idx) => (
                  <div key={w.id} className="p-1.5 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">
                      #{idx + 1} <span className="text-white font-bold">{w.from.id}</span> ➔ <span className="text-white font-bold">{w.to.id}</span>
                    </span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: w.color }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

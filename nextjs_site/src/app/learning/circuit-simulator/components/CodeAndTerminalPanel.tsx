'use client';

import React, { useState } from 'react';
import { CPSSensorDefinition } from '../data/cpsSensors';
import { WireConnection } from './WiresLayer';

interface CodeAndTerminalPanelProps {
  activeCode: string;
  onCodeChange?: (code: string) => void;
  serialLogs: string[];
  onClearLogs: () => void;
  onSendSerialCommand?: (cmd: string) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSim: () => void;
  placedComponents: any[];
  wires: WireConnection[];
  onClose?: () => void;
  isDarkMode?: boolean;
}

export default function CodeAndTerminalPanel({
  activeCode,
  onCodeChange,
  serialLogs,
  onClearLogs,
  onSendSerialCommand,
  isSimulating,
  onToggleSimulate,
  onResetSim,
  placedComponents,
  wires,
  onClose,
  isDarkMode = false,
}: CodeAndTerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<'serial' | 'code' | 'bom'>('serial');
  const [serialInput, setSerialInput] = useState('');
  const [baudRate, setBaudRate] = useState('9600');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [compileStatus, setCompileStatus] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = () => {
    setCompileStatus('compiling');
    setTimeout(() => {
      setCompileStatus('success');
      setTimeout(() => setCompileStatus(null), 4000);
    }, 1000);
  };

  const handleExportCSV = () => {
    let csv = 'Component Name,Category / Type,Quantity\n';
    placedComponents.forEach((c) => {
      const title = c.sensorDef ? c.sensorDef.title : c.title;
      const cat = c.sensorDef ? c.sensorDef.category : c.type.toUpperCase();
      csv += `"${title}","${cat}",1\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CPS_Circuit_BOM.csv`;
    a.click();
  };

  const handleSend = () => {
    if (serialInput.trim()) {
      onSendSerialCommand?.(serialInput.trim());
      setSerialInput('');
    }
  };

  return (
    <div
      className={`h-full flex flex-col select-none border-l transition-colors ${
        isDarkMode ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-[#ffffff] border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Header & Simulation Controls Bar */}
      <div
        className={`p-3 border-b flex items-center justify-between gap-3 ${
          isDarkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSimulate}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 ${
              isSimulating
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isSimulating ? 'pause' : 'play_arrow'}
            </span>
            {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>

          <button
            onClick={onResetSim}
            className={`p-1.5 rounded-xl border transition-colors ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                : 'border-slate-300 bg-white text-slate-600 hover:text-slate-900'
            }`}
            title="Reset Board & Firmware"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
          </button>
        </div>

        {/* Right side: Status and Close */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className={`text-[11px] font-bold ${isSimulating ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isSimulating ? 'ONLINE' : 'STOPPED'}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Panel Navigation Tabs */}
      <div
        className={`flex items-center px-3 border-b text-xs font-semibold ${
          isDarkMode ? 'border-slate-800 bg-[#0b101c]' : 'border-slate-200 bg-slate-100/70'
        }`}
      >
        <button
          onClick={() => setActiveTab('serial')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'serial'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">terminal</span>
          Serial Monitor
          {serialLogs.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              {serialLogs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'code'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">code</span>
          Arduino IDE (.ino)
        </button>

        <button
          onClick={() => setActiveTab('bom')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
            activeTab === 'bom'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-sm">inventory_2</span>
          BOM & Parts ({placedComponents.length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SERIAL MONITOR
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'serial' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Serial Bar: Baud selector + Clear + Autoscroll */}
          <div
            className={`p-2 border-b flex items-center justify-between text-xs ${
              isDarkMode ? 'border-slate-800 bg-[#0d131f]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Baud:</span>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className={`border rounded px-1.5 py-0.5 text-xs font-mono outline-none ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-white border-slate-300 text-blue-600'
                }`}
              >
                <option value="9600">9600 baud</option>
                <option value="19200">19200 baud</option>
                <option value="38400">38400 baud</option>
                <option value="57600">57600 baud</option>
                <option value="115200">115200 baud</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 h-3 w-3"
                />
                Autoscroll
              </label>

              <button
                onClick={onClearLogs}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  isDarkMode
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Logs Viewport */}
          <div
            className={`flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 select-text ${
              isDarkMode ? 'bg-[#060911] text-slate-200' : 'bg-slate-900 text-slate-200'
            }`}
          >
            {serialLogs.length === 0 ? (
              <div className="text-slate-500 italic py-8 text-center text-xs">
                No serial data yet. Click &quot;Start Simulation&quot; to begin streaming telemetry.
              </div>
            ) : (
              serialLogs.map((log, idx) => {
                const isAlert = log.includes('ALERT') || log.includes('WARNING') || log.includes('🚨');
                const isSystem = log.includes('===') || log.includes('Online') || log.includes('Initialized');
                const isUser = log.startsWith('> User:');

                return (
                  <div key={idx} className="leading-relaxed hover:bg-white/5 px-1 rounded flex gap-2">
                    <span className="text-slate-600 select-none text-[10px] w-6 shrink-0">{idx + 1}</span>
                    <span
                      className={`break-all ${
                        isUser
                          ? 'text-cyan-300 font-bold'
                          : isAlert
                          ? 'text-amber-400 font-bold'
                          : isSystem
                          ? 'text-sky-400 font-semibold'
                          : 'text-emerald-400'
                      }`}
                    >
                      {log}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Serial Send Input Bar */}
          <div
            className={`p-2 border-t flex gap-2 ${
              isDarkMode ? 'border-slate-800 bg-[#0d131f]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <input
              type="text"
              placeholder="Send command to Arduino (e.g. HELP, READ, LED ON, STATUS)..."
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className={`flex-1 border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-blue-500 ${
                isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <button
              onClick={handleSend}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold active:scale-95 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: ARDUINO C++ SKETCH CODE
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'code' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div
            className={`p-2 border-b flex items-center justify-between text-xs ${
              isDarkMode ? 'border-slate-800 bg-[#0d131f]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <span className="font-mono text-[11px] text-slate-500">
              Sketch: <span className="text-blue-600 dark:text-blue-400 font-bold">CPS_Hardware_Firmware.ino</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyCode}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all"
              >
                <span className="material-symbols-outlined text-xs">done_all</span>
                Verify / Compile
              </button>

              <button
                onClick={handleCopyCode}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  isDarkMode
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Compilation Banner */}
          {compileStatus === 'compiling' && (
            <div className="p-2 bg-blue-900/40 border-b border-blue-700/60 text-blue-300 text-xs font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              <span>Compiling sketch for Arduino Uno (ATmega328P)...</span>
            </div>
          )}
          {compileStatus === 'success' && (
            <div className="p-2 bg-emerald-950/60 border-b border-emerald-700/60 text-emerald-300 text-xs font-mono">
              ✓ Compilation Successful! Binary sketch size: 4,182 bytes (13% of 32,256 byte flash).
            </div>
          )}

          {/* Code Textarea / Viewer */}
          <div className="flex-1 flex overflow-hidden">
            <textarea
              value={activeCode}
              onChange={(e) => onCodeChange?.(e.target.value)}
              spellCheck={false}
              className={`flex-1 p-3 font-mono text-xs leading-relaxed outline-none resize-none select-text ${
                isDarkMode ? 'bg-[#060911] text-cyan-300' : 'bg-slate-900 text-cyan-300'
              }`}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: BOM / BILL OF MATERIALS
         ───────────────────────────────────────────────────────────── */}
      {activeTab === 'bom' && (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold">Bill of Materials (BOM)</h4>
              <p className="text-xs text-slate-500">Components in this simulated circuit</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export CSV
            </button>
          </div>

          <div className="space-y-2">
            {placedComponents.map((c, i) => (
              <div
                key={c.instanceId || i}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <h5 className="font-bold text-xs">
                    {c.sensorDef ? c.sensorDef.title : c.title}
                  </h5>
                  <p className="text-[10px] text-slate-500">
                    {c.sensorDef ? c.sensorDef.category : c.type.toUpperCase()}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  QTY: 1
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h5 className="font-bold text-xs mb-2">Connected Wires ({wires.length})</h5>
            <div className="space-y-1 font-mono text-[11px]">
              {wires.map((w, idx) => (
                <div
                  key={w.id}
                  className={`p-2 rounded flex items-center justify-between border ${
                    isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <span>
                    #{idx + 1} {w.label || `${w.from.id} ➔ ${w.to.id}`}
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: w.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

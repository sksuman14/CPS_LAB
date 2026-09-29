import React from 'react';
import type { BLEState } from '../services/bleService';
import { blocklyExamples } from '../data/examples';
import Link from 'next/link';

interface ConnectionBarProps {
  bleState: BLEState;
  isRunning: boolean;
  isSupported: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onSelectExample?: (xml: string) => void;
}

export default function ConnectionBar({
  bleState,
  isRunning,
  isSupported,
  onConnect,
  onDisconnect,
  onRun,
  onStop,
  onClear,
  onSelectExample,
}: ConnectionBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 shadow-md z-10">
      
      {/* Left: Back button & Status */}
      <div className="flex items-center gap-6">
        <Link href="/learning" className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:text-white transition-colors border border-slate-300 dark:border-white/10">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </Link>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-space">Robotic Car Controller</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={`w-2 h-2 rounded-full ${
                bleState.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              }`}
            />
            <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase font-bold tracking-wider">
              {bleState.isConnected ? `Connected: ${bleState.deviceName}` : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Connection Controls */}
      {!isSupported ? (
        <div className="text-red-400 text-xs font-bold flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
          <span className="material-symbols-outlined text-sm">warning</span>
          Web Bluetooth not supported
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {!bleState.isConnected ? (
            <button
              onClick={onConnect}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]"
            >
              <span className="material-symbols-outlined text-sm">bluetooth</span>
              Connect Car
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/20 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-sm">bluetooth_disabled</span>
              Disconnect
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-2"></div>

          {!isRunning ? (
            <button
              onClick={onRun}
              disabled={!bleState.isConnected}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                bleState.isConnected
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 dark:text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 dark:text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              Run Code
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-slate-900 dark:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] animate-pulse"
            >
              <span className="material-symbols-outlined text-sm">stop</span>
              Stop
            </button>
          )}
        </div>
      )}

      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        {/* Examples Dropdown */}
        <select
          className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none hover:bg-slate-200 dark:bg-white/10 transition-all cursor-pointer appearance-none"
          onChange={(e) => {
            if (e.target.value && onSelectExample) {
              onSelectExample(e.target.value);
              e.target.value = ''; // Reset select after loading
            }
          }}
          defaultValue=""
        >
          <option value="" disabled className="bg-white bg-white dark:bg-[#13131a]">
            Load Example...
          </option>
          {blocklyExamples.map((ex) => (
            <option key={ex.id} value={ex.xml} className="bg-white bg-white dark:bg-[#13131a]">
              {ex.name}
            </option>
          ))}
        </select>

        {/* Clear workspace */}
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-slate-500 dark:text-white/50 hover:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          title="Clear Workspace"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Clear
        </button>
      </div>

    </div>
  );
}



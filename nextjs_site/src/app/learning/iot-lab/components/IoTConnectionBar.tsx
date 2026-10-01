import React from 'react';
import type { SerialState } from '../services/serialService';
import Link from 'next/link';

interface IoTConnectionBarProps {
  serialState: SerialState;
  isRunning: boolean;
  isSupported: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRun: () => void;
  onStop: () => void;
  onClear: () => void;
  onSelectExample?: (xml: string) => void;
  examples: {id: string, name: string, xml: string}[];
}

export default function IoTConnectionBar({
  serialState,
  isRunning,
  isSupported,
  onConnect,
  onDisconnect,
  onRun,
  onStop,
  onClear,
  onSelectExample,
    examples,
}: IoTConnectionBarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 shadow-md z-10">
      
      <div className="flex items-center gap-6">
        <Link href="/learning" className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:text-white transition-colors border border-slate-300 dark:border-white/10">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </Link>
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-space">IoT Sensor Dashboard</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={`w-2 h-2 rounded-full ${
                serialState.isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              }`}
            />
            <span className="text-[10px] text-slate-500 dark:text-white/50 uppercase font-bold tracking-wider">
              {serialState.isConnected ? `Connected: ${serialState.portName}` : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {!isSupported ? (
        <div className="text-red-400 text-xs font-bold flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
          <span className="material-symbols-outlined text-sm">warning</span>
          Web Serial not supported
        </div>
      ) : (
        <div className="flex items-center gap-2">


          {!isRunning ? (
            <button
              onClick={onRun}
              title="Run"
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all bg-emerald-500 hover:bg-emerald-400 text-slate-900 dark:text-white shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]"
            >
              <span className="material-symbols-outlined text-lg">play_arrow</span>
            </button>
          ) : (
            <button
              onClick={onStop}
              title="Stop"
              className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-400 text-slate-900 dark:text-white rounded-full transition-all shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)] animate-pulse"
            >
              <span className="material-symbols-outlined text-lg">stop</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <select
          className="bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none hover:bg-slate-200 dark:bg-white/10 transition-all cursor-pointer appearance-none"
          onChange={(e) => {
            if (e.target.value && onSelectExample) {
              onSelectExample(e.target.value);
              e.target.value = ''; 
            }
          }}
          defaultValue=""
        >
          <option value="" disabled className="bg-white bg-white dark:bg-[#13131a]">
            Load Template...
          </option>
          {examples.map((ex) => (
            <option key={ex.id} value={ex.xml} className="bg-white bg-white dark:bg-[#13131a]">
              {ex.name}
            </option>
          ))}
        </select>

        {serialState.isConnected && (
          <button
            onClick={onDisconnect}
            title="Force Disconnect Hardware"
            className="flex items-center gap-1 text-orange-500 dark:text-orange-400/70 hover:text-orange-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">usb_off</span>
            Unplug
          </button>
        )}
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-slate-500 dark:text-white/50 hover:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
          Clear
        </button>
        <Link
          href="/docs/iot_lab_tutorial.html"
          target="_blank"
          className="flex items-center gap-1 text-slate-500 dark:text-white/50 hover:text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/30"
          title="Open Step-by-Step Document"
        >
          <span className="material-symbols-outlined text-sm">menu_book</span>
          Tutorial
        </Link>
      </div>

    </div>
  );
}



'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import CodePreview from './components/CodePreview';
import ConnectionBar from './components/ConnectionBar';
import type { CodeLanguages } from './components/BlocklyEditor';
import {
  connectCar,
  disconnectCar,
  sendCommand,
  onBLEStateChange,
  isWebBluetoothSupported,
  type BLEState,
} from './services/bleService';

const BlocklyEditor = dynamic(() => import('./components/BlocklyEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-50 bg-slate-50 dark:bg-[#0a0a10]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-sm font-space tracking-wide">Initializing workspace...</p>
      </div>
    </div>
  ),
});

export default function BlockCodingPage() {
  const [code, setCode] = useState<CodeLanguages>({ javascript: '', python: '', cpp: '', java: '' });
  const [bleState, setBleState] = useState<BLEState>({ isConnected: false, deviceName: null, error: null });
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const abortRef = useRef(false);
  const workspaceRef = useRef<any>(null);
  const [exampleXml, setExampleXml] = useState<string | null>(null);

  const [isSupported, setIsSupported] = useState(true); // Assume true for SSR to match initial client render

  React.useEffect(() => {
    onBLEStateChange((state) => {
      setBleState(state);
    });
    setIsSupported(isWebBluetoothSupported());
  }, []);

  const handleConnect = useCallback(async () => {
    setBleState((prev) => ({ ...prev, error: null }));
    await connectCar();
  }, []);

  const handleDisconnect = useCallback(async () => {
    await disconnectCar();
  }, []);

  const log = useCallback((message: string) => {
    setConsoleOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
    setShowConsole(true);
  }, []);

  const handleRun = useCallback(async () => {
    if (!bleState.isConnected) {
      setBleState((prev) => ({
        ...prev,
        error: 'Connect to the car first!',
      }));
      return;
    }

    setIsRunning(true);
    abortRef.current = false;
    setConsoleOutput([]);
    setShowConsole(true);
    log('▶ Program started');

    try {
      const sleep = (seconds: number) =>
        new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(resolve, seconds * 1000);
          const check = setInterval(() => {
            if (abortRef.current) {
              clearTimeout(timeout);
              clearInterval(check);
              reject(new Error('Program stopped'));
            }
          }, 100);
          setTimeout(() => clearInterval(check), seconds * 1000 + 100);
        });

      const carAPI = {
        move: async (dir: string, duration: number) => {
          if (abortRef.current) throw new Error('Program stopped');
          log(`🚗 Moving ${dir} for ${duration}s`);
          const cmd = dir === 'Forward' ? 'F' : dir === 'Backward' ? 'B' : dir === 'Left' ? 'L' : 'R';
          await sendCommand(cmd);
          await sleep(duration);
          await sendCommand('S');
        },
        stop: async () => {
          if (abortRef.current) throw new Error('Program stopped');
          log('🛑 Stopping');
          await sendCommand('S');
        },
        setSpeed: async (speed: number) => {
          if (abortRef.current) throw new Error('Program stopped');
          log(`🏎️ Speed set to ${speed}`);
          await sendCommand(speed.toString());
        },
        wait: async (seconds: number) => {
          if (abortRef.current) throw new Error('Program stopped');
          log(`⏱️ Waiting ${seconds}s`);
          await sleep(seconds);
        },
        connect: async () => {
          log('🔗 Connecting to car...');
          await connectCar();
          log('✅ Connected!');
        },
        disconnect: async () => {
          log('🔌 Disconnecting...');
          await disconnectCar();
          log('Disconnected');
        },
        sendCommand: async (cmd: string) => {
          if (abortRef.current) throw new Error('Program stopped');
          log(`📡 Sending custom command: ${cmd}`);
          await sendCommand(cmd);
        }
      };

      // Wrap and execute the user's generated JavaScript code
      const fn = new Function('car', `return (async () => { \n${code.javascript}\n })();`);
      await fn(carAPI);
      
      log('✅ Program completed!');
    } catch (err: any) {
      if (err.message === 'Program stopped') {
        log('⏹ Program stopped by user');
        try { await sendCommand('S'); } catch {}
      } else {
        log(`❌ Error: ${err.message}`);
      }
    } finally {
      setIsRunning(false);
    }
  }, [code.javascript, bleState.isConnected, log]);

  const handleStop = useCallback(async () => {
    abortRef.current = true;
    try { await sendCommand('S'); } catch {}
    setIsRunning(false);
  }, []);

  const handleClear = useCallback(() => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      setCode({ javascript: '', python: '', cpp: '', java: '' });
      setExampleXml(null);
      localStorage.removeItem('cps_blockly_workspace');
    }
  }, []);

  const handleSelectExample = useCallback((xml: string) => {
    setExampleXml(xml);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ConnectionBar
        bleState={bleState}
        isRunning={isRunning}
        isSupported={isSupported}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRun={handleRun}
        onStop={handleStop}
        onClear={handleClear}
        onSelectExample={handleSelectExample}
      />

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-[65] h-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative">
          <BlocklyEditor
            onCodeChange={setCode}
            exampleXml={exampleXml}
            onWorkspaceReady={(ws) => { workspaceRef.current = ws; }}
          />
        </div>

        <div className="flex-[35] h-full flex flex-col gap-4">
          <div className={`${showConsole ? 'flex-[60]' : 'flex-1'} overflow-hidden`}>
            <CodePreview code={code} />
          </div>

          {showConsole && (
            <div className="flex-[40] flex flex-col bg-slate-50 bg-slate-50 dark:bg-[#0a0a10] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-white bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-sm">terminal</span>
                  <span className="text-slate-900 dark:text-white text-xs font-bold font-space uppercase tracking-wider">Console Output</span>
                </div>
                <button onClick={() => { setShowConsole(false); setConsoleOutput([]); }} className="text-slate-600 dark:text-slate-400 dark:text-white/40 hover:text-slate-900 dark:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-loose bg-slate-50 bg-slate-50 dark:bg-[#0a0a10]">
                {consoleOutput.map((line, i) => (
                  <div key={i} className={`${line.includes('❌') ? 'text-red-400' : line.includes('✅') ? 'text-emerald-400' : line.includes('📡') ? 'text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AccessGate from '@/components/AccessGate';
import CodePreview from '../block-coding/components/CodePreview';
import IoTConnectionBar from './components/IoTConnectionBar';
import { IoTAnimationWidget } from './components/IoTAnimationWidget';
import { getDynamicExamples } from './data/examples';
import type { CodeLanguages } from '../block-coding/components/BlocklyEditor';
import {
  connectSerial,
  disconnectSerial,
  onSerialStateChange,
  onSensorData,
  isWebSerialSupported,
  restartDevice,
  type SerialState,
} from './services/serialService';


const SENSOR_KIT = [
  { name: "Soil Spectra", protocol: "RS485", sensor: "Soil Sensor", icon: "emoji_nature" },
  { name: "Rain Gauge", protocol: "ADC", sensor: "Rain Gauge", icon: "rainy" },
  { name: "Radiation Shield", protocol: "I2C", sensor: "Weather Shield", icon: "wb_sunny" },
  { name: "Ultrasonic Anemometer", protocol: "RS485", sensor: "Wind Sensor", icon: "air" },
  { name: "AHT20", protocol: "I2C", sensor: "AHT20", icon: "device_thermostat" },
  { name: "STTS751", protocol: "I2C", sensor: "STTS751", icon: "thermometer" },
  { name: "STS30", protocol: "I2C", sensor: "STS30", icon: "thermometer" },
  { name: "LIS3DH", protocol: "I2C", sensor: "LIS3DH", icon: "3d_rotation" },
  { name: "LIS2DH", protocol: "I2C", sensor: "LIS2DH", icon: "crop_free" },
  { name: "VCNL4040", protocol: "I2C", sensor: "VCNL4040", icon: "light_mode" },
  { name: "VEML7700", protocol: "I2C", sensor: "VEML7700", icon: "lightbulb" },
  { name: "SEN66", protocol: "I2C", sensor: "SEN66", icon: "blur_on" }
];

const IoTBlocklyEditor = dynamic(() => import('./components/IoTBlocklyEditor'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-slate-50 bg-slate-50 dark:bg-[#0a0a10] text-slate-600 dark:text-slate-400 font-space text-sm">Loading IoT Editor...</div>,
});

export default function IoTLabPage() {
  const [code, setCode] = useState<CodeLanguages>({ javascript: '', python: '', cpp: '', java: '' });
  const [serialState, setSerialState] = useState<SerialState>({ isConnected: false, portName: null, error: null });
  const [isRunning, setIsRunning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [exampleXml, setExampleXml] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState(SENSOR_KIT[4]);
  const [animations, setAnimations] = useState<Record<string, number>>({});
  const [customUI, setCustomUI] = useState({ active: false, height: 50, color: '#3b82f6', text: 'Custom Widget' });
  const activeLogicRef = useRef<((sensor: any) => Promise<void>) | null>(null);
  const dynamicExamples = getDynamicExamples(selectedSensor.name);
  const intervalsRef = useRef<number[]>([]);
  const sensorStateRef = useRef<any>({});

      React.useEffect(() => {
      onSerialStateChange((newState) => {
        setSerialState(prevState => {
          if (newState.isConnected && !prevState.isConnected) {
            setConsoleOutput([`Connected to USB Serial Device at 115200 baud`]);
          } else if (!newState.isConnected && prevState.isConnected) {
            setConsoleOutput(out => [...out.slice(-49), `Disconnected from USB Serial Device`]);
          }
          return newState;
        });
      });
      setIsSupported(isWebSerialSupported());

    // Wire up the live data feed to our running logic
    onSensorData(async (data) => {
        Object.assign(sensorStateRef.current, data);
      // Always show raw data in console to prove it works
      // (We limit array size to avoid memory leaks)
      const textToPrint = data.raw !== undefined ? data.raw : (typeof data === 'object' ? JSON.stringify(data) : String(data));
        setConsoleOutput(prev => [...prev.slice(-49), textToPrint]);
      
      // If deployed, run the blockly logic
      if (activeLogicRef.current) {
        try {
          await activeLogicRef.current(data);
        } catch (e: any) {
          setConsoleOutput(prev => [...prev.slice(-49), `[Error] Logic Error: ${e.message}`]);
        }
      }
    });
  }, []);

  const handleConnect = useCallback(async () => {
    await connectSerial();
  }, []);

  
    const handleDisconnect = useCallback(async () => {
      await disconnectSerial();
      intervalsRef.current.forEach(id => window.clearInterval(id));
      intervalsRef.current = [];
      setIsRunning(false);
    setAnimations({});
    setCustomUI({ active: false, height: 50, color: '#3b82f6', text: 'Custom Widget' });

    activeLogicRef.current = null;
  }, []);

  const log = useCallback((val: any) => {
    setConsoleOutput(prev => [...prev.slice(-49), String(val)]);
  }, []);

  const alertDashboard = useCallback((val: any) => {
    setConsoleOutput(prev => [...prev.slice(-49), `[ALERT] ${val}`]);
    // Native browser alert as a fun physical feedback
    setTimeout(() => alert(`Sensor Alert: ${val}`), 10);
  }, []);


  const animateDashboard = useCallback((type: string, value: number) => {
    setAnimations(prev => ({ ...prev, [type]: value }));
  }, []);

  const updateCustomUI = useCallback((updates: Partial<{height: number, color: string, text: string}>) => {
    setCustomUI(prev => ({ ...prev, active: true, ...updates }));
  }, []);

  const handleRun = useCallback(async () => {
    try {
      setIsRunning(true);
      setConsoleOutput(prev => [...prev, `[System] Logic deploying...`]);

      const executable = `
        ${code.javascript}
      `;
      
      const factory = new Function('log', 'alert', 'animate', 'connect', 'disconnect', 'onData', 'setInterval', 'restartDevice', 'getSensor', 'updateCustomUI', `return (async () => { \n${executable}\n })();`);
      
      
        const safeSetInterval = (fn: any, ms: number) => {
          const id = window.setInterval(fn, ms);
          intervalsRef.current.push(id as unknown as number);
          return id;
        };
        
        await factory(log, alertDashboard, animateDashboard, connectSerial, disconnectSerial, (handler: any) => {

          activeLogicRef.current = handler;
          setConsoleOutput(prev => [...prev, `[System] Sensor listener registered.`]);
        }, safeSetInterval, restartDevice, (key: string) => sensorStateRef.current[key], updateCustomUI);
      
    } catch (e: any) {
      setConsoleOutput(prev => [...prev, `[Error] Compilation Error: ${e.message}`]);
      setIsRunning(false);
    setAnimations({});
    setCustomUI({ active: false, height: 50, color: '#3b82f6', text: 'Custom Widget' });
    }
  }, [code.javascript, log, alertDashboard]);

  
    const handleStop = useCallback(() => {
      activeLogicRef.current = null;
      intervalsRef.current.forEach(id => window.clearInterval(id));
      intervalsRef.current = [];
      setIsRunning(false);
    setAnimations({});
    setCustomUI({ active: false, height: 50, color: '#3b82f6', text: 'Custom Widget' });

    setConsoleOutput(prev => [...prev, `[System] Logic stopped.`]);
  }, []);

  const handleClear = useCallback(() => {
    setCode({ javascript: '', python: '', cpp: '', java: '' });
    setExampleXml(null);
  }, []);

  const handleSelectExample = useCallback((xml: string) => {
    setExampleXml(xml);
  }, []);

  return (
    <AccessGate accessKey="IOT_LAB" moduleName="IoT Sensor Lab" gradient="from-blue-500 to-cyan-400" icon="sensors">
    <div className="flex flex-col h-screen overflow-hidden">
      <IoTConnectionBar
        examples={dynamicExamples}
        serialState={serialState}
        isRunning={isRunning}
        isSupported={isSupported}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onRun={handleRun}
        onStop={handleStop}
        onClear={handleClear}
        onSelectExample={handleSelectExample}
      />

      
        <div className="flex-none bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5 shadow-sm p-4 overflow-x-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-indigo-500">inventory_2</span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase font-space tracking-wider">Your Sensor Kit</h2>
          </div>
          <div className="flex gap-3">
            {SENSOR_KIT.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelectedSensor(s)}
                className={`flex-none flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${selectedSensor.name === s.name ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedSensor.name === s.name ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-200 dark:bg-white/10'}`}>
                  <span className="material-symbols-outlined text-sm">{s.icon}</span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold font-space uppercase tracking-wide">{s.name}</div>
                  <div className="text-[10px] opacity-70 font-mono">Protocol: {s.protocol}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-[65] h-full rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl relative">
          <IoTBlocklyEditor 
            onCodeChange={setCode} 
            exampleXml={exampleXml}
          />
        </div>

        <div className="flex-[35] h-full flex flex-col gap-4">
          <div className="flex-[50] overflow-hidden">
            <CodePreview code={code} />
          </div>

                    {Object.keys(animations).length > 0 && (
            <div className="flex-none p-4 bg-slate-50 dark:bg-[#0a0a10] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(animations).map(([type, value]) => (
                  <IoTAnimationWidget key={type} type={type} value={value} />
                ))}
              </div>
            </div>
          )}

          {customUI.active && (
            <div className="flex-none p-4 bg-slate-50 dark:bg-[#0a0a10] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl mt-4">
              <div className="flex flex-col items-center justify-center p-4 h-48 w-full bg-slate-100 dark:bg-[#13131a] rounded-xl relative overflow-hidden border border-slate-200 dark:border-white/5">
                <div className="absolute top-2 left-4 text-xs font-bold text-slate-500 font-space tracking-wider uppercase z-20">Student UI Builder</div>
                <div className="z-20 text-3xl font-black text-slate-800 dark:text-white drop-shadow-md">{customUI.text}</div>
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out shadow-[0_-5px_15px_rgba(0,0,0,0.1)] z-10"
                  style={{ height: `${customUI.height}%`, backgroundColor: customUI.color }}
                />
              </div>
            </div>
          )}
          <div className="flex-[50] flex flex-col bg-slate-50 dark:bg-[#0a0a10] border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-white bg-white dark:bg-[#13131a] border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-sm">terminal</span>
                <span className="text-slate-900 dark:text-white text-xs font-bold font-space uppercase tracking-wider">Live Sensor Data</span>
              </div>
              <button onClick={() => setConsoleOutput([])} className="text-slate-600 dark:text-slate-400 dark:text-white/40 hover:text-slate-900 dark:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed bg-slate-50 bg-slate-50 dark:bg-[#0a0a10]">
              {consoleOutput.length === 0 && (
                <div className="text-slate-700 dark:text-slate-300 dark:text-white/20 h-full flex items-center justify-center font-space">
                  Awaiting connection...
                </div>
              )}
              {consoleOutput.map((line, i) => (
                <div key={i} className={`${line.includes('❌') ? 'text-red-400' : line.includes('⚠️') ? 'text-amber-400 font-bold' : line.includes('📝') ? 'text-blue-400' : 'text-emerald-400/70'}`}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AccessGate>
  );
}


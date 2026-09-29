import React from 'react';

interface AnimationWidgetProps {
  type: string;
  value: number;
}

export function IoTAnimationWidget({ type, value }: AnimationWidgetProps) {
  // Normalize value between 0 and 100 for visual scaling
  const getPercentage = (val: number, min: number, max: number) => {
    return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
  };

  const containerClass = "flex flex-col items-center justify-center p-4 h-56 w-full max-w-xs mx-auto bg-white dark:bg-[#13131a] rounded-xl relative overflow-hidden shadow-sm border border-slate-200 dark:border-white/5";

  if (type === 'heat') {
    const height = getPercentage(value, 0, 50);
    return (
      <div className={containerClass}>
        <div className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 font-space tracking-wider uppercase z-20">Temperature</div>
        <div className="absolute top-2 right-4 text-lg font-black text-slate-800 dark:text-white tracking-tighter z-20">{value.toFixed(1)}°C</div>
        
        <div className="w-10 h-28 bg-slate-100 dark:bg-white/5 rounded-full relative flex items-end p-1 shadow-inner border border-slate-200 dark:border-white/10 mt-6 z-10">
          <div 
            className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ height: `${height}%` }}
          />
        </div>
        
        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full -mt-4 border-4 border-white dark:border-[#13131a] z-10 shadow-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-lg">device_thermostat</span>
        </div>
      </div>
    );
  }

  if (type === 'humidity') {
    const height = getPercentage(value, 0, 100);
    return (
      <div className={containerClass}>
        <div className="absolute top-3 left-4 text-[10px] font-bold text-blue-400 font-space tracking-wider uppercase z-20">Humidity</div>
        <div className="absolute top-2 right-4 text-lg font-black text-slate-800 dark:text-white tracking-tighter z-20 drop-shadow-md">{value.toFixed(1)}%</div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 opacity-90 transition-all duration-700 ease-in-out flex items-top justify-center" style={{ height: `${height}%` }}>
          <div className="w-full h-4 bg-blue-300/30 rounded-t-full -mt-2 blur-sm"></div>
        </div>
        
        <div className="absolute bottom-4 z-10">
          <span className="material-symbols-outlined text-white text-3xl opacity-50">water_drop</span>
        </div>
      </div>
    );
  }

  if (type === 'rain') {
    const intensity = getPercentage(value, 0, 100);
    const drops = Math.floor(intensity / 10) + 1;
    
    return (
      <div className={containerClass + " !bg-slate-900"}>
        <div className="absolute top-3 left-4 text-[10px] font-bold text-blue-400 font-space tracking-wider uppercase z-20">Rain Gauge</div>
        <div className="absolute top-2 right-4 text-lg font-black text-white tracking-tighter z-20">{value.toFixed(1)} mm</div>
        
        <div className="flex gap-3 mt-8 h-24 items-end z-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 rounded-full bg-blue-400 transition-all duration-200 ${i < drops ? 'animate-bounce' : 'opacity-20'}`}
              style={{ 
                height: i < drops ? `${Math.random() * 60 + 40}%` : '20%',
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>
        <div className="w-full h-8 bg-blue-500/20 absolute bottom-0 rounded-b-xl border-t border-blue-500/30" />
      </div>
    );
  }

  if (type === 'wind') {
    const speed = Math.max(0.5, value / 5);
    const duration = 2 / speed; 
    
    return (
      <div className={containerClass + " !bg-sky-50 dark:!bg-sky-950/20"}>
        <div className="absolute top-3 left-4 text-[10px] font-bold text-sky-600 dark:text-sky-400 font-space tracking-wider uppercase z-20">Wind Speed</div>
        <div className="absolute top-2 right-4 text-lg font-black text-slate-800 dark:text-white tracking-tighter z-20">{value.toFixed(1)} m/s</div>
        
        <div className="relative flex items-center justify-center w-24 h-24 mt-4 z-10">
          <div 
            className="absolute w-20 h-20 text-sky-500 flex items-center justify-center"
            style={{ animation: `spin ${duration}s linear infinite` }}
          >
            <span className="material-symbols-outlined text-[5rem] leading-none absolute">mode_fan</span>
          </div>
          <div className="w-2 h-16 bg-slate-300 dark:bg-slate-700 absolute top-16 rounded-b-lg" />
        </div>
      </div>
    );
  }

  if (type === 'led') {
    const isOn = value > 0.5;
    return (
      <div className={containerClass + " !bg-slate-900"}>
        <div className="absolute top-3 left-4 text-[10px] font-bold text-yellow-500 font-space tracking-wider uppercase z-20">Smart LED</div>
        <div className="absolute top-2 right-4 text-lg font-black text-white tracking-tighter z-20">{isOn ? 'ON' : 'OFF'}</div>
        
        <div className={`w-16 h-16 rounded-full mt-4 flex items-center justify-center z-10 transition-all duration-300 ${isOn ? 'bg-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.6)]' : 'bg-slate-800 border-2 border-slate-700'}`}>
          <span className={`material-symbols-outlined text-3xl ${isOn ? 'text-white' : 'text-slate-600'}`}>lightbulb</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 font-space text-sm">
      <span className="material-symbols-outlined mr-2 animate-pulse">query_stats</span>
      Waiting for visualization data...
    </div>
  );
}

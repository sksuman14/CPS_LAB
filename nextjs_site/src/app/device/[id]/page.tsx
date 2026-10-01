'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Cpu, Clock, CalendarDays, Droplets, Thermometer, Wind, Gauge, Sun, Wifi, Battery, Signal, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import CyberBackground from '@/components/CyberBackground';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const API_KEY = 'Annam@2025';

function formatDateForApi(date: Date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

function getWindDirectionStr(deg: number) {
  if (deg === null || deg === undefined) return '';
  const arr = ["North", "NNE", "NE", "ENE", "East", "ESE", "SE", "SSE", "South", "SSW", "SW", "WSW", "West", "WNW", "NW", "NNW"];
  return `${deg}° ${arr[Math.floor((deg / 22.5) + 0.5) % 16]}`;
}

function voltageToPercent(voltage: number): number {
  if (voltage <= 0) return 0;
  return Math.round(((voltage - 2.8) / (4.2 - 2.8)) * 100 * 10) / 10;
}

function getBatteryInfo(voltage: number): { color: string; label: string; pct: number } {
  const pct = Math.min(100, Math.max(0, voltageToPercent(voltage)));
  if (voltage >= 3.8) return { color: '#22c55e', label: 'Good',    pct };
  if (voltage >= 3.5) return { color: '#f97316', label: 'Low',     pct };
  return                      { color: '#ef4444', label: 'Critical', pct };
}

function getSignalInfo(dbm: number): { color: string; bars: number; label: string } {
  if (dbm > -60) return { color: '#22c55e', bars: 4, label: 'Excellent' };
  if (dbm > -75) return { color: '#22c55e', bars: 3, label: 'Good'      };
  if (dbm > -90) return { color: '#f97316', bars: 2, label: 'Fair'      };
  return                { color: '#ef4444', bars: 1, label: 'Weak'      };
}

const METRICS = [
  { key: 'CurrentTemperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: '#f97316' },
  { key: 'CurrentHumidity', label: 'Humidity', unit: '%', icon: Droplets, color: '#3b82f6' },
  { key: 'LightIntensity', label: 'Light Intensity', unit: 'Lux', icon: Sun, color: '#06b6d4' },
  { key: 'AtmPressure', label: 'Atm Pressure', unit: 'hPa', icon: Gauge, color: '#a855f7' },
  { key: 'RainfallHourly', label: 'Rainfall', unit: 'mm', icon: Droplets, color: '#6366f1' },
  { key: 'WindSpeed', label: 'Wind', unit: 'm/s', icon: Wind, color: '#10b981' },
];

const PERIODS = [
  { label: '7 Days', days: 7 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
];

export default function DeviceGraphPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const deviceId = decodeURIComponent(params.id as string);
  const apiType = searchParams.get('api') || 'cps';
  const topic = searchParams.get('topic') || '';
  const location = searchParams.get('location') || 'Unknown Location';

  const [periodDays, setPeriodDays] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
  );
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let sDate, eDate;
      if (periodDays === 0) {
        const d = new Date(selectedDate);
        sDate = formatDateForApi(d);
        eDate = formatDateForApi(d);
      } else {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - periodDays);
        sDate = formatDateForApi(start);
        eDate = formatDateForApi(end);
      }
      
      const baseUrl = apiType === 'polytechnic' 
        ? 'https://gtk47vexob.execute-api.us-east-1.amazonaws.com/polytechnicdata'
        : 'https://gtk47vexob.execute-api.us-east-1.amazonaws.com/cpsdata';
        
      const numericIdMatch = deviceId.match(/\d+/);
      const numericId = numericIdMatch ? parseInt(numericIdMatch[0], 10).toString() : deviceId;
        
      const url = `${baseUrl}?deviceid=${encodeURIComponent(numericId)}&startdate=${sDate}&enddate=${eDate}&key=${API_KEY}`;
      
      const res = await fetch(url);
      const json = await res.json();
      
      if (json && Array.isArray(json.items)) {
        const sorted = json.items.sort((a: any, b: any) => 
          new Date(a.TimeStamp).getTime() - new Date(b.TimeStamp).getTime()
        );
        setData(sorted);
      } else {
        setData([]);
      }
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [deviceId, apiType, periodDays, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  // Sanitize data for the graph so 0s don't cause massive drops
  const chartData = useMemo(() => {
    return data.map(d => {
      const copy = { ...d };
      if (copy.CurrentHumidity === 0) copy.CurrentHumidity = null;
      if (copy.CurrentTemperature === 0) copy.CurrentTemperature = null;
      if (copy.AtmPressure === 0) copy.AtmPressure = null;
      return copy;
    });
  }, [data]);

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-hidden">
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 pt-28 pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{deviceId}</h1>
                {latest?.FirmwareVersion && (
                  <span className="text-xs text-slate-400 dark:text-white/30 font-mono">v{latest.FirmwareVersion}</span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-white/50">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-white/50">Last active: {latest ? new Date(latest.TimeStamp).toLocaleString() : 'N/A'}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {latest?.SignalStrength != null && (() => {
                const sig = getSignalInfo(latest.SignalStrength);
                return (
                  <div className="flex items-center gap-1.5" title={`Signal: ${latest.SignalStrength} dBm (${sig.label})`}>
                    {/* Signal bars */}
                    <div className="flex items-end gap-[2px] h-4">
                      {[1,2,3,4].map(b => (
                        <div
                          key={b}
                          className="w-[3px] rounded-sm transition-all"
                          style={{
                            height: `${b * 25}%`,
                            backgroundColor: b <= sig.bars ? sig.color : 'rgba(255,255,255,0.15)',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: sig.color }}>{latest.SignalStrength} dBm</span>
                  </div>
                );
              })()}
              {latest?.BatteryVoltage != null && (() => {
                const bat = getBatteryInfo(latest.BatteryVoltage);
                return (
                  <div className="flex items-center gap-1.5" title={`Battery: ${latest.BatteryVoltage}V (${bat.pct}%)`}>
                    {/* Battery icon */}
                    <div className="relative flex items-center">
                      <div className="w-6 h-3.5 rounded-[3px] border-2 flex items-center px-[2px]" style={{ borderColor: bat.color }}>
                        <div
                          className="h-[7px] rounded-[1px] transition-all"
                          style={{ width: `${bat.pct}%`, backgroundColor: bat.color, maxWidth: '100%' }}
                        />
                      </div>
                      {/* battery tip nub */}
                      <div className="w-[3px] h-[6px] rounded-r-sm ml-[1px]" style={{ backgroundColor: bat.color }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: bat.color }}>{bat.pct.toFixed(0)}%</span>
                  </div>
                );
              })()}
              <button onClick={fetchData} className="text-slate-400 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {METRICS.map(m => {
            const val = latest?.[m.key];
            const hasVal = val !== null && val !== undefined;
            
            // Calculate Min/Max skipping nulls
            const validData = data.map(d => d[m.key]).filter(v => typeof v === 'number' && !isNaN(v));
            const min = validData.length > 0 ? Math.min(...validData) : null;
            const max = validData.length > 0 ? Math.max(...validData) : null;

            return (
              <div
                key={m.key}
                className="relative rounded-2xl overflow-hidden group cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ boxShadow: `0 0 0 1px ${m.color}30, 0 4px 24px ${m.color}18` }}
              >
                {/* Glowing gradient background */}
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${m.color}22 0%, ${m.color}08 60%, transparent 100%)` }} />
                <div className="absolute inset-0 bg-surface-container" style={{ opacity: 0.85 }} />

                {/* Colored top border */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}60)` }} />

                {/* Big glow orb */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" style={{ backgroundColor: m.color }} />

                {/* Content */}
                <div className="relative z-10 p-5 flex flex-col h-36">
                  {/* Label row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${m.color}25` }}>
                      <m.icon className="w-4 h-4" style={{ color: m.color }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/60">{m.label}</span>
                  </div>
                  
                  {/* Main value */}
                  <p className="text-2xl font-black leading-none mb-1 text-slate-800 dark:text-white">
                    {hasVal ? Number(val).toFixed(2) : <span className="text-slate-400 dark:text-white/30">--</span>}
                    <span className="text-sm font-semibold ml-1.5" style={{ color: m.color }}>{m.unit}</span>
                  </p>
                  
                  {/* Subtext */}
                  <div className="mt-auto">
                    {m.key === 'WindSpeed' ? (
                      <span className="text-[11px] font-semibold" style={{ color: m.color }}>{getWindDirectionStr(latest?.WindDirection)}</span>
                    ) : m.key === 'RainfallHourly' ? (
                      <span className="text-[11px] font-semibold" style={{ color: m.color }}>Total: {hasVal ? Number(val).toFixed(2) : '0.00'} mm</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <ChevronDown className="w-3 h-3 text-sky-500" />
                          <span className="text-[10px] font-mono text-sky-500">{min !== null ? min.toFixed(2) : '--'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChevronUp className="w-3 h-3 text-rose-500" />
                          <span className="text-[10px] font-mono text-rose-500">{max !== null ? max.toFixed(2) : '--'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-transparent w-fit mb-6">
          <div className="relative">
            <input 
              type="date"
              value={selectedDate}
              onClick={(e) => {
                try {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                } catch (err) {}
              }}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setPeriodDays(0);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className={`px-5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center pointer-events-none border ${
              periodDays === 0 ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-container text-white/50 border-white/5'
            }`}>
              {new Date(selectedDate).toLocaleDateString('en-GB')}
            </div>
          </div>
          
          {PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriodDays(p.days)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition border ${
                periodDays === p.days ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-container text-white/50 hover:text-white border-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container rounded-2xl border border-white/10">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-white/50 text-sm">Fetching sensor data...</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-20 bg-surface-container rounded-2xl border border-white/10">
            <p className="text-white/50 font-bold">No data available for this period.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {METRICS.map(m => {
              // Only render chart if there's data for this metric
              const hasData = chartData.some(d => d[m.key] !== null && d[m.key] !== undefined);
              if (!hasData) return null;

              return (
                <div key={m.key} className="p-6 rounded-2xl bg-surface-container border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-6">
                    <m.icon className="w-5 h-5" style={{ color: m.color }} />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{m.label} Trend</h3>
                  </div>
                  
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={m.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={m.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="TimeStamp" 
                          stroke="rgba(255,255,255,0.2)" 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return periodDays === 0 ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
                          }}
                        />
                        <YAxis 
                          stroke="rgba(255,255,255,0.2)" 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const dataPoint = payload[0].payload;
                              const val = payload[0].value;
                              return (
                                <div className="bg-surface-container-high border border-white/10 p-3 rounded-xl shadow-xl">
                                  <p className="text-white/50 text-xs mb-1">{label ? new Date(label).toLocaleString() : ''}</p>
                                  <p style={{ color: m.color }} className="font-bold text-sm">
                                    {m.label}: {val !== null ? Number(val).toFixed(2) : '--'} {m.unit}
                                  </p>
                                  {m.key === 'WindSpeed' && dataPoint.WindDirection !== undefined && dataPoint.WindDirection !== null && (
                                    <p className="text-white/70 text-xs mt-1">
                                      Direction: {getWindDirectionStr(dataPoint.WindDirection)}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey={m.key} 
                          stroke={m.color} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill={`url(#gradient-${m.key})`} 
                          isAnimationActive={false}
                          connectNulls={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

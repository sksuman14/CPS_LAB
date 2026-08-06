'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Thermometer,
  Droplets,
  Activity,
  Wifi,
  RefreshCw,
  Calendar,
  Search,
  Download,
  ArrowUpDown,
  AlertTriangle,
  Database,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Plus,
  Trash2,
  Navigation,
  X
} from 'lucide-react';
import CyberBackground from '@/components/CyberBackground';

export interface DeviceReading {
  DeviceId: string;
  Temperature: number;
  Humidity: number;
  epoch_timestamp: number;
  TimeStamp: string;
}

const DEFAULT_DEVICES = ['150', '151', '152', '153', '155'];

// REUSABLE INTERACTIVE 3D TILT CARD COMPONENT WITH CURSOR LIGHT GLOW
function TiltCard({
  children,
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.25)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 3D tilt calculation (max tilt +- 7 deg)
    const rY = ((mouseX - width / 2) / (width / 2)) * 7;
    const rX = -((mouseY - height / 2) / (height / 2)) * 7;

    setRotateX(rX);
    setRotateY(rY);
    setGlowPos({ x: (mouseX / width) * 100, y: (mouseY / height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={`relative overflow-hidden transition-all duration-300 ${
        isHovered
          ? 'shadow-[0_20px_45px_rgba(0,0,0,0.4)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.85)] border-primary/40'
          : 'shadow-lg border-outline-variant/30 dark:border-white/10'
      } ${className}`}
    >
      {/* Dynamic Cursor Radial Light Highlight */}
      {isHovered && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(350px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
          }}
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        />
      )}
      <div style={{ transform: 'translateZ(12px)' }} className="relative z-0 h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

// Sub-component for individual Device Section
function SingleDeviceSection({
  deviceId,
  readings,
  loading,
  startDate,
  endDate,
  onRemoveDevice,
  isRemovable,
}: {
  deviceId: string;
  readings: DeviceReading[];
  loading: boolean;
  startDate: string;
  endDate: string;
  onRemoveDevice: (id: string) => void;
  isRemovable: boolean;
}) {
  // Table filters & pagination per device
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'TimeStamp' | 'Temperature' | 'Humidity'>('TimeStamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Graph states per device
  const [chartView, setChartView] = useState<'combined' | 'temperature' | 'humidity'>('combined');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [panOffset, setPanOffset] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Statistics calculation for this device
  const stats = useMemo(() => {
    if (!readings || readings.length === 0) {
      return {
        latestTemp: null,
        latestHumidity: null,
        minTemp: null,
        maxTemp: null,
        avgTemp: null,
        minHumidity: null,
        maxHumidity: null,
        avgHumidity: null,
        latestTime: null,
      };
    }

    const latest = readings[readings.length - 1];
    const temps = readings.map((r) => r.Temperature).filter((t) => typeof t === 'number');
    const hums = readings.map((r) => r.Humidity).filter((h) => typeof h === 'number');

    const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
    const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
    const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

    const minHumidity = hums.length > 0 ? Math.min(...hums) : 0;
    const maxHumidity = hums.length > 0 ? Math.max(...hums) : 0;
    const avgHumidity = hums.length > 0 ? hums.reduce((a, b) => a + b, 0) / hums.length : 0;

    return {
      latestTemp: latest.Temperature,
      latestHumidity: latest.Humidity,
      minTemp,
      maxTemp,
      avgTemp,
      minHumidity,
      maxHumidity,
      avgHumidity,
      latestTime: latest.TimeStamp,
    };
  }, [readings]);

  // Visible readings calculation based on Zoom & Pan window
  const visibleReadings = useMemo(() => {
    if (!readings || readings.length === 0) return [];
    if (zoomLevel === 100) return readings;

    const total = readings.length;
    const windowSize = Math.max(3, Math.floor(total * (100 / zoomLevel)));
    const maxPan = total - windowSize;
    const clampedPan = Math.max(0, Math.min(panOffset, maxPan));

    return readings.slice(clampedPan, clampedPan + windowSize);
  }, [readings, zoomLevel, panOffset]);

  // Filtered & sorted table data for this device
  const filteredReadings = useMemo(() => {
    let result = [...readings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.TimeStamp.toLowerCase().includes(q) ||
          String(r.Temperature).includes(q) ||
          String(r.Humidity).includes(q) ||
          String(r.DeviceId).includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'TimeStamp') {
        valA = a.epoch_timestamp || new Date(a.TimeStamp).getTime();
        valB = b.epoch_timestamp || new Date(b.TimeStamp).getTime();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [readings, searchQuery, sortField, sortDirection]);

  // Pagination for this device table
  const totalPages = Math.ceil(filteredReadings.length / rowsPerPage) || 1;
  const paginatedReadings = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredReadings.slice(start, start + rowsPerPage);
  }, [filteredReadings, currentPage, rowsPerPage]);

  const handleSort = (field: 'TimeStamp' | 'Temperature' | 'Humidity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export CSV for this specific device
  const exportDeviceCSV = () => {
    if (readings.length === 0) return;
    const headers = ['DeviceId', 'TimeStamp', 'Temperature (°C)', 'Humidity (%)'];
    const rows = readings.map((r) => [
      r.DeviceId,
      `"${r.TimeStamp}"`,
      r.Temperature,
      r.Humidity,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Device_${deviceId}_Telemetry_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Temperature Status Badge: Hot, Cool, Moderate
  const getTempBadge = (temp: number | null) => {
    if (temp === null) return { text: 'N/A', color: 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 dark:bg-white/10 dark:text-white/60 dark:border-white/20' };
    if (temp < 20) return { text: 'Cool', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' };
    if (temp <= 28) return { text: 'Moderate', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    return { text: 'Hot', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
  };

  // Humidity Status Badge: Dry, Wet, Moderate
  const getHumidityBadge = (humidity: number | null) => {
    if (humidity === null) return { text: 'N/A', color: 'bg-surface-container-high text-on-surface-variant border-outline-variant/40 dark:bg-white/10 dark:text-white/60 dark:border-white/20' };
    if (humidity < 40) return { text: 'Dry', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    if (humidity <= 70) return { text: 'Moderate', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    return { text: 'Wet', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' };
  };

  // Zoom / Pan Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 50, 400));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 50, 100);
      if (next === 100) setPanOffset(0);
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(100);
    setPanOffset(0);
  };
  const handlePanLeft = () => setPanOffset((p) => Math.max(0, p - 3));
  const handlePanRight = () => {
    if (readings.length === 0) return;
    const windowSize = Math.max(3, Math.floor(readings.length * (100 / zoomLevel)));
    const maxPan = readings.length - windowSize;
    setPanOffset((p) => Math.min(maxPan, p + 3));
  };

  // SVG Mouse Move Handler for interactive cursor
  const handleMouseMoveSVG = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleReadings.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const relativeX = (mouseX / rect.width) * 1000;
    const clampedX = Math.max(50, Math.min(950, relativeX));
    const ratio = (clampedX - 50) / 900;
    const index = Math.round(ratio * (visibleReadings.length - 1));

    setHoverIndex(index);
    setMousePos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeaveSVG = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  return (
    <motion.section
      id={`device-${deviceId}`}
      style={{ scrollMarginTop: '110px' }}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-28 mb-14 p-6 sm:p-8 rounded-3xl bg-surface-container/80 dark:bg-surface-container-high/40 backdrop-blur-2xl border border-outline-variant/30 dark:border-white/10 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden"
    >
      {/* HOLOGRAPHIC 3D CYBER SEPARATION HEADER FOR DEVICE ID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-outline-variant/30 dark:border-white/10">
        
        {/* TOP LEFT CORNER DEVICE ID HOLOGRAPHIC BADGE */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <div className="relative flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-surface-container-lowest dark:bg-black/80 border border-primary/50 text-on-surface dark:text-white shadow-md">
              <Cpu className="w-5 h-5 text-primary animate-pulse" />
              <span className="font-headline font-black text-lg sm:text-xl tracking-tight uppercase">
                DEVICE ID: <span className="text-primary font-mono font-bold">#{deviceId}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Device Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportDeviceCSV}
            disabled={readings.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low dark:bg-white/5 hover:bg-surface-container-high dark:hover:bg-white/10 border border-outline-variant/30 dark:border-white/10 text-on-surface dark:text-white text-xs font-bold uppercase transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            Export CSV
          </button>

          {isRemovable && (
            <button
              onClick={() => onRemoveDevice(deviceId)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 dark:text-red-400 transition-all"
              title="Remove Device Section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4 INTERACTIVE 3D SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Temperature Card with 3D Tilt */}
        <TiltCard
          glowColor="rgba(245, 158, 11, 0.25)"
          className="p-6 rounded-2xl bg-gradient-to-b from-orange-500/10 to-surface-container-high/90 dark:to-surface-container-high/80 backdrop-blur-xl border border-orange-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30">
              <Thermometer className="w-5 h-5" />
            </div>
            {stats.latestTemp !== null && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  getTempBadge(stats.latestTemp).color
                }`}
              >
                {getTempBadge(stats.latestTemp).text}
              </span>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 dark:text-white/50 mb-1">
            Temperature
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface dark:text-white">
              {loading ? '--' : stats.latestTemp !== null ? `${stats.latestTemp}°C` : 'N/A'}
            </h2>
          </div>

          <div className="pt-3 border-t border-outline-variant/30 dark:border-white/10 grid grid-cols-3 gap-1 text-[11px] text-on-surface-variant dark:text-white/60 font-mono">
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Min</span>
              <span className="text-orange-600 dark:text-orange-300 font-bold">{stats.minTemp !== null ? `${stats.minTemp.toFixed(1)}°` : '--'}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Avg</span>
              <span className="text-on-surface dark:text-white font-bold">{stats.avgTemp !== null ? `${stats.avgTemp.toFixed(1)}°` : '--'}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Max</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">{stats.maxTemp !== null ? `${stats.maxTemp.toFixed(1)}°` : '--'}</span>
            </div>
          </div>
        </TiltCard>

        {/* Humidity Card with 3D Tilt */}
        <TiltCard
          glowColor="rgba(59, 130, 246, 0.25)"
          className="p-6 rounded-2xl bg-gradient-to-b from-blue-500/10 to-surface-container-high/90 dark:to-surface-container-high/80 backdrop-blur-xl border border-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/30">
              <Droplets className="w-5 h-5" />
            </div>
            {stats.latestHumidity !== null && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  getHumidityBadge(stats.latestHumidity).color
                }`}
              >
                {getHumidityBadge(stats.latestHumidity).text}
              </span>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 dark:text-white/50 mb-1">
            Humidity
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface dark:text-white">
              {loading ? '--' : stats.latestHumidity !== null ? `${stats.latestHumidity}%` : 'N/A'}
            </h2>
          </div>

          <div className="pt-3 border-t border-outline-variant/30 dark:border-white/10 grid grid-cols-3 gap-1 text-[11px] text-on-surface-variant dark:text-white/60 font-mono">
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Min</span>
              <span className="text-blue-600 dark:text-blue-300 font-bold">{stats.minHumidity !== null ? `${stats.minHumidity.toFixed(1)}%` : '--'}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Avg</span>
              <span className="text-on-surface dark:text-white font-bold">{stats.avgHumidity !== null ? `${stats.avgHumidity.toFixed(1)}°` : '--'}</span>
            </div>
            <div>
              <span className="block text-[9px] uppercase text-on-surface-variant/60 dark:text-white/40 font-body font-bold">Max</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.maxHumidity !== null ? `${stats.maxHumidity.toFixed(1)}%` : '--'}</span>
            </div>
          </div>
        </TiltCard>

        {/* Telemetry Logs Count Card with 3D Tilt */}
        <TiltCard
          glowColor="rgba(99, 102, 241, 0.25)"
          className="p-6 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-surface-container-high/90 dark:to-surface-container-high/80 backdrop-blur-xl border border-indigo-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 dark:text-white/50 mb-1">
              Telemetry Logs
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface dark:text-white">
                {loading ? '--' : readings.length}
              </h2>
              <span className="text-xs text-on-surface-variant/60 dark:text-white/40 font-medium">records</span>
            </div>
          </div>
        </TiltCard>

        {/* Gateway Status & Info Card with 3D Tilt */}
        <TiltCard
          glowColor="rgba(16, 185, 129, 0.25)"
          className="p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-surface-container-high/90 dark:to-surface-container-high/80 backdrop-blur-xl border border-emerald-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Active Node
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70 dark:text-white/50 mb-1">
            Gateway Node ID
          </p>
          <div className="flex items-baseline gap-2 mb-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface dark:text-white font-mono">
              #{deviceId}
            </h2>
          </div>

          <div className="pt-3 border-t border-outline-variant/30 dark:border-white/10 flex items-center justify-between text-[11px] text-on-surface-variant dark:text-white/60">
            <span className="text-on-surface-variant/60 dark:text-white/40 font-bold uppercase text-[9px]">Last Timestamp</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-300 font-bold truncate max-w-[120px]">
              {stats.latestTime ? stats.latestTime.split(' ')[1] : '--'}
            </span>
          </div>
        </TiltCard>
      </div>

      {/* TELEMETRY GRAPH FOR THIS DEVICE */}
      <div className="mb-8 p-6 rounded-2xl bg-surface-container-high/90 dark:bg-[#090d16] backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/30 dark:border-white/10">
          <div>
            <h3 className="text-lg font-bold font-headline text-on-surface dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Telemetry Visualizer
            </h3>
          </div>

          {/* Controls: View Mode, Zoom & Pan */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Toggle */}
            <div className="flex items-center bg-surface-container-low dark:bg-black/40 p-1 rounded-xl border border-outline-variant/30 dark:border-white/10 text-xs font-bold">
              <button
                onClick={() => setChartView('combined')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'combined'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant/70 dark:text-white/60 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => setChartView('temperature')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'temperature'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-on-surface-variant/70 dark:text-white/60 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                Temp (°C)
              </button>
              <button
                onClick={() => setChartView('humidity')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'humidity'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-on-surface-variant/70 dark:text-white/60 hover:text-on-surface dark:hover:text-white'
                }`}
              >
                Humidity (%)
              </button>
            </div>

            {/* Pan Left / Right when Zoomed in */}
            {zoomLevel > 100 && (
              <div className="flex items-center gap-1 bg-surface-container-low dark:bg-black/50 p-1 rounded-xl border border-outline-variant/30 dark:border-white/15">
                <button
                  onClick={handlePanLeft}
                  className="p-1.5 rounded-lg bg-surface-container-high dark:bg-white/5 hover:bg-primary/20 text-on-surface dark:text-white transition-colors"
                  title="Pan Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-on-surface-variant/60 dark:text-white/50 px-1">Pan</span>
                <button
                  onClick={handlePanRight}
                  className="p-1.5 rounded-lg bg-surface-container-high dark:bg-white/5 hover:bg-primary/20 text-on-surface dark:text-white transition-colors"
                  title="Pan Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 bg-surface-container-low dark:bg-black/50 p-1 rounded-xl border border-outline-variant/30 dark:border-white/15">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg bg-surface-container-high dark:bg-white/5 hover:bg-primary/20 text-on-surface dark:text-white transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold px-2 text-on-surface dark:text-white/80 min-w-[42px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 100}
                className="p-1.5 rounded-lg bg-surface-container-high dark:bg-white/5 hover:bg-primary/20 text-on-surface dark:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                disabled={zoomLevel === 100}
                className="p-1.5 rounded-lg bg-surface-container-high dark:bg-white/5 hover:bg-primary/20 text-on-surface-variant dark:text-white/70 hover:text-on-surface dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Graph Render Container */}
        {loading ? (
          <div className="h-80 w-full flex flex-col items-center justify-center bg-surface-container-lowest dark:bg-black/40 rounded-xl border border-outline-variant/20 dark:border-white/5 animate-pulse">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-xs text-on-surface-variant/50 dark:text-white/40 font-mono">Loading telemetry graph for Device #{deviceId}...</p>
          </div>
        ) : readings.length === 0 ? (
          <div className="h-80 w-full flex flex-col items-center justify-center bg-surface-container-lowest dark:bg-black/40 rounded-xl border border-outline-variant/20 dark:border-white/5">
            <Database className="w-10 h-10 text-on-surface-variant/30 dark:text-white/20 mb-3" />
            <p className="text-sm font-bold text-on-surface-variant dark:text-white/60">No Telemetry Observations Found for Device #{deviceId}</p>
            <p className="text-xs text-on-surface-variant/50 dark:text-white/40 mt-1">Select a different date range above.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Legend & Hover Info Header */}
            <div className="flex items-center justify-between text-xs mb-3 px-2">
              <div className="flex items-center gap-6">
                {(chartView === 'combined' || chartView === 'temperature') && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span className="text-on-surface dark:text-white/80 font-medium">Temperature (°C)</span>
                  </div>
                )}
                {(chartView === 'combined' || chartView === 'humidity') && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1 rounded-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    <span className="text-on-surface dark:text-white/80 font-medium">Humidity (%)</span>
                  </div>
                )}
              </div>

              <div className="text-on-surface-variant/70 dark:text-white/40 text-[11px] font-mono">
                {hoverIndex !== null && visibleReadings[hoverIndex]
                  ? `${visibleReadings[hoverIndex].TimeStamp} | Temp: ${visibleReadings[hoverIndex].Temperature}°C | Humidity: ${visibleReadings[hoverIndex].Humidity}%`
                  : 'Hover cursor over graph to inspect live telemetry values'}
              </div>
            </div>

            {/* Chart SVG Viewport Container */}
            <div className="w-full border border-outline-variant/30 dark:border-white/10 rounded-xl bg-surface-container-lowest dark:bg-[#070a11] p-4 relative">
              
              {/* Floating Cursor Tooltip */}
              {hoverIndex !== null && visibleReadings[hoverIndex] && mousePos && (
                <div
                  style={{
                    left: Math.min(mousePos.x + 15, 800),
                    top: Math.max(mousePos.y - 60, 10),
                  }}
                  className="absolute z-30 pointer-events-none bg-surface-container-lowest dark:bg-black/90 border border-amber-500/50 p-2.5 rounded-xl shadow-xl text-xs font-mono backdrop-blur-md text-on-surface dark:text-white"
                >
                  <div className="text-[10px] text-on-surface-variant/70 dark:text-white/50 mb-1 border-b border-outline-variant/30 dark:border-white/10 pb-0.5">
                    {visibleReadings[hoverIndex].TimeStamp} (Device #{deviceId})
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {(chartView === 'combined' || chartView === 'temperature') && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">Temperature:</span>
                        <span className="font-bold">{visibleReadings[hoverIndex].Temperature}°C</span>
                      </div>
                    )}
                    {(chartView === 'combined' || chartView === 'humidity') && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Humidity:</span>
                        <span className="font-bold">{visibleReadings[hoverIndex].Humidity}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="h-80 w-full relative">
                <svg
                  ref={svgRef}
                  className="w-full h-full overflow-visible cursor-crosshair"
                  viewBox="0 0 1000 280"
                  onMouseMove={handleMouseMoveSVG}
                  onMouseLeave={handleMouseLeaveSVG}
                >
                  <defs>
                    <linearGradient id={`tempGradient_${deviceId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id={`humGradient_${deviceId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Plot Calculations for Dynamic Y-Scale and Data Slicing */}
                  {(() => {
                    const count = visibleReadings.length;
                    if (count === 0) return null;

                    // Temperature Dynamic Y Scale (Left)
                    const temps = visibleReadings.map((r) => r.Temperature);
                    const minTemp = Math.floor(Math.min(...temps) - 1);
                    const maxTemp = Math.ceil(Math.max(...temps) + 1);

                    // Humidity Dynamic Y Scale (Right)
                    const hums = visibleReadings.map((r) => r.Humidity);
                    const minHum = Math.floor(Math.min(...hums) - 2);
                    const maxHum = Math.ceil(Math.max(...hums) + 2);

                    const getX = (index: number) =>
                      count === 1 ? 500 : (index / (count - 1)) * 900 + 50;

                    const getTempY = (val: number) => {
                      const range = maxTemp - minTemp || 1;
                      return 230 - ((val - minTemp) / range) * 210;
                    };

                    const getHumY = (val: number) => {
                      const range = maxHum - minHum || 1;
                      return 230 - ((val - minHum) / range) * 210;
                    };

                    const tempPoints = visibleReadings
                      .map((r, i) => `${getX(i)},${getTempY(r.Temperature)}`)
                      .join(' L ');

                    const humPoints = visibleReadings
                      .map((r, i) => `${getX(i)},${getHumY(r.Humidity)}`)
                      .join(' L ');

                    const tempArea = `M ${getX(0)},230 L ${tempPoints} L ${getX(
                      visibleReadings.length - 1
                    )},230 Z`;
                    const humArea = `M ${getX(0)},230 L ${humPoints} L ${getX(
                      visibleReadings.length - 1
                    )},230 Z`;

                    const tickStep = Math.max(1, Math.floor(visibleReadings.length / 8));

                    return (
                      <>
                        {/* Y-Axis Grid Lines & Left Temp Ticks */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = 230 - ratio * 210;
                          const tempVal = (minTemp + ratio * (maxTemp - minTemp)).toFixed(1);
                          const humVal = (minHum + ratio * (maxHum - minHum)).toFixed(1);

                          return (
                            <g key={i}>
                              <line
                                x1="50"
                                y1={y}
                                x2="950"
                                y2={y}
                                stroke="currentColor"
                                className="text-on-surface-variant/15 dark:text-white/10"
                                strokeDasharray="4 4"
                              />
                              {(chartView === 'combined' || chartView === 'temperature') && (
                                <text
                                  x="42"
                                  y={y + 4}
                                  fill="currentColor"
                                  className="text-amber-600 dark:text-amber-400 font-mono text-[10px]"
                                  textAnchor="end"
                                >
                                  {tempVal}°C
                                </text>
                              )}
                              {(chartView === 'combined' || chartView === 'humidity') && (
                                <text
                                  x="958"
                                  y={y + 4}
                                  fill="currentColor"
                                  className="text-blue-600 dark:text-blue-400 font-mono text-[10px]"
                                  textAnchor="start"
                                >
                                  {humVal}%
                                </text>
                              )}
                            </g>
                          );
                        })}

                        {/* Temperature Area & Line */}
                        {(chartView === 'combined' || chartView === 'temperature') && (
                          <>
                            <path d={tempArea} fill={`url(#tempGradient_${deviceId})`} />
                            <path
                              d={`M ${tempPoints}`}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {/* Humidity Area & Line */}
                        {(chartView === 'combined' || chartView === 'humidity') && (
                          <>
                            <path d={humArea} fill={`url(#humGradient_${deviceId})`} />
                            <path
                              d={`M ${humPoints}`}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {/* X-Axis Tilted Timestamp Labels */}
                        {visibleReadings.map((r, i) => {
                          if (i % tickStep !== 0 && i !== visibleReadings.length - 1) return null;
                          const cx = getX(i);
                          const timeFormatted = r.TimeStamp.includes(' ')
                            ? `${r.TimeStamp.split(' ')[0].slice(5)} ${r.TimeStamp.split(' ')[1].slice(0, 5)}`
                            : r.TimeStamp;

                          return (
                            <g key={i} transform={`translate(${cx}, 245)`}>
                              <line x1="0" y1="-15" x2="0" y2="-5" stroke="currentColor" className="text-on-surface-variant/30 dark:text-white/20" />
                              <text
                                transform="rotate(-55)"
                                fill="currentColor"
                                className="text-on-surface-variant/70 dark:text-white/45 font-mono text-[10px]"
                                textAnchor="end"
                              >
                                {timeFormatted}
                              </text>
                            </g>
                          );
                        })}

                        {/* Hover Crosshair & Data Point Glow */}
                        {hoverIndex !== null && visibleReadings[hoverIndex] && (
                          <g>
                            <line
                              x1={getX(hoverIndex)}
                              y1="20"
                              x2={getX(hoverIndex)}
                              y2="230"
                              stroke="currentColor"
                              className="text-on-surface-variant/60 dark:text-white/40"
                              strokeDasharray="3 3"
                            />
                            {(chartView === 'combined' || chartView === 'temperature') && (
                              <circle
                                cx={getX(hoverIndex)}
                                cy={getTempY(visibleReadings[hoverIndex].Temperature)}
                                r="6"
                                fill="#f59e0b"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="shadow-[0_0_12px_rgba(245,158,11,1)]"
                              />
                            )}
                            {(chartView === 'combined' || chartView === 'humidity') && (
                              <circle
                                cx={getX(hoverIndex)}
                                cy={getHumY(visibleReadings[hoverIndex].Humidity)}
                                r="6"
                                fill="#3b82f6"
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="shadow-[0_0_12px_rgba(59,130,246,1)]"
                              />
                            )}
                          </g>
                        )}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TELEMETRY DATA TABLE FOR THIS DEVICE */}
      <div className="p-6 rounded-2xl bg-surface-container-high/60 dark:bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 shadow-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold font-headline text-on-surface dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Raw Telemetry Logs
            </h3>
          </div>

          {/* Search Input with 1-Click Clear Button */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-on-surface-variant/40 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search timestamps or values..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-container-lowest dark:bg-black/40 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white text-xs focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/40 dark:placeholder:text-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-container-high dark:hover:bg-white/10 text-on-surface-variant/40 dark:text-white/40 hover:text-on-surface dark:hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto custom-scrollbar border border-outline-variant/30 dark:border-white/10 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low dark:bg-white/5 text-on-surface-variant dark:text-white/70 uppercase tracking-wider font-bold text-[10px] border-b border-outline-variant/30 dark:border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-mono">#</th>
                <th
                  onClick={() => handleSort('TimeStamp')}
                  className="py-3.5 px-4 cursor-pointer hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Timestamp
                    <ArrowUpDown className="w-3 h-3 text-primary" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Device ID</th>
                <th
                  onClick={() => handleSort('Temperature')}
                  className="py-3.5 px-4 cursor-pointer hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Temperature (°C)
                    <ArrowUpDown className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Humidity')}
                  className="py-3.5 px-4 cursor-pointer hover:text-on-surface dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    Humidity (%)
                    <ArrowUpDown className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 dark:divide-white/5 text-on-surface dark:text-white/90">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-surface-container-high dark:bg-white/10 rounded w-6" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-surface-container-high dark:bg-white/10 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-surface-container-high dark:bg-white/10 rounded w-12" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-surface-container-high dark:bg-white/10 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-surface-container-high dark:bg-white/10 rounded w-16" /></td>
                  </tr>
                ))
              ) : paginatedReadings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant/40 dark:text-white/40">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold text-sm">No telemetry records found for Device #{deviceId}</p>
                  </td>
                </tr>
              ) : (
                paginatedReadings.map((row, idx) => {
                  const rowIndex = (currentPage - 1) * rowsPerPage + idx + 1;

                  return (
                    <tr key={idx} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors font-mono">
                      <td className="py-3.5 px-4 text-on-surface-variant/60 dark:text-white/40 text-[11px]">{rowIndex}</td>
                      <td className="py-3.5 px-4 font-bold text-on-surface dark:text-white tracking-tight">
                        {row.TimeStamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-surface-container-high dark:bg-white/10 text-on-surface dark:text-white/80 text-[11px]">
                          {row.DeviceId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {row.Temperature}°C
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {row.Humidity}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredReadings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-outline-variant/30 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-on-surface-variant/70 dark:text-white/50">
              <span>Showing</span>
              <span className="font-bold text-on-surface dark:text-white">
                {(currentPage - 1) * rowsPerPage + 1}
              </span>
              <span>to</span>
              <span className="font-bold text-on-surface dark:text-white">
                {Math.min(currentPage * rowsPerPage, filteredReadings.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-on-surface dark:text-white">{filteredReadings.length}</span>
              <span>entries</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Rows per page selector */}
              <div className="flex items-center gap-2 text-on-surface-variant/70 dark:text-white/60">
                <span>Per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-surface-container-lowest dark:bg-black/50 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Page Nav Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-high dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 text-on-surface dark:text-white" />
                </button>
                <span className="px-3 font-mono text-on-surface dark:text-white/80">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-high dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 text-on-surface dark:text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}

// MAIN PAGE COMPONENT (MULTI-DEVICE DASHBOARD)
export default function DevicePage() {
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultDate = getTodayString();

  // Multi-Device state management
  const [deviceList, setDeviceList] = useState<string[]>(DEFAULT_DEVICES);
  const [newDeviceId, setNewDeviceId] = useState<string>('');

  const [startDate, setStartDate] = useState<string>(defaultDate);
  const [endDate, setEndDate] = useState<string>(defaultDate);

  const [readingsByDevice, setReadingsByDevice] = useState<Record<string, DeviceReading[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [globalLoading, setGlobalLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(15);

  // Sorted list of devices serially
  const sortedDevices = useMemo(() => {
    return [...deviceList].sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  }, [deviceList]);

  // Smooth Scroll Helper with exact navbar offset calculation
  const scrollToDevice = (id: string) => {
    const el = document.getElementById(`device-${id}`);
    if (el) {
      const yOffset = -110;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Fetch telemetry data for ALL devices in parallel
  const fetchAllDevicesData = useCallback(async () => {
    if (deviceList.length === 0) return;
    setGlobalLoading(true);
    setError(null);

    const newLoadingMap: Record<string, boolean> = {};
    deviceList.forEach((id) => {
      newLoadingMap[id] = true;
    });
    setLoadingMap(newLoadingMap);

    try {
      const promises = deviceList.map(async (id) => {
        const url = `https://xobyj4e8bc.execute-api.us-east-1.amazonaws.com/default/Gateway_SHT40_API?DeviceId=${encodeURIComponent(
          id.trim()
        )}&startdate=${startDate}&enddate=${endDate}`;

        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) return { id, data: [] };
          const json = await res.json();
          if (Array.isArray(json)) {
            const sorted = [...json].sort(
              (a, b) => (a.epoch_timestamp || 0) - (b.epoch_timestamp || 0)
            );
            return { id, data: sorted };
          } else if (json && typeof json === 'object') {
            return { id, data: [json] };
          }
          return { id, data: [] };
        } catch {
          return { id, data: [] };
        }
      });

      const results = await Promise.all(promises);
      const newReadingsMap: Record<string, DeviceReading[]> = {};
      results.forEach((res) => {
        newReadingsMap[res.id] = res.data;
      });

      setReadingsByDevice(newReadingsMap);
    } catch (err: any) {
      console.error('Failed to fetch multi-device telemetry:', err);
      setError('Error fetching telemetry data across gateway devices.');
    } finally {
      setGlobalLoading(false);
      setLoadingMap({});
    }
  }, [deviceList, startDate, endDate]);

  // Initial fetch on mount & when date range or device list changes
  useEffect(() => {
    fetchAllDevicesData();
  }, [fetchAllDevicesData]);

  // Auto-refresh 15-second countdown timer loop
  useEffect(() => {
    if (!autoRefresh) {
      setCountdown(15);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchAllDevicesData();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, fetchAllDevicesData]);

  // Global Export CSV for ALL Devices combined
  const exportAllDevicesCSV = () => {
    const allRecords: DeviceReading[] = [];
    Object.values(readingsByDevice).forEach((deviceReadings) => {
      allRecords.push(...deviceReadings);
    });

    if (allRecords.length === 0) return;

    allRecords.sort((a, b) => (a.epoch_timestamp || 0) - (b.epoch_timestamp || 0));

    const headers = ['DeviceId', 'TimeStamp', 'Temperature (°C)', 'Humidity (%)'];
    const rows = allRecords.map((r) => [
      r.DeviceId,
      `"${r.TimeStamp}"`,
      r.Temperature,
      r.Humidity,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Gateway_All_Devices_Telemetry_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick preset helper
  const handleQuickPreset = (preset: 'today' | 'yesterday' | 'week') => {
    const today = new Date();
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'today') {
      setStartDate(formatDate(today));
      setEndDate(formatDate(today));
    } else if (preset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      setStartDate(formatDate(yesterday));
      setEndDate(formatDate(yesterday));
    } else if (preset === 'week') {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      setStartDate(formatDate(lastWeek));
      setEndDate(formatDate(today));
    }
  };

  // Add new device ID to multi-device view (sorted serially)
  const handleAddDevice = () => {
    if (!newDeviceId.trim()) return;
    const cleanId = newDeviceId.trim();
    if (!deviceList.includes(cleanId)) {
      const updated = [...deviceList, cleanId].sort(
        (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0)
      );
      setDeviceList(updated);
    }
    setNewDeviceId('');
  };

  // Remove device ID from view
  const handleRemoveDevice = (idToRemove: string) => {
    setDeviceList(deviceList.filter((id) => id !== idToRemove));
  };

  return (
    <div className="relative min-h-screen bg-background text-on-surface pt-24 pb-20 overflow-hidden font-body transition-colors duration-300">
      {/* Dynamic Cyber Background canvas */}
      <CyberBackground />

      {/* FLOATING 3D QUICK JUMP BAR FOR SERIAL DEVICES (DESKTOP) */}
      {sortedDevices.length > 1 && (
        <aside aria-label="Device Navigation" className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2 p-2.5 rounded-2xl bg-surface-container/90 dark:bg-black/70 backdrop-blur-xl border border-outline-variant/40 dark:border-white/15 shadow-xl text-on-surface dark:text-white">
          <div className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            Nodes
          </div>
          {sortedDevices.map((id) => (
            <button
              key={id}
              onClick={() => scrollToDevice(id)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-container-low dark:bg-white/5 hover:bg-primary/20 border border-outline-variant/30 dark:border-white/10 hover:border-primary/50 text-on-surface dark:text-white font-mono text-xs font-bold transition-all hover:scale-105"
              title={`Jump to Device #${id}`}
            >
              #{id}
            </button>
          ))}
        </aside>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* GLOBAL HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/30 dark:border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  Multi-Node Gateway Telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {deviceList.length} Devices Online
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tight text-on-surface dark:text-white">
                Gateway <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">SHT40 Sensors</span> Dashboard
              </h1>
            </div>

            {/* Global Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportAllDevicesCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low dark:bg-white/5 border border-outline-variant/30 dark:border-white/15 hover:bg-surface-container-high dark:hover:bg-white/10 text-on-surface dark:text-white text-xs font-bold uppercase tracking-wider transition-all hover:border-primary/40 shadow-sm"
                title="Export combined CSV for all devices"
              >
                <Download className="w-4 h-4 text-primary" />
                Export All CSV
              </button>

              <button
                onClick={() => fetchAllDevicesData()}
                disabled={globalLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`} />
                {globalLoading ? 'Fetching All...' : 'Refresh All'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* GLOBAL CONTROLS & FILTER BAR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 p-6 rounded-2xl bg-surface-container-high/60 backdrop-blur-xl border border-outline-variant/30 dark:border-white/10 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
            
            {/* Start Date Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/80 dark:text-white/70 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest dark:bg-black/50 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white font-mono text-sm focus:outline-none focus:border-primary transition-all color-scheme-light dark:color-scheme-dark"
              />
            </div>

            {/* End Date Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/80 dark:text-white/70 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest dark:bg-black/50 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white font-mono text-sm focus:outline-none focus:border-primary transition-all color-scheme-light dark:color-scheme-dark"
              />
            </div>

            {/* Add Device ID Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant/80 dark:text-white/70 mb-2 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-primary" />
                Add Device ID
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest dark:bg-black/50 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white font-mono text-sm focus:outline-none focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDevice()}
                />
                <button
                  onClick={handleAddDevice}
                  className="px-3 py-2.5 rounded-xl bg-surface-container-low dark:bg-white/10 hover:bg-surface-container-high dark:hover:bg-white/20 border border-outline-variant/40 dark:border-white/15 text-on-surface dark:text-white text-xs font-bold uppercase"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Fetch & Auto-Refresh Toggle with Live Countdown */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllDevicesData}
                className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Apply Range
              </button>

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  autoRefresh
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-surface-container-low dark:bg-white/5 border-outline-variant/30 dark:border-white/10 text-on-surface-variant dark:text-white/60 hover:text-on-surface dark:hover:text-white'
                }`}
                title="Auto-refresh every 15 seconds"
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="text-xs font-bold uppercase hidden sm:inline">
                  {autoRefresh ? `Live (${countdown}s)` : 'Auto'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Date Range Buttons & Active Device Badges */}
          <div className="pt-4 border-t border-outline-variant/30 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant/60 dark:text-white/40 font-bold uppercase tracking-wider text-[10px]">Quick Presets:</span>
              <button
                onClick={() => handleQuickPreset('today')}
                className="px-3 py-1 rounded-lg bg-surface-container-low dark:bg-white/5 hover:bg-surface-container-high dark:hover:bg-white/10 border border-outline-variant/30 dark:border-white/10 text-on-surface-variant dark:text-white/80 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handleQuickPreset('yesterday')}
                className="px-3 py-1 rounded-lg bg-surface-container-low dark:bg-white/5 hover:bg-surface-container-high dark:hover:bg-white/10 border border-outline-variant/30 dark:border-white/10 text-on-surface-variant dark:text-white/80 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                Yesterday
              </button>
              <button
                onClick={() => handleQuickPreset('week')}
                className="px-3 py-1 rounded-lg bg-surface-container-low dark:bg-white/5 hover:bg-surface-container-high dark:hover:bg-white/10 border border-outline-variant/30 dark:border-white/10 text-on-surface-variant dark:text-white/80 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                Last 7 Days
              </button>
            </div>

            {/* Active Device Badges & Mobile/Tablet Quick Jump */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-on-surface-variant/60 dark:text-white/40 font-bold uppercase tracking-wider text-[10px]">Active Devices:</span>
              {sortedDevices.map((id) => (
                <button
                  key={id}
                  onClick={() => scrollToDevice(id)}
                  className="px-2.5 py-0.5 rounded-md bg-surface-container-high dark:bg-white/10 hover:bg-primary/20 border border-outline-variant/30 dark:border-white/15 text-on-surface dark:text-white/90 font-mono text-[11px] font-bold transition-all hover:scale-105 cursor-pointer"
                  title={`Jump to Device #${id}`}
                >
                  #{id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ERROR STATE */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-red-700 dark:text-red-200">Connection Warning</h4>
                <p className="text-xs text-red-600/80 dark:text-red-300/80">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchAllDevicesData}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-700 dark:text-red-200 font-bold text-xs uppercase"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* SINGLE PAGE ALL DEVICES SECTIONS (SORTED SERIALLY WITH 3D TILT CARDS & THEME SYNC) */}
        {sortedDevices.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant/50 dark:text-white/40 bg-surface-container-high/40 rounded-3xl border border-outline-variant/30 dark:border-white/10">
            <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30 text-primary" />
            <h3 className="text-lg font-bold text-on-surface dark:text-white">No Devices Selected</h3>
            <p className="text-xs text-on-surface-variant/60 dark:text-white/40 mt-1">Add a Device ID above to display telemetry data.</p>
          </div>
        ) : (
          sortedDevices.map((id) => (
            <SingleDeviceSection
              key={id}
              deviceId={id}
              readings={readingsByDevice[id] || []}
              loading={loadingMap[id] || globalLoading}
              startDate={startDate}
              endDate={endDate}
              onRemoveDevice={handleRemoveDevice}
              isRemovable={sortedDevices.length > 1}
            />
          ))
        )}

      </div>
    </div>
  );
}

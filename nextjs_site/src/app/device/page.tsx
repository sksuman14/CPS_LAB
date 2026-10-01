'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, RefreshCw, Cpu, MapPin, Clock,
  Wifi, WifiOff, Loader2, CheckCircle2, AlertTriangle,
  Settings, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';

// ── APIs ──────────────────────────────────────────────────────────────
const USER_DEVICES_API = 'https://ln8b1r7ld9.execute-api.us-east-1.amazonaws.com/default/Cloudsense_user_devices';
const ADD_DEVICE_API   = 'https://ymfmk699j5.execute-api.us-east-1.amazonaws.com/default/Cloudsense_user_add_devices';
const ACTIVITY_API     = 'https://ccweytqvvj.execute-api.us-east-1.amazonaws.com/default/WS_Device_Activity';

// Device templates for CPS Lab
const DEVICE_TEMPLATES = [
  { name: 'Polytechnic Sensor', emoji: '🏫', prefix: 'PC' },
  { name: 'CPS Sensor',         emoji: '🌡️', prefix: 'PS' },
];

interface DeviceInfo {
  id: string;
  topic: string;
  isActive: boolean;
  lastSeenTs: number | null;
  location: string;
  category: string;
}

// ── Helpers ────────────────────────────────────────────────────────────
function timeAgo(ts: number | null) {
  if (!ts) return 'No data';
  const diff = Date.now() - ts;
  if (isNaN(diff)) return 'No data';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Determine API type from device id/topic
function getApiType(id: string, topic: string): 'cps' | 'polytechnic' {
  const t = topic.toLowerCase();
  const lowerId = id.toLowerCase();
  if (lowerId.startsWith('pc') || t.includes('polytechnic') || t.includes('pc') || t.includes('gpc')) return 'polytechnic';
  return 'cps';
}

export default function DeviceListPage() {
  const router = useRouter();
  const { user, googleUser } = useAuth();
  const userEmail = user?.attributes?.email || googleUser?.email || '';

  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deviceInput, setDeviceInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // ── Fetch user devices + activity ────────────────────────────────────
  const fetchDevices = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const [devRes, actRes] = await Promise.allSettled([
        fetch(`${USER_DEVICES_API}?email_id=${encodeURIComponent(userEmail)}`),
        fetch(ACTIVITY_API),
      ]);

      // Parse activity timestamps
      const activityMap: Record<string, { ts: Date; location: string }> = {};
      if (actRes.status === 'fulfilled' && actRes.value.ok) {
        const actJson = await actRes.value.json();
        const devList: any[] = actJson.devices ?? [];
        devList.forEach((d: any) => {
          const rawTopic = (d.Topic || d['deviceid#topic'] || d['deviceId#topic'] || '').toLowerCase();
          const tsStr = d.TimeStamp_IST || '';
          if (!rawTopic || !tsStr) return;
          const topicStr = rawTopic.includes('#') ? rawTopic.split('#')[1] : rawTopic;
          const ts = new Date(tsStr.replace(' ', 'T'));
          if (!isNaN(ts.getTime())) {
            const city = d.City || ''; const dist = d.District || ''; const state = d.State || '';
            const loc = [city, dist, state].filter(Boolean).join(', ');
            activityMap[topicStr] = { ts, location: loc };
          }
        });
      }

      // Parse user's registered devices
      const list: DeviceInfo[] = [];
      if (devRes.status === 'fulfilled' && devRes.value.ok) {
        const json = await devRes.value.json();
        const entries = Array.isArray(json) ? json : [json];
        entries.forEach((item: any) => {
          Object.entries(item).forEach(([key, val]) => {
            if (key === 'email_id' || key === 'device_id') return;
            const ids: string[] = Array.isArray(val) ? val.map(String) : typeof val === 'string' ? [val] : [];
            ids.forEach(id => {
              if (!id.trim()) return;
              const lowerId = id.toLowerCase();
              
              // Extract numeric ID for topic matching (e.g., PC013 -> 13)
              const numMatch = lowerId.match(/\d+/);
              const num = numMatch ? parseInt(numMatch[0], 10) : id;
              
              let topic = '';
              if (lowerId.startsWith('pc')) {
                topic = `ws/polytechnic/${num}`.toLowerCase();
              } else if (lowerId.startsWith('ps')) {
                topic = `ws/cps/${num}`.toLowerCase();
              } else {
                topic = `ws/cps/${id}`.toLowerCase();
              }
              
              // Look for activity in the map
              const act = activityMap[topic] || activityMap[`ws/cps/${id}`.toLowerCase()] || activityMap[`ws/polytechnic/${id}`.toLowerCase()] || null;
              
              // 1 hour threshold for Active status (60 mins * 60 secs * 1000 ms)
              const isActive = act ? (Date.now() - act.ts.getTime()) < 60 * 60 * 1000 : false;
              
              list.push({
                id,
                topic,
                isActive,
                lastSeenTs: act ? act.ts.getTime() : null,
                location: act?.location || '',
                category: key,
              });
            });
          });
        });
      }

      setDevices(list);
    } catch {
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  // ── Add device ───────────────────────────────────────────────────────
  const handleAdd = async () => {
    const id = deviceInput.trim();
    if (!id) return;
    setAdding(true);
    setAddMsg(null);
    try {
      await fetch(`${ADD_DEVICE_API}?email_id=${encodeURIComponent(userEmail)}&device_id=${encodeURIComponent(id)}`);
      setAddMsg({ ok: true, text: `Device "${id}" added successfully!` });
      setDeviceInput('');
      setTimeout(() => { setShowAddModal(false); setAddMsg(null); fetchDevices(); }, 1500);
    } catch {
      setAddMsg({ ok: false, text: 'Failed to add device. Please try again.' });
    } finally {
      setAdding(false);
    }
  };

  // ── Navigate to graph ─────────────────────────────────────────────────
  const openDevice = (dev: DeviceInfo) => {
    const apiType = getApiType(dev.id, dev.topic);
    router.push(`/device/${encodeURIComponent(dev.id)}?api=${apiType}&topic=${encodeURIComponent(dev.topic)}&location=${encodeURIComponent(dev.location)}`);
  };

  // ── Filter ────────────────────────────────────────────────────────────
  const filtered = devices.filter(d => {
    if (filter === 'Active' && !d.isActive) return false;
    if (filter === 'Inactive' && d.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.id.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount   = devices.filter(d => d.isActive).length;
  const inactiveCount = devices.filter(d => !d.isActive).length;

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 pt-32 pb-10">

        {/* ── Header Row ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Your Devices</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDevices}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Device
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Devices', value: devices.length, icon: Cpu, color: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/10' },
            { label: 'Active',        value: activeCount,    icon: Wifi, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
            { label: 'Inactive',      value: inactiveCount,  icon: WifiOff, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
          ].map(s => (
            <div key={s.label} className={`p-4 sm:p-5 rounded-2xl ${s.bg} border ${s.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">{s.label}</span>
              </div>
              <p className={`text-3xl sm:text-4xl font-black font-headline ${s.color}`}>
                {loading ? '—' : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by device ID, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-primary/50 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-surface-container border border-white/10 rounded-xl p-1">
            {(['All', 'Active', 'Inactive'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${filter === f ? 'bg-primary text-white' : 'text-white/50 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        {search && (
          <p className="text-white/40 text-xs mb-4">{filtered.length} device{filtered.length !== 1 ? 's' : ''} found</p>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-white/30">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-primary" />
            <p className="text-sm">Loading your devices...</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && devices.length === 0 && (
          <div className="text-center py-24">
            <Cpu className="w-14 h-14 mx-auto mb-4 text-white/20" />
            <p className="text-white/50 font-bold text-lg">No devices yet</p>
            <p className="text-white/30 text-sm mt-1">Click <span className="text-primary font-semibold">Add Device</span> to register your first sensor</p>
          </div>
        )}

        {/* ── Device Grid ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dev, idx) => (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => openDevice(dev)}
                className="group relative p-5 rounded-2xl bg-surface-container border border-white/10 hover:border-primary/40 cursor-pointer transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5"
              >
                {/* Active indicator stripe */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${dev.isActive ? 'bg-emerald-500' : 'bg-red-500/50'}`} />

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dev.isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-red-400'}`} />
                    <span className="font-bold text-sm text-white">{idx + 1}. {dev.id}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition" />
                </div>

                {dev.location && (
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span className="text-[11px] text-white/40 truncate">{dev.location}</span>
                  </div>
                )}
                {dev.lastSeenTs && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-white/30 flex-shrink-0" />
                    <span className="text-[11px] text-white/30">{timeAgo(dev.lastSeenTs)}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Device Modal ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
                  className="w-full max-w-[480px] rounded-2xl bg-surface-container-high border border-white/10 shadow-2xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-xl font-bold text-white">Add Device Manually</h2>
                    <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white/50 text-[13px] mb-5">Choose a template category below or type your custom ID directly.</p>
    
                  {/* Templates */}
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary/80 mb-3">Device Templates</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {DEVICE_TEMPLATES.map(t => (
                      <button
                        key={t.prefix}
                        onClick={() => setDeviceInput(t.prefix)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/10 text-white/80 text-xs font-medium transition"
                      >
                        {t.emoji} {t.name}
                      </button>
                    ))}
                  </div>
    
                  {/* Input */}
                  <div className="relative mb-5">
                    <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                    <input
                      autoFocus
                      value={deviceInput}
                      onChange={e => setDeviceInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd()}
                      placeholder="Enter Device ID (e.g. PC001 or PS003)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/30 border-2 border-primary/40 text-white placeholder-white/25 text-sm font-mono focus:outline-none focus:border-primary transition"
                    />
                  </div>
    
                  {/* Message */}
                  <AnimatePresence>
                    {addMsg && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border mb-4 ${addMsg.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                      >
                        {addMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {addMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
    
                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl text-red-400 hover:text-red-300 font-bold text-sm transition">
                      Cancel
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={adding || !deviceInput.trim()}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                      {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm &amp; Add
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

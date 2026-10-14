'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { CPS_PRODUCTS_SENSORS, CPSSensorDefinition, SensorPin } from './data/cpsSensors';
import ArduinoBoard, { ARDUINO_UNO_PINS, McuPin } from './components/ArduinoBoard';
import SensorModuleCard from './components/SensorModuleCard';
import WiresLayer, { WireConnection } from './components/WiresLayer';

import Breadboard from './components/Breadboard';

interface PlacedComponent {
  instanceId: string;
  type: 'mcu' | 'sensor' | 'breadboard';
  sensorDef?: CPSSensorDefinition;
  title: string;
  breadboardType?: 'half' | 'full' | 'mini';
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  values: Record<string, any>;
}

interface CanvasComment {
  id: string;
  x: number;
  y: number;
  text: string;
}

export default function CirkitStyleSimulatorPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme synced with next-themes (defaults to light mode when theme is light)
  const isDarkMode = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : false;

  // Top mode tabs: 'design' | 'code' | 'simulate' | 'upload'
  const [activeMode, setActiveMode] = useState<'design' | 'code' | 'simulate' | 'upload'>('design');

  // Left rail active icon
  const [activeRail, setActiveRail] = useState<'parts' | 'custom' | 'favorites' | 'projects'>('parts');

  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search & filter in parts drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [partsTab, setPartsTab] = useState<'simulation' | 'diagramming'>('simulation');
  const [includeBeta, setIncludeBeta] = useState(false);

  // Canvas zoom & pan
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Dropdown menus state
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'help' | 'export' | null>(null);

  // Project title
  const [projectTitle, setProjectTitle] = useState('Untitled circuit design');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Canvas Placed Components - starts EMPTY matching Cirkit Designer
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);

  // Selected Component on Canvas
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Comments / Textboxes on Canvas - starts EMPTY
  const [comments, setComments] = useState<CanvasComment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // Wire Connections - starts EMPTY
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Selected Pin for Wire Routing
  const [selectedPin, setSelectedPin] = useState<{
    source: 'sensor' | 'mcu';
    instanceId?: string;
    pin: SensorPin | McuPin;
    x: number;
    y: number;
  } | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Dragging state for canvas items
  const [draggingItem, setDraggingItem] = useState<{
    type: 'component' | 'comment';
    id: string;
    startX: number;
    startY: number;
    itemStartX: number;
    itemStartY: number;
  } | null>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<any[]>([]);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTimeSeconds, setSimTimeSeconds] = useState(0);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[Cirkit CPS Engine] Virtual hardware initialized.',
    '[Arduino Uno] ATmega328P Clock: 16MHz Ready.',
    '[Serial Monitor] Baud 9600 Listening.',
  ]);

  // Audio Context for Buzzer / Relay
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = (freq = 800) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // Simulation Loop & Timer
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setSimTimeSeconds((t) => t + 1);
    }, 1000);

    const dataInterval = setInterval(() => {
      placedComponents.forEach((comp) => {
        if (comp.type === 'sensor' && comp.sensorDef) {
          const res = comp.sensorDef.readFormula(comp.values);
          if (res.serialString) {
            setSerialLogs((prev) => {
              const next = [...prev, res.serialString!];
              if (next.length > 80) next.shift();
              return next;
            });
          }
        }
      });
    }, 1800);

    return () => {
      clearInterval(timer);
      clearInterval(dataInterval);
    };
  }, [isSimulating, placedComponents]);

  // Mouse move handler for dragging items on canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const currentX = (e.clientX - bounds.left) / zoom;
    const currentY = (e.clientY - bounds.top) / zoom;

    setMousePos({ x: currentX, y: currentY });

    if (draggingItem) {
      const deltaX = currentX - draggingItem.startX;
      const deltaY = currentY - draggingItem.startY;

      if (draggingItem.type === 'component') {
        setPlacedComponents((prev) =>
          prev.map((c) =>
            c.instanceId === draggingItem.id
              ? {
                  ...c,
                  x: Math.max(0, draggingItem.itemStartX + deltaX),
                  y: Math.max(0, draggingItem.itemStartY + deltaY),
                }
              : c
          )
        );
      } else if (draggingItem.type === 'comment') {
        setComments((prev) =>
          prev.map((c) =>
            c.id === draggingItem.id
              ? {
                  ...c,
                  x: Math.max(0, draggingItem.itemStartX + deltaX),
                  y: Math.max(0, draggingItem.itemStartY + deltaY),
                }
              : c
          )
        );
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingItem) {
      setDraggingItem(null);
      // Auto-update wire positions after moving component
      recalculateWires();
    }
  };

  // Recalculate wire endpoint coordinates based on actual component locations
  const recalculateWires = () => {
    setWires((prevWires) =>
      prevWires.map((w) => {
        let fromCoord = { ...w.from };
        let toCoord = { ...w.to };

        // check from
        const [fromCompId, fromPinId] = w.from.id.split(':');
        const fromComp = placedComponents.find((c) => c.instanceId === fromCompId);
        if (fromComp && fromComp.sensorDef) {
          const pin = fromComp.sensorDef.pins.find((p) => p.id === fromPinId);
          if (pin) {
            fromCoord.x = fromComp.x + (pin.x / 100) * 300;
            fromCoord.y = fromComp.y + 115 + fromComp.sensorDef.controls.length * 40;
          }
        }

        // check to
        if (w.to.id.startsWith('mcu:')) {
          const mcuPinId = w.to.id.replace('mcu:', '');
          const mcuComp = placedComponents.find((c) => c.type === 'mcu');
          const mcuPin = ARDUINO_UNO_PINS.find((p) => p.id === mcuPinId);
          if (mcuComp && mcuPin) {
            toCoord.x = mcuComp.x + mcuPin.x;
            toCoord.y = mcuComp.y + mcuPin.y;
          }
        }

        return { ...w, from: fromCoord, to: toCoord };
      })
    );
  };

  // 1. TOOLBAR ACTION: Toggle Simulation
  const handleToggleSimulation = () => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (next) {
        setSerialLogs((logs) => [...logs, '▶ [Simulation Started] 5.0V Rail Online.']);
      } else {
        setSerialLogs((logs) => [...logs, '⏸ [Simulation Paused]']);
      }
      return next;
    });
  };

  // 2. TOOLBAR ACTION: Create Textbox / Comment (Tt)
  const handleCreateComment = () => {
    const newComment: CanvasComment = {
      id: `comment-${Date.now().toString().slice(-4)}`,
      x: 250 + (comments.length % 4) * 30,
      y: 200 + (comments.length % 4) * 30,
      text: 'Note: Sensor configuration details...',
    };
    setComments((prev) => [...prev, newComment]);
    setSelectedCommentId(newComment.id);
    setSelectedComponentId(null);
  };

  // 3. TOOLBAR ACTION: Auto-route Wires (Button from image 2)
  const handleAutoRouteWires = () => {
    const mcuComp = placedComponents.find((c) => c.type === 'mcu');
    if (!mcuComp) {
      alert('Please place an Arduino UNO board on the canvas first.');
      return;
    }

    const newWires: WireConnection[] = [];
    placedComponents
      .filter((c) => c.type === 'sensor' && c.sensorDef)
      .forEach((comp) => {
        comp.sensorDef!.pins.forEach((pin) => {
          const pinAbsX = comp.x + (pin.x / 100) * 300;
          const pinAbsY = comp.y + 115 + comp.sensorDef!.controls.length * 40;

          const targetMcuPin =
            ARDUINO_UNO_PINS.find((m) => m.id === pin.suggestedMcuPin || m.label === pin.suggestedMcuPin) ||
            ARDUINO_UNO_PINS.find((m) => m.type === pin.type);

          if (targetMcuPin) {
            newWires.push({
              id: `w-${comp.instanceId}-${pin.id}`,
              from: { id: `${comp.instanceId}:${pin.id}`, x: pinAbsX, y: pinAbsY },
              to: { id: `mcu:${targetMcuPin.id}`, x: mcuComp.x + targetMcuPin.x, y: mcuComp.y + targetMcuPin.y },
              color: pin.defaultWireColor || '#38bdf8',
              label: `${pin.name} ➔ ${targetMcuPin.label}`,
            });
          }
        });
      });

    setWires(newWires);
    setSerialLogs((prev) => [...prev, `> [Auto-Route Wires] Connected ${newWires.length} pins cleanly.`]);
  };

  // 4. TOOLBAR ACTION: Rotate Component
  const handleRotateSelected = (delta = 90) => {
    if (!selectedComponentId) {
      alert('Please click a component on the canvas to select it first.');
      return;
    }
    setPlacedComponents((prev) =>
      prev.map((c) =>
        c.instanceId === selectedComponentId
          ? { ...c, rotation: (c.rotation + delta + 360) % 360 }
          : c
      )
    );
    setTimeout(recalculateWires, 50);
  };

  // 5. TOOLBAR ACTION: Delete Selected
  const handleDeleteSelected = () => {
    if (selectedComponentId) {
      setPlacedComponents((prev) => prev.filter((c) => c.instanceId !== selectedComponentId));
      setWires((prev) =>
        prev.filter((w) => !w.from.id.startsWith(selectedComponentId) && !w.to.id.startsWith(selectedComponentId))
      );
      setSelectedComponentId(null);
    } else if (selectedCommentId) {
      setComments((prev) => prev.filter((c) => c.id !== selectedCommentId));
      setSelectedCommentId(null);
    } else if (selectedWireId) {
      setWires((prev) => prev.filter((w) => w.id !== selectedWireId));
      setSelectedWireId(null);
    } else {
      if (confirm('Delete all components, wires, and comments?')) {
        setPlacedComponents([]);
        setWires([]);
        setComments([]);
      }
    }
  };

  // 6. TOOLBAR ACTION: Fit View / Center
  const handleFitView = () => {
    setZoom(1);
    if (placedComponents.length > 0) {
      setPlacedComponents((prev) =>
        prev.map((c, idx) => ({
          ...c,
          x: c.type === 'mcu' ? 420 : 70 + idx * 30,
          y: c.type === 'mcu' ? 100 : 70 + idx * 40,
        }))
      );
      setTimeout(recalculateWires, 50);
    }
  };

  // Add Sensor from drawer
  const handleAddSensor = (sensorDef: CPSSensorDefinition) => {
    const newId = `${sensorDef.id}-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'sensor',
      sensorDef,
      title: sensorDef.title,
      x: 70 + (placedComponents.length % 3) * 40,
      y: 70 + Math.floor(placedComponents.length / 3) * 70,
      rotation: 0,
      values: { ...sensorDef.defaultValues },
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Add Breadboard
  const handleAddBreadboard = (type: 'half' | 'full' | 'mini') => {
    const title = type === 'full' ? 'Full Breadboard' : type === 'half' ? 'Half Breadboard' : 'Mini Breadboard';
    const newId = `bb-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'breadboard',
      title,
      breadboardType: type,
      x: 180 + (placedComponents.length % 3) * 30,
      y: 120 + (placedComponents.length % 3) * 30,
      rotation: 0,
      values: {},
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Add Board
  const handleAddBoard = (boardName: string) => {
    const newId = `mcu-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'mcu',
      title: boardName,
      x: 380 + (placedComponents.length % 2) * 40,
      y: 100 + (placedComponents.length % 2) * 40,
      rotation: 0,
      values: {},
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Sensor control slider update
  const handleValueChange = (instanceId: string, key: string, value: any) => {
    setPlacedComponents((prev) =>
      prev.map((c) => {
        if (c.instanceId === instanceId) {
          if (c.sensorDef?.id === 'buzzer-module' && key === 'isBeeping' && value === true) {
            playBeep(c.values.frequency || 1000);
          }
          if (c.sensorDef?.id === 'relay-module' && key === 'state') {
            playBeep(value ? 350 : 250);
          }
          return {
            ...c,
            values: { ...c.values, [key]: value },
          };
        }
        return c;
      })
    );
  };

  // Pin wiring
  const handleSensorPinClick = (instanceId: string, pin: SensorPin) => {
    const comp = placedComponents.find((c) => c.instanceId === instanceId);
    if (!comp || !comp.sensorDef) return;

    const pinId = `${instanceId}:${pin.id}`;
    const pinAbsX = comp.x + (pin.x / 100) * 300;
    const pinAbsY = comp.y + 115 + comp.sensorDef.controls.length * 40;

    if (!selectedPin) {
      setSelectedPin({
        source: 'sensor',
        instanceId,
        pin,
        x: pinAbsX,
        y: pinAbsY,
      });
    } else if (selectedPin.source === 'mcu') {
      const wireColor = pin.defaultWireColor || '#38bdf8';
      setWires((prev) => [
        ...prev,
        {
          id: `w-${Date.now()}`,
          from: { id: pinId, x: pinAbsX, y: pinAbsY },
          to: { id: `mcu:${selectedPin.pin.id}`, x: selectedPin.x, y: selectedPin.y },
          color: wireColor,
          label: `${pin.name} ➔ ${'label' in selectedPin.pin ? selectedPin.pin.label : selectedPin.pin.name}`,
        },
      ]);
      setSelectedPin(null);
    } else {
      setSelectedPin({
        source: 'sensor',
        instanceId,
        pin,
        x: pinAbsX,
        y: pinAbsY,
      });
    }
  };

  const handleMcuPinClick = (pin: McuPin) => {
    const mcuComp = placedComponents.find((c) => c.type === 'mcu') || { x: 420, y: 100 };
    const pinAbsX = mcuComp.x + pin.x;
    const pinAbsY = mcuComp.y + pin.y;

    if (!selectedPin) {
      setSelectedPin({
        source: 'mcu',
        pin,
        x: pinAbsX,
        y: pinAbsY,
      });
    } else if (selectedPin.source === 'sensor') {
      const sensorPin = selectedPin.pin as SensorPin;
      const wireColor = sensorPin.defaultWireColor || '#38bdf8';
      setWires((prev) => [
        ...prev,
        {
          id: `w-${Date.now()}`,
          from: { id: `${selectedPin.instanceId}:${sensorPin.id}`, x: selectedPin.x, y: selectedPin.y },
          to: { id: `mcu:${pin.id}`, x: pinAbsX, y: pinAbsY },
          color: wireColor,
          label: `${sensorPin.name} ➔ ${pin.label}`,
        },
      ]);
      setSelectedPin(null);
    } else {
      setSelectedPin({
        source: 'mcu',
        pin,
        x: pinAbsX,
        y: pinAbsY,
      });
    }
  };

  // Export functions
  const handleExportIno = () => {
    const code = `// CPS Lab Arduino Sketch Export\n// Project: ${projectTitle}\nvoid setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  delay(1000);\n}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}.ino`;
    a.click();
    setOpenMenu(null);
  };

  const handleExportBOM = () => {
    let csv = 'Product Name,Category,Quantity\n';
    csv += 'Arduino UNO Rev3,Microcontroller,1\n';
    placedComponents
      .filter((c) => c.type === 'sensor' && c.sensorDef)
      .forEach((c) => {
        csv += `"${c.sensorDef!.title}","${c.sensorDef!.category}",1\n`;
      });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}_BOM.csv`;
    a.click();
    setOpenMenu(null);
  };

  const filteredSensors = CPS_PRODUCTS_SENSORS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`h-screen w-screen flex flex-col font-sans overflow-hidden select-none transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
      }`}
      onClick={() => setOpenMenu(null)}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP APP BAR
         ───────────────────────────────────────────────────────────── */}
      <header
        className={`h-14 border-b px-4 flex items-center justify-between z-40 shrink-0 shadow-xs relative transition-colors ${
          isDarkMode ? 'bg-[#090d16] border-slate-800 text-slate-100' : 'bg-[#ffffff] border-slate-200 text-slate-900'
        }`}
      >
        {/* Left: Back Button + Editable Title + File/Edit/Help Menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/learning"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shadow-2xs group mr-1 ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-blue-400 hover:border-blue-700'
                : 'border-slate-200 bg-[#f8fafc] text-slate-700 hover:text-blue-600 hover:border-blue-300'
            }`}
            title="Back to Learning Hub"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">
              arrow_back
            </span>
            <span>Back</span>
          </Link>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="text-sm font-semibold border border-blue-400 rounded px-1.5 py-0.5 outline-none bg-transparent"
                />
              ) : (
                <span
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-sm font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  {projectTitle}
                </span>
              )}
            </div>

            {/* File / Edit / Help Dropdown Bar */}
            <div className={`flex items-center gap-3 text-xs font-medium pl-1 relative ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {/* File Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
                  className={isDarkMode ? 'hover:text-slate-100' : 'hover:text-slate-900'}
                >
                  File
                </button>
                {openMenu === 'file' && (
                  <div className={`absolute top-6 left-0 w-48 border rounded-xl shadow-xl py-1 z-50 text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#ffffff] border-slate-200 text-slate-800'
                  }`}>
                    <button
                      onClick={() => {
                        setPlacedComponents([]);
                        setWires([]);
                        setComments([]);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>New Circuit</span>
                      <span className="text-[10px] text-slate-400">Ctrl+N</span>
                    </button>
                    <button
                      onClick={handleExportIno}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>Download .ino</span>
                    </button>
                    <button
                      onClick={handleExportBOM}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>Export BOM (CSV)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
                  className={isDarkMode ? 'hover:text-slate-100' : 'hover:text-slate-900'}
                >
                  Edit
                </button>
                {openMenu === 'edit' && (
                  <div className={`absolute top-6 left-0 w-44 border rounded-xl shadow-xl py-1 z-50 text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#ffffff] border-slate-200 text-slate-800'
                  }`}>
                    <button
                      onClick={() => {
                        handleAutoRouteWires();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      Auto-route wires
                    </button>
                    <button
                      onClick={() => {
                        handleRotateSelected();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      Rotate Selected (90°)
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteSelected();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-rose-500 ${isDarkMode ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50'}`}
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
              </div>

              {/* Help Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
                  className={isDarkMode ? 'hover:text-slate-100' : 'hover:text-slate-900'}
                >
                  Help
                </button>
                {openMenu === 'help' && (
                  <div className={`absolute top-6 left-0 w-52 border rounded-xl shadow-xl py-1 z-50 text-xs ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#ffffff] border-slate-200 text-slate-800'
                  }`}>
                    <Link
                      href="/products"
                      target="_blank"
                      className={`w-full block px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      CPS Sensor Datasheets ↗
                    </Link>
                    <Link
                      href="/learning/block-coding"
                      className={`w-full block px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      Block Coding Guide
                    </Link>
                    <div className={`px-3 py-1.5 text-[10px] border-t ${
                      isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'
                    }`}>
                      Cirkit Designer CPS Edition v2.4
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mode Switcher Pills (Design, Code, Simulate, Upload) */}
        <div className={`flex items-center p-1 rounded-xl border transition-colors ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveMode('design')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'design'
                ? isDarkMode
                  ? 'bg-slate-900 text-slate-100 shadow-sm'
                  : 'bg-[#ffffff] text-slate-900 shadow-sm'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-blue-600">check</span>
            Design
          </button>

          <button
            onClick={() => setActiveMode('code')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'code'
                ? isDarkMode
                  ? 'bg-slate-900 text-slate-100 shadow-sm'
                  : 'bg-[#ffffff] text-slate-900 shadow-sm'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Code
          </button>

          <button
            onClick={() => {
              setActiveMode('simulate');
              if (!isSimulating) setIsSimulating(true);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'simulate'
                ? isDarkMode
                  ? 'bg-slate-900 text-slate-100 shadow-sm'
                  : 'bg-[#ffffff] text-slate-900 shadow-sm'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Simulate
          </button>

          <button
            onClick={() => {
              setActiveMode('upload');
              alert('Virtual MCU Firmware Upload: Sketch verified and ready to deploy via WebSerial in IoT Lab!');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'upload'
                ? isDarkMode
                  ? 'bg-slate-900 text-slate-100 shadow-sm'
                  : 'bg-[#ffffff] text-slate-900 shadow-sm'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload
          </button>
        </div>

        {/* Right: Auth buttons */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className={`text-xs font-semibold px-2 ${
              isDarkMode ? 'text-slate-300 hover:text-slate-100' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border border-blue-600 text-blue-600 ${
              isDarkMode ? 'hover:bg-blue-950/40' : 'hover:bg-blue-50'
            }`}
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. WORKSPACE BODY (Left Rails + Secondary Drawer + Canvas)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Leftmost Vertical Icon Rail */}
        <div
          className={`w-16 border-r flex flex-col items-center py-3 gap-4 shrink-0 z-30 transition-colors ${
            isDarkMode ? 'bg-[#090d16] border-slate-800' : 'bg-[#ffffff] border-slate-200'
          }`}
        >
          <button
            onClick={() => {
              setActiveRail('parts');
              setSidebarOpen(true);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
              activeRail === 'parts' && sidebarOpen
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Browse Components"
          >
            <span className="material-symbols-outlined text-xl">memory</span>
            <span className="text-[10px] font-bold">Parts</span>
          </button>

          <button
            onClick={() => setActiveRail('custom')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
              activeRail === 'custom'
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Custom Components"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            <span className="text-[9px] font-medium leading-tight">My Custom Parts</span>
          </button>

          <button
            onClick={() => setActiveRail('favorites')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
              activeRail === 'favorites'
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Favorites"
          >
            <span className="material-symbols-outlined text-xl">star</span>
            <span className="text-[9px] font-medium leading-tight">Favorite Parts</span>
          </button>

          <div className={`w-8 h-px my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <button
            onClick={() => setActiveRail('projects')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
              activeRail === 'projects'
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
            }`}
            title="My Projects"
          >
            <span className="material-symbols-outlined text-xl">folder</span>
            <span className="text-[9px] font-medium leading-tight">Projects</span>
          </button>
        </div>

        {/* Secondary Sidebar: Components Library Drawer */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-[280px] border-r flex flex-col shrink-0 z-20 overflow-hidden transition-colors ${
                isDarkMode ? 'bg-[#0d131f] border-slate-800' : 'bg-[#ffffff] border-slate-200'
              }`}
            >
              {/* Search Box */}
              <div className={`p-3 border-b flex items-center gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search Components"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border rounded-lg pl-3 pr-8 py-2 text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                  <span className="material-symbols-outlined text-sm text-slate-400 absolute right-2.5 top-2.5">
                    search
                  </span>
                </div>
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">view_list</span>
                </button>
              </div>

              {/* Diagramming / Simulation Parts Pill Switcher */}
              <div className={`p-2.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className={`flex p-1 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button
                    onClick={() => setPartsTab('diagramming')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      partsTab === 'diagramming'
                        ? isDarkMode
                          ? 'bg-slate-900 text-slate-100 shadow-sm'
                          : 'bg-[#ffffff] text-slate-900 shadow-sm'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-slate-100'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Diagramming Parts
                  </button>
                  <button
                    onClick={() => setPartsTab('simulation')}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      partsTab === 'simulation'
                        ? isDarkMode
                          ? 'bg-slate-900 text-slate-100 shadow-sm'
                          : 'bg-[#ffffff] text-slate-900 shadow-sm'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-slate-100'
                          : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Simulation Parts
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2 px-1">
                  <input
                    type="checkbox"
                    id="includeBeta"
                    checked={includeBeta}
                    onChange={(e) => setIncludeBeta(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                  />
                  <label htmlFor="includeBeta" className={`text-[11px] cursor-pointer ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Include beta parts
                  </label>
                </div>
              </div>

              {/* Parts Grid */}
              {(() => {
                const cardClass = `flex flex-col items-center justify-between p-2 rounded-xl border cursor-pointer group text-center transition-all shadow-xs h-[92px] ${
                  isDarkMode
                    ? 'border-slate-800 bg-slate-900 text-slate-200 hover:border-blue-500 hover:bg-slate-800/80'
                    : 'border-slate-200 bg-[#ffffff] text-slate-800 hover:border-blue-500 hover:bg-blue-50/50'
                }`;
                const cardTextClass = `text-[10px] font-medium leading-tight ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`;

                return (
                  <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 content-start">
                    {partsTab === 'diagramming' ? (
                      /* ─── DIAGRAMMING PARTS ─── */
                      <>
                        {/* Half Breadboard */}
                        {('half breadboard'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBreadboard('half')}
                            className={cardClass}
                            title="Half-size solderless breadboard (400 tie points)"
                          >
                            <div className="w-12 h-10 rounded border border-slate-300 bg-slate-50 flex flex-col justify-center gap-0.5 px-1 shadow-2xs">
                              <div className="h-0.5 w-full bg-rose-400 rounded-full" />
                              <div className="h-0.5 w-full bg-blue-400 rounded-full" />
                              <div className="flex justify-between px-0.5 py-0.5">
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                              </div>
                            </div>
                            <span className={cardTextClass}>Half Breadboard</span>
                          </div>
                        )}

                        {/* Full Breadboard */}
                        {('full breadboard'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBreadboard('full')}
                            className={cardClass}
                            title="Full-size solderless breadboard (830 tie points)"
                          >
                            <div className="w-12 h-10 rounded border border-slate-300 bg-slate-50 flex flex-col justify-center gap-0.5 px-1 shadow-2xs">
                              <div className="h-0.5 w-full bg-rose-400 rounded-full" />
                              <div className="h-0.5 w-full bg-blue-400 rounded-full" />
                              <div className="flex justify-between px-0.5 py-0.5">
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                              </div>
                            </div>
                            <span className={cardTextClass}>Full Breadboard</span>
                          </div>
                        )}

                        {/* Mini Breadboard */}
                        {('mini breadboard'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBreadboard('mini')}
                            className={cardClass}
                            title="Mini breadboard (170 tie points)"
                          >
                            <div className="w-10 h-10 rounded border border-slate-300 bg-slate-50 flex flex-col justify-center gap-0.5 px-1 shadow-2xs">
                              <div className="flex justify-between px-0.5 py-1">
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                                <span className="w-1 h-1 rounded-xs bg-slate-300" />
                              </div>
                            </div>
                            <span className={cardTextClass}>Mini Breadboard</span>
                          </div>
                        )}

                        {/* 12V DC Supply */}
                        {('12v dc power supply'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('12V DC External Supply: Ready to connect to VIN/GND bus rails.')}
                            className={cardClass}
                            title="12V DC Power Supply Module"
                          >
                            <div className="w-9 h-9 rounded-full border-2 border-slate-400 flex flex-col items-center justify-center shadow-2xs">
                              <span className={`text-[7px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>+ 12V -</span>
                            </div>
                            <span className={cardTextClass}>12V DC Supply</span>
                          </div>
                        )}

                        {/* 16x2 I2C LCD */}
                        {('16x2 i2c lcd'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('16x2 I2C Display: Address 0x27 ready.')}
                            className={cardClass}
                            title="16x2 Character LCD with I2C Backback"
                          >
                            <div className="w-11 h-7 rounded bg-emerald-600 border-2 border-slate-800 flex items-center justify-center shadow-xs">
                              <span className="text-[6px] font-mono text-emerald-100">16x2 I2C</span>
                            </div>
                            <span className={cardTextClass}>16x2 I2C LCD</span>
                          </div>
                        )}

                        {/* 20x4 LCD */}
                        {('20x4 lcd display'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('20x4 LCD: 4-row alphanumeric display.')}
                            className={cardClass}
                            title="20x4 Alphanumeric LCD"
                          >
                            <div className="w-11 h-8 rounded bg-emerald-700 border-2 border-slate-800 flex items-center justify-center shadow-xs">
                              <span className="text-[6px] font-mono text-emerald-100">20x4 LCD</span>
                            </div>
                            <span className={cardTextClass}>20x4 LCD</span>
                          </div>
                        )}

                        {/* 2.9" Greyscale eInk */}
                        {('eink greyscale display'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('2.9" Greyscale e-Paper Display: Ultra-low power SPI interface.')}
                            className={cardClass}
                            title="2.9-inch Greyscale e-Ink Display"
                          >
                            <div className="w-11 h-8 rounded bg-slate-200 border border-slate-400 flex items-center justify-center shadow-xs">
                              <span className="text-[6px] font-mono text-slate-700 font-bold">e-INK</span>
                            </div>
                            <span className={cardTextClass}>2.9" eInk Grey</span>
                          </div>
                        )}

                        {/* 3-bit Decoder */}
                        {('3-bit decoder chip ic'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('3-to-8 Line Decoder (74HC138): Demultiplexer IC.')}
                            className={cardClass}
                            title="3-to-8 Decoder / Demultiplexer IC"
                          >
                            <div className="w-10 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center shadow-2xs">
                              <span className="text-[6px] font-mono text-slate-300">74HC138</span>
                            </div>
                            <span className={cardTextClass}>3-bit Decoder</span>
                          </div>
                        )}

                        {/* 10k Potentiometer */}
                        {('potentiometer analog 10k'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('10k Rotary Potentiometer: Analog voltage divider.')}
                            className={cardClass}
                            title="10k Rotary Potentiometer"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-slate-500 flex items-center justify-center shadow-2xs">
                              <div className="w-1 h-3 bg-blue-600 rounded-full" />
                            </div>
                            <span className={cardTextClass}>10k Potentiometer</span>
                          </div>
                        )}

                        {/* Push Button Switch */}
                        {('push button tactile switch'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => alert('Tactile Push Button: Digital input with pull-up.')}
                            className={cardClass}
                            title="Tactile Push Button Switch"
                          >
                            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xs">
                              <div className="w-4 h-4 rounded-full bg-rose-600 shadow-inner" />
                            </div>
                            <span className={cardTextClass}>Push Button</span>
                          </div>
                        )}
                      </>
                    ) : (
                      /* ─── SIMULATION PARTS ─── */
                      <>
                        {/* Microcontrollers */}
                        {('arduino uno'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBoard('Arduino UNO')}
                            className={cardClass}
                            title="Arduino Uno Rev3 (ATmega328P with Simulation Logic)"
                          >
                            <div className="w-11 h-9 rounded bg-[#00878f] border border-[#006f75] flex flex-col items-center justify-center p-0.5 shadow-sm">
                              <div className="w-5 h-2 bg-[#1e293b] rounded-xs mb-0.5" />
                              <span className="text-[8px] font-mono font-bold text-white leading-none">UNO</span>
                            </div>
                            <span className={cardTextClass}>Arduino UNO</span>
                          </div>
                        )}

                        {('arduino mega 2560'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBoard('Arduino Mega 2560')}
                            className={cardClass}
                            title="Arduino Mega 2560 Rev3"
                          >
                            <div className="w-12 h-9 rounded bg-[#00878f] border border-[#006f75] flex flex-col items-center justify-center p-0.5 shadow-sm">
                              <span className="text-[7px] font-mono font-bold text-white leading-none">MEGA 2560</span>
                            </div>
                            <span className={cardTextClass}>Arduino Mega 2560</span>
                          </div>
                        )}

                        {('esp32 devkitc'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBoard('ESP32 DevKitC')}
                            className={cardClass}
                            title="ESP32 DevKitC NodeMCU"
                          >
                            <div className="w-8 h-10 rounded bg-[#1e293b] border border-slate-600 flex flex-col items-center justify-between py-1 shadow-sm">
                              <div className="w-5 h-3 bg-slate-300 rounded-xs" />
                              <span className="text-[7px] font-mono font-bold text-white">ESP32</span>
                            </div>
                            <span className={cardTextClass}>ESP32 DevKitC</span>
                          </div>
                        )}

                        {('esp32-s3'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBoard('ESP32-S3')}
                            className={cardClass}
                            title="ESP32-S3 Dual-Core SoC"
                          >
                            <div className="w-8 h-10 rounded bg-[#0f172a] border border-slate-600 flex flex-col items-center justify-between py-1 shadow-sm">
                              <div className="w-5 h-3 bg-amber-400/80 rounded-xs" />
                              <span className="text-[7px] font-mono font-bold text-white">S3</span>
                            </div>
                            <span className={cardTextClass}>ESP32-S3</span>
                          </div>
                        )}

                        {('raspberry pi pico'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => handleAddBoard('Raspberry Pi Pico')}
                            className={cardClass}
                            title="Raspberry Pi Pico RP2040"
                          >
                            <div className="w-7 h-10 rounded bg-emerald-800 border border-emerald-900 flex flex-col items-center justify-between py-1 shadow-sm">
                              <div className="w-4 h-3 bg-emerald-950 rounded-xs" />
                              <span className="text-[7px] font-mono font-bold text-emerald-200">PICO</span>
                            </div>
                            <span className={cardTextClass}>Raspberry Pi Pico</span>
                          </div>
                        )}

                        {('1 channel 5v relay switch'.includes(searchQuery.toLowerCase()) || !searchQuery) && (
                          <div
                            onClick={() => {
                              const relayDef = CPS_PRODUCTS_SENSORS.find((s) => s.id === 'relay-module') || CPS_PRODUCTS_SENSORS[8];
                              handleAddSensor(relayDef);
                            }}
                            className={cardClass}
                            title="1-Channel 5V Relay Switch (Interactive simulation toggle)"
                          >
                            <div className="w-9 h-9 rounded bg-blue-600 border border-blue-700 flex flex-col items-center justify-center shadow-sm">
                              <span className="text-[7px] font-mono font-bold text-white">5V RELAY</span>
                            </div>
                            <span className={cardTextClass}>1 Channel 5V Relay</span>
                          </div>
                        )}

                        {/* CPS Products Sensors with Live Simulation Formulas */}
                        {filteredSensors.map((sensor) => (
                          <div
                            key={sensor.id}
                            onClick={() => handleAddSensor(sensor)}
                            className={cardClass}
                            title={sensor.subtitle}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs group-hover:scale-105 transition-all ${
                                isDarkMode
                                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                                  : 'bg-blue-50 border-blue-100 text-blue-600'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xl">{sensor.icon}</span>
                            </div>
                            <span className={`${cardTextClass} line-clamp-2`}>
                              {sensor.title}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Handle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-1/2 z-30 -translate-y-1/2 w-4 h-8 border rounded-r-md flex items-center justify-center shadow-sm transition-colors ${
            isDarkMode
              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-100'
              : 'bg-[#ffffff] border-slate-200 text-slate-400 hover:text-slate-800'
          }`}
          style={{ left: sidebarOpen ? '344px' : '64px' }}
        >
          <span className="material-symbols-outlined text-xs">
            {sidebarOpen ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>

        {/* ─────────────────────────────────────────────────────────────
            3. MAIN CANVAS AREA (Exact Buttons from your 5 images)
           ───────────────────────────────────────────────────────────── */}
        <div
          className={`flex-1 relative overflow-hidden transition-colors ${
            showGrid
              ? isDarkMode
                ? 'bg-[#090d16] bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:24px_24px]'
                : 'bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:24px_24px]'
              : isDarkMode
              ? 'bg-[#090d16]'
              : 'bg-slate-50'
          }`}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* TOP-RIGHT FLOATING TOOLBAR (Image 1, 2, 3, 4, 5 tooltips) */}
          <div className="absolute top-4 right-6 z-30 flex items-center gap-2">
            {/* 1. GREEN CIRCULAR PLAY BUTTON: "Start the simulation" (Image 5) */}
            <div className="relative group/simbtn">
              <button
                onClick={handleToggleSimulation}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${
                  isSimulating
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {isSimulating ? 'pause' : 'play_arrow'}
                </span>
              </button>
              {/* Tooltip */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/simbtn:opacity-100 transition-opacity pointer-events-none z-50">
                {isSimulating ? 'Stop the simulation' : 'Start the simulation'}
              </div>
            </div>

            {/* Canvas Action Bar */}
            <div className={`flex items-center border rounded-2xl p-1 shadow-md gap-0.5 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#ffffff] border-slate-200'
            }`}>
              {/* 2. TEXT TOOL: "Create Textbox / Comment" (Image 3, 4) */}
              <div className="relative group/tool">
                <button
                  onClick={handleCreateComment}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-800' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-bold text-sm tracking-tighter">Tt</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Create Textbox / Comment
                </div>
              </div>

              {/* 3. AUTO-ROUTE WIRES BUTTON: "Auto-route wires" (Image 2) */}
              <div className="relative group/tool">
                <button
                  onClick={handleAutoRouteWires}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-800' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">cable</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Auto-route wires
                </div>
              </div>

              {/* 4. GRID TOGGLE: "Show / Hide Grid" (Image 1) */}
              <div className="relative group/tool">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-2 rounded-xl transition-colors ${
                    showGrid
                      ? isDarkMode
                        ? 'text-blue-400 bg-slate-800'
                        : 'text-blue-600 bg-blue-50'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">grid_on</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Show / Hide Grid
                </div>
              </div>

              {/* 5a. ROTATE COUNTER-CLOCKWISE */}
              <div className="relative group/tool">
                <button
                  onClick={() => handleRotateSelected(-90)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-800' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">rotate_left</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Rotate component (-90°)
                </div>
              </div>

              {/* 5b. ROTATE CLOCKWISE */}
              <div className="relative group/tool">
                <button
                  onClick={() => handleRotateSelected(90)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-800' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">rotate_right</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Rotate component (90°)
                </div>
              </div>

              <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

              {/* Fit View */}
              <div className="relative group/tool">
                <button
                  onClick={handleFitView}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">crop_free</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Fit to screen
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="relative group/tool">
                <button
                  onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">zoom_in</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Zoom in
                </div>
              </div>

              <div className="relative group/tool">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">zoom_out</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Zoom out
                </div>
              </div>

              {/* Delete Trash */}
              <div className="relative group/tool">
                <button
                  onClick={handleDeleteSelected}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  {selectedComponentId ? 'Delete selected component' : 'Delete'}
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Status Live Bar */}
          {isSimulating && (
            <div className="absolute top-4 left-6 z-30 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 px-3.5 py-1.5 rounded-2xl shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                SIMULATION RUNNING • {simTimeSeconds}s
              </span>
            </div>
          )}

          {/* SVG Wires Layer */}
          <WiresLayer
            wires={wires}
            activeDraftWire={
              selectedPin
                ? {
                    from: { x: selectedPin.x, y: selectedPin.y },
                    to: { x: mousePos.x, y: mousePos.y },
                    color: (selectedPin.pin as any).defaultWireColor || '#38bdf8',
                  }
                : null
            }
            onRemoveWire={(wireId) => setWires((prev) => prev.filter((w) => w.id !== wireId))}
            isSimulating={isSimulating}
          />

          {/* Canvas Components Container with Zoom transform */}
          <div
            className="w-full h-full relative origin-top-left"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Placed Arduino Board(s) */}
            {placedComponents
              .filter((c) => c.type === 'mcu')
              .map((mcu) => (
                <div
                  key={mcu.instanceId}
                  className={`absolute z-10 cursor-move transition-shadow ${
                    selectedComponentId === mcu.instanceId ? 'ring-2 ring-blue-500 rounded-2xl' : ''
                  }`}
                  style={{
                    left: mcu.x,
                    top: mcu.y,
                    transform: `rotate(${mcu.rotation}deg)`,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedComponentId(mcu.instanceId);
                    setSelectedCommentId(null);
                    setDraggingItem({
                      type: 'component',
                      id: mcu.instanceId,
                      startX: mousePos.x,
                      startY: mousePos.y,
                      itemStartX: mcu.x,
                      itemStartY: mcu.y,
                    });
                  }}
                >
                  <ArduinoBoard
                    onPinClick={handleMcuPinClick}
                    selectedPinId={selectedPin?.source === 'mcu' ? selectedPin.pin.id : null}
                    connectedPinIds={wires.map((w) =>
                      w.to.id.startsWith('mcu:') ? w.to.id.replace('mcu:', '') : ''
                    )}
                    isSimulating={isSimulating}
                    pin13LedState={isSimulating}
                    txLedState={isSimulating}
                    rxLedState={isSimulating}
                  />
                </div>
              ))}

            {/* Placed Breadboard(s) */}
            {placedComponents
              .filter((c) => c.type === 'breadboard')
              .map((bb) => (
                <div
                  key={bb.instanceId}
                  className={`absolute z-10 cursor-move transition-shadow ${
                    selectedComponentId === bb.instanceId ? 'ring-2 ring-blue-500 rounded-2xl' : ''
                  }`}
                  style={{
                    left: bb.x,
                    top: bb.y,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedComponentId(bb.instanceId);
                    setSelectedCommentId(null);
                    setDraggingItem({
                      type: 'component',
                      id: bb.instanceId,
                      startX: mousePos.x,
                      startY: mousePos.y,
                      itemStartX: bb.x,
                      itemStartY: bb.y,
                    });
                  }}
                >
                  <Breadboard
                    type={bb.breadboardType || 'half'}
                    rotation={bb.rotation}
                    isSelected={selectedComponentId === bb.instanceId}
                  />
                </div>
              ))}

            {/* Placed CPS Sensor Modules */}
            {placedComponents
              .filter((c) => c.type === 'sensor' && c.sensorDef)
              .map((comp) => (
                <div
                  key={comp.instanceId}
                  className={`cursor-move ${
                    selectedComponentId === comp.instanceId ? 'ring-2 ring-blue-500 rounded-2xl' : ''
                  }`}
                  style={{
                    transform: `rotate(${comp.rotation}deg)`,
                  }}
                  onMouseDown={(e) => {
                    // if clicking an input, don't drag
                    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
                      return;
                    }
                    setSelectedComponentId(comp.instanceId);
                    setSelectedCommentId(null);
                    setDraggingItem({
                      type: 'component',
                      id: comp.instanceId,
                      startX: mousePos.x,
                      startY: mousePos.y,
                      itemStartX: comp.x,
                      itemStartY: comp.y,
                    });
                  }}
                >
                  <SensorModuleCard
                    sensor={comp.sensorDef!}
                    instanceId={comp.instanceId}
                    position={{ x: comp.x, y: comp.y }}
                    values={comp.values}
                    onValueChange={handleValueChange}
                    onPinClick={handleSensorPinClick}
                    onRemove={(id) => {
                      setPlacedComponents((prev) => prev.filter((c) => c.instanceId !== id));
                      setWires((prev) => prev.filter((w) => !w.from.id.startsWith(id) && !w.to.id.startsWith(id)));
                    }}
                    selectedPinId={
                      selectedPin?.source === 'sensor' ? `${selectedPin.instanceId}:${selectedPin.pin.id}` : null
                    }
                    connectedPinIds={wires.map((w) => (w.from.id.startsWith(comp.instanceId) ? w.from.id : ''))}
                    isSimulating={isSimulating}
                  />
                </div>
              ))}

            {/* Placed Canvas Comments / Textboxes (From Tt Tool) */}
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`absolute z-20 w-64 p-3 rounded-2xl border-2 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-amber-50 border-amber-200'
                } ${
                  selectedCommentId === comment.id
                    ? 'border-blue-500 shadow-xl'
                    : 'shadow-md'
                } cursor-move`}
                style={{ left: comment.x, top: comment.y }}
                onMouseDown={() => {
                  setSelectedCommentId(comment.id);
                  setSelectedComponentId(null);
                  setDraggingItem({
                    type: 'comment',
                    id: comment.id,
                    startX: mousePos.x,
                    startY: mousePos.y,
                    itemStartX: comment.x,
                    itemStartY: comment.y,
                  });
                }}
              >
                <div className={`flex items-center justify-between pb-1 border-b mb-2 text-[10px] font-bold ${
                  isDarkMode ? 'border-slate-800 text-amber-400' : 'border-amber-200 text-amber-800'
                }`}>
                  <span>NOTE / COMMENT</span>
                  <button
                    onClick={() => setComments((prev) => prev.filter((c) => c.id !== comment.id))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={comment.text}
                  onChange={(e) =>
                    setComments((prev) =>
                      prev.map((c) => (c.id === comment.id ? { ...c, text: e.target.value } : c))
                    )
                  }
                  rows={3}
                  className={`w-full bg-transparent text-xs resize-none outline-none font-sans ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. CODE / SIMULATE SIDE PANELS
           ───────────────────────────────────────────────────────────── */}
        {activeMode === 'code' && (
          <div className="w-[450px] h-full bg-[#0d1117] border-l border-slate-800 flex flex-col z-30 shadow-2xl text-white">
            <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                CPS_Hardware_Firmware.ino
              </span>
              <button onClick={() => setActiveMode('design')} className="text-xs text-slate-400 hover:text-white">
                ✕ Close
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-cyan-300 whitespace-pre">
              {`// CPS Lab Arduino Sketch
#include <Wire.h>

void setup() {
  Serial.begin(9600);
  Wire.begin();
  Serial.println("CPS Sensor Hub Online.");
}

void loop() {
  // Read sensor values in real time
  Serial.println("Reading sensors...");
  delay(1000);
}`}
            </div>
          </div>
        )}

        {activeMode === 'simulate' && (
          <div className="w-[450px] h-full bg-slate-950 border-l border-slate-800 flex flex-col z-30 shadow-2xl text-white">
            <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Serial Monitor (9600 Baud)
                </span>
              </div>
              <button onClick={() => setActiveMode('design')} className="text-xs text-slate-400 hover:text-white">
                ✕ Close
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
              {serialLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600 select-none">{idx + 1}</span>
                  <span className={log.includes('ALERT') ? 'text-amber-400' : 'text-emerald-400'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

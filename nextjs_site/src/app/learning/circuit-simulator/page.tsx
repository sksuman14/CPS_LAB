'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { CPS_PRODUCTS_SENSORS, CPSSensorDefinition, SensorPin } from './data/cpsSensors';
import ArduinoBoard, { ARDUINO_UNO_PINS, McuPin } from './components/ArduinoBoard';
import SensorModuleCard from './components/SensorModuleCard';
import WiresLayer, { WireConnection } from './components/WiresLayer';
import Breadboard from './components/Breadboard';
import {
  LEDComponent,
  ResistorComponent,
  PushButtonComponent,
  PotentiometerComponent,
  Lcd16x2Component,
  DiscretePin,
} from './components/DiscreteComponents';
import CodeAndTerminalPanel from './components/CodeAndTerminalPanel';
import { STARTER_PROJECTS, StarterProject } from './data/starterProjects';
import { generateArduinoSketch } from './data/codeGenerator';

export interface PlacedComponent {
  instanceId: string;
  type: 'mcu' | 'sensor' | 'breadboard' | 'discrete';
  title: string;
  sensorDef?: CPSSensorDefinition;
  breadboardType?: 'half' | 'full' | 'mini';
  discreteType?: 'led' | 'resistor' | 'button' | 'potentiometer' | 'lcd';
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

  const isDarkMode = mounted ? (resolvedTheme === 'dark' || theme === 'dark') : false;

  // Top mode tabs: 'design' | 'code' | 'simulate' | 'upload'
  const [activeMode, setActiveMode] = useState<'design' | 'code' | 'simulate' | 'upload'>('design');

  // Left rail active icon: 'parts' | 'projects'
  const [activeRail, setActiveRail] = useState<'parts' | 'projects'>('parts');

  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search & filter in parts drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [includeBeta, setIncludeBeta] = useState(false);

  // Canvas zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // Wire Color Palette
  const WIRE_COLORS = [
    { label: 'Red (5V/VCC)', color: '#ef4444' },
    { label: 'Black (GND)', color: '#0f172a' },
    { label: 'Blue (Signal)', color: '#3b82f6' },
    { label: 'Green (Analog)', color: '#22c55e' },
    { label: 'Yellow (Pulse)', color: '#eab308' },
    { label: 'Orange (Aux)', color: '#f97316' },
    { label: 'Purple (I2C/SPI)', color: '#a855f7' },
    { label: 'White (Clock)', color: '#f8fafc' },
  ];
  const [activeWireColor, setActiveWireColor] = useState('#3b82f6');

  // Dropdown menus state
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'help' | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLoadProjectOpen, setIsLoadProjectOpen] = useState(false);

  // Project title
  const [projectTitle, setProjectTitle] = useState('Untitled circuit design');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Canvas Placed Components - starts EMPTY matching Cirkit Designer
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);

  // Selected Component on Canvas
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Comments / Textboxes on Canvas
  const [comments, setComments] = useState<CanvasComment[]>([]);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // Wire Connections
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Selected Pin for Wire Routing
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    x: number;
    y: number;
    label: string;
    suggestedColor?: string;
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

  // Generated Arduino C++ Sketch Code
  const [arduinoCode, setArduinoCode] = useState<string>('');

  // Auto-generate code when components or wires change
  useEffect(() => {
    const code = generateArduinoSketch(placedComponents, wires, projectTitle);
    setArduinoCode(code);
  }, [placedComponents, wires, projectTitle]);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTimeSeconds, setSimTimeSeconds] = useState(0);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[Cirkit CPS Engine v2.4] Virtual hardware initialized.',
    '[Arduino Uno] ATmega328P Clock: 16MHz Ready.',
    '[Serial Monitor] Baud 9600 Listening.',
  ]);

  // Short Circuit Detection
  const hasShortCircuit = wires.some((w) => {
    const f = w.from.id.toLowerCase();
    const t = w.to.id.toLowerCase();
    const isFromPwr = f.includes('5v') || f.includes('vcc') || f.includes('3.3v') || f.includes('vin') || f.includes('p_plus');
    const isToGnd = t.includes('gnd') || t.includes('ground') || t.includes('p_minus');
    const isToPwr = t.includes('5v') || t.includes('vcc') || t.includes('3.3v') || t.includes('vin') || t.includes('p_plus');
    const isFromGnd = f.includes('gnd') || f.includes('ground') || f.includes('p_minus');
    return (isFromPwr && isToGnd) || (isToPwr && isFromGnd);
  });

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

  // Recalculate wire endpoint coordinates based on actual component locations
  const recalculateWires = useCallback(() => {
    setWires((prevWires) =>
      prevWires.map((w) => {
        const fromCoord = { ...w.from };
        const toCoord = { ...w.to };

        const updateEndpoint = (endpointId: string, currentCoord: { x: number; y: number }) => {
          // Check MCU
          if (endpointId.startsWith('mcu:')) {
            const mcuPinId = endpointId.replace('mcu:', '');
            const mcuComp = placedComponents.find((c) => c.type === 'mcu');
            const mcuPin = ARDUINO_UNO_PINS.find((p) => p.id === mcuPinId);
            if (mcuComp && mcuPin) {
              return { x: mcuComp.x + mcuPin.x, y: mcuComp.y + mcuPin.y };
            }
          }

          // Check Sensor
          const parts = endpointId.split(':');
          if (parts.length === 2) {
            const [compId, pinId] = parts;
            const comp = placedComponents.find((c) => c.instanceId === compId);
            if (comp) {
              if (comp.type === 'sensor' && comp.sensorDef) {
                const pin = comp.sensorDef.pins.find((p) => p.id === pinId);
                if (pin) {
                  return {
                    x: comp.x + (pin.x / 100) * 300,
                    y: comp.y + 244,
                  };
                }
              }
              if (comp.type === 'discrete') {
                if (comp.discreteType === 'led') {
                  const xOffset = pinId === 'anode' ? 20 : 44;
                  return { x: comp.x + xOffset, y: comp.y + 90 };
                }
                if (comp.discreteType === 'resistor') {
                  const xOffset = pinId === 'pin1' ? 8 : 112;
                  return { x: comp.x + xOffset, y: comp.y + 20 };
                }
                if (comp.discreteType === 'potentiometer') {
                  const xOffset = pinId === 'vcc' ? 18 : pinId === 'wiper' ? 40 : 62;
                  return { x: comp.x + xOffset, y: comp.y + 72 };
                }
                if (comp.discreteType === 'lcd') {
                  const xOffset = pinId === 'gnd' ? 18 : pinId === 'vcc' ? 34 : pinId === 'sda' ? 50 : 66;
                  return { x: comp.x + xOffset, y: comp.y + 10 };
                }
                if (comp.discreteType === 'button') {
                  const xOffset = pinId.startsWith('1') ? 8 : 52;
                  const yOffset = pinId.endsWith('a') ? 18 : 42;
                  return { x: comp.x + xOffset, y: comp.y + yOffset };
                }
              }
            }
          }
          return currentCoord;
        };

        return {
          ...w,
          from: { ...w.from, ...updateEndpoint(w.from.id, fromCoord) },
          to: { ...w.to, ...updateEndpoint(w.to.id, toCoord) },
        };
      })
    );
  }, [placedComponents]);

  // Canvas Mouse Move: Handles Panning and Item Dragging
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const currentX = (e.clientX - bounds.left - pan.x) / zoom;
    const currentY = (e.clientY - bounds.top - pan.y) / zoom;

    setMousePos({ x: currentX, y: currentY });

    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan({ x: panStart.panX + deltaX, y: panStart.panY + deltaY });
      return;
    }

    if (draggingItem) {
      const deltaX = currentX - draggingItem.startX;
      const deltaY = currentY - draggingItem.startY;

      if (draggingItem.type === 'component') {
        setPlacedComponents((prev) =>
          prev.map((c) =>
            c.instanceId === draggingItem.id
              ? {
                  ...c,
                  x: Math.max(-200, draggingItem.itemStartX + deltaX),
                  y: Math.max(-200, draggingItem.itemStartY + deltaY),
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
                  x: Math.max(-200, draggingItem.itemStartX + deltaX),
                  y: Math.max(-200, draggingItem.itemStartY + deltaY),
                }
              : c
          )
        );
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking directly on the canvas background, initiate Pan
    if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
      setSelectedComponentId(null);
      setSelectedCommentId(null);
      setSelectedWireId(null);
      // Cancel draft wire if clicking empty space
      if (selectedPin) setSelectedPin(null);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggingItem) {
      setDraggingItem(null);
      recalculateWires();
    }
  };

  // 5. TOOLBAR ACTION: Rotate Component
  const handleRotateSelected = useCallback((delta = 90) => {
    if (!selectedComponentId) return;
    setPlacedComponents((prev) =>
      prev.map((c) =>
        c.instanceId === selectedComponentId
          ? { ...c, rotation: (c.rotation + delta + 360) % 360 }
          : c
      )
    );
    setTimeout(recalculateWires, 50);
  }, [selectedComponentId, recalculateWires]);

  // 7. TOOLBAR ACTION: Delete Selected
  const handleDeleteSelected = useCallback(() => {
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
    }
  }, [selectedComponentId, selectedCommentId, selectedWireId]);

  // Keyboard Shortcuts (Delete, Rotate R, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }
      if (e.key === 'r' || e.key === 'R') {
        handleRotateSelected(90);
      }
      if (e.key === 'Escape') {
        setSelectedPin(null);
        setSelectedComponentId(null);
        setSelectedWireId(null);
        setSelectedCommentId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, selectedWireId, selectedCommentId, handleRotateSelected, handleDeleteSelected]);

  // 1. TOOLBAR ACTION: Toggle Simulation
  const handleToggleSimulation = () => {
    setIsSimulating((prev) => {
      const next = !prev;
      if (next) {
        setSerialLogs((logs) => [...logs, '▶ [Simulation Started] 5.0V VCC Rail Online.']);
      } else {
        setSerialLogs((logs) => [...logs, '⏸ [Simulation Paused]']);
      }
      return next;
    });
  };

  // 2. TOOLBAR ACTION: Reset Simulation
  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimTimeSeconds(0);
    setSerialLogs([
      '[Arduino Uno] ATmega328P Firmware Reset.',
      '[Arduino Uno] 16MHz Oscillator Stabilized.',
      '[Serial Monitor] Baud 9600 Ready.',
    ]);
  };

  // 3. TOOLBAR ACTION: Create Textbox / Comment (Tt)
  const handleCreateComment = () => {
    const newComment: CanvasComment = {
      id: `comment-${Date.now().toString().slice(-4)}`,
      x: 250 - pan.x / zoom + (comments.length % 4) * 30,
      y: 200 - pan.y / zoom + (comments.length % 4) * 30,
      text: 'Note: Circuit configuration instructions...',
    };
    setComments((prev) => [...prev, newComment]);
    setSelectedCommentId(newComment.id);
    setSelectedComponentId(null);
  };

  // 4. TOOLBAR ACTION: Auto-route Wires
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
          const pinAbsY = comp.y + 244;

          const targetMcuPin =
            ARDUINO_UNO_PINS.find((m) => m.id === pin.suggestedMcuPin || m.label === pin.suggestedMcuPin) ||
            ARDUINO_UNO_PINS.find((m) => m.type === pin.type);

          if (targetMcuPin) {
            newWires.push({
              id: `w-${comp.instanceId}-${pin.id}`,
              from: { id: `${comp.instanceId}:${pin.id}`, x: pinAbsX, y: pinAbsY },
              to: { id: `mcu:${targetMcuPin.id}`, x: mcuComp.x + targetMcuPin.x, y: mcuComp.y + targetMcuPin.y },
              color: pin.defaultWireColor || activeWireColor,
              label: `${pin.name} ➔ ${targetMcuPin.label}`,
            });
          }
        });
      });

    setWires(newWires);
    setSerialLogs((prev) => [...prev, `> [Auto-Route Wires] Connected ${newWires.length} pins cleanly.`]);
  };

  // 6. TOOLBAR ACTION: Duplicate Selected Component
  const handleDuplicateSelected = () => {
    if (!selectedComponentId) return;
    const target = placedComponents.find((c) => c.instanceId === selectedComponentId);
    if (!target) return;

    const clonedId = `${target.type}-${Date.now().toString().slice(-4)}`;
    const cloned: PlacedComponent = {
      ...target,
      instanceId: clonedId,
      x: target.x + 40,
      y: target.y + 40,
    };
    setPlacedComponents((prev) => [...prev, cloned]);
    setSelectedComponentId(clonedId);
  };

  // 8. TOOLBAR ACTION: Fit View / Center
  const handleFitView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    recalculateWires();
  };

  // Add Sensor from drawer
  const handleAddSensor = (sensorDef: CPSSensorDefinition) => {
    const newId = `${sensorDef.id}-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'sensor',
      sensorDef,
      title: sensorDef.title,
      x: 80 - pan.x / zoom + (placedComponents.length % 3) * 40,
      y: 80 - pan.y / zoom + Math.floor(placedComponents.length / 3) * 60,
      rotation: 0,
      values: { ...sensorDef.defaultValues },
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Add Discrete Component (LED, Resistor, Pot, Button, LCD)
  const handleAddDiscrete = (discreteType: 'led' | 'resistor' | 'button' | 'potentiometer' | 'lcd', color?: string) => {
    const newId = `${discreteType}-${Date.now().toString().slice(-4)}`;
    const title =
      discreteType === 'led'
        ? `${(color || 'Red').toUpperCase()} 5mm LED`
        : discreteType === 'resistor'
        ? '220Ω Resistor'
        : discreteType === 'button'
        ? 'Tactile Push Button'
        : discreteType === 'potentiometer'
        ? '10k Potentiometer'
        : '16x2 I2C LCD';

    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'discrete',
      discreteType,
      title,
      x: 140 - pan.x / zoom + (placedComponents.length % 4) * 30,
      y: 140 - pan.y / zoom + (placedComponents.length % 4) * 30,
      rotation: 0,
      values: {
        color: color || 'red',
        isLit: true,
        resistance: '220',
        value: 50,
        isPressed: false,
        line1: 'CPS IoT Lab v2.4',
        line2: 'System Online',
      },
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
      x: 180 - pan.x / zoom,
      y: 120 - pan.y / zoom,
      rotation: 0,
      values: {},
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Add MCU Board
  const handleAddBoard = (boardName: string) => {
    const newId = `mcu-${Date.now().toString().slice(-4)}`;
    const newComp: PlacedComponent = {
      instanceId: newId,
      type: 'mcu',
      title: boardName,
      x: 400 - pan.x / zoom,
      y: 100 - pan.y / zoom,
      rotation: 0,
      values: {},
    };
    setPlacedComponents((prev) => [...prev, newComp]);
    setSelectedComponentId(newId);
  };

  // Generic Pin Click Router: Connects ANY pin to ANY pin!
  const handleGenericPinClick = (pinId: string, absX: number, absY: number, label: string, suggestedColor?: string) => {
    if (!selectedPin) {
      // Pick first pin
      setSelectedPin({ id: pinId, x: absX, y: absY, label, suggestedColor });
    } else {
      // If clicking same pin, cancel
      if (selectedPin.id === pinId) {
        setSelectedPin(null);
        return;
      }

      // Establish new wire!
      const wireCol = suggestedColor || selectedPin.suggestedColor || activeWireColor;
      const newWire: WireConnection = {
        id: `w-${Date.now()}`,
        from: { id: selectedPin.id, x: selectedPin.x, y: selectedPin.y },
        to: { id: pinId, x: absX, y: absY },
        color: wireCol,
        label: `${selectedPin.label} ➔ ${label}`,
      };

      setWires((prev) => [...prev, newWire]);
      setSelectedPin(null);
    }
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

  // Serial Monitor Command Processor
  const handleSendSerialCommand = (cmd: string) => {
    const upper = cmd.trim().toUpperCase();
    setSerialLogs((logs) => [...logs, `> User: ${cmd}`]);

    setTimeout(() => {
      if (upper === 'HELP') {
        setSerialLogs((logs) => [
          ...logs,
          'Available Commands: HELP, STATUS, READ, LED ON, LED OFF, PUMP ON, PUMP OFF, RESET',
        ]);
      } else if (upper === 'STATUS') {
        setSerialLogs((logs) => [
          ...logs,
          `[MCU] Online: 5.0V Rail OK | Sim Time: ${simTimeSeconds}s | Components: ${placedComponents.length} | Wires: ${wires.length}`,
        ]);
      } else if (upper === 'READ') {
        setSerialLogs((logs) => [
          ...logs,
          `[ADC Snapshot] A0: 420 | A1: 512 | A2: 680 | I2C Bus: 0x27 ACK`,
        ]);
      } else if (upper === 'LED ON') {
        setPlacedComponents((prev) =>
          prev.map((c) =>
            c.type === 'discrete' && c.discreteType === 'led'
              ? { ...c, values: { ...c.values, isLit: true } }
              : c
          )
        );
        setSerialLogs((logs) => [...logs, '[MCU] Pin 13 LED Set HIGH.']);
      } else if (upper === 'LED OFF') {
        setPlacedComponents((prev) =>
          prev.map((c) =>
            c.type === 'discrete' && c.discreteType === 'led'
              ? { ...c, values: { ...c.values, isLit: false } }
              : c
          )
        );
        setSerialLogs((logs) => [...logs, '[MCU] Pin 13 LED Set LOW.']);
      } else if (upper === 'RESET') {
        handleResetSimulation();
      } else {
        setSerialLogs((logs) => [...logs, `[Firmware] Received: "${cmd}" (Type HELP for list of commands)`]);
      }
    }, 150);
  };

  // Load a starter project preset
  const handleLoadProject = (proj: StarterProject) => {
    setPlacedComponents(proj.components);
    setWires(proj.wires);
    setProjectTitle(proj.title);
    setArduinoCode(proj.initialCode);
    setOpenMenu(null);
    handleFitView();
  };

  // Save current project to localStorage
  const handleSaveProject = () => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('cps-saved-projects') || '[]');
      const newEntry = {
        title: projectTitle,
        components: placedComponents,
        wires,
        savedAt: new Date().toLocaleString(),
      };
      savedProjects.unshift(newEntry);
      localStorage.setItem('cps-saved-projects', JSON.stringify(savedProjects.slice(0, 10)));
      alert(`Project "${projectTitle}" saved successfully to your browser storage!`);
      setOpenMenu(null);
    } catch (e) {
      alert('Failed to save project to localStorage.');
    }
  };

  // Export functions
  const handleExportIno = () => {
    const blob = new Blob([arduinoCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.replace(/\s+/g, '_')}.ino`;
    a.click();
    setOpenMenu(null);
  };

  const handleExportBOM = () => {
    let csv = 'Product / Component Name,Category,Quantity\n';
    placedComponents.forEach((c) => {
      const title = c.sensorDef ? c.sensorDef.title : c.title;
      const cat = c.sensorDef ? c.sensorDef.category : c.type.toUpperCase();
      csv += `"${title}","${cat}",1\n`;
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
                  title="Click to rename circuit"
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
                  <div className={`absolute top-6 left-0 w-52 border rounded-xl shadow-xl py-1 z-50 text-xs ${
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
                      onClick={handleSaveProject}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span>Save Project</span>
                      <span className="text-[10px] text-slate-400">Storage</span>
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
                  <div className={`absolute top-6 left-0 w-48 border rounded-xl shadow-xl py-1 z-50 text-xs ${
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
                      Rotate Selected (R)
                    </button>
                    <button
                      onClick={() => {
                        handleDuplicateSelected();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      Duplicate Selected
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteSelected();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-rose-500 ${isDarkMode ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50'}`}
                    >
                      Delete Selected (Del)
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
                    <button
                      onClick={() => {
                        setIsShortcutsOpen(true);
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      Keyboard Shortcuts ⌨️
                    </button>
                    <Link
                      href="/products"
                      target="_blank"
                      className={`w-full block px-3 py-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    >
                      CPS Sensor Datasheets ↗
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
            <span className="material-symbols-outlined text-sm text-blue-600">draw</span>
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
            <span className="material-symbols-outlined text-sm text-blue-600">code</span>
            Code
          </button>

          <button
            onClick={() => {
              setActiveMode('simulate');
              if (!isSimulating) handleToggleSimulation();
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
            <span className="material-symbols-outlined text-sm text-emerald-500">play_circle</span>
            Simulate
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isDarkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-amber-500">upload</span>
            Upload
          </button>
        </div>

        {/* Right: Auth / Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Wire Color Palette Indicator */}
          <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <span className="text-[10px] font-bold text-slate-500 mr-1">Wire:</span>
            {WIRE_COLORS.slice(0, 5).map((wc) => (
              <button
                key={wc.color}
                onClick={() => {
                  setActiveWireColor(wc.color);
                  if (selectedWireId) {
                    setWires((prev) =>
                      prev.map((w) => (w.id === selectedWireId ? { ...w, color: wc.color } : w))
                    );
                  }
                }}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  activeWireColor === wc.color ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: wc.color }}
                title={wc.label}
              />
            ))}
          </div>

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

      {/* Short Circuit Warning Banner */}
      {hasShortCircuit && (
        <div className="bg-rose-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>SHORT CIRCUIT DETECTED: A wire directly bridges VCC (Power) to Ground! Check connections.</span>
          </div>
          <button
            onClick={() => {
              // Remove short circuit wires
              setWires((prev) =>
                prev.filter((w) => {
                  const f = w.from.id.toLowerCase();
                  const t = w.to.id.toLowerCase();
                  return !(
                    (f.includes('5v') && t.includes('gnd')) ||
                    (t.includes('5v') && f.includes('gnd')) ||
                    (f.includes('vcc') && t.includes('gnd')) ||
                    (t.includes('vcc') && f.includes('gnd'))
                  );
                })
              );
            }}
            className="px-2 py-0.5 rounded bg-rose-800 hover:bg-rose-900 text-[11px]"
          >
            Remove Short Wire
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. WORKSPACE BODY (Left Rails + Secondary Drawer + Canvas + Docked Panel)
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

          <div className={`w-8 h-px my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <button
            onClick={() => {
              setActiveRail('projects');
              setSidebarOpen(true);
            }}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
              activeRail === 'projects' && sidebarOpen
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-blue-50 text-blue-600'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-100'
                  : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Starter Projects"
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
              {/* Rail Content 1: PARTS */}
              {activeRail === 'parts' && (
                <>
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
                  </div>

                  {/* Parts Grid */}
                  <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 content-start">
                    {/* Arduino UNO */}
                    <div
                      onClick={() => handleAddBoard('Arduino UNO')}
                      className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer h-[92px] text-center"
                      title="Arduino Uno Rev3 (ATmega328P with Simulation Logic)"
                    >
                      <div className="w-11 h-9 rounded bg-[#00878f] border border-[#006f75] flex flex-col items-center justify-center p-0.5 shadow-sm">
                        <div className="w-5 h-2 bg-[#1e293b] rounded-xs mb-0.5" />
                        <span className="text-[8px] font-mono font-bold text-white leading-none">UNO</span>
                      </div>
                      <span className="text-[10px] font-medium leading-tight">Arduino UNO</span>
                    </div>

                    {/* Arduino Mega */}
                    <div
                      onClick={() => handleAddBoard('Arduino Mega 2560')}
                      className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer h-[92px] text-center"
                      title="Arduino Mega 2560"
                    >
                      <div className="w-12 h-9 rounded bg-[#00878f] border border-[#006f75] flex flex-col items-center justify-center p-0.5 shadow-sm">
                        <span className="text-[7px] font-mono font-bold text-white leading-none">MEGA 2560</span>
                      </div>
                      <span className="text-[10px] font-medium leading-tight">Arduino Mega</span>
                    </div>

                    {/* CPS Sensors Catalog */}
                    {filteredSensors.map((sensor) => (
                      <div
                        key={sensor.id}
                        onClick={() => handleAddSensor(sensor)}
                        className="flex flex-col items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer h-[92px] text-center"
                        title={sensor.subtitle}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs ${
                            isDarkMode
                              ? 'bg-slate-800 border-slate-700 text-cyan-400'
                              : 'bg-blue-50 border-blue-100 text-blue-600'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{sensor.icon}</span>
                        </div>
                        <span className="text-[10px] font-medium leading-tight line-clamp-2">
                          {sensor.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Rail Content 4: PROJECTS / STARTER TEMPLATES */}
              {activeRail === 'projects' && (
                <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">
                  <div>
                    <h4 className="font-bold text-xs">Starter Circuits</h4>
                    <p className="text-[10px] text-slate-500">1-click complete pre-wired templates</p>
                  </div>
                  <div className="space-y-2.5">
                    {STARTER_PROJECTS.map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => handleLoadProject(proj)}
                        className={`p-3 rounded-xl border cursor-pointer hover:border-blue-500 transition-all ${
                          isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 material-symbols-outlined text-base">
                            {proj.icon}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold">{proj.title}</h5>
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                              {proj.components.length} parts • {proj.wires.length} wires
                            </span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            3. MAIN CANVAS AREA
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
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
        >
          {/* TOP-RIGHT FLOATING TOOLBAR */}
          <div className="absolute top-4 right-6 z-30 flex items-center gap-2">
            {/* 1. GREEN CIRCULAR PLAY BUTTON: "Start the simulation" */}
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
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/simbtn:opacity-100 transition-opacity pointer-events-none z-50">
                {isSimulating ? 'Stop the simulation' : 'Start the simulation'}
              </div>
            </div>

            {/* Canvas Action Bar */}
            <div className={`flex items-center border rounded-2xl p-1 shadow-md gap-0.5 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#ffffff] border-slate-200'
            }`}>
              {/* 2. TEXT TOOL: "Create Textbox / Comment" */}
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

              {/* 3. AUTO-ROUTE WIRES BUTTON */}
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

              {/* 4. GRID TOGGLE */}
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

              {/* 5. ROTATE SELECTED */}
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

              {/* Fit View / Center */}
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
                  Fit to screen / Center
                </div>
              </div>

              {/* Zoom In */}
              <div className="relative group/tool">
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">zoom_in</span>
                </button>
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#334155] text-white text-[11px] font-medium py-1 px-2.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition-opacity pointer-events-none z-50">
                  Zoom in ({Math.round(zoom * 100)}%)
                </div>
              </div>

              {/* Zoom Out */}
              <div className="relative group/tool">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
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

              {/* Delete Selected */}
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
                  Delete selected (Del)
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

          {/* SVG Wires Layer (Transformed with Canvas Pan & Zoom) */}
          <div
            className="absolute inset-0 origin-top-left pointer-events-none"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            <WiresLayer
              wires={wires}
              selectedWireId={selectedWireId}
              onSelectWire={(id) => setSelectedWireId(id)}
              activeDraftWire={
                selectedPin
                  ? {
                      from: { x: selectedPin.x, y: selectedPin.y },
                      to: { x: mousePos.x, y: mousePos.y },
                      color: selectedPin.suggestedColor || activeWireColor,
                    }
                  : null
              }
              onRemoveWire={(wireId) => setWires((prev) => prev.filter((w) => w.id !== wireId))}
              isSimulating={isSimulating}
            />
          </div>

          {/* Canvas Components Container with Pan & Zoom transform */}
          <div
            className="w-full h-full relative origin-top-left pointer-events-auto"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
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
                    onPinClick={(pin) => {
                      const pinAbsX = mcu.x + pin.x;
                      const pinAbsY = mcu.y + pin.y;
                      const color =
                        pin.type === 'power'
                          ? '#ef4444'
                          : pin.type === 'ground'
                          ? '#0f172a'
                          : pin.type === 'i2c'
                          ? '#a855f7'
                          : activeWireColor;
                      handleGenericPinClick(`mcu:${pin.id}`, pinAbsX, pinAbsY, `Arduino ${pin.label}`, color);
                    }}
                    selectedPinId={selectedPin?.id.startsWith('mcu:') ? selectedPin.id.replace('mcu:', '') : null}
                    connectedPinIds={wires.flatMap((w) => [
                      w.from.id.startsWith('mcu:') ? w.from.id.replace('mcu:', '') : '',
                      w.to.id.startsWith('mcu:') ? w.to.id.replace('mcu:', '') : '',
                    ])}
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
                    instanceId={bb.instanceId}
                    type={bb.breadboardType || 'half'}
                    rotation={bb.rotation}
                    isSelected={selectedComponentId === bb.instanceId}
                    onPinClick={(pinKey, relX, relY, label) => {
                      const pinAbsX = bb.x + relX;
                      const pinAbsY = bb.y + relY;
                      const color = pinKey.includes('plus')
                        ? '#ef4444'
                        : pinKey.includes('minus')
                        ? '#0f172a'
                        : activeWireColor;
                      handleGenericPinClick(pinKey, pinAbsX, pinAbsY, `Breadboard ${label}`, color);
                    }}
                    selectedPinId={selectedPin?.id}
                    connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                  />
                </div>
              ))}

            {/* Placed Discrete Components (LED, Resistor, Button, Pot, LCD) */}
            {placedComponents
              .filter((c) => c.type === 'discrete')
              .map((comp) => (
                <div
                  key={comp.instanceId}
                  className={`absolute z-10 cursor-move ${
                    selectedComponentId === comp.instanceId ? 'ring-2 ring-blue-500 rounded-xl' : ''
                  }`}
                  style={{
                    left: comp.x,
                    top: comp.y,
                    transform: `rotate(${comp.rotation}deg)`,
                  }}
                  onMouseDown={(e) => {
                    if ((e.target as HTMLElement).tagName === 'INPUT') return;
                    e.stopPropagation();
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
                  {comp.discreteType === 'led' && (
                    <LEDComponent
                      instanceId={comp.instanceId}
                      color={comp.values.color || 'red'}
                      isLit={isSimulating && comp.values.isLit}
                      isSelected={selectedComponentId === comp.instanceId}
                      onPinClick={(instId, pin) => {
                        handleGenericPinClick(
                          `${instId}:${pin.id}`,
                          comp.x + pin.relX,
                          comp.y + pin.relY,
                          `LED ${pin.name}`,
                          pin.id === 'anode' ? '#ef4444' : '#0f172a'
                        );
                      }}
                      selectedPinId={selectedPin?.id}
                      connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    />
                  )}

                  {comp.discreteType === 'resistor' && (
                    <ResistorComponent
                      instanceId={comp.instanceId}
                      resistance={comp.values.resistance || '220'}
                      isSelected={selectedComponentId === comp.instanceId}
                      onPinClick={(instId, pin) => {
                        handleGenericPinClick(
                          `${instId}:${pin.id}`,
                          comp.x + pin.relX,
                          comp.y + pin.relY,
                          `Resistor ${pin.name}`,
                          activeWireColor
                        );
                      }}
                      selectedPinId={selectedPin?.id}
                      connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    />
                  )}

                  {comp.discreteType === 'button' && (
                    <PushButtonComponent
                      instanceId={comp.instanceId}
                      isPressed={comp.values.isPressed}
                      onPressChange={(instId, pressed) => {
                        handleValueChange(instId, 'isPressed', pressed);
                        if (pressed) playBeep(900);
                      }}
                      isSelected={selectedComponentId === comp.instanceId}
                      onPinClick={(instId, pin) => {
                        handleGenericPinClick(
                          `${instId}:${pin.id}`,
                          comp.x + pin.relX,
                          comp.y + pin.relY,
                          `Button ${pin.name}`,
                          activeWireColor
                        );
                      }}
                      selectedPinId={selectedPin?.id}
                      connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    />
                  )}

                  {comp.discreteType === 'potentiometer' && (
                    <PotentiometerComponent
                      instanceId={comp.instanceId}
                      value={comp.values.value ?? 50}
                      onChange={(instId, val) => handleValueChange(instId, 'value', val)}
                      isSelected={selectedComponentId === comp.instanceId}
                      onPinClick={(instId, pin) => {
                        handleGenericPinClick(
                          `${instId}:${pin.id}`,
                          comp.x + pin.relX,
                          comp.y + pin.relY,
                          `Pot ${pin.name}`,
                          pin.id === 'vcc' ? '#ef4444' : pin.id === 'gnd' ? '#0f172a' : '#22c55e'
                        );
                      }}
                      selectedPinId={selectedPin?.id}
                      connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    />
                  )}

                  {comp.discreteType === 'lcd' && (
                    <Lcd16x2Component
                      instanceId={comp.instanceId}
                      line1={comp.values.line1}
                      line2={comp.values.line2}
                      isBacklightOn={isSimulating}
                      isSelected={selectedComponentId === comp.instanceId}
                      onPinClick={(instId, pin) => {
                        handleGenericPinClick(
                          `${instId}:${pin.id}`,
                          comp.x + pin.relX,
                          comp.y + pin.relY,
                          `LCD ${pin.name}`,
                          pin.id === 'vcc' ? '#ef4444' : pin.id === 'gnd' ? '#0f172a' : '#a855f7'
                        );
                      }}
                      selectedPinId={selectedPin?.id}
                      connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    />
                  )}
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
                    onPinClick={(instId, pin) => {
                      const pinAbsX = comp.x + (pin.x / 100) * 300;
                      const pinAbsY = comp.y + 244;
                      handleGenericPinClick(
                        `${instId}:${pin.id}`,
                        pinAbsX,
                        pinAbsY,
                        `${comp.sensorDef!.title} ${pin.name}`,
                        pin.defaultWireColor
                      );
                    }}
                    onRemove={(id) => {
                      setPlacedComponents((prev) => prev.filter((c) => c.instanceId !== id));
                      setWires((prev) => prev.filter((w) => !w.from.id.startsWith(id) && !w.to.id.startsWith(id)));
                    }}
                    selectedPinId={selectedPin?.id}
                    connectedPinIds={wires.flatMap((w) => [w.from.id, w.to.id])}
                    isSimulating={isSimulating}
                  />
                </div>
              ))}

            {/* Placed Canvas Comments / Textboxes */}
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
            4. DOCKED CODE & SERIAL MONITOR PANEL (Cirkit Designer Mode)
           ───────────────────────────────────────────────────────────── */}
        {(activeMode === 'code' || activeMode === 'simulate') && (
          <div className="w-[460px] h-full shrink-0 z-30 shadow-2xl flex flex-col">
            <CodeAndTerminalPanel
              activeCode={arduinoCode}
              onCodeChange={(code) => setArduinoCode(code)}
              serialLogs={serialLogs}
              onClearLogs={() => setSerialLogs([])}
              onSendSerialCommand={handleSendSerialCommand}
              isSimulating={isSimulating}
              onToggleSimulate={handleToggleSimulation}
              onResetSim={handleResetSimulation}
              placedComponents={placedComponents}
              wires={wires}
              onClose={() => setActiveMode('design')}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. MODALS (Custom Parts, WebSerial Upload, Shortcuts)
         ───────────────────────────────────────────────────────────── */}
      {/* Firmware Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-[#ffffff] border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 material-symbols-outlined text-xl">
                  upload
                </span>
                <div>
                  <h3 className="text-base font-bold">Deploy Firmware to Board</h3>
                  <p className="text-xs text-slate-500">WebSerial USB Flasher</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-800 dark:text-blue-300">
                Plug your physical Arduino Uno into USB and click &quot;Connect via WebSerial&quot; to burn your sketch directly.
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Target Board:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Arduino Uno (ATmega328P)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Flash Size:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">4,182 bytes</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Baud Rate:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">115200 (Optiboot)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if ('serial' in navigator) {
                    (navigator as any).serial
                      .requestPort()
                      .then(() => alert('Hardware Connected: Uploading sketch...'))
                      .catch(() => alert('WebSerial connection cancelled.'));
                  } else {
                    alert('WebSerial API is supported in Google Chrome & Edge. You can also download the .ino sketch from File menu.');
                  }
                  setIsUploadModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95"
              >
                Connect & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-100' : 'bg-[#ffffff] border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Rotate Component:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">R</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delete Selected:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">Del / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cancel Wire / Deselect:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono font-bold">Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Pan Canvas:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Click & Drag Empty Space</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Zoom:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Toolbar Zoom +/-</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

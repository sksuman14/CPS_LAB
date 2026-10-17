'use client';

import React from 'react';

// Pin definition for discrete components
export interface DiscretePin {
  id: string;
  name: string;
  type: 'power' | 'ground' | 'analog' | 'digital' | 'i2c';
  relX: number;
  relY: number;
}

// ─────────────────────────────────────────────────────────────
// 1. LED COMPONENT (5mm Through-Hole LED)
// ─────────────────────────────────────────────────────────────
interface LEDComponentProps {
  instanceId: string;
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'white';
  isLit?: boolean;
  isSelected?: boolean;
  onPinClick?: (instanceId: string, pin: DiscretePin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export function LEDComponent({
  instanceId,
  color = 'red',
  isLit = false,
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: LEDComponentProps) {
  const colorMap = {
    red: { fill: '#ef4444', glow: '#f87171', shadow: 'rgba(239, 68, 68, 0.7)' },
    green: { fill: '#22c55e', glow: '#4ade80', shadow: 'rgba(34, 197, 94, 0.7)' },
    blue: { fill: '#3b82f6', glow: '#60a5fa', shadow: 'rgba(59, 130, 246, 0.7)' },
    yellow: { fill: '#eab308', glow: '#fde047', shadow: 'rgba(234, 179, 8, 0.7)' },
    white: { fill: '#f8fafc', glow: '#ffffff', shadow: 'rgba(255, 255, 255, 0.8)' },
  };

  const selectedCol = colorMap[color] || colorMap.red;

  const pins: DiscretePin[] = [
    { id: 'anode', name: 'Anode (+)', type: 'digital', relX: 20, relY: 90 },
    { id: 'cathode', name: 'Cathode (-)', type: 'ground', relX: 44, relY: 90 },
  ];

  return (
    <div
      className={`relative w-[64px] h-[100px] select-none ${
        isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''
      }`}
    >
      <svg viewBox="0 0 64 100" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`ledGlow-${instanceId}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={selectedCol.glow} stopOpacity="0.8" />
            <stop offset="100%" stopColor={selectedCol.fill} stopOpacity="0.9" />
          </radialGradient>
          <filter id={`bloom-${instanceId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Metal Legs (Leads) */}
        {/* Anode (Longer leg, bent slightly) */}
        <path d="M 20 50 L 20 86" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        {/* Cathode (Shorter straight leg) */}
        <path d="M 44 50 L 44 86" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* LED Dome Body */}
        {/* Glow halo when lit */}
        {isLit && (
          <circle
            cx="32"
            cy="28"
            r="24"
            fill={selectedCol.fill}
            opacity="0.5"
            filter={`url(#bloom-${instanceId})`}
            className="animate-pulse"
          />
        )}

        {/* Epoxy Base Rim */}
        <ellipse cx="32" cy="48" rx="19" ry="5" fill="#475569" opacity="0.6" />
        <ellipse cx="32" cy="46" rx="18" ry="4" fill={selectedCol.fill} opacity={isLit ? 1 : 0.7} />

        {/* Main Dome */}
        <path
          d="M 14 46 C 14 20, 50 20, 50 46 Z"
          fill={isLit ? `url(#ledGlow-${instanceId})` : selectedCol.fill}
          stroke={selectedCol.glow}
          strokeWidth="1"
          opacity={isLit ? 1 : 0.85}
        />

        {/* Internal Anode / Cathode Post silhouette */}
        <path d="M 24 45 L 24 35 L 30 35" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <path d="M 40 45 L 40 32 L 34 32" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

        {/* Specular Highlight on Dome */}
        <path
          d="M 22 24 C 22 18, 30 18, 34 20"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={isLit ? 0.9 : 0.6}
        />

        {/* Interactive Pin Terminals */}
        {pins.map((p) => {
          const isPinSelected = selectedPinId === `${instanceId}:${p.id}`;
          const isConnected = connectedPinIds.includes(`${instanceId}:${p.id}`);

          return (
            <g
              key={p.id}
              className="cursor-pointer group/pin"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(instanceId, p);
              }}
            >
              <circle
                cx={p.relX}
                cy={p.relY}
                r="6"
                fill={isPinSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isPinSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.5"
                className="transition-all group-hover/pin:fill-sky-400 group-hover/pin:scale-125"
              />
              <circle cx={p.relX} cy={p.relY} r="2.5" fill="#000000" />
              <text
                x={p.relX}
                y={p.relY + 9}
                fill="#cbd5e1"
                fontSize="6"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.id === 'anode' ? '+' : '-'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. RESISTOR COMPONENT (1/4W Through-Hole Resistor)
// ─────────────────────────────────────────────────────────────
interface ResistorComponentProps {
  instanceId: string;
  resistance?: '220' | '1k' | '10k' | '100k';
  isSelected?: boolean;
  onPinClick?: (instanceId: string, pin: DiscretePin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export function ResistorComponent({
  instanceId,
  resistance = '220',
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: ResistorComponentProps) {
  // Color bands [Band 1, Band 2, Multiplier, Tolerance (Gold)]
  const bandsMap: Record<string, string[]> = {
    '220': ['#dc2626', '#dc2626', '#92400e', '#f59e0b'], // Red, Red, Brown, Gold
    '1k': ['#92400e', '#000000', '#dc2626', '#f59e0b'], // Brown, Black, Red, Gold
    '10k': ['#92400e', '#000000', '#f97316', '#f59e0b'], // Brown, Black, Orange, Gold
    '100k': ['#92400e', '#000000', '#eab308', '#f59e0b'], // Brown, Black, Yellow, Gold
  };

  const bands = bandsMap[resistance] || bandsMap['220'];

  const pins: DiscretePin[] = [
    { id: 'pin1', name: 'Pin 1', type: 'digital', relX: 8, relY: 20 },
    { id: 'pin2', name: 'Pin 2', type: 'digital', relX: 112, relY: 20 },
  ];

  return (
    <div
      className={`relative w-[120px] h-[40px] select-none ${
        isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''
      }`}
    >
      <svg viewBox="0 0 120 40" className="w-full h-full overflow-visible">
        {/* Metal Leads */}
        <line x1="8" y1="20" x2="32" y2="20" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="88" y1="20" x2="112" y2="20" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Resistor Body (Beige ceramic with bulbous ends) */}
        <path
          d="M 32 14 C 36 10, 42 10, 46 13 L 74 13 C 78 10, 84 10, 88 14 C 90 18, 90 22, 88 26 C 84 30, 78 30, 74 27 L 46 27 C 42 30, 36 30, 32 26 C 30 22, 30 18, 32 14 Z"
          fill="#d4b483"
          stroke="#b8935c"
          strokeWidth="1.2"
        />

        {/* Color Bands */}
        <rect x="42" y="11" width="4" height="18" fill={bands[0]} rx="0.5" />
        <rect x="52" y="13" width="4" height="14" fill={bands[1]} rx="0.5" />
        <rect x="62" y="13" width="4" height="14" fill={bands[2]} rx="0.5" />
        <rect x="76" y="11" width="4" height="18" fill={bands[3]} rx="0.5" />

        {/* Value Label */}
        <text x="60" y="36" fill="#64748b" fontSize="7" fontWeight="bold" textAnchor="middle">
          {resistance === '220' ? '220 Ω' : `${resistance} Ω`}
        </text>

        {/* Interactive Pins */}
        {pins.map((p) => {
          const isPinSelected = selectedPinId === `${instanceId}:${p.id}`;
          const isConnected = connectedPinIds.includes(`${instanceId}:${p.id}`);

          return (
            <g
              key={p.id}
              className="cursor-pointer group/pin"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(instanceId, p);
              }}
            >
              <circle
                cx={p.relX}
                cy={p.relY}
                r="5"
                fill={isPinSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isPinSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.2"
                className="transition-all group-hover/pin:fill-sky-400 group-hover/pin:scale-125"
              />
              <circle cx={p.relX} cy={p.relY} r="2" fill="#000000" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. TACTILE PUSH BUTTON SWITCH
// ─────────────────────────────────────────────────────────────
interface PushButtonComponentProps {
  instanceId: string;
  isPressed?: boolean;
  onPressChange?: (instanceId: string, pressed: boolean) => void;
  isSelected?: boolean;
  onPinClick?: (instanceId: string, pin: DiscretePin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export function PushButtonComponent({
  instanceId,
  isPressed = false,
  onPressChange,
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: PushButtonComponentProps) {
  const pins: DiscretePin[] = [
    { id: '1a', name: 'Pin 1A', type: 'digital', relX: 8, relY: 18 },
    { id: '1b', name: 'Pin 1B', type: 'digital', relX: 8, relY: 42 },
    { id: '2a', name: 'Pin 2A', type: 'digital', relX: 52, relY: 18 },
    { id: '2b', name: 'Pin 2B', type: 'digital', relX: 52, relY: 42 },
  ];

  return (
    <div
      className={`relative w-[60px] h-[60px] select-none ${
        isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''
      }`}
    >
      <svg viewBox="0 0 60 60" className="w-full h-full overflow-visible">
        {/* Metal Terminals */}
        <path d="M 8 18 L 18 18" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 8 42 L 18 42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 42 18 L 52 18" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 42 42 L 52 42" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Black Plastic Switch Body */}
        <rect x="16" y="10" width="28" height="40" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        {/* Metal Top Plate */}
        <rect x="18" y="12" width="24" height="36" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />

        {/* Corner Rivets */}
        <circle cx="21" cy="15" r="1.5" fill="#64748b" />
        <circle cx="39" cy="15" r="1.5" fill="#64748b" />
        <circle cx="21" cy="45" r="1.5" fill="#64748b" />
        <circle cx="39" cy="45" r="1.5" fill="#64748b" />

        {/* Circular Push Actuator (Clickable) */}
        <g
          className="cursor-pointer"
          onMouseDown={() => onPressChange?.(instanceId, true)}
          onMouseUp={() => onPressChange?.(instanceId, false)}
          onTouchStart={() => onPressChange?.(instanceId, true)}
          onTouchEnd={() => onPressChange?.(instanceId, false)}
        >
          <circle
            cx="30"
            cy="30"
            r={isPressed ? '9' : '10'}
            fill={isPressed ? '#dc2626' : '#ef4444'}
            stroke="#b91c1c"
            strokeWidth="1.5"
            className="transition-transform active:scale-90"
          />
          <circle
            cx="30"
            cy="30"
            r={isPressed ? '5' : '6'}
            fill={isPressed ? '#991b1b' : '#dc2626'}
          />
        </g>

        {/* Interactive Terminals */}
        {pins.map((p) => {
          const isPinSelected = selectedPinId === `${instanceId}:${p.id}`;
          const isConnected = connectedPinIds.includes(`${instanceId}:${p.id}`);

          return (
            <g
              key={p.id}
              className="cursor-pointer group/pin"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(instanceId, p);
              }}
            >
              <circle
                cx={p.relX}
                cy={p.relY}
                r="4.5"
                fill={isPinSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isPinSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.2"
                className="transition-all group-hover/pin:fill-sky-400 group-hover/pin:scale-125"
              />
              <circle cx={p.relX} cy={p.relY} r="1.8" fill="#000000" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. 10K ROTARY POTENTIOMETER
// ─────────────────────────────────────────────────────────────
interface PotentiometerComponentProps {
  instanceId: string;
  value?: number; // 0 to 100
  onChange?: (instanceId: string, val: number) => void;
  isSelected?: boolean;
  onPinClick?: (instanceId: string, pin: DiscretePin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export function PotentiometerComponent({
  instanceId,
  value = 50,
  onChange,
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: PotentiometerComponentProps) {
  const pins: DiscretePin[] = [
    { id: 'vcc', name: 'VCC (1)', type: 'power', relX: 18, relY: 72 },
    { id: 'wiper', name: 'SIG (Wiper)', type: 'analog', relX: 40, relY: 72 },
    { id: 'gnd', name: 'GND (3)', type: 'ground', relX: 62, relY: 72 },
  ];

  // Rotate knob pointer from -135deg to +135deg based on value (0 to 100)
  const angle = -135 + (value / 100) * 270;

  return (
    <div
      className={`relative w-[80px] h-[80px] select-none ${
        isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''
      }`}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full overflow-visible">
        {/* Metal Legs */}
        <line x1="18" y1="52" x2="18" y2="70" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="52" x2="40" y2="70" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="62" y1="52" x2="62" y2="70" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

        {/* Blue Pot Body */}
        <rect x="10" y="10" width="60" height="46" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

        {/* Circular Knob Well */}
        <circle cx="40" cy="32" r="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="40" cy="32" r="14" fill="#f8fafc" />

        {/* Rotating Dial Notch */}
        <g transform={`rotate(${angle} 40 32)`}>
          <line x1="40" y1="32" x2="40" y2="19" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="20" r="1.5" fill="#ffffff" />
        </g>

        {/* Resistance Text */}
        <text x="40" y="50" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">
          10K POT ({value}%)
        </text>

        {/* Interactive Pins */}
        {pins.map((p) => {
          const isPinSelected = selectedPinId === `${instanceId}:${p.id}`;
          const isConnected = connectedPinIds.includes(`${instanceId}:${p.id}`);

          return (
            <g
              key={p.id}
              className="cursor-pointer group/pin"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(instanceId, p);
              }}
            >
              <circle
                cx={p.relX}
                cy={p.relY}
                r="5"
                fill={isPinSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isPinSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.2"
                className="transition-all group-hover/pin:fill-sky-400 group-hover/pin:scale-125"
              />
              <circle cx={p.relX} cy={p.relY} r="2" fill="#000000" />
            </g>
          );
        })}
      </svg>

      {/* Interactive slider under the pot to easily rotate without mouse dragging arcs */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange?.(instanceId, parseFloat(e.target.value))}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 accent-sky-500 cursor-pointer"
        title={`Rotate 10k Potentiometer (${value}%)`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. 16x2 I2C ALPHANUMERIC LCD MODULE
// ─────────────────────────────────────────────────────────────
interface Lcd16x2ComponentProps {
  instanceId: string;
  line1?: string;
  line2?: string;
  isBacklightOn?: boolean;
  isSelected?: boolean;
  onPinClick?: (instanceId: string, pin: DiscretePin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
}

export function Lcd16x2Component({
  instanceId,
  line1 = 'CPS IoT Lab v2.4',
  line2 = 'System Ready...',
  isBacklightOn = true,
  isSelected = false,
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
}: Lcd16x2ComponentProps) {
  const pins: DiscretePin[] = [
    { id: 'gnd', name: 'GND', type: 'ground', relX: 18, relY: 10 },
    { id: 'vcc', name: 'VCC', type: 'power', relX: 34, relY: 10 },
    { id: 'sda', name: 'SDA', type: 'i2c', relX: 50, relY: 10 },
    { id: 'scl', name: 'SCL', type: 'i2c', relX: 66, relY: 10 },
  ];

  return (
    <div
      className={`relative w-[210px] h-[95px] select-none ${
        isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''
      }`}
    >
      <svg viewBox="0 0 210 95" className="w-full h-full overflow-visible">
        {/* Green PCB Board */}
        <rect x="0" y="0" width="210" height="95" rx="5" fill="#15803d" stroke="#166534" strokeWidth="2" />

        {/* Mounting screw holes */}
        <circle cx="8" cy="8" r="3.5" fill="#052e16" stroke="#4ade80" strokeWidth="0.8" />
        <circle cx="202" cy="8" r="3.5" fill="#052e16" stroke="#4ade80" strokeWidth="0.8" />
        <circle cx="8" cy="87" r="3.5" fill="#052e16" stroke="#4ade80" strokeWidth="0.8" />
        <circle cx="202" cy="87" r="3.5" fill="#052e16" stroke="#4ade80" strokeWidth="0.8" />

        {/* I2C Backpack Header (Top Left) */}
        <rect x="10" y="2" width="64" height="16" rx="2" fill="#0f172a" stroke="#334155" />
        <text x="42" y="24" fill="#bbf7d0" fontSize="5.5" fontWeight="bold" textAnchor="middle">
          I2C (0x27)
        </text>

        {/* Black Bezel Display Frame */}
        <rect x="16" y="28" width="178" height="58" rx="3" fill="#090d16" stroke="#334155" strokeWidth="1.5" />

        {/* Blue Backlit LCD Screen */}
        <rect
          x="22"
          y="34"
          width="166"
          height="46"
          rx="2"
          fill={isBacklightOn ? '#1d4ed8' : '#1e293b'}
          stroke="#1e40af"
          strokeWidth="1"
        />

        {/* LCD Text Lines */}
        <text
          x="28"
          y="52"
          fill={isBacklightOn ? '#ffffff' : '#64748b'}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1"
        >
          {line1.slice(0, 16).padEnd(16, ' ')}
        </text>

        <text
          x="28"
          y="68"
          fill={isBacklightOn ? '#ffffff' : '#64748b'}
          fontSize="9.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="1"
        >
          {line2.slice(0, 16).padEnd(16, ' ')}
        </text>

        {/* Interactive I2C Pins */}
        {pins.map((p) => {
          const isPinSelected = selectedPinId === `${instanceId}:${p.id}`;
          const isConnected = connectedPinIds.includes(`${instanceId}:${p.id}`);

          return (
            <g
              key={p.id}
              className="cursor-pointer group/pin"
              onClick={(e) => {
                e.stopPropagation();
                onPinClick?.(instanceId, p);
              }}
            >
              <circle
                cx={p.relX}
                cy={p.relY}
                r="4.5"
                fill={isPinSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isPinSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.2"
                className="transition-all group-hover/pin:fill-sky-400 group-hover/pin:scale-125"
              />
              <circle cx={p.relX} cy={p.relY} r="1.8" fill="#000000" />
              <text
                x={p.relX}
                y={p.relY - 5}
                fill="#ffffff"
                fontSize="5"
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

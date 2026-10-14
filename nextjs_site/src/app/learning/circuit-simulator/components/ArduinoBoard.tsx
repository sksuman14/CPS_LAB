'use client';

import React from 'react';

export interface McuPin {
  id: string;
  label: string;
  type: 'power' | 'ground' | 'analog' | 'digital' | 'i2c' | 'other';
  header: 'power' | 'analog' | 'digital-low' | 'digital-high';
  x: number; // coordinates relative to board (width=460, height=320)
  y: number;
}

export const ARDUINO_UNO_PINS: McuPin[] = [
  // Power Header (Bottom Left)
  { id: 'IOREF', label: 'IOREF', type: 'other', header: 'power', x: 145, y: 300 },
  { id: 'RESET', label: 'RST', type: 'other', header: 'power', x: 159, y: 300 },
  { id: '3.3V', label: '3.3V', type: 'power', header: 'power', x: 173, y: 300 },
  { id: '5V', label: '5V', type: 'power', header: 'power', x: 187, y: 300 },
  { id: 'GND1', label: 'GND', type: 'ground', header: 'power', x: 201, y: 300 },
  { id: 'GND2', label: 'GND', type: 'ground', header: 'power', x: 215, y: 300 },
  { id: 'VIN', label: 'VIN', type: 'power', header: 'power', x: 229, y: 300 },

  // Analog Header (Bottom Right)
  { id: 'A0', label: 'A0', type: 'analog', header: 'analog', x: 260, y: 300 },
  { id: 'A1', label: 'A1', type: 'analog', header: 'analog', x: 274, y: 300 },
  { id: 'A2', label: 'A2', type: 'analog', header: 'analog', x: 288, y: 300 },
  { id: 'A3', label: 'A3', type: 'analog', header: 'analog', x: 302, y: 300 },
  { id: 'A4', label: 'A4/SDA', type: 'i2c', header: 'analog', x: 316, y: 300 },
  { id: 'A5', label: 'A5/SCL', type: 'i2c', header: 'analog', x: 330, y: 300 },

  // Digital High (Top Right)
  { id: 'SCL', label: 'SCL', type: 'i2c', header: 'digital-high', x: 212, y: 22 },
  { id: 'SDA', label: 'SDA', type: 'i2c', header: 'digital-high', x: 226, y: 22 },
  { id: 'AREF', label: 'AREF', type: 'other', header: 'digital-high', x: 240, y: 22 },
  { id: 'GND', label: 'GND', type: 'ground', header: 'digital-high', x: 254, y: 22 },
  { id: '13', label: '13', type: 'digital', header: 'digital-high', x: 268, y: 22 },
  { id: '12', label: '12', type: 'digital', header: 'digital-high', x: 282, y: 22 },
  { id: '11', label: '~11', type: 'digital', header: 'digital-high', x: 296, y: 22 },
  { id: '10', label: '~10', type: 'digital', header: 'digital-high', x: 310, y: 22 },
  { id: '9', label: '~9', type: 'digital', header: 'digital-high', x: 324, y: 22 },
  { id: '8', label: '8', type: 'digital', header: 'digital-high', x: 338, y: 22 },

  // Digital Low (Top Far Right)
  { id: '7', label: '7', type: 'digital', header: 'digital-low', x: 360, y: 22 },
  { id: '6', label: '~6', type: 'digital', header: 'digital-low', x: 374, y: 22 },
  { id: '5', label: '~5', type: 'digital', header: 'digital-low', x: 388, y: 22 },
  { id: '4', label: '4', type: 'digital', header: 'digital-low', x: 402, y: 22 },
  { id: '3', label: '~3', type: 'digital', header: 'digital-low', x: 416, y: 22 },
  { id: '2', label: '2', type: 'digital', header: 'digital-low', x: 430, y: 22 },
  { id: '1', label: 'TX', type: 'digital', header: 'digital-low', x: 444, y: 22 },
  { id: '0', label: 'RX', type: 'digital', header: 'digital-low', x: 458, y: 22 },
];

interface ArduinoBoardProps {
  onPinClick?: (pin: McuPin) => void;
  selectedPinId?: string | null;
  connectedPinIds?: string[];
  isSimulating?: boolean;
  pin13LedState?: boolean;
  txLedState?: boolean;
  rxLedState?: boolean;
}

export default function ArduinoBoard({
  onPinClick,
  selectedPinId,
  connectedPinIds = [],
  isSimulating = false,
  pin13LedState = false,
  txLedState = false,
  rxLedState = false,
}: ArduinoBoardProps) {
  return (
    <div className="relative select-none drop-shadow-2xl">
      <svg
        viewBox="0 0 490 325"
        className="w-[490px] h-[325px] overflow-visible"
      >
        <defs>
          <linearGradient id="pcbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Arduino PCB Base */}
        <path
          d="M 15 10 L 465 10 A 15 15 0 0 1 480 25 L 480 295 A 15 15 0 0 1 465 310 L 15 310 A 15 15 0 0 1 0 295 L 0 25 A 15 15 0 0 1 15 10 Z"
          fill="url(#pcbGradient)"
          stroke="#38bdf8"
          strokeWidth="1.5"
          filter="url(#boardShadow)"
        />

        {/* Screw Mounting Holes */}
        <circle cx="25" cy="55" r="9" fill="#02476d" stroke="#e0f2fe" strokeWidth="1" />
        <circle cx="25" cy="55" r="4.5" fill="#090d16" />
        
        <circle cx="150" cy="30" r="9" fill="#02476d" stroke="#e0f2fe" strokeWidth="1" />
        <circle cx="150" cy="30" r="4.5" fill="#090d16" />
        
        <circle cx="455" cy="65" r="9" fill="#02476d" stroke="#e0f2fe" floodColor="none" strokeWidth="1" />
        <circle cx="455" cy="65" r="4.5" fill="#090d16" />
        
        <circle cx="455" cy="275" r="9" fill="#02476d" stroke="#e0f2fe" strokeWidth="1" />
        <circle cx="455" cy="275" r="4.5" fill="#090d16" />

        {/* USB B Connector (Metal Shell) */}
        <rect x="0" y="35" width="70" height="60" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        <rect x="8" y="47" width="54" height="36" rx="2" fill="#0f172a" />
        <rect x="18" y="55" width="34" height="20" fill="#e2e8f0" rx="1" />

        {/* 2.1mm DC Barrel Power Jack */}
        <rect x="0" y="220" width="75" height="65" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <rect x="0" y="240" width="35" height="25" fill="#020617" />
        <circle cx="15" cy="252" r="5" fill="#f59e0b" />

        {/* Voltage Regulator & Capacitors */}
        <rect x="85" y="235" width="35" height="40" fill="#1e293b" rx="2" stroke="#475569" />
        <circle cx="85" cy="185" r="11" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="115" cy="185" r="11" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />

        {/* 16MHz Crystal Oscillator */}
        <rect x="95" y="115" width="22" height="42" rx="4" fill="#cbd5e1" stroke="#94a3b8" />
        <text x="106" y="140" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(-90 106 140)">16.000</text>

        {/* ATmega328P Dual-In-Line DIP IC */}
        <rect x="190" y="175" width="170" height="45" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        {/* IC Notch */}
        <path d="M 190 192 A 6 6 0 0 1 190 204 Z" fill="#1e293b" />
        <text x="275" y="202" fill="#94a3b8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
          ATmega328P - PU
        </text>

        {/* IC Pins */}
        {[...Array(14)].map((_, i) => (
          <g key={i}>
            <rect x={200 + i * 11} y="169" width="4" height="6" fill="#cbd5e1" />
            <rect x={200 + i * 11} y="220" width="4" height="6" fill="#cbd5e1" />
          </g>
        ))}

        {/* Reset Button */}
        <circle cx="95" cy="30" r="11" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        <circle cx="95" cy="30" r="5" fill="#f87171" />
        <text x="95" y="47" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">RESET</text>

        {/* Silk Screen Branding */}
        <text x="210" y="85" fill="#ffffff" fontSize="18" fontWeight="900" fontFamily="sans-serif">
          CPS <tspan fill="#38bdf8">ARDUINO</tspan> UNO
        </text>
        <text x="210" y="100" fill="#93c5fd" fontSize="9" fontWeight="bold" letterSpacing="1.5">
          CYBER-PHYSICAL SYSTEMS LAB
        </text>
        <text x="210" y="125" fill="#bae6fd" fontSize="8" fontWeight="semibold">
          REV 3.0 • INTERACTIVE VIRTUAL MCU
        </text>

        {/* Power LED (ON) */}
        <g transform="translate(150, 95)">
          <circle cx="0" cy="0" r="4.5" fill={isSimulating ? '#22c55e' : '#15803d'} stroke="#86efac" strokeWidth="1" />
          {isSimulating && (
            <circle cx="0" cy="0" r="10" fill="#22c55e" opacity="0.3" className="animate-pulse" />
          )}
          <text x="8" y="3" fill="#ffffff" fontSize="7" fontWeight="bold">ON</text>
        </g>

        {/* Pin 13 Built-in LED (L) */}
        <g transform="translate(150, 115)">
          <circle cx="0" cy="0" r="4.5" fill={pin13LedState ? '#f59e0b' : '#78350f'} stroke="#fde68a" strokeWidth="1" />
          {pin13LedState && (
            <circle cx="0" cy="0" r="10" fill="#f59e0b" opacity="0.4" className="animate-ping" />
          )}
          <text x="8" y="3" fill="#ffffff" fontSize="7" fontWeight="bold">L</text>
        </g>

        {/* TX LED */}
        <g transform="translate(150, 135)">
          <circle cx="0" cy="0" r="3.5" fill={txLedState ? '#ef4444' : '#7f1d1d'} />
          <text x="8" y="3" fill="#ffffff" fontSize="7" fontWeight="bold">TX</text>
        </g>

        {/* RX LED */}
        <g transform="translate(150, 150)">
          <circle cx="0" cy="0" r="3.5" fill={rxLedState ? '#ef4444' : '#7f1d1d'} />
          <text x="8" y="3" fill="#ffffff" fontSize="7" fontWeight="bold">RX</text>
        </g>

        {/* Pin Header Blocks (Black Sockets) */}
        {/* Power Header Socket */}
        <rect x="138" y="288" width="100" height="24" rx="2" fill="#090d16" stroke="#1e293b" />
        {/* Analog Header Socket */}
        <rect x="252" y="288" width="88" height="24" rx="2" fill="#090d16" stroke="#1e293b" />
        {/* Digital High Socket */}
        <rect x="204" y="10" width="144" height="24" rx="2" fill="#090d16" stroke="#1e293b" />
        {/* Digital Low Socket */}
        <rect x="352" y="10" width="116" height="24" rx="2" fill="#090d16" stroke="#1e293b" />

        {/* Header Labels (Silk) */}
        <text x="188" y="280" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">POWER</text>
        <text x="296" y="280" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">ANALOG IN</text>
        <text x="275" y="45" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">DIGITAL (PWM ~)</text>
        <text x="410" y="45" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">COMMUNICATION</text>

        {/* Interactive Pin Sockets */}
        {ARDUINO_UNO_PINS.map((pin) => {
          const isSelected = selectedPinId === pin.id;
          const isConnected = connectedPinIds.includes(pin.id);

          return (
            <g
              key={pin.id}
              className="cursor-pointer group"
              onClick={() => onPinClick?.(pin)}
            >
              {/* Outer Glow on hover / selected */}
              {(isSelected || isConnected) && (
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r="8"
                  fill={isSelected ? '#38bdf8' : '#22c55e'}
                  opacity={isSelected ? 0.6 : 0.3}
                  className={isSelected ? 'animate-pulse' : ''}
                />
              )}

              {/* Pin Socket Hole */}
              <circle
                cx={pin.x}
                cy={pin.y}
                r="4.5"
                fill={isSelected ? '#38bdf8' : isConnected ? '#22c55e' : '#1e293b'}
                stroke={isSelected ? '#ffffff' : '#64748b'}
                strokeWidth="1.2"
                className="transition-colors group-hover:fill-sky-400 group-hover:stroke-white"
              />
              <circle
                cx={pin.x}
                cy={pin.y}
                r="2"
                fill="#000000"
              />

              {/* Pin Label Text */}
              <text
                x={pin.x}
                y={pin.y > 100 ? pin.y - 8 : pin.y + 14}
                fill={isSelected ? '#38bdf8' : isConnected ? '#86efac' : '#e2e8f0'}
                fontSize="6.5"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {pin.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

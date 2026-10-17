'use client';

import React from 'react';

export interface WireConnection {
  id: string;
  from: {
    id: string; // e.g. 'mcu:5V', 'sensor-1:vcc', 'bb-1:p_plus_0'
    x: number;
    y: number;
  };
  to: {
    id: string;
    x: number;
    y: number;
  };
  color: string;
  label?: string;
}

interface WiresLayerProps {
  wires: WireConnection[];
  selectedWireId?: string | null;
  onSelectWire?: (wireId: string | null) => void;
  activeDraftWire?: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    color: string;
  } | null;
  onRemoveWire?: (wireId: string) => void;
  isSimulating?: boolean;
}

export default function WiresLayer({
  wires,
  selectedWireId,
  onSelectWire,
  activeDraftWire,
  onRemoveWire,
  isSimulating = false,
}: WiresLayerProps) {
  // Generate smooth cubic bezier curve between two points
  const getWirePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);

    // Natural sag for realistic physical wires
    const sag = Math.min(140, Math.max(35, distance * 0.28));

    // Control points
    const cy1 = y1 + sag;
    const cy2 = y2 + sag;

    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
      <defs>
        <filter id="wireGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="wireSelectedGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render Established Wires */}
      {wires.map((wire) => {
        const isSelected = selectedWireId === wire.id;
        const path = getWirePath(wire.from.x, wire.from.y, wire.to.x, wire.to.y);
        const midX = (wire.from.x + wire.to.x) / 2;
        const midY =
          (wire.from.y + wire.to.y) / 2 +
          Math.min(90, Math.hypot(wire.to.x - wire.from.x, wire.to.y - wire.from.y) * 0.18);

        return (
          <g
            key={wire.id}
            className="pointer-events-auto group/wire cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelectWire?.(wire.id);
            }}
          >
            {/* Wider transparent stroke for easy hover & clicking */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Selection Outline Glow */}
            {isSelected && (
              <path
                d={path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="10"
                strokeLinecap="round"
                opacity="0.8"
                filter="url(#wireSelectedGlow)"
              />
            )}

            {/* Outer wire insulation shadow */}
            <path
              d={path}
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Main Colored Wire Core */}
            <path
              d={path}
              fill="none"
              stroke={wire.color}
              strokeWidth={isSelected ? '5' : '3.8'}
              strokeLinecap="round"
              className="transition-all group-hover/wire:brightness-125"
            />

            {/* Live Current Flow Animation during Simulation */}
            {isSimulating && (
              <path
                d={path}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 14"
                className="animate-[dash_1.2s_linear_infinite]"
                opacity="0.9"
              />
            )}

            {/* Wire Connection End Terminals */}
            <circle cx={wire.from.x} cy={wire.from.y} r="3.5" fill="#ffffff" stroke={wire.color} strokeWidth="1.5" />
            <circle cx={wire.to.x} cy={wire.to.y} r="3.5" fill="#ffffff" stroke={wire.color} strokeWidth="1.5" />

            {/* Delete / Inspect Floating Badge (visible on hover or when selected) */}
            <g
              transform={`translate(${midX}, ${midY})`}
              className={`transition-opacity cursor-pointer ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover/wire:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWire?.(wire.id);
              }}
            >
              <rect
                x="-14"
                y="-14"
                width="28"
                height="28"
                rx="14"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
                className="shadow-xl hover:scale-110 transition-transform"
              />
              <text
                x="0"
                y="4.5"
                fill="#ffffff"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
                className="select-none pointer-events-none"
              >
                ✕
              </text>

              {/* Wire Label Tooltip */}
              {wire.label && (
                <g transform="translate(0, -22)">
                  <rect
                    x="-50"
                    y="-12"
                    width="100"
                    height="18"
                    rx="9"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="1"
                    fill="#f8fafc"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {wire.label}
                  </text>
                </g>
              )}
            </g>
          </g>
        );
      })}

      {/* Render In-Progress Draft Wire (following cursor) */}
      {activeDraftWire && (
        <path
          d={getWirePath(
            activeDraftWire.from.x,
            activeDraftWire.from.y,
            activeDraftWire.to.x,
            activeDraftWire.to.y
          )}
          fill="none"
          stroke={activeDraftWire.color}
          strokeWidth="3.5"
          strokeDasharray="6 6"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

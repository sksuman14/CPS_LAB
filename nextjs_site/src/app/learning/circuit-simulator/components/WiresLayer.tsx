'use client';

import React from 'react';

export interface WireConnection {
  id: string;
  from: {
    id: string; // e.g. 'mcu:5V' or 'instance1:vcc'
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
  activeDraftWire,
  onRemoveWire,
  isSimulating = false,
}: WiresLayerProps) {
  // Generate smooth cubic bezier curve between two points
  const getWirePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.hypot(dx, dy);
    
    // Sag amount for realistic wire physics
    const sag = Math.min(120, Math.max(30, distance * 0.25));

    // Control points
    const cy1 = y1 + sag;
    const cy2 = y2 + sag;

    return `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
      <defs>
        <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Render Established Wires */}
      {wires.map((wire) => {
        const path = getWirePath(wire.from.x, wire.from.y, wire.to.x, wire.to.y);
        const midX = (wire.from.x + wire.to.x) / 2;
        const midY = (wire.from.y + wire.to.y) / 2 + Math.min(80, Math.hypot(wire.to.x - wire.from.x, wire.to.y - wire.from.y) * 0.15);

        return (
          <g key={wire.id} className="pointer-events-auto group/wire cursor-pointer">
            {/* Outer wire shadow / thickness */}
            <path
              d={path}
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Main Colored Wire */}
            <path
              d={path}
              fill="none"
              stroke={wire.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all group-hover/wire:stroke-white group-hover/wire:stroke-[5]"
            />

            {/* Live Current Flow Animation */}
            {isSimulating && (
              <path
                d={path}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="6 12"
                className="animate-[dash_1.5s_linear_infinite]"
                opacity="0.8"
              />
            )}

            {/* Wire Connection End Pins */}
            <circle cx={wire.from.x} cy={wire.from.y} r="3" fill="#ffffff" />
            <circle cx={wire.to.x} cy={wire.to.y} r="3" fill="#ffffff" />

            {/* Hover Delete Action Button */}
            <g
              transform={`translate(${midX}, ${midY})`}
              className="opacity-0 group-hover/wire:opacity-100 transition-opacity cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveWire?.(wire.id);
              }}
            >
              <circle cx="0" cy="0" r="10" fill="#ef4444" className="shadow-lg" />
              <text
                x="0"
                y="3.5"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
              >
                ✕
              </text>
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
          strokeWidth="3"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

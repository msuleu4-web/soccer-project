'use client';

import type { Formation } from '@/types/simulator';

const FORMATION_LAYOUTS: Record<Formation, { x: number; y: number }[]> = {
  '4-3-3': [
    { x: 50, y: 5 },
    { x: 15, y: 25 }, { x: 38, y: 22 }, { x: 62, y: 22 }, { x: 85, y: 25 },
    { x: 30, y: 50 }, { x: 50, y: 48 }, { x: 70, y: 50 },
    { x: 20, y: 80 }, { x: 50, y: 85 }, { x: 80, y: 80 },
  ],
  '4-2-3-1': [
    { x: 50, y: 5 },
    { x: 15, y: 25 }, { x: 38, y: 22 }, { x: 62, y: 22 }, { x: 85, y: 25 },
    { x: 35, y: 45 }, { x: 65, y: 45 },
    { x: 25, y: 70 }, { x: 50, y: 68 }, { x: 75, y: 70 },
    { x: 50, y: 88 },
  ],
  '3-5-2': [
    { x: 50, y: 5 },
    { x: 25, y: 25 }, { x: 50, y: 22 }, { x: 75, y: 25 },
    { x: 12, y: 50 }, { x: 35, y: 48 }, { x: 50, y: 50 }, { x: 65, y: 48 }, { x: 88, y: 50 },
    { x: 38, y: 85 }, { x: 62, y: 85 },
  ],
  '4-4-2': [
    { x: 50, y: 5 },
    { x: 15, y: 25 }, { x: 38, y: 22 }, { x: 62, y: 22 }, { x: 85, y: 25 },
    { x: 15, y: 55 }, { x: 38, y: 52 }, { x: 62, y: 52 }, { x: 85, y: 55 },
    { x: 38, y: 85 }, { x: 62, y: 85 },
  ],
  '3-4-3': [
    { x: 50, y: 5 },
    { x: 25, y: 25 }, { x: 50, y: 22 }, { x: 75, y: 25 },
    { x: 15, y: 50 }, { x: 38, y: 48 }, { x: 62, y: 48 }, { x: 85, y: 50 },
    { x: 25, y: 85 }, { x: 50, y: 88 }, { x: 75, y: 85 },
  ],
  '5-3-2': [
    { x: 50, y: 5 },
    { x: 10, y: 25 }, { x: 30, y: 22 }, { x: 50, y: 20 }, { x: 70, y: 22 }, { x: 90, y: 25 },
    { x: 30, y: 50 }, { x: 50, y: 48 }, { x: 70, y: 50 },
    { x: 38, y: 85 }, { x: 62, y: 85 },
  ],
};

interface Props {
  formation: Formation;
  color?: string;
  flipped?: boolean;
}

export default function FormationPitch({ formation, color = '#00D26A', flipped = false }: Props) {
  const positions = FORMATION_LAYOUTS[formation];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-auto" preserveAspectRatio="none">
      <rect width="100" height="100" fill="#0a3d1f" />
      <rect width="100" height="100" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      <rect x="25" y="0" width="50" height="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      <rect x="25" y="85" width="50" height="15" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      {positions.map((pos, i) => {
        const y = flipped ? 100 - pos.y : pos.y;
        return (
          <circle
            key={i}
            cx={pos.x}
            cy={y}
            r="3"
            fill={color}
            stroke="white"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}

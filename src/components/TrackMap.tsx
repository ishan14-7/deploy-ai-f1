import React, { useMemo } from 'react';
import type { TelemetryPoint } from '../types/telemetry';

interface TrackMapProps {
  telemetry: TelemetryPoint[];
  hoverDistance?: number;
}

export const TrackMap: React.FC<TrackMapProps> = ({ telemetry, hoverDistance }) => {
  const { path, minX, maxX, minY, maxY } = useMemo(() => {
    if (!telemetry || telemetry.length === 0) return { path: "", minX: 0, maxX: 100, minY: 0, maxY: 100 };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    const d = telemetry.map((pt, i) => {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
      
      const cmd = i === 0 ? 'M' : 'L';
      return `${cmd} ${pt.x} ${pt.y}`;
    }).join(' ');
    
    return { path: d, minX, maxX, minY, maxY };
  }, [telemetry]);

  const padding = (maxX - minX) * 0.1;
  const viewBox = `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;

  const hoverPoint = useMemo(() => {
    if (hoverDistance === undefined || !telemetry.length) return null;
    return telemetry.reduce((prev, curr) => 
      Math.abs(curr.distance - hoverDistance) < Math.abs(prev.distance - hoverDistance) ? curr : prev
    );
  }, [hoverDistance, telemetry]);

  return (
    <div className="w-full h-full bg-card rounded-none p-4 flex items-center justify-center border border-border relative overflow-hidden">
      <div className="absolute top-2 left-2 text-[10px] font-mono text-muted-foreground tracking-widest">SYS.TRACK.MAP</div>
      <svg viewBox={viewBox} className="w-full h-full z-10" style={{ transform: 'rotate(-90deg)' }}>
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth={(maxX - minX) * 0.015} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_12px_rgba(228,0,43,0.6)]" />
        
        {hoverPoint && (
          <circle 
            cx={hoverPoint.x} 
            cy={hoverPoint.y} 
            r={(maxX - minX) * 0.03} 
            fill="var(--primary)" 
            stroke="var(--background)"
            strokeWidth={(maxX - minX) * 0.01}
          />
        )}
      </svg>
    </div>
  );
};

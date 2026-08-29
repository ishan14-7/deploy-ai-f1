import React, { useMemo } from 'react';
import type { EnergyStrategy } from '../types/strategy';
import { EvilAreaChart } from './evilcharts/charts/recharts-area-chart';
import type { ChartConfig } from './evilcharts/ui/recharts-chart';

interface EnergyStrategyChartProps {
  strategies: EnergyStrategy[];
  hoverDistance?: number;
  onHover?: (distance: number) => void;
}

export const EnergyStrategyChart: React.FC<EnergyStrategyChartProps> = ({ strategies, onHover }) => {
  const mergedData = useMemo(() => {
    if (!strategies || strategies.length === 0) return [];
    
    return strategies[0].points.map((pt, i) => {
      const dataPoint: any = { distance: pt.distance };
      strategies.forEach(strategy => {
        dataPoint[`${strategy.id}_battery`] = strategy.points[i]?.battery || 0;
      });
      return dataPoint;
    });
  }, [strategies]);

  const config = useMemo(() => {
    const cfg: any = {};
    const colors = ['#E4002B', '#FFFFFF', '#888888', '#555555'];
    strategies.forEach((strategy, idx) => {
      cfg[`${strategy.id}_battery`] = {
        label: strategy.name,
        colors: {
          light: [colors[idx % colors.length]],
          dark: [colors[idx % colors.length]]
        }
      };
    });
    return cfg as ChartConfig;
  }, [strategies]);

  if (!strategies.length) return null;

  const handleMouseMove = (e: any) => {
    if (e && e.activeLabel !== undefined && onHover) {
      onHover(Number(e.activeLabel));
    }
  };

  const handleMouseLeave = () => {
    if (onHover) onHover(undefined as any);
  };

  return (
    <div className="bg-card p-4 rounded-none border border-border h-80 flex flex-col overflow-hidden">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 shrink-0">ENERGY STRATEGY - SIMULATED DATA</h3>
      <div className="flex-1 min-h-0 w-full">
        <EvilAreaChart 
          data={mergedData as any[]} 
          config={config} 
          xDataKey="distance"
          className="aspect-auto h-full w-full"
          chartProps={{
            syncId: "telemetrySync",
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave
          }}
        >
          <EvilAreaChart.XAxis hide type="number" dataKey="distance" domain={['dataMin', 'dataMax']} />
          <EvilAreaChart.YAxis domain={[0, 4.5]} />
          <EvilAreaChart.Tooltip />
          <EvilAreaChart.Legend />
          
          {strategies.map((strategy) => (
            <EvilAreaChart.Area 
              key={strategy.id}
              dataKey={`${strategy.id}_battery`} 
              variant="gradient"
            />
          ))}
        </EvilAreaChart>
      </div>
    </div>
  );
};

import React from 'react';
import type { TelemetryPoint } from '../types/telemetry';
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { EvilLineChart } from './evilcharts/charts/recharts-line-chart';
import type { ChartConfig } from './evilcharts/ui/recharts-chart';

interface TelemetryChartProps {
  telemetry: TelemetryPoint[];
  onHoverDistance: (distance: number | undefined) => void;
}

const config = {
  speed: {
    label: "Speed",
    colors: { light: ["#E4002B"], dark: ["#E4002B"] }
  },
  throttle: {
    label: "Throttle",
    colors: { light: ["#FFFFFF"], dark: ["#FFFFFF"] }
  },
  brake: {
    label: "Brake",
    colors: { light: ["#E4002B"], dark: ["#E4002B"] }
  },
  brake_val: {
    label: "Brake",
    colors: { light: ["#E4002B"], dark: ["#E4002B"] }
  }
} satisfies ChartConfig;

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, onHoverDistance }) => {
  const handleMouseMove = (e: any) => {
    if (e && e.activeLabel !== undefined) {
      onHoverDistance(Number(e.activeLabel));
    }
  };

  const handleMouseLeave = () => {
    onHoverDistance(undefined);
  };

  const brakeData = telemetry.map(t => ({
    ...t,
    brake_val: t.brake ? 100 : 0
  }));

  const commonChartProps = {
    syncId: "telemetrySync",
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  };

  const maxSpeed = Math.max(...telemetry.map(t => t.speed));
  const avgSpeed = (telemetry.reduce((a, b) => a + b.speed, 0) / telemetry.length).toFixed(1);
  
  const avgThrottle = (telemetry.reduce((a, b) => a + b.throttle, 0) / telemetry.length).toFixed(1);
  const percentFullThrottle = ((telemetry.filter(t => t.throttle > 95).length / telemetry.length) * 100).toFixed(1);
  
  const percentBraking = ((telemetry.filter(t => t.brake).length / telemetry.length) * 100).toFixed(1);

  return (
    <div className="w-full space-y-4">
      {/* SPEED */}
      <div className="bg-card p-4 border border-border h-72 flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-end mb-4 shrink-0 border-b border-border/50 pb-2">
          <h3 className="text-xs font-bold text-muted-foreground font-mono tracking-widest mb-1">SPEED VS DISTANCE</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 relative flex items-center justify-center">
                <RadialBarChart 
                  width={48} 
                  height={48} 
                  cx="50%" cy="50%" 
                  innerRadius="70%" outerRadius="100%" 
                  barSize={4} 
                  data={[{ name: 'Speed', value: maxSpeed, fill: 'var(--primary)' }]}
                  startAngle={225} endAngle={-45}
                >
                  <PolarAngleAxis type="number" domain={[0, 360]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={2} />
                </RadialBarChart>
                <div className="absolute inset-0 flex items-center justify-center pt-[2px]">
                  <span className="font-mono text-[10px] font-bold">{maxSpeed}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-mono">PEAK V</div>
                <div className="text-xs font-bold font-mono text-primary">KM/H</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-mono">AVG V</div>
              <div className="text-sm font-bold font-mono text-foreground">{avgSpeed} KM/H</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 w-full relative">
          <EvilLineChart 
            data={telemetry as any[]} 
            config={config} 
            xDataKey="distance" 
            animationType="none"
            className="aspect-auto h-full w-full"
            chartProps={commonChartProps}
          >
            <EvilLineChart.XAxis hide type="number" dataKey="distance" domain={['dataMin', 'dataMax']} />
            <EvilLineChart.YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <EvilLineChart.Tooltip />
            <EvilLineChart.Line dataKey="speed" strokeVariant="solid" />
            <EvilLineChart.ActiveDot variant="colored-border" />
          </EvilLineChart>
        </div>
      </div>

      {/* THROTTLE */}
      <div className="bg-card p-4 border border-border h-48 flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-end mb-4 shrink-0 border-b border-border/50 pb-2">
          <h3 className="text-xs font-bold text-muted-foreground font-mono tracking-widest">THROTTLE DEMAND</h3>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-mono">WOT TIME</div>
              <div className="text-sm font-bold font-mono text-foreground">{percentFullThrottle}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-mono">AVG POS</div>
              <div className="text-sm font-bold font-mono text-foreground">{avgThrottle}%</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 w-full relative">
          <EvilLineChart 
            data={telemetry as any[]} 
            config={config} 
            xDataKey="distance" 
            animationType="none"
            className="aspect-auto h-full w-full"
            chartProps={commonChartProps}
          >
            <EvilLineChart.XAxis hide type="number" dataKey="distance" domain={['dataMin', 'dataMax']} />
            <EvilLineChart.YAxis hide domain={[0, 110]} />
            <EvilLineChart.Tooltip />
            <EvilLineChart.Line dataKey="throttle" strokeVariant="solid" />
            <EvilLineChart.ActiveDot variant="colored-border" />
          </EvilLineChart>
        </div>
      </div>

      {/* BRAKE */}
      <div className="bg-card p-4 border border-border h-48 flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-end mb-4 shrink-0 border-b border-border/50 pb-2">
          <h3 className="text-xs font-bold text-muted-foreground font-mono tracking-widest">BRAKING PRESSURE</h3>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground font-mono">TIME ON BRAKES</div>
              <div className="text-sm font-bold font-mono text-primary">{percentBraking}%</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 w-full relative">
          <EvilLineChart 
            data={brakeData as any[]} 
            config={config} 
            xDataKey="distance" 
            animationType="none"
            className="aspect-auto h-full w-full"
            chartProps={commonChartProps}
          >
            <EvilLineChart.XAxis hide type="number" dataKey="distance" domain={['dataMin', 'dataMax']} />
            <EvilLineChart.YAxis hide domain={[0, 110]} />
            <EvilLineChart.Tooltip />
            <EvilLineChart.Line dataKey="brake_val" strokeVariant="solid" />
            <EvilLineChart.ActiveDot variant="colored-border" />
          </EvilLineChart>
        </div>
      </div>
    </div>
  );
};

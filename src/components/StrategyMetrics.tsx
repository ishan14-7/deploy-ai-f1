import React from 'react';
import type { EnergyStrategy } from '../types/strategy';
import { Battery, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

interface StrategyMetricsProps {
  strategies: EnergyStrategy[];
}

export const StrategyMetrics: React.FC<StrategyMetricsProps> = ({ strategies }) => {
  if (!strategies || strategies.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {strategies.map((strategy) => {
        const isNaive = strategy.id === 'naive';
        return (
          <div key={strategy.id} className="bg-card border border-border rounded-none p-4">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Zap className={isNaive ? 'text-primary' : 'text-foreground'} size={20} />
              {strategy.name}
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-3 rounded-none text-sm">
                <span className="text-muted-foreground block mb-1 flex items-center gap-1">
                  <TrendingUp size={14} /> Perf Score
                </span>
                <span className="text-xl font-mono text-foreground">{strategy.summary.performanceScore}</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-none text-sm">
                <span className="text-muted-foreground block mb-1 flex items-center gap-1">
                  <Zap size={14} /> Efficiency
                </span>
                <span className="text-xl font-mono text-foreground">{strategy.summary.efficiency}%</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-none text-sm">
                <span className="text-muted-foreground block mb-1 flex items-center gap-1">
                  <Battery size={14} /> Min Battery
                </span>
                <span className="text-xl font-mono text-foreground">{strategy.summary.minimumBattery.toFixed(2)} MJ</span>
              </div>
              
              <div className={`bg-muted/50 p-3 rounded-none text-sm border-l-2 flex flex-col justify-center ${strategy.summary.blackout ? 'border-primary bg-primary/10' : 'border-foreground/20'}`}>
                <span className="text-muted-foreground block mb-1 flex items-center gap-1">
                  {strategy.summary.blackout && <AlertTriangle size={14} className="text-primary shrink-0" />} Status
                </span>
                <span className={`font-bold tracking-tight leading-none overflow-hidden text-ellipsis ${strategy.summary.blackout ? 'text-primary text-base sm:text-lg' : 'text-foreground text-xl'}`}>
                  {strategy.summary.blackout ? 'BLACKOUT' : 'CLEAR'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

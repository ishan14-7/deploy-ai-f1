import React from 'react';
import { CIRCUITS } from '../data/metadata';
import { drivers, getDriverTeam } from '../data/drivers';
import { DriverAvatar } from './DriverAvatar';
import type { LapRequestParams } from '../services/telemetryService';
import { Route, MapPin, Target, Zap } from 'lucide-react';

interface ScenarioPreviewProps {
  params: LapRequestParams;
}

export const ScenarioPreview: React.FC<ScenarioPreviewProps> = ({ params }) => {
  const circuit = CIRCUITS[params.event] || { name: params.event, circuitName: "Select a Circuit", distanceKm: 0, turns: 0 };
  const driver = drivers[params.driver] || { name: "Unknown Driver", team: "Unknown" };

  return (
    <div className="w-full flex flex-col mt-8 border border-border rounded-none bg-card/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-background/0 pointer-events-none"></div>
      
      {/* Header */}
      <div className="border-b border-border p-4 bg-card/50 flex justify-between items-center z-10">
        <h2 className="text-sm font-semibold text-muted-foreground font-mono tracking-widest flex items-center gap-2">
          <Target size={16} className="text-primary" />
          SELECTED SCENARIO
        </h2>
        <div className="text-xs font-mono text-muted-foreground tracking-widest px-3 py-1 bg-background border border-border rounded-none">
          {params.year} // {params.session}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row z-10">
        {/* Circuit Hero (Left, 70%) */}
        <div className="w-full lg:w-2/3 p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between min-h-[400px]">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter uppercase uppercase leading-none">
              {circuit.name}
            </h1>
            <h3 className="text-xl md:text-2xl font-bold text-muted-foreground mt-2 flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              {circuit.circuitName}
            </h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center py-8 opacity-80 w-full">
            {circuit.svgPath ? (
              <svg viewBox="-5 -5 110 110" className="w-full h-full max-w-[80%] max-h-[500px] drop-shadow-[0_0_20px_rgba(228,0,43,0.8)]">
                <path d={circuit.svgPath} fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <Route size={120} strokeWidth={1} className="text-muted-foreground opacity-50" />
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-auto border-t border-border/50 pt-6">
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">DISTANCE</div>
              <div className="text-xl font-bold text-foreground">{circuit.distanceKm.toFixed(3)} <span className="text-sm font-normal text-muted-foreground">KM</span></div>
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">TURNS</div>
              <div className="text-xl font-bold text-foreground">{circuit.turns}</div>
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">SESSION</div>
              <div className="text-xl font-bold text-foreground">{params.session}</div>
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground mb-1">YEAR</div>
              <div className="text-xl font-bold text-foreground">{params.year}</div>
            </div>
          </div>
        </div>

        {/* Driver Preview (Right, 30%) */}
        <div className="w-full lg:w-1/3 p-8 flex flex-col bg-card/30">
          <h4 className="text-sm font-semibold text-muted-foreground font-mono tracking-widest mb-8 border-b border-border/50 pb-2">
            SELECTED DRIVER
          </h4>
          
          <div className="flex-1 flex flex-col">
            {/* Driver Portrait Placeholder */}
            <div className="w-full flex-1 min-h-[300px] border-b-2 border-primary/20 mb-8 relative flex items-end justify-center bg-gradient-to-t from-primary/5 to-transparent overflow-hidden">
              <DriverAvatar code={params.driver} year={params.year} size="full" className="border-none bg-transparent" />
            </div>

            <div className="text-center w-full">
              <div className="text-3xl font-black text-primary font-mono mb-2">
                {params.driver}
              </div>
              <div className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">
                {driver.name}
              </div>
              {getDriverTeam(params.driver, params.year) && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <img 
                    src={`/teams/${getDriverTeam(params.driver, params.year).toLowerCase().replace(/ /g, '-')}.png`} 
                    alt={getDriverTeam(params.driver, params.year)} 
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden px-3 py-1 border border-border rounded-none font-mono text-muted-foreground">
                    {getDriverTeam(params.driver, params.year).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Banner */}
      <div className="border-t border-border bg-primary/10 p-4 px-8 flex justify-between items-center z-10">
        <div className="text-sm font-mono text-primary font-bold tracking-widest flex items-center gap-2">
          <Zap size={16} /> REAL F1 TELEMETRY READY
        </div>
        <div className="text-xs font-mono text-muted-foreground opacity-60">
          AWAITING ANALYSIS TRIGGER
        </div>
      </div>
    </div>
  );
};

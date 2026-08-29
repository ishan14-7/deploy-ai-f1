import React, { useState } from 'react';
import { fetchTelemetry } from '../services/telemetryService';
import { strategyProvider } from '../services/strategyProvider';
import type { StrategyComparison } from '../types/strategy';
import type { LapRequestParams } from '../services/telemetryService';
import type { TelemetryData } from '../types/telemetry';
import { TelemetryChart } from '../components/TelemetryChart';
import { TrackMap } from '../components/TrackMap';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { EnergyStrategyChart } from '../components/EnergyStrategyChart';
import { StrategyMetrics } from '../components/StrategyMetrics';
import { EngineerReport } from '../components/EngineerReport';
import { ScenarioPreview } from '../components/ScenarioPreview';
import { drivers, getDriverTeam } from '../data/drivers';
import { DriverAvatar } from '../components/DriverAvatar';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const YEARS = [2024, 2025, 2026];

const EVENTS = [
  "Bahrain Grand Prix", "Saudi Arabian Grand Prix", "Australian Grand Prix",
  "Japanese Grand Prix", "Chinese Grand Prix", "Miami Grand Prix",
  "Emilia Romagna Grand Prix", "Monaco Grand Prix", "Canadian Grand Prix",
  "Spanish Grand Prix", "Austrian Grand Prix", "British Grand Prix",
  "Hungarian Grand Prix", "Belgian Grand Prix", "Dutch Grand Prix",
  "Italian Grand Prix", "Azerbaijan Grand Prix", "Singapore Grand Prix",
  "United States Grand Prix", "Mexico City Grand Prix", "São Paulo Grand Prix",
  "Las Vegas Grand Prix", "Qatar Grand Prix", "Abu Dhabi Grand Prix"
];

const SESSIONS = [
  { value: "FP1", label: "Practice 1" },
  { value: "FP2", label: "Practice 2" },
  { value: "FP3", label: "Practice 3" },
  { value: "Q1", label: "Qualifying 1" },
  { value: "Q2", label: "Qualifying 2" },
  { value: "Q3", label: "Qualifying 3" },
  { value: "R", label: "Race" }
];

const SPRINT_EVENTS: Record<number, string[]> = {
  2024: ["Chinese Grand Prix", "Miami Grand Prix", "Austrian Grand Prix", "United States Grand Prix", "São Paulo Grand Prix", "Qatar Grand Prix"],
  2025: ["Chinese Grand Prix", "Miami Grand Prix", "Belgian Grand Prix", "United States Grand Prix", "São Paulo Grand Prix", "Qatar Grand Prix"],
  2026: ["Chinese Grand Prix", "Miami Grand Prix", "Belgian Grand Prix", "United States Grand Prix", "São Paulo Grand Prix", "Qatar Grand Prix"],
};


export const Dashboard: React.FC = () => {
  const [params, setParams] = useState<LapRequestParams>({
    year: 2024,
    event: "Italian Grand Prix",
    session: "Q3",
    driver: "VER"
  });

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [strategyData, setStrategyData] = useState<StrategyComparison | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [isLapLoading, setIsLapLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverDistance, setHoverDistance] = useState<number | undefined>(undefined);

  const handleLoadLap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const req = { ...params };
      delete req.lapNumber; // always load default lap for session
      const data = await fetchTelemetry(req);
      setTelemetry(data);
      const strategy = await strategyProvider.getStrategy(data);
      setStrategyData(strategy);
      setSelectedLap(data.metadata.lapNumber);
    } catch (err: any) {
      setError(err.message || "Failed to fetch session data.");
      setTelemetry(null);
      setStrategyData(null);
      setSelectedLap(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLapChange = async (newLapNumber: number) => {
    if (newLapNumber === selectedLap) return;
    setIsLapLoading(true);
    setError(null);
    try {
      const data = await fetchTelemetry({ ...params, lapNumber: newLapNumber });
      setTelemetry(data);
      const strategy = await strategyProvider.getStrategy(data);
      setStrategyData(strategy);
      setSelectedLap(newLapNumber);
    } catch (err: any) {
      setError(err.message || "Failed to fetch lap data.");
    } finally {
      setIsLapLoading(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setParams(prev => {
      const next = { ...prev, [name]: name === 'year' ? parseInt(value) || 2024 : value };
      
      // Auto-fallback if the new event doesn't support the currently selected sprint session
      if (name === 'event' || name === 'year') {
        const isSprint = SPRINT_EVENTS[next.year as number]?.includes(next.event);
        if (!isSprint && (next.session === 'SQ' || next.session === 'Sprint')) {
          next.session = 'Q3';
        }
      }
      return next;
    });
  };

  

  const isSprintWeekend = SPRINT_EVENTS[params.year]?.includes(params.event);

  const availableSessions = [
    ...SESSIONS,
    ...(isSprintWeekend ? [
      { value: "SQ", label: "Sprint Shootout" },
      { value: "Sprint", label: "Sprint" }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans">
      <header className="mb-8 border-b border-border pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
              DEPLOY AI
            </h1>
            <p className="text-muted-foreground font-mono text-sm tracking-widest mt-1">
              {telemetry ? "LAP ANALYSIS" : "LOAD SESSION"}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <img src="/teams/haas.png" alt="TGR Haas" className="h-14 w-auto object-contain" />
            <img src="/f1-logo.png" alt="F1 Logo" className="h-8 w-auto object-contain opacity-90" />
          </div>
        </div>
        
        <form onSubmit={handleLoadLap} className="flex flex-wrap w-full gap-4 items-end bg-card/50 p-4 rounded-none border border-border">
          <div className="flex flex-col gap-1 flex-1 min-w-[90px] max-w-[120px]">
            <label className="text-xs font-mono text-muted-foreground">YEAR</label>
            <Select value={params.year.toString()} onValueChange={(v) => handleSelectChange('year', v || '')}>
              <SelectTrigger className="w-full bg-background border-border text-foreground h-9">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {YEARS.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-[3] min-w-[200px]">
            <label className="text-xs font-mono text-muted-foreground">EVENT</label>
            <Select value={params.event} onValueChange={(v) => handleSelectChange('event', v || '')}>
              <SelectTrigger className="w-full bg-background border-border text-foreground h-9">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[300px]">
                {EVENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-[1.5] min-w-[120px] max-w-[200px]">
            <label className="text-xs font-mono text-muted-foreground">SESSION</label>
            <Select value={params.session} onValueChange={(v) => handleSelectChange('session', v || '')}>
              <SelectTrigger className="w-full bg-background border-border text-foreground h-9">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                {availableSessions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 flex-[2] min-w-[200px]">
            <label className="text-xs font-mono text-muted-foreground">DRIVER</label>
            <Select value={params.driver} onValueChange={(v) => handleSelectChange('driver', v || '')}>
              <SelectTrigger className="w-full bg-background border-border text-foreground h-9">
                <SelectValue placeholder="Driver" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[300px]">
                {Object.keys(drivers).map(d => {
                  const drv = drivers[d];
                  
                  return (
                    <SelectItem key={d} value={d}>
                      <div className="flex items-center gap-3">
                        <DriverAvatar code={d} year={params.year} size="sm" />
                        <span className="font-bold">{drv.name}</span>
                        <span className="text-muted-foreground font-mono text-xs">{d}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="ml-auto bg-primary hover:bg-primary/90 text-white font-mono text-sm px-6 h-9 rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "LOADING..." : "LOAD SESSION"}
          </button>
        </form>
      </header>

      {!telemetry && !loading && !error && (
        <ScenarioPreview params={params} />
      )}

      {loading && (
        <div className="bg-card border border-border rounded-none p-12 flex flex-col items-center justify-center text-center space-y-6 my-8 shadow-2xl">
          <Loader2 size={48} className="text-primary animate-spin" />
          <div>
            <h3 className="text-xl font-black text-foreground tracking-widest mb-2">INITIALIZING SESSION</h3>
            <p className="text-muted-foreground font-mono text-sm">
              LOADING SESSION DATA...
            </p>
            <div className="mt-4 inline-block px-3 py-1 bg-background border border-border rounded-none font-mono text-xs text-muted-foreground">
              {params.event} | {params.session} | {params.driver}
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-primary/10 border border-primary rounded-none p-6 my-8">
          <h2 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
            <AlertCircle size={20} /> UNABLE TO LOAD LAP
          </h2>
          <p className="text-muted-foreground font-mono text-sm mb-4">
            The requested session data could not be loaded.
          </p>
          <div className="bg-background p-3 rounded-none border border-border text-muted-foreground font-mono text-xs overflow-auto">
            {error}
          </div>
        </div>
      )}


      {telemetry && !loading && !error && (
        <div className="bg-card border border-border p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative">
          {isLapLoading && (
            <div className="absolute inset-0 bg-background/80 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          )}
          <div className="flex flex-col">
            <h2 className="font-black text-lg tracking-widest uppercase">{telemetry.metadata.event}</h2>
            <div className="text-muted-foreground font-mono text-sm uppercase">
              {params.session} · {params.driver} · LAP {selectedLap} / {telemetry.metadata.availableLaps?.length || '?'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                const laps = telemetry.metadata.availableLaps || [];
                const idx = laps.findIndex(l => l.lapNumber === selectedLap);
                if (idx > 0) handleLapChange(laps[idx - 1].lapNumber);
              }}
              disabled={isLapLoading || (telemetry.metadata.availableLaps || []).findIndex(l => l.lapNumber === selectedLap) <= 0}
              className="font-mono text-xs hover:text-primary hover:-translate-x-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-x-0 disabled:active:scale-100 transition-all duration-200"
            >
              [ ← PREVIOUS ]
            </button>
            
            <Select value={selectedLap?.toString() || ""} onValueChange={(v) => handleLapChange(parseInt(v as string))}>
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-9 font-mono text-xs">
                <SelectValue placeholder="Select Lap" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground max-h-[300px]">
                {(telemetry.metadata.availableLaps || []).map(l => (
                  <SelectItem key={l.lapNumber} value={l.lapNumber.toString()} disabled={!l.lapTime}>
                    LAP {l.lapNumber} {l.isFastest ? '· FASTEST' : ''} {l.lapTime ? `(${l.lapTime.toFixed(3)}s)` : '(IN/OUT)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button 
              onClick={() => {
                const laps = telemetry.metadata.availableLaps || [];
                const idx = laps.findIndex(l => l.lapNumber === selectedLap);
                if (idx < laps.length - 1 && idx !== -1) handleLapChange(laps[idx + 1].lapNumber);
              }}
              disabled={isLapLoading || (() => {
                const laps = telemetry.metadata.availableLaps || [];
                const idx = laps.findIndex(l => l.lapNumber === selectedLap);
                return idx === -1 || idx >= laps.length - 1;
              })()}
              className="font-mono text-xs hover:text-primary hover:translate-x-1 active:scale-95 disabled:opacity-30 disabled:hover:translate-x-0 disabled:active:scale-100 transition-all duration-200"
            >
              [ NEXT → ]
            </button>
          </div>
        </div>
      )}

      {telemetry && !loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border border-border rounded-none p-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-4 font-mono tracking-widest">LAP STATUS</h2>
                
                <div className="flex items-center gap-2 text-foreground font-bold mb-6">
                  <CheckCircle2 size={20} /> REAL LAP LOADED
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 font-mono text-sm">
                  <div>
                    <span className="block text-muted-foreground text-xs mb-1">EVENT</span>
                    <span className="text-foreground">{telemetry.metadata.event}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs mb-1">SESSION</span>
                    <span className="text-foreground">{telemetry.metadata.session}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DriverAvatar code={telemetry.metadata.driver} year={params.year} size="md" />
                    <div>
                      <div className="text-sm font-bold text-foreground leading-none">{drivers[telemetry.metadata.driver]?.name || telemetry.metadata.driver}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-none" style={{ backgroundColor: telemetry.metadata.team_color }}></span>
                        {getDriverTeam(telemetry.metadata.driver, params.year).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs mb-1">LAP TIME</span>
                    <span className="text-foreground font-bold">{telemetry.metadata.lapTime ? telemetry.metadata.lapTime.toFixed(3) + "s" : "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs mb-1">TOP SPEED</span>
                    <span className="text-foreground text-primary">{Math.max(...telemetry.telemetry.map(d => d.speed))} km/h</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground text-xs mb-1">DISTANCE</span>
                    <span className="text-foreground">{telemetry.metadata.lapDistance.toFixed(0)} m</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[400px]">
                <TrackMap telemetry={telemetry.telemetry} hoverDistance={hoverDistance} />
              </div>
              
              {strategyData && (
                <>
                  <StrategyMetrics strategies={strategyData.strategies} />
                  <EngineerReport report={strategyData.engineerReport} />
                </>
              )}
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <EnergyStrategyChart 
                strategies={strategyData?.strategies || []} 
                hoverDistance={hoverDistance} 
                onHover={setHoverDistance} 
              />
              <TelemetryChart 
                telemetry={telemetry.telemetry} 
                onHoverDistance={setHoverDistance} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

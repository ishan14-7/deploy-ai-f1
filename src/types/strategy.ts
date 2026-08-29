export interface StrategyPoint {
  distance: number;
  battery: number;
  deployment: number;
  recovery: number;
  blackout: boolean;
}

export interface SegmentRecommendation {
  segmentId: number;
  deployment: number;
  recovery: number;
  recommendation: string;
}

export interface StrategySummary {
  minimumBattery: number;
  blackout: boolean;
  blackoutDistance?: number;
  efficiency: number;
  performanceScore: number;
}

export interface EnergyStrategy {
  id: string;
  name: string;
  summary: StrategySummary;
  points: StrategyPoint[];
  segmentRecommendations: SegmentRecommendation[];
}

export interface EngineerReport {
  summary: string;
}

export interface StrategyComparison {
  strategies: EnergyStrategy[];
  engineerReport: EngineerReport;
}

export interface StrategyRequest {
  // Pass the full telemetry data to the strategy engine
  telemetry: any;
}

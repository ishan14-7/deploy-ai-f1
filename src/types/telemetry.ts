export interface TelemetryPoint {
  distance: number;
  time: number;
  speed: number;
  throttle: number;
  brake: boolean;
  rpm?: number;
  gear?: number;
  x: number;
  y: number;
}

export interface TrackSegment {
  id: number;
  startDistance: number;
  endDistance: number;
  type: "straight" | "corner" | "braking" | "acceleration";
  averageSpeed: number;
  averageThrottle: number;
  averageBrake: number;
}

export interface LapMetadata {
  year: number;
  event: string;
  session: string;
  driver: string;
  lapTime: number | null;
  lapNumber: number;
  availableLaps: { lapNumber: number, lapTime: number | null, isFastest: boolean }[];
  team_color?: string;
  lapDistance: number;
}

export interface TelemetryData {
  metadata: LapMetadata;
  telemetry: TelemetryPoint[];
  segments: TrackSegment[];
}

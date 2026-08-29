import type { TelemetryData } from '../types/telemetry';
import { TELEMETRY_API_URL, TELEMETRY_SAMPLE_URL } from '../config/dataSource';

export interface LapRequestParams {
  year: number;
  event: string;
  session: string;
  driver: string;
  lapNumber?: number;
}

export const fetchTelemetry = async (params: LapRequestParams, useSample: boolean = false): Promise<TelemetryData> => {
  try {
    let url = TELEMETRY_SAMPLE_URL;
    
    if (!useSample) {
      const query = new URLSearchParams({
        year: params.year.toString(),
        event: params.event,
        session: params.session,
        driver: params.driver,
        ...(params.lapNumber ? { lap_number: params.lapNumber.toString() } : {})
      });
      url = `${TELEMETRY_API_URL}?${query.toString()}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `API Request Failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || "Failed to load session data");
  }
};

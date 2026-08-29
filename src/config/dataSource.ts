export const STRATEGY_SOURCE: "mock" | "api" = "mock";
export const STRATEGY_API_URL = "http://localhost:8001/api/strategy/compare"; // Example teammate port

const isProd = import.meta.env.PROD;
const API_BASE = isProd ? '' : `http://${window.location.hostname}:8000`;

export const TELEMETRY_API_URL = `${API_BASE}/api/lap`;
export const TELEMETRY_SAMPLE_URL = `${API_BASE}/api/lap/sample`;

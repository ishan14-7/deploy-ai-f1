import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pathlib import Path
import math

from data.fastf1_loader import load_session_telemetry
from data.telemetry_processor import process_telemetry, create_mock_telemetry
from data.segmenter import segment_telemetry

app = FastAPI(title="DeployAI Telemetry API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/lap")
def get_lap_telemetry(year: int, event: str, session: str, driver: str, lap_number: Optional[int] = None):
    """
    Load actual FastF1 telemetry and return the structured data contract.
    """
    try:
        raw_telemetry, lap_info = load_session_telemetry(year, event, session, driver, lap_number)
        telemetry = process_telemetry(raw_telemetry)
        segments = segment_telemetry(telemetry)
        
        # Replace NaNs or Infs that JSON can't handle
        def clean_float(val):
            if val is None or math.isnan(val) or math.isinf(val):
                return 0.0
            return val

        # Clean telemetry
        cleaned_telemetry = []
        for t in telemetry:
            cleaned_t = {k: clean_float(v) if isinstance(v, float) else v for k, v in t.items()}
            cleaned_telemetry.append(cleaned_t)
            
        # Clean segments
        cleaned_segments = []
        for s in segments:
            cleaned_s = {k: clean_float(v) if isinstance(v, float) else v for k, v in s.items()}
            cleaned_segments.append(cleaned_s)
        
        return {
            "metadata": lap_info,
            "telemetry": cleaned_telemetry,
            "segments": cleaned_segments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/lap/sample")
def get_sample_telemetry():
    """
    Return generated sample telemetry if FastF1 fails or runs offline.
    """
    try:
        telemetry, lap_info = create_mock_telemetry()
        segments = segment_telemetry(telemetry)
        return {
            "metadata": lap_info,
            "telemetry": telemetry,
            "segments": segments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

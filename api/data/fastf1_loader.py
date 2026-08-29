import fastf1
import os
import pandas as pd

# Enable cache
import tempfile
# Use /tmp for Vercel serverless environment compatibility
CACHE_DIR = os.environ.get('FASTF1_CACHE_DIR', os.path.join(tempfile.gettempdir(), 'fastf1_cache'))
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

def load_session_telemetry(year: int, event: str, session_name: str, driver: str, lap_number: int = None):
    """
    Loads telemetry for the fastest lap of a specified driver in a session.
    """
    try:
        target_split = None
        f1_session_name = session_name
        if session_name in ["Q1", "Q2", "Q3"]:
            f1_session_name = "Q"
            target_split = session_name
            
        session = fastf1.get_session(year, event, f1_session_name)
        session.load(telemetry=True, weather=False, messages=False)
        
        try:
            laps = session.laps
            if len(laps) == 0:
                raise ValueError("Session loaded but contains no laps.")
        except Exception as e:
            raise ValueError(f"FastF1 could not download the telemetry for this session. The F1 API may be blocking the request or the data is unavailable. (Original error: {str(e)})")
        if target_split:
            q1, q2, q3 = laps.split_qualifying_sessions()
            if target_split == "Q1":
                laps = q1
            elif target_split == "Q2":
                laps = q2
            elif target_split == "Q3":
                laps = q3
        
        # Get driver laps
        import warnings
        warnings.filterwarnings("ignore", category=FutureWarning)
        
        driver_laps = laps.pick_driver(driver) if hasattr(laps, 'pick_driver') else laps.pick_drivers(driver)
        
        fastest_lap = driver_laps.pick_fastest()
        fastest_num = int(fastest_lap['LapNumber']) if not pd.isna(fastest_lap.get('LapNumber')) else None
        
        available_laps = []
        for _, l in driver_laps.iterrows():
            l_time = l.get('LapTime')
            available_laps.append({
                "lapNumber": int(l['LapNumber']),
                "lapTime": l_time.total_seconds() if pd.notna(l_time) else None,
                "isFastest": int(l['LapNumber']) == fastest_num if fastest_num is not None else False
            })
            
        if lap_number is not None:
            # pick specific lap
            lap_records = driver_laps[driver_laps['LapNumber'] == lap_number]
            if lap_records.empty:
                raise ValueError(f"Lap {lap_number} not found for {driver}")
            lap = lap_records.iloc[0]
        else:
            lap = fastest_lap
            if lap is None or pd.isna(lap.get('LapTime')):
                # fallback to first lap with a time
                valid_laps = driver_laps.dropna(subset=['LapTime'])
                if valid_laps.empty:
                    raise ValueError(f"No valid laps found for {driver} in {session_name}")
                lap = valid_laps.iloc[0]
        
        # Get telemetry
        telemetry = lap.get_telemetry()
        
        lap_info = {
            "year": year,
            "event": event,
            "session": session_name,
            "driver": driver,
            "lapTime": lap.get('LapTime').total_seconds() if pd.notna(lap.get('LapTime')) else None,
            "lapNumber": int(lap['LapNumber']),
            "availableLaps": available_laps,
            "lapDistance": float(telemetry['Distance'].max()) if 'Distance' in telemetry.columns else 0.0
        }
        
        return telemetry, lap_info
    except Exception as e:
        print(f"Error loading FastF1 data: {e}")
        raise

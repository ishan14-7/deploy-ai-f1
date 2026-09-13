import urllib.request
import urllib.parse
import json
from datetime import datetime, timedelta

def _fetch_json(url: str):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.loads(response.read().decode('utf-8'))

def get_session_key(year: int, event: str, session_name: str) -> int:
    meetings = _fetch_json(f"https://api.openf1.org/v1/meetings?year={year}")
    
    meeting_key = None
    for m in meetings:
        if event.lower() in m['meeting_name'].lower() or event.lower() in m.get('meeting_official_name', '').lower():
            meeting_key = m['meeting_key']
            break
            
    if not meeting_key:
        raise ValueError(f"Could not find meeting for event: {event} in {year}")
        
    openf1_session_name = session_name
    if session_name in ["Q1", "Q2", "Q3", "Qualifying", "Q"]:
        openf1_session_name = "Qualifying"
    elif session_name in ["R", "Race"]:
        openf1_session_name = "Race"
        
    sessions = _fetch_json(f"https://api.openf1.org/v1/sessions?meeting_key={meeting_key}&session_name={urllib.parse.quote(openf1_session_name)}")
    if not sessions:
        raise ValueError(f"Could not find session {openf1_session_name} for meeting {meeting_key}")
        
    return sessions[-1]['session_key']

def get_driver_number(session_key: int, acronym: str) -> int:
    drivers = _fetch_json(f"https://api.openf1.org/v1/drivers?session_key={session_key}")
    for d in drivers:
        if d.get('name_acronym', '').upper() == acronym.upper():
            return d['driver_number']
    raise ValueError(f"Could not find driver {acronym} in session {session_key}")

def load_session_telemetry(year: int, event: str, session_name: str, driver: str, lap_number: int = None):
    session_key = get_session_key(year, event, session_name)
    driver_number = get_driver_number(session_key, driver)
    
    laps = _fetch_json(f"https://api.openf1.org/v1/laps?session_key={session_key}&driver_number={driver_number}")
    if not laps:
        raise ValueError(f"No laps found for {driver} in session {session_key}")
        
    valid_laps = [l for l in laps if l.get('lap_duration') is not None and l.get('date_start') is not None]
    if not valid_laps:
        raise ValueError("No valid timed laps found.")
        
    if lap_number is not None:
        target_lap = next((l for l in valid_laps if l['lap_number'] == lap_number), None)
        if not target_lap:
            raise ValueError(f"Lap {lap_number} not found.")
    else:
        target_lap = sorted(valid_laps, key=lambda x: x['lap_duration'])[0]
        
    fastest_num = sorted(valid_laps, key=lambda x: x['lap_duration'])[0]['lap_number']
    available_laps = []
    for l in laps:
        available_laps.append({
            "lapNumber": l['lap_number'],
            "lapTime": l.get('lap_duration'),
            "isFastest": l['lap_number'] == fastest_num
        })
        
    start_time_str = target_lap['date_start']
    start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
    end_time = start_time + timedelta(seconds=target_lap['lap_duration'])
    
    start_str = start_time.isoformat()
    end_str = end_time.isoformat()
    
    car_data_url = f"https://api.openf1.org/v1/car_data?session_key={session_key}&driver_number={driver_number}&date>={urllib.parse.quote(start_str)}&date<={urllib.parse.quote(end_str)}"
    car_data = _fetch_json(car_data_url)
    
    loc_data_url = f"https://api.openf1.org/v1/location?session_key={session_key}&driver_number={driver_number}&date>={urllib.parse.quote(start_str)}&date<={urllib.parse.quote(end_str)}"
    loc_data = _fetch_json(loc_data_url)
    
    lap_info = {
        "year": year,
        "event": event,
        "session": session_name,
        "driver": driver,
        "lapTime": target_lap['lap_duration'],
        "lapNumber": target_lap['lap_number'],
        "availableLaps": available_laps,
        "lapDistance": 5000.0 # Approximate
    }
    
    return {"car_data": car_data, "location": loc_data}, lap_info

from datetime import datetime

def process_telemetry(raw_telemetry: dict):
    car_data = raw_telemetry.get('car_data', [])
    loc_data = raw_telemetry.get('location', [])
    
    if not car_data:
        return []

    car_data.sort(key=lambda x: x['date'])
    if loc_data:
        loc_data.sort(key=lambda x: x['date'])

    merged_data = []
    total_distance = 0.0
    
    try:
        start_time = datetime.fromisoformat(car_data[0]['date'].replace('Z', '+00:00'))
    except Exception:
        return []

    loc_idx = 0
    num_locs = len(loc_data)

    for i in range(len(car_data)):
        cd = car_data[i]
        try:
            current_time = datetime.fromisoformat(cd['date'].replace('Z', '+00:00'))
        except Exception:
            continue
            
        time_sec = (current_time - start_time).total_seconds()
        speed = float(cd.get('speed', 0) or 0)
        
        if i > 0:
            try:
                prev_time = datetime.fromisoformat(car_data[i-1]['date'].replace('Z', '+00:00'))
                dt = (current_time - prev_time).total_seconds()
                total_distance += (speed / 3.6) * dt
            except Exception:
                pass

        x, y = 0.0, 0.0
        while loc_idx < num_locs - 1:
            loc_time = datetime.fromisoformat(loc_data[loc_idx]['date'].replace('Z', '+00:00'))
            if loc_time >= current_time:
                break
            loc_idx += 1
            
        if loc_idx < num_locs:
            x = float(loc_data[loc_idx].get('x', 0) or 0)
            y = float(loc_data[loc_idx].get('y', 0) or 0)

        merged_data.append({
            "distance": total_distance,
            "time": time_sec,
            "speed": speed,
            "throttle": float(cd.get('throttle', 0) or 0),
            "brake": 1 if float(cd.get('brake', 0) or 0) > 0 else 0,
            "rpm": float(cd.get('rpm', 0) or 0),
            "gear": float(cd.get('n_gear', 0) or 0),
            "x": x,
            "y": y
        })

    return merged_data

def create_mock_telemetry():
    pass

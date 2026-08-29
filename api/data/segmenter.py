def segment_telemetry(telemetry_data: list):
    """
    Groups telemetry into segments (straight, corner, braking, acceleration).
    """
    segments = []
    
    if not telemetry_data:
        return segments
        
    current_segment = {
        "id": 1,
        "startDistance": telemetry_data[0]['distance'],
        "endDistance": 0,
        "type": "straight",
        "averageSpeed": 0,
        "averageThrottle": 0,
        "averageBrake": 0,
        "_points": []
    }
    
    # Very simple threshold-based segmenter
    def determine_type(throttle, brake, speed):
        if brake:
            return "braking"
        elif throttle > 90 and speed > 200:
            return "straight"
        elif throttle > 50:
            return "acceleration"
        else:
            return "corner"
            
    for pt in telemetry_data:
        pt_type = determine_type(pt.get('throttle', 0), pt.get('brake', False), pt.get('speed', 0))
        
        if pt_type != current_segment["type"] and len(current_segment["_points"]) > 10:
            # Finalize segment
            pts = current_segment.pop("_points")
            current_segment["endDistance"] = pts[-1]['distance']
            current_segment["averageSpeed"] = sum(p['speed'] for p in pts) / len(pts)
            current_segment["averageThrottle"] = sum(p['throttle'] for p in pts) / len(pts)
            current_segment["averageBrake"] = sum(1 for p in pts if p['brake']) / len(pts)
            segments.append(current_segment)
            
            # Start new segment
            current_segment = {
                "id": len(segments) + 1,
                "startDistance": pt['distance'],
                "endDistance": 0,
                "type": pt_type,
                "averageSpeed": 0,
                "averageThrottle": 0,
                "averageBrake": 0,
                "_points": [pt]
            }
        else:
            current_segment["_points"].append(pt)
            
    # Add the last segment
    if current_segment["_points"]:
        pts = current_segment.pop("_points")
        current_segment["endDistance"] = pts[-1]['distance'] if pts else current_segment["startDistance"]
        current_segment["averageSpeed"] = sum(p['speed'] for p in pts) / len(pts) if pts else 0
        current_segment["averageThrottle"] = sum(p['throttle'] for p in pts) / len(pts) if pts else 0
        current_segment["averageBrake"] = sum(1 for p in pts if p['brake']) / len(pts) if pts else 0
        segments.append(current_segment)
        
    return segments

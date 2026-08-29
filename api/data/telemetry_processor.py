import pandas as pd
import numpy as np

def process_telemetry(raw_telemetry: pd.DataFrame):
    """
    Cleans and normalizes FastF1 telemetry.
    """
    # Select necessary columns and handle missing values
    columns_to_keep = ['Distance', 'Time', 'Speed', 'Throttle', 'Brake', 'RPM', 'nGear', 'X', 'Y']
    available_columns = [col for col in columns_to_keep if col in raw_telemetry.columns]
    
    df = raw_telemetry[available_columns].copy()
    
    # Convert Time (timedelta) to seconds
    if 'Time' in df.columns:
        df['Time'] = df['Time'].dt.total_seconds()
        
    # Replace any NaNs with 0 (or previous value)
    df.fillna(method='ffill', inplace=True)
    df.fillna(0, inplace=True)
    
    # Rename nGear to gear
    if 'nGear' in df.columns:
        df.rename(columns={'nGear': 'gear'}, inplace=True)
    
    # Rename columns to lowercase for JSON contract
    df.rename(columns=lambda x: x.lower(), inplace=True)
    
    return df.to_dict('records')

def create_mock_telemetry():
    """
    Creates a sample/fallback telemetry dataset for local development.
    Simulates a basic track with straights and corners.
    """
    lap_info = {
        "year": 2024,
        "event": "Mock Grand Prix",
        "session": "Q",
        "driver": "MOC",
        "lapTime": 90.0,
        "lapDistance": 5000.0,
        "lapNumber": 14,
        "availableLaps": [
            {"lapNumber": 13, "lapTime": None, "isFastest": False},
            {"lapNumber": 14, "lapTime": 90.0, "isFastest": True},
            {"lapNumber": 15, "lapTime": 95.0, "isFastest": False}
        ]
    }
    
    num_points = 1000
    distances = np.linspace(0, 5000, num_points)
    times = np.linspace(0, 90, num_points)
    
    # Simulate speed (sine wave for corners and straights)
    speeds = 150 + 100 * np.sin(distances / 5000 * 4 * np.pi)
    
    # Simulate throttle (high when speed is increasing)
    throttle = np.where(np.gradient(speeds) > 0, 100, 0)
    
    # Simulate brake (true when speed is decreasing sharply)
    brake = np.gradient(speeds) < -0.5
    
    # Simulate track coordinates (a simple loop)
    x = 1000 * np.cos(distances / 5000 * 2 * np.pi)
    y = 1000 * np.sin(distances / 5000 * 2 * np.pi)
    
    data = []
    for i in range(num_points):
        data.append({
            "distance": float(distances[i]),
            "time": float(times[i]),
            "speed": float(speeds[i]),
            "throttle": float(throttle[i]),
            "brake": bool(brake[i]),
            "rpm": int(10000 + 2000 * (speeds[i] / 300)),
            "gear": int(min(8, max(1, speeds[i] / 40))),
            "x": float(x[i]),
            "y": float(y[i])
        })
        
    return data, lap_info

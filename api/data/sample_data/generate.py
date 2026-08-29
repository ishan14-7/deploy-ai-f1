import sys
import os
import json

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from data.fastf1_loader import load_session_telemetry
from data.telemetry_processor import process_telemetry

def generate_sample_data():
    print("Loading 2023 Monza Q VER telemetry for sample data...")
    try:
        metadata, raw_telemetry = load_session_telemetry(2023, 'Monza', 'Q', 'VER')
        processed_data = process_telemetry(metadata, raw_telemetry)
        
        out_path = os.path.join(os.path.dirname(__file__), 'fallback.json')
        with open(out_path, 'w') as f:
            json.dump(processed_data, f)
            
        print(f"Sample data successfully generated at {out_path}")
    except Exception as e:
        print(f"Failed to generate sample data: {e}")

if __name__ == "__main__":
    generate_sample_data()

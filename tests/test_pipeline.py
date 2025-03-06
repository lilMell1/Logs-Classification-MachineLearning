from controllers.textPreprocess import compute_log_vector
from controllers.prediction import classify_log
from config.settings import LOG_STORAGE_FILE
import json
import os

# Simulated real log from Splunk
log = {
    "serviceName": "RoutePlannerService",
    "timestamp": "2024-01-30T12:00:00Z",
    "logString": "Received no navigation options from navigation assistance",
    "itemId": 1,
    "realAnswer": "Process-Level"
}

# Classify log and update model if necessary
print("log values:", log)
prediction, confidence = classify_log(log)

# Store results
log_result = {
    "log": log["logString"],
    "predicted_category": prediction,
    "confidence": confidence,
    "realAnswer": log["realAnswer"]
}

# Ensure `logs.json` is properly managed
if os.path.exists(LOG_STORAGE_FILE):
    try:
        with open(LOG_STORAGE_FILE, "r") as f:
            existing_logs = json.load(f)
            if not isinstance(existing_logs, list):
                existing_logs = []
    except (json.JSONDecodeError, FileNotFoundError):
        print("⚠ Warning: Corrupted logs.json detected. Resetting file.")
        existing_logs = []
else:
    existing_logs = []

existing_logs.append(log_result)

# Write updated log results
with open(LOG_STORAGE_FILE, "w") as f:
    json.dump(existing_logs, f, indent=4)

print(f"✅ Log classification saved: {log_result}")

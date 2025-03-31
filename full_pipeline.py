# lets_begin.py

import os
import json
from operator import truediv

from config.settings import input_file_path, output_file_path
from controllers.prediction import classify_log

train_mode = False

def append_to_output_file(log_result):
    """Safely appends a log result to the evaluation_results.json file."""
    if os.path.exists(output_file_path):
        try:
            with open(output_file_path, "r") as f:
                existing_results = json.load(f)
                if not isinstance(existing_results, list):
                    existing_results = []
        except (json.JSONDecodeError, FileNotFoundError):
            existing_results = []
    else:
        existing_results = []

    existing_results.append(log_result)

    with open(output_file_path, "w") as f:
        json.dump(existing_results, f, indent=4)

def main(train_mode):
    if not os.path.exists(input_file_path):
        print(f"❌ Input file not found: {input_file_path}")
        return

    try:
        with open(input_file_path, "r") as f:
            logs = json.load(f)
    except Exception as e:
        print(f"❌ Failed to read input logs: {e}")
        return

    for idx, log in enumerate(logs):
        print(f"\n--- Processing Log #{idx + 1} ---")
        prediction, confidence = classify_log(log, train=train_mode)

        result = {
            "logString": log.get("logString"),
            "predicted": prediction,
            "confidence": confidence,
            "realAnswer": log.get("realAnswer")
        }

        append_to_output_file(result)

    print(f"\n✅ All logs processed and appended to: {output_file_path}")

if __name__ == "__main__":
    main(train_mode=True)  # Set to False to skip learning

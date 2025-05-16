import os
import json
import time
from controllers.prediction import classify_log
from config.settings import input_file_path, LOG_STORAGE_FILE, train_mode, last_result_learning, summery_of_results_learning
from evaluate_model_performance import evaluate_metrics

def append_to_log_file(log_result):
    """Safely appends a single classification result to logs_results.json"""
    if os.path.exists(LOG_STORAGE_FILE):
        try:
            with open(LOG_STORAGE_FILE, "r") as f:
                existing_logs = json.load(f)
                if not isinstance(existing_logs, list):
                    existing_logs = []
        except (json.JSONDecodeError, FileNotFoundError):
            print("⚠ Warning: Corrupted logs.json. Resetting.")
            existing_logs = []
    else:
        existing_logs = []

    existing_logs.append(log_result)

    with open(LOG_STORAGE_FILE, "w") as f:
        json.dump(existing_logs, f, indent=4)

def main():
    start_time = time.time()

    if not os.path.exists(input_file_path):
        print(f"Input file not found: {input_file_path}")
        return

    with open(input_file_path, "r") as f:
        logs = json.load(f)

    if not isinstance(logs, list) or len(logs) == 0:
        print("No logs to process.")
        return

    problematic_logs = [log for log in logs if log.get("logLevel", "").lower() in ["warning", "trace", "fatal","debug","error"]]
    print("LEARNIING FROM:"+input_file_path)
    if not problematic_logs:
        print("No problematic logs to process.")
        return

    processed_logs = []

    for idx, log in enumerate(problematic_logs):
        print(f"\nProcessing Log #{idx + 1}")
        prediction_output = classify_log(log, train=train_mode)
        prediction = prediction_output["predicted_category"]
        confidence = prediction_output["confidence"]

        result = {
            "log": log.get("logString"),
            "predicted_category": prediction,
            "confidence": confidence,
            "realAnswer": log.get("realAnswer")
        }

        append_to_log_file(result)
        processed_logs.append(result)
        print(f"Saved: {result}")

    print("\n📊 Running evaluation metrics...")
    evaluate_metrics(processed_logs, last_result_learning=last_result_learning, summary_file_path=summery_of_results_learning)
    print(f"\n⏱️ Total processing time: {round(time.time() - start_time, 2)} seconds.")

if __name__ == "__main__":
    main()

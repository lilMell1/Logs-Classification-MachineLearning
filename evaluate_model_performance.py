# evaluate_model_performance.py

import os
import json
from datetime import datetime, timezone
from config.settings import output_file_path

def evaluate_model(logs_path=output_file_path):
    if not os.path.exists(logs_path):
        print(f"❌ Log results file not found: {logs_path}")
        return

    try:
        with open(logs_path, "r") as f:
            logs = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load logs: {e}")
        return

    if not logs or not isinstance(logs, list):
        print("⚠ No valid log entries found.")
        return

    total = len(logs)
    correct = 0
    confidence_sum = 0.0

    for log in logs:
        if log.get("predicted") == log.get("realAnswer"):
            correct += 1
        confidence_sum += float(log.get("confidence", 0))

    accuracy = (correct / total) * 100
    avg_confidence = confidence_sum / total

    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "total_logs": total,
        "correct_predictions": correct,
        "accuracy": round(accuracy, 2),
        "average_confidence": round(avg_confidence, 4)
    }

    # ✅ Save this run to a unique file
    eval_dir = os.path.join(os.path.dirname(logs_path), "evaluations")
    os.makedirs(eval_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    single_summary_path = os.path.join(eval_dir, f"evaluation_{timestamp}.json")
    with open(single_summary_path, "w") as f:
        json.dump(summary, f, indent=4)

    # ✅ Append this summary to the main performance history file
    performance_log = os.path.join(eval_dir, "_model_performance_log.json")

    # Safe read with fallback in case of corrupted or empty file
    if os.path.exists(performance_log):
        try:
            with open(performance_log, "r") as f:
                history = json.load(f)
                if not isinstance(history, list):
                    print("⚠ Invalid format in performance log. Resetting it.")
                    history = []
        except (json.JSONDecodeError, FileNotFoundError):
            print("⚠ Corrupted or empty performance log detected. Starting fresh.")
            history = []
    else:
        history = []

    history.append(summary)

    with open(performance_log, "w") as f:
        json.dump(history, f, indent=4)

    # ✅ Print result to terminal
    print("\n📊 Evaluation Summary:")
    print(f"🔹 Total Logs: {total}")
    print(f"✅ Correct Predictions: {correct}")
    print(f"📈 Accuracy: {accuracy:.2f}%")
    print(f"🔍 Average Confidence: {avg_confidence:.4f}")
    print(f"📝 Saved to: {single_summary_path}")

if __name__ == "__main__":
    evaluate_model()

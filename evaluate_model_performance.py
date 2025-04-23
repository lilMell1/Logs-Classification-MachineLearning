import json
import os
from datetime import datetime
from sklearn.metrics import precision_score, recall_score, f1_score
from config.settings import LOG_STORAGE_FILE


def evaluate_metrics(current_run_logs, output_file_path, summary_file_path):
    if not current_run_logs or not isinstance(current_run_logs, list):
        print("⚠ No valid logs received for evaluation.")
        return None  # 🔴 EXPLICIT return

    y_true_current = [log["realAnswer"].lower() for log in current_run_logs]
    y_pred_current = [log["predicted_category"].lower() for log in current_run_logs]

    correct = sum(1 for a, b in zip(y_true_current, y_pred_current) if a == b)
    total = len(current_run_logs)

    confidence_values = []
    for log in current_run_logs:
        try:
            confidence_values.append(float(log["confidence"]))
        except (ValueError, TypeError):
            print(f"⚠ Skipping invalid confidence value: {log.get('confidence')}")

    avg_confidence = sum(confidence_values) / len(confidence_values) if confidence_values else 0

    # Read historical logs
    if not os.path.exists(LOG_STORAGE_FILE):
        print("⚠ No historical log file found.")
        return None

    try:
        with open(LOG_STORAGE_FILE, "r") as f:
            all_logs = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load historical logs: {e}")
        return None

    if not all_logs or not isinstance(all_logs, list):
        print("⚠ Historical logs file is empty or invalid.")
        return None

    y_true_all = [log["realAnswer"].lower() for log in all_logs]
    y_pred_all = [log["predicted_category"].lower() for log in all_logs]

    precision = precision_score(y_true_all, y_pred_all, average="weighted", zero_division=0)
    recall = recall_score(y_true_all, y_pred_all, average="weighted", zero_division=0)
    f1 = f1_score(y_true_all, y_pred_all, average="weighted", zero_division=0)

    print(f"\n📈 Evaluation Metrics on ALL historical runs:")
    print(f"📊 Precision: {precision:.3f}")
    print(f"📊 Recall:    {recall:.3f}")
    print(f"📊 F1 Score:  {f1:.3f}")

    run_summary = {
        "timestamp": datetime.now().isoformat(),
        "total_logs": total,
        "correct_predictions": correct,
        "accuracy": round(correct / total, 4),
        "average_confidence": round(avg_confidence, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4)
    }

    # Append mode for output file (treat like a run history)
    if os.path.exists(output_file_path):
        try:
            with open(output_file_path, "r") as f:
                previous_runs = json.load(f)
                if not isinstance(previous_runs, list):
                    previous_runs = []
        except:
            previous_runs = []
    else:
        previous_runs = []

    previous_runs.append(run_summary)

    with open(output_file_path, "w") as f:
        json.dump(previous_runs, f, indent=4)

    # Load and update summary
    if os.path.exists(summary_file_path):
        try:
            with open(summary_file_path, "r") as f:
                all_runs = json.load(f)
                if not isinstance(all_runs, list):
                    all_runs = []
        except:
            all_runs = []
    else:
        all_runs = []

    all_runs.append(run_summary)

    with open(summary_file_path, "w") as f:
        json.dump(all_runs, f, indent=4)

    print("\n✅ Evaluation results saved:")
    print(f" - Current run → {output_file_path}")
    print(f" - Summary of all runs → {summary_file_path}")

    return run_summary  # ✅ return it properly

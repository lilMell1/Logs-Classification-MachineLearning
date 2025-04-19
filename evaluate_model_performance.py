import json
import os
from datetime import datetime
from sklearn.metrics import precision_score, recall_score, f1_score
from config.settings import output_file_path, LOG_STORAGE_FILE

SUMMARY_FILE = os.path.join(os.path.dirname(output_file_path), "summary_results.json")

def evaluate_metrics(current_run_logs):
    if not current_run_logs or not isinstance(current_run_logs, list):
        print("⚠ No valid logs received for evaluation.")
        return

    # 🧠 Step 1: חישוב מידע על הריצה הנוכחית
    y_true_current = [log["realAnswer"] for log in current_run_logs]
    y_pred_current = [log["predicted_category"] for log in current_run_logs]

    correct = sum(1 for a, b in zip(y_true_current, y_pred_current) if a == b)
    total = len(current_run_logs)
    avg_confidence = sum(log["confidence"] for log in current_run_logs) / total if total > 0 else 0

    # 🧠 Step 2: precision/recall/f1 על כל הריצות ביחד
    if not os.path.exists(LOG_STORAGE_FILE):
        print("⚠ No historical log file found.")
        return

    try:
        with open(LOG_STORAGE_FILE, "r") as f:
            all_logs = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load historical logs: {e}")
        return

    if not all_logs or not isinstance(all_logs, list):
        print("⚠ Historical logs file is empty or invalid.")
        return

    y_true_all = [log["realAnswer"] for log in all_logs]
    y_pred_all = [log["predicted_category"] for log in all_logs]

    label = "Application-Level"
    precision = precision_score(y_true_all, y_pred_all, pos_label=label)
    recall = recall_score(y_true_all, y_pred_all, pos_label=label)
    f1 = f1_score(y_true_all, y_pred_all, pos_label=label)

    # ✅ הדפסה למסך
    print(f"\n📈 Evaluation Metrics for '{label}' class (on ALL runs):")
    print(f"📊 Precision: {precision:.3f}")
    print(f"📊 Recall:    {recall:.3f}")
    print(f"📊 F1 Score:  {f1:.3f}")

    # ✅ תיעוד לריצה הנוכחית
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

    with open(output_file_path, "w") as f:
        json.dump(run_summary, f, indent=4)

    # ✅ תיעוד לריצות קודמות
    if os.path.exists(SUMMARY_FILE):
        try:
            with open(SUMMARY_FILE, "r") as f:
                all_runs = json.load(f)
                if not isinstance(all_runs, list):
                    all_runs = []
        except:
            all_runs = []
    else:
        all_runs = []

    all_runs.append(run_summary)

    with open(SUMMARY_FILE, "w") as f:
        json.dump(all_runs, f, indent=4)

    print("\n✅ Evaluation results saved:")
    print(f" - Current run → {output_file_path}")
    print(f" - Summary of all runs → {SUMMARY_FILE}")

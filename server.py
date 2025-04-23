from flask import Flask, request, jsonify
from controllers.prediction import classify_log
import json
import os
from datetime import datetime
from config.settings import FRONT_LOGS, FRONT_SUMMERY
from evaluate_model_performance import evaluate_metrics

app = Flask(__name__)

@app.route('/analyze-log', methods=['POST'])
def analyze_log():
    try:
        logs = request.json.get("logs", [])
        print(f"Received logs: {logs}")

        if not logs:
            return jsonify({"status": "error", "message": "No logs received"}), 400

        # Save received logs to FRONT_LOGS
        if os.path.exists(FRONT_LOGS):
            with open(FRONT_LOGS, "r") as f:
                existing_logs = json.load(f)
        else:
            existing_logs = []

        existing_logs.extend(logs)

        with open(FRONT_LOGS, "w") as f:
            json.dump(existing_logs, f, indent=4)

        # Filter problematic logs
        filtered_logs = [
            log for log in logs
            if log.get("logLevel", "").lower() in ["debug", "trace", "warning", "fatal"]
        ]

        if not filtered_logs:
            return jsonify({"status": "error", "message": "No problematic logs found."}), 400

        results = []
        y_true = []
        y_pred = []
        confidences = []

        for log in filtered_logs:
            prediction_output = classify_log(log, train=False)
            prediction = prediction_output["predicted_category"]
            confidence = prediction_output["confidence"]

            results.append({
                "log": log["logString"],
                "predicted_category": prediction,
                "confidence": confidence,
                "serviceName": log.get("serviceName", "N/A"),
                "timestamp": log.get("timestamp", "N/A"),
                "source": log.get("source", "N/A"),
                "realAnswer": log.get("realAnswer", "unknown")
            })

            y_true.append(log["realAnswer"].lower())
            y_pred.append(prediction)
            confidences.append(confidence)

        # Evaluate and get summary (without overwriting)
        run_summary = evaluate_metrics(results, output_file_path=FRONT_SUMMERY, summary_file_path=FRONT_SUMMERY)
        if not run_summary:
            return jsonify({"status": "error", "message": "Failed to generate evaluation summary."}), 500
        print(f"Processed results: {results}")
        print(f"Run summary: {run_summary}")

        return jsonify({
            "status": "success",
            "results": results,
            "stats": run_summary  # ✅ this goes to the frontend
        }), 200

    except Exception as e:
        print(f"Error processing logs: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

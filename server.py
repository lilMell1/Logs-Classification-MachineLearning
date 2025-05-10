from flask import Flask, request, jsonify
from controllers.prediction import classify_log
import json
import os
from datetime import datetime
from config.settings import FRONT_LOGS, FRONT_SUMMERY, last_result_learning
from evaluate_model_performance import evaluate_metrics

app = Flask(__name__)

@app.route('/analyze-log', methods=['POST'])
def analyze_log():
    try:
        logs = request.json.get("logs", [])
        print(f"Received logs: {logs}")

        if not logs:
            return jsonify({"status": "error", "message": "No logs received"}), 400

        # Save received logs
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
                "logLevel": log.get("logLevel", "N/A"),
            })

            confidences.append(confidence)

        # evaluation_results.json
        if os.path.exists(last_result_learning):
            with open(last_result_learning, "r") as f:
                machine_summary = json.load(f)
        else:
            machine_summary = {}

        print(f"Processed {len(results)} logs.")
        return jsonify({
            "status": "success",
            "results": results,
            "machineSummary": machine_summary
        }), 200

    except Exception as e:
        print(f"Error processing logs: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

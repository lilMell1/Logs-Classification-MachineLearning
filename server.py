from flask import Flask, request, jsonify
from controllers.prediction import classify_log

app = Flask(__name__)

@app.route('/analyze-log', methods=['POST'])
def analyze_log():
    try:
        logs = request.json.get("logs", [])
        if not logs:
            return jsonify({"status": "error", "message": "No logs received"}), 400

        results = []
        for log in logs:
            prediction, confidence = classify_log(log)  # 🔹 Run prediction ONLY here
            results.append({
                "log": log["logString"],
                "predicted_category": prediction,
                "confidence": confidence
            })

        return jsonify({"status": "success", "results": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Ensure nothing executes before this

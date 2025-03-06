import numpy as np
import json
from config.settings import VECTOR_SIZE
from controllers.textPreprocess import compute_log_vector
from models.classifier import FullyConnectedLayer
from models.softmax import softmax
from controllers.updates import update_biases, update_word_vectors, update_weights  # ✅ Import missing function

# Load trained model
fc_layer = FullyConnectedLayer(input_dim=VECTOR_SIZE, output_dim=2)
# **Ensure load_model() is called only once**
if not hasattr(fc_layer, "is_loaded"):
    fc_layer.load_model()
    fc_layer.is_loaded = True  # Prevents repeated loading


def classify_log(log):
    """Predicts the class of a log and updates weights, biases, and embeddings if incorrect."""

    log_string = log["logString"]
    real_answer = log.get("realAnswer")

    print("classify:", log_string)

    T_h = compute_log_vector(log_string)  # Compute sentence vector
    z = fc_layer.forward(T_h)  # Compute logits
    probabilities = softmax(z)  # Convert to probabilities

    predicted_class = np.argmax(probabilities)
    confidence = np.max(probabilities)

    print(f" Prediction: {predicted_class}, Confidence: {confidence}")

    # Convert real_answer to one-hot encoded vector
    label_mapping = {"Application-Level": 0, "Process-Level": 1}
    real_answer_numeric = label_mapping.get(real_answer, -1)

    if real_answer_numeric == -1:
        print(f" Warning: Unknown label '{real_answer}', skipping update.")
        return "Unknown", confidence

    y_true = np.zeros(2)  # One-hot encode the real label
    y_true[real_answer_numeric] = 1

    # If prediction is wrong, apply updates **BEFORE logging**
    print(f" BEFORE UPDATE: Prediction={predicted_class}, Confidence={confidence}")

    if real_answer_numeric != predicted_class:
        update_word_vectors(log_string, real_answer_numeric, predicted_class)
        update_biases(real_answer_numeric, predicted_class)
        error = update_weights(fc_layer, T_h, y_true)

        print(f"🔄 Error after update: {error:.4f}")

    fc_layer.save_model()  # **Ensure model is saved**
    print(f" AFTER UPDATE: Prediction={predicted_class}, Confidence={confidence}")

    print(f" Updated Prediction: {predicted_class}, Confidence: {confidence}")
    return "Application-Level" if predicted_class == 0 else "Process-Level", float(confidence)

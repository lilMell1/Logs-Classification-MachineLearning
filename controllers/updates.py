import json
import numpy as np
import os
from config.settings import VECTOR_SIZE, BIAS_UPDATES_FILE, WORD_VECTOR_FILE
from models.classifier import FullyConnectedLayer
from controllers.textPreprocess import compute_log_vector
from models.softmax import softmax
# Load trained model
fc_layer = FullyConnectedLayer(input_dim=VECTOR_SIZE, output_dim=2)
fc_layer.load_model()

def update_biases(real_answer, predicted_class):
    """Adjusts the bias of the incorrect class and logs changes."""
    label_mapping = {"Application-Level": 0, "Process-Level": 1}
    real_answer = label_mapping.get(real_answer, -1)

    if real_answer == -1:
        print(f"⚠ Warning: Unknown label '{real_answer}', skipping bias update.")
        return

    if real_answer == predicted_class:
        print(f"✅ Correct prediction, no bias update needed. Logging the prediction anyway.")
        # ✅ Even if the prediction is correct, we log it for history tracking
        log_bias_update(real_answer, predicted_class, 0.0)  # No adjustment, but log entry
        return

    adjustment = -0.1 if predicted_class == 0 else 0.1  # Increase bias adjustment
    fc_layer.biases[predicted_class] += adjustment

    print(f"🔄 Bias updated: New Mean(b)={np.mean(fc_layer.biases)}")

    # ✅ Save model after bias update
    fc_layer.save_model()

    # ✅ Log bias update properly
    log_bias_update(real_answer, predicted_class, adjustment)
    print(f"✅ Bias update saved to {BIAS_UPDATES_FILE}")

def log_bias_update(real_answer, predicted_class, adjustment):
    """Logs bias updates to `bias_updates.json` properly."""
    bias_update_data = {
        "real_answer": real_answer,
        "predicted": predicted_class,
        "adjustment": adjustment
    }

    #  Load existing bias updates safely
    if os.path.exists(BIAS_UPDATES_FILE):
        try:
            with open(BIAS_UPDATES_FILE, "r") as f:
                updates = json.load(f)
                if not isinstance(updates, list):
                    updates = []
        except (json.JSONDecodeError, FileNotFoundError):
            print("⚠ Warning: Corrupted bias_updates.json detected. Resetting file.")
            updates = []
    else:
        updates = []

    updates.append(bias_update_data)  # ✅ Append the new entry properly

    with open(BIAS_UPDATES_FILE, "w") as f:
        json.dump(updates, f, indent=4)  # ✅ Ensure changes are saved


def update_word_vectors(log_string, real_answer, predicted_class):
    """Updates word embeddings (M) when the model makes a wrong prediction."""
    if real_answer == predicted_class:
        return

    words = log_string.lower().split()
    learning_rate = 0.1
    error = 1 if real_answer == 1 else -1

    if os.path.exists(WORD_VECTOR_FILE):
        with open(WORD_VECTOR_FILE, "r") as f:
            try:
                word_vectors = json.load(f)
            except json.JSONDecodeError:
                word_vectors = {}
    else:
        word_vectors = {}

    T_h = compute_log_vector(log_string)
    for word in words:
        if word in word_vectors:
            word_vector = np.array(word_vectors[word])
            word_vector = word_vector - learning_rate * error * T_h
            word_vectors[word] = word_vector.tolist()

    with open(WORD_VECTOR_FILE, "w") as f:
        json.dump(word_vectors, f, indent=4)

def update_weights(fc_layer, T_h, y_true, lr=0.5):  # Increased learning rate
    """Updates classifier weights (W) and biases (b) using gradient descent."""
    z = fc_layer.forward(T_h)
    probabilities = softmax(z)
    error = y_true - probabilities  # Compute error

    # Debugging print Before updates
    print(f" BEFORE UPDATE: Mean(W)={np.mean(fc_layer.weights)}, Mean(b)={np.mean(fc_layer.biases)}")
    print(f" ERROR VECTOR: {error}")

    # gradient descent updates
    weight_update = lr * np.outer(error, T_h)
    bias_update = lr * error

    fc_layer.weights += weight_update  # ✅ Apply weight updates
    fc_layer.biases += bias_update  # ✅ Apply bias updates

    # Debugging print: After updates
    print(f" AFTER UPDATE: Mean(W)={np.mean(fc_layer.weights)}, Mean(b)={np.mean(fc_layer.biases)}")

    # Ensure changes are significant
    if np.allclose(weight_update, 0) and np.allclose(bias_update, 0):
        print(" WARNING: Updates are too small, model might not be learning!")

    # Save the updated model
    fc_layer.save_model()

    return np.mean(np.abs(error))


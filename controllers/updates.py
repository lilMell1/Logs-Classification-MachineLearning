import json
import numpy as np
import os
from config.settings import VECTOR_SIZE, BIAS_UPDATES_FILE, WORD_VECTOR_FILE
from controllers.textPreprocess import compute_log_vector
from models.softmax import softmax

def update_biases(real_answer, predicted_class, model):
    """Adjusts the bias of the incorrect class and logs changes."""
    if real_answer == -1:
        print(f"⚠ Warning: Unknown label '{real_answer}', skipping bias update.")
        return

    if real_answer == predicted_class:
        print(f"✅ Correct prediction, no bias update needed. Logging the prediction anyway.")
        log_bias_update(real_answer, predicted_class, 0.0)
        return

    adjustment = -0.1 if predicted_class == 0 else 0.1
    model.biases[predicted_class] += adjustment

    model.save_model()
    log_bias_update(real_answer, predicted_class, adjustment)


def log_bias_update(real_answer, predicted_class, adjustment):
    """Logs bias updates to `bias_updates.json` properly."""
    bias_update_data = {
        "real_answer": int(real_answer),
        "predicted": int(predicted_class),
        "adjustment": float(adjustment)
    }

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

    updates.append(bias_update_data)

    with open(BIAS_UPDATES_FILE, "w") as f:
        json.dump(updates, f, indent=4)

def update_word_vectors(log, real_answer, predicted_class, model):
    """
    Updates word embeddings (M) using full log vector.
    Includes logString, logLevel, and source — works only if prediction was incorrect.
    """
    if real_answer == predicted_class:
        return

    log_string = log.get("logString", "")
    words = log_string.lower().split()  # ניתן לשדרג בעתיד לטוקניזציה חכמה
    learning_rate = 0.1
    error = 1 if real_answer == 1 else -1

    if os.path.exists(WORD_VECTOR_FILE):
        try:
            with open(WORD_VECTOR_FILE, "r") as f:
                word_vectors = json.load(f)
        except json.JSONDecodeError:
            word_vectors = {}
    else:
        word_vectors = {}

    full_vector = compute_log_vector(log)
    text_only_vector = full_vector[:300]  # Use only the word embedding portion

    for word in words:
        if word in word_vectors:
            word_vector = np.array(word_vectors[word])
            word_vector = word_vector - learning_rate * error * text_only_vector
            word_vectors[word] = word_vector.tolist()

    with open(WORD_VECTOR_FILE, "w") as f:
        json.dump(word_vectors, f, indent=4)

def update_weights(model, full_vector, y_true, learningRate=0.5):
    """
    Updates classifier weights (W) and biases (b) using gradient descent.
    """
    z = model.forward(full_vector)
    probabilities = softmax(z)
    error = y_true - probabilities

    weight_update = learningRate * np.outer(error, full_vector)
    bias_update = learningRate * error

    model.weights += weight_update
    model.biases += bias_update

    if np.allclose(weight_update, 0) and np.allclose(bias_update, 0):
        print("⚠ WARNING: Updates are too small, model might not be learning!")

    model.save_model()
    return np.mean(np.abs(error))

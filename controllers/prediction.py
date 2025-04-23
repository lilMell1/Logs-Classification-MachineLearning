import numpy as np
import json
from config.settings import MODEL_VECTOR_SIZE
from controllers.textPreprocess import compute_log_vector
from models.classifier import FullyConnectedLayer
from models.softmax import softmax
from controllers.updates import update_biases, update_word_vectors, update_weights

# Load trained model
fullyConnectedLayer = FullyConnectedLayer(input_dim=MODEL_VECTOR_SIZE, output_dim=2)

def classify_log(log, train=False):
    """Predicts the class of a log and updates weights, biases, and embeddings if incorrect."""

    if not log.get("realAnswer"):
        return {"predicted_category": "Unknown", "confidence": 0.0}  # Added fallback if no realAnswer

    real_answer = log.get("realAnswer").lower()  # Convert to lowercase for standardization
    print("classify:", log)

    try:
        full_vector = compute_log_vector(log)  # T_H
        logits = fullyConnectedLayer.forward(full_vector)  # Raw output from the model (before softmax)
        probabilities = softmax(logits)  # Converts logits into probabilities for each class

        # Get the index of the highest probability (0 or 1) → this is the predicted class
        predicted_class = np.argmax(probabilities)

        # Get the actual confidence score of that prediction (a float between 0.0 and 1.0)
        confidence = np.max(probabilities)

        label_map_reverse = {0: "application-level", 1: "process-level"}  # Make labels lowercase for consistency

        print(f" Prediction: {label_map_reverse[predicted_class]} ({predicted_class}), Confidence: {confidence:.4f}")

        # Convert real_answer to one-hot encoded vector
        label_mapping = {"application-level": 0, "process-level": 1}  # Standardize labels to lowercase
        real_answer_numeric = label_mapping.get(real_answer, -1)

        if real_answer_numeric == -1:
            print(f" Warning: Unknown label '{real_answer}', skipping update.")
            return {"predicted_category": "Unknown", "confidence": confidence}

        true_label_vector = np.zeros(2)
        true_label_vector[real_answer_numeric] = 1

        if train and real_answer_numeric != predicted_class:  # only update if the machine answer is not as the real answer!
            print(f" ------MACHINE UPDATE------ \n")
            print(f" BEFORE UPDATE: Prediction={predicted_class}, Confidence={confidence}")
            update_word_vectors(log, real_answer_numeric, predicted_class, fullyConnectedLayer)
            update_biases(real_answer_numeric, predicted_class, fullyConnectedLayer)
            error = update_weights(fullyConnectedLayer, full_vector, true_label_vector)

            print(f"🔄 Error after update: {error:.4f}")
            fullyConnectedLayer.save_model()
            print(f" AFTER UPDATE: Prediction={predicted_class}, Confidence={confidence}")
            print(f" AFTER UPDATE COMPLETE — Final Output: {label_map_reverse[predicted_class]}, Confidence: {confidence:.4f}")

        return {"predicted_category": label_map_reverse[predicted_class], "confidence": float(confidence)}

    except Exception as e:
        print(f"Error during classification: {e}")
        return {"predicted_category": "Error", "confidence": 0.0}

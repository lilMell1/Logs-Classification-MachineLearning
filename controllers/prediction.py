import numpy as np
import json
from config.settings import MODEL_VECTOR_SIZE, train_mode
from controllers.textPreprocess import compute_log_vector
from models.classifier import FullyConnectedLayer
from models.softmax import softmax
from controllers.updates import update_biases, update_word_vectors, update_weights

# Load trained model
fullyConnectedLayer = FullyConnectedLayer(input_dim=MODEL_VECTOR_SIZE, output_dim=2)

def classify_log(log, train):
    """Predicts the class of a log and updates weights, biases, and embeddings if train=True and realAnswer exists."""

    print("classify:", log)

    try:
        full_vector = compute_log_vector(log)
        logits = fullyConnectedLayer.forward(full_vector)
        probabilities = softmax(logits)

        predicted_class = np.argmax(probabilities)
        confidence = np.max(probabilities)

        label_map_reverse = {0: "application-level", 1: "process-level"}

        print(f" Prediction: {label_map_reverse[predicted_class]} ({predicted_class}), Confidence: {confidence:.4f}")

        # Only try to learn if train=True AND realAnswer exists
        if train:
            real_answer = log.get("realAnswer")
            if real_answer:
                real_answer = real_answer.lower()
                label_mapping = {"application-level": 0, "process-level": 1}
                real_answer_numeric = label_mapping.get(real_answer, -1)

                if real_answer_numeric == -1:
                    print(f" Warning: Unknown label '{real_answer}', skipping learning.")
                else:
                    true_label_vector = np.zeros(2)
                    true_label_vector[real_answer_numeric] = 1

                    if real_answer_numeric != predicted_class:
                        print(f" ------MACHINE UPDATE------ ")
                        print(f"BEFORE UPDATE: Prediction={predicted_class}, Confidence={confidence}")
                        update_word_vectors(log, real_answer_numeric, predicted_class, fullyConnectedLayer)
                        update_biases(real_answer_numeric, predicted_class, fullyConnectedLayer)
                        error = update_weights(fullyConnectedLayer, full_vector, true_label_vector)
                        fullyConnectedLayer.save_model()
                        print(f"AFTER UPDATE COMPLETE: Error={error:.4f}")

        return {
            "predicted_category": label_map_reverse[predicted_class],
            "confidence": float(confidence)
        }

    except Exception as e:
        print(f"Error during classification: {e}")
        return {"predicted_category": "Error", "confidence": 0.0}

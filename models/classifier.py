import numpy as np
import json
import os
from config.settings import MODEL_VECTOR_SIZE, CLASSIFIER_MODEL_FILE

class FullyConnectedLayer:
    def __init__(self, input_dim=MODEL_VECTOR_SIZE, output_dim=2):
        """Initialize weights and biases for the fully connected layer."""
        self.weights = np.random.uniform(-0.5, 0.5, (output_dim, input_dim)) # W! Shape = (2 x 307): 2 output classes (Application-Level, Process-Level), 307 input features (text + metadata)
        self.biases = np.random.uniform(-0.5, 0.5, output_dim) # b! Shape = (2,): one bias per output class
        self.load_model()

    def forward(self, full_vector):
        """Compute logits."""
        if not isinstance(full_vector, np.ndarray):
            raise ValueError("Input T_h (full vector) must be a NumPy array")

        if full_vector.shape[0] != self.weights.shape[1]: # full_vector should have shape (307,) 1D — same as model input dimension
            raise ValueError(f"Input size mismatch: Expected {self.weights.shape[1]}, got {full_vector.shape[0]}")

        logits = self.biases + np.dot(self.weights, full_vector) # logits: shape (2,) → raw scores for Application-Level and Process-Level before softmax
        return logits

    def save_model(self):
        """Save weights & biases."""
        model_data = {
            "weights": self.weights.tolist(),
            "biases": self.biases.tolist()
        }
        with open(CLASSIFIER_MODEL_FILE, "w") as f:
            json.dump(model_data, f, indent=4)

        # Debugging print
        print(f" Model saved! Mean(W)={np.mean(self.weights)}, Mean(b)={np.mean(self.biases)}")

    def load_model(self):
        """Load weights & biases from file and verify they are changing."""
        if os.path.exists(CLASSIFIER_MODEL_FILE):
            try:
                with open(CLASSIFIER_MODEL_FILE, "r") as f:
                    model_data = json.load(f)
                    self.weights = np.array(model_data["weights"])
                    self.biases = np.array(model_data["biases"])
                    print(f" Model loaded: Mean(W)={np.mean(self.weights)}, Mean(b)={np.mean(self.biases)}")
            except (FileNotFoundError, json.JSONDecodeError):
                print(" No valid saved model found. Using random initialization.")
        else:
            print(" No saved model found. Using random initialization.")





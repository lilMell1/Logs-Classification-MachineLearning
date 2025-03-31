import numpy as np
from models.classifier import FullyConnectedLayer
from models.softmax import softmax


def update_weights(fc_layer, T_h, y_true, learningRate=0.1):  # 🔥 Increase learning rate
    """Updates classifier weights (W) and biases (b) using gradient descent."""
    z = fc_layer.forward(T_h)
    probabilities = softmax(z)
    error = y_true - probabilities

    # print(f"🔄 BEFORE UPDATE: Mean(W)={np.mean(fc_layer.weights)}, Mean(b)={np.mean(fc_layer.biases)}")
    # print(f"🔄 ERROR VECTOR: {error}")

    weight_update = learningRate * np.outer(error, T_h)
    bias_update = learningRate * error

    fc_layer.weights += weight_update  # ✅ Apply weight updates
    fc_layer.biases += bias_update  # ✅ Apply bias updates

    # print(f"✅ AFTER UPDATE: Mean(W)={np.mean(fc_layer.weights)}, Mean(b)={np.mean(fc_layer.biases)}")

    # Ensure changes are significant
    if np.allclose(weight_update, 0) and np.allclose(bias_update, 0):
        print("⚠ WARNING: Updates are too small, model might not be learning!")

    # ✅ Save the updated model
    fc_layer.save_model()

    return np.mean(np.abs(error))



import numpy as np

def softmax(logits):
    """Manually compute the softmax function for a given input vector z."""
    exp_z = np.exp(logits - np.max(logits))  # Subtract np.max for numerical stability (good for large numbers, doesnt effect answer)
    return exp_z / np.sum(exp_z)

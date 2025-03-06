import numpy as np

def softmax(z):
    """Manually compute the softmax function for a given input vector z."""
    exp_z = np.exp(z - np.max(z))  # Subtract np.max for numerical stability (good for large numbers, doesnt effect answer)
    return exp_z / np.sum(exp_z)

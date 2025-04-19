import numpy as np
from models.embeddings import log_to_vector

# Converts string labels into binary values
label_map = {
    "application-level": 0,
    "process-level": 1
}

def prepare_features_and_labels(logs: list[dict]):
    """
    Converts logs into X (features) and y (labels) for training or prediction.
    """
    X = []
    y = []

    for log in logs:
        if 'realAnswer' not in log:
            continue  # Skip if no label is provided (e.g., during prediction)
        feature_vector = log_to_vector(log)
        label = label_map.get(log['realAnswer'])
        if label is not None:
            X.append(feature_vector)
            y.append(label)

    return np.array(X), np.array(y)

def prepare_features_only(logs: list[dict]):
    """
    Converts unlabeled logs into only feature vectors for prediction.
    """
    return np.array([log_to_vector(log) for log in logs])

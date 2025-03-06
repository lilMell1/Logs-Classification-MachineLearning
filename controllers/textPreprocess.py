import re
import numpy as np
from models.embeddings import get_word_vector
from config.settings import VECTOR_SIZE

def preprocess_string(string):
    """Extracts logString, tokenizes, and converts words to embeddings."""
    words = re.findall(r'\b\w+\b', string.lower())
    print("words:", words)
    vectors = [get_word_vector(word) for word in words]
    return np.array(vectors)

def compute_log_vector(log, method="mean"):
    """Computes sentence embedding from word vectors."""
    vectors = preprocess_string(log)

    if len(vectors) == 0:
        return np.zeros(VECTOR_SIZE)

    return np.mean(vectors, axis=0) if method == "mean" else np.sum(vectors, axis=0)

import numpy as np
import re
from models.embeddings import get_word_vector
from config.settings import VECTOR_SIZE

# Define one-hot options
LOG_LEVELS = ['debug', 'trace', 'warning', 'fatal','error'] # 5 more dimensions for the vectors
SOURCES = ['current-application', 'other-process'] # 2 more dimensions for the vectors

def compute_log_vector(log: dict) -> np.ndarray:
    """
    Generates a full feature vector using:
    - Average of word embeddings from logString
    - One-hot vector for logLevel - for example: [0,0,1,0,0] if warning is in the log
    - One-hot vector for source - for example: [0,1] if the source is from other process
    """

    # -------- Word Embedding from logString --------
    log_string = log.get("logString", "")
    words = re.findall(r'\b\w+\b', log_string.lower())
    if words:
        word_vectors = [get_word_vector(word) for word in words] # getting all the vectors of the words
        text_embedding = np.mean(word_vectors, axis=0) # the mean of all the vectors
    else:
        text_embedding = np.zeros(VECTOR_SIZE)

    # -------- One-hot Encoding: logLevel --------
    log_level = log.get("logLevel", "").lower()
    level_vector = np.zeros(len(LOG_LEVELS))
    if log_level in LOG_LEVELS:
        level_vector[LOG_LEVELS.index(log_level)] = 1

    # -------- One-hot Encoding: source --------
    source = log.get("source", "")
    source_vector = np.zeros(len(SOURCES))
    if source in SOURCES:
        source_vector[SOURCES.index(source)] = 1

    # -------- Final Combined Vector --------
    full_vector = np.concatenate([text_embedding, level_vector, source_vector])
    return full_vector

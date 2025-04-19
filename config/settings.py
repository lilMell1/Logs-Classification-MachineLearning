import os

# Global settings
VECTOR_SIZE = 300  # Number of dimensions for word embeddings
LOG_LEVEL_DIM = 5
SOURCE_DIM = 2
MODEL_VECTOR_SIZE = VECTOR_SIZE + LOG_LEVEL_DIM + SOURCE_DIM  # = 307
train_mode = True

# Storage directory
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "../storage")

# Ensure the storage directory exists
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

# File paths for storing models, embeddings, and logs
WORD_VECTOR_FILE = os.path.join(STORAGE_DIR, "word_vectors.json")  # Stores word embeddings
LOG_STORAGE_FILE = os.path.join(STORAGE_DIR, "logs_results.json")  # Stores processed logs
CLASSIFIER_MODEL_FILE = os.path.join(STORAGE_DIR, "classifier_model.json")  # Stores model weights & biases
BIAS_UPDATES_FILE = os.path.join(STORAGE_DIR, "bias_updates.json")  # Stores bias correction updates
input_file_path = os.path.join(STORAGE_DIR, "learningLogs2.json")  # Stores bias correction updates
output_file_path = os.path.join(STORAGE_DIR, "evaluation_results.json")
# Debugging output to confirm correct paths
print(f"STORAGE DIRECTORY: {STORAGE_DIR}")
print(f"WORD_VECTOR_FILE: {WORD_VECTOR_FILE}")
print(f"LOG_STORAGE_FILE: {LOG_STORAGE_FILE}")
print(f"CLASSIFIER_MODEL_FILE: {CLASSIFIER_MODEL_FILE}")
print(f"BIAS_UPDATES_FILE: {BIAS_UPDATES_FILE}")

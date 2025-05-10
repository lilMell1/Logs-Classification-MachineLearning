import json
import numpy as np
import os
from config.settings import VECTOR_SIZE, WORD_VECTOR_FILE

# Ensure storage directory exists
STORAGE_DIR = os.path.dirname(WORD_VECTOR_FILE)
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)

# ✅ Load only once
def load_word_vectors():
    if os.path.exists(WORD_VECTOR_FILE) and os.stat(WORD_VECTOR_FILE).st_size > 0:
        try:
            with open(WORD_VECTOR_FILE, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print("⚠ Error loading word vectors, resetting file.")
    return {}

# ✅ Global word_vectors only once
word_vectors = load_word_vectors()

def generate_vector():
    return np.random.uniform(-0.5, 0.5, VECTOR_SIZE).tolist()

def save_word_vectors():
    try:
        with open(WORD_VECTOR_FILE, "w") as f:
            json.dump(word_vectors, f, indent=4)
        print(f"💾 Word vectors saved. Total words: {len(word_vectors)}")
    except Exception as e:
        print(f"⚠ Error saving word vectors: {e}")

def get_word_vector(word):
    word = word.lower()  # normalize

    if word not in word_vectors:
        print(f"🆕 New word detected: '{word}', adding to word_vectors.json")
        word_vectors[word] = generate_vector()
        try:
            save_word_vectors()
        except RuntimeError as e:
            print(f"⚠ Error saving word vectors safely: {e}")

    return np.array(word_vectors[word])
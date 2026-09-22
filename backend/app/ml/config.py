import os

class MLConfig:
    # Model Weights for Hybrid Combiner
    CONTENT_WEIGHT: float = 0.50
    COLLABORATIVE_WEIGHT: float = 0.30
    POPULARITY_WEIGHT: float = 0.20

    # Interaction Signal Weights
    EVENT_WEIGHTS = {
        "booking": 5.0,
        "rating": 4.0,
        "review": 3.5,
        "favorite": 3.0,
        "movie_search": 1.5,
        "movie_view": 1.0,
    }

    # Minimum similarity threshold
    SIMILARITY_THRESHOLD: float = 0.05

    # Artifacts storage directory
    ARTIFACTS_DIR: str = os.path.join(os.path.dirname(__file__), "artifacts")
    CONTENT_MODEL_FILE: str = os.path.join(ARTIFACTS_DIR, "content_similarity.pkl")
    TFIDF_VECTORIZER_FILE: str = os.path.join(ARTIFACTS_DIR, "tfidf_vectorizer.pkl")
    COLLABORATIVE_MODEL_FILE: str = os.path.join(ARTIFACTS_DIR, "collaborative_similarity.pkl")
    MOVIE_METADATA_FILE: str = os.path.join(ARTIFACTS_DIR, "movie_metadata.pkl")

ml_config = MLConfig()

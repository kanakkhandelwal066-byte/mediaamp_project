import os
import pickle
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal
from app.ml.config import ml_config
from app.ml.data_loader import load_movie_corpus, load_interaction_data
from app.ml.content_model import ContentBasedModel
from app.ml.collaborative_model import CollaborativeFilteringModel

def train_and_save_models():
    print("[ML TRAIN] Starting offline training for CineBook AI Recommendation Engine...")
    db = SessionLocal()

    try:
        # Create artifacts directory
        os.makedirs(ml_config.ARTIFACTS_DIR, exist_ok=True)

        # 1. Load data
        print("  -> Loading movie textual corpus...")
        movie_corpus = load_movie_corpus(db)
        print(f"     Loaded {len(movie_corpus)} active movies.")

        print("  -> Loading user-item interaction signals...")
        interactions = load_interaction_data(db)
        print(f"     Loaded {len(interactions)} interaction data points.")

        all_movie_ids = [m["movie_id"] for m in movie_corpus]

        # 2. Train Content-Based Model
        print("  -> Training TF-IDF & Cosine Similarity Content-Based Model...")
        content_model = ContentBasedModel()
        content_model.fit(movie_corpus)

        # 3. Train Collaborative Filtering Model
        print("  -> Training Item-Item Collaborative Filtering Model...")
        collab_model = CollaborativeFilteringModel()
        collab_model.fit(interactions, all_movie_ids)

        # 4. Save Artifacts
        print(f"  -> Persisting model artifacts to {ml_config.ARTIFACTS_DIR}...")
        with open(ml_config.CONTENT_MODEL_FILE, "wb") as f:
            pickle.dump(content_model, f)

        with open(ml_config.COLLABORATIVE_MODEL_FILE, "wb") as f:
            pickle.dump(collab_model, f)

        metadata_dict = {m["movie_id"]: m for m in movie_corpus}
        with open(ml_config.MOVIE_METADATA_FILE, "wb") as f:
            pickle.dump(metadata_dict, f)

        print("[OK] ML models trained and saved successfully!")
        print(f"     Artifacts created in: {ml_config.ARTIFACTS_DIR}")

    except Exception as e:
        print(f"[ERROR] Failed to train ML models: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    train_and_save_models()

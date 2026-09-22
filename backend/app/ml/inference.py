import os
import pickle
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.ml.config import ml_config
from app.ml.recommender import HybridRecommender
from app.ml.data_loader import load_movie_corpus, load_interaction_data
from app.ml.content_model import ContentBasedModel
from app.ml.collaborative_model import CollaborativeFilteringModel

logger = logging.getLogger("cinebook.ml")

class RecommendationService:
    _instance: Optional["RecommendationService"] = None

    def __init__(self):
        self.recommender: Optional[HybridRecommender] = None
        self._load_or_initialize()

    @classmethod
    def get_instance(cls) -> "RecommendationService":
        if cls._instance is None:
            cls._instance = RecommendationService()
        return cls._instance

    def _load_or_initialize(self):
        """Loads serialized model artifacts from disk if available."""
        try:
            if (
                os.path.exists(ml_config.CONTENT_MODEL_FILE)
                and os.path.exists(ml_config.COLLABORATIVE_MODEL_FILE)
                and os.path.exists(ml_config.MOVIE_METADATA_FILE)
            ):
                with open(ml_config.CONTENT_MODEL_FILE, "rb") as f:
                    content_model = pickle.load(f)
                with open(ml_config.COLLABORATIVE_MODEL_FILE, "rb") as f:
                    collab_model = pickle.load(f)
                with open(ml_config.MOVIE_METADATA_FILE, "rb") as f:
                    meta_dict = pickle.load(f)

                self.recommender = HybridRecommender(content_model, collab_model, meta_dict)
                logger.info("Successfully loaded ML recommendation models from disk artifacts.")
            else:
                logger.info("ML artifacts not found on disk. Initializing in-memory on demand.")
        except Exception as e:
            logger.warning(f"Failed to load ML artifacts from disk: {e}. Will train in-memory.")

    def ensure_model_ready(self, db: Session):
        """If model is not yet loaded, trains in-memory from database."""
        if self.recommender is None:
            movie_corpus = load_movie_corpus(db)
            interactions = load_interaction_data(db)
            all_movie_ids = [m["movie_id"] for m in movie_corpus]

            content_model = ContentBasedModel().fit(movie_corpus)
            collab_model = CollaborativeFilteringModel().fit(interactions, all_movie_ids)
            meta_dict = {m["movie_id"]: m for m in movie_corpus}

            self.recommender = HybridRecommender(content_model, collab_model, meta_dict)

    def get_recommendations(
        self,
        db: Session,
        user_id: Optional[int] = None,
        top_n: int = 6
    ) -> List[Dict[str, Any]]:
        self.ensure_model_ready(db)
        if not self.recommender:
            return []
        return self.recommender.recommend_for_user(user_id=user_id, top_n=top_n)

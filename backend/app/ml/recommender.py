from typing import List, Dict, Any, Optional
from app.ml.config import ml_config
from app.ml.content_model import ContentBasedModel
from app.ml.collaborative_model import CollaborativeFilteringModel

class HybridRecommender:
    def __init__(
        self,
        content_model: ContentBasedModel,
        collaborative_model: CollaborativeFilteringModel,
        movie_metadata: Dict[int, Dict[str, Any]]
    ):
        self.content_model = content_model
        self.collaborative_model = collaborative_model
        self.movie_metadata = movie_metadata

    def recommend_for_user(
        self,
        user_id: Optional[int] = None,
        top_n: int = 6,
        user_history_movie_ids: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid recommendation pipeline:
        1. Content-based scores from user's recently watched/liked movies.
        2. Collaborative scores from user-item interaction similarities.
        3. Popularity score baseline.
        4. Configurable weighted blend: 0.5*content + 0.3*collab + 0.2*popularity.
        5. Cold start fallback if user has no interactions.
        """
        user_history = user_history_movie_ids or []
        if user_id and user_id in self.collaborative_model.user_history:
            user_history = list(set(user_history + list(self.collaborative_model.user_history[user_id].keys())))

        # 1. Cold start check
        if not user_history:
            return self._cold_start_recommendations(top_n=top_n)

        # 2. Content scores: aggregate similarities to user's history movies
        content_scores: Dict[int, float] = {}
        for past_m_id in user_history:
            sims = self.content_model.get_similar_movies(past_m_id, top_n=10)
            for cand_id, score in sims:
                if cand_id not in user_history:
                    content_scores[cand_id] = max(content_scores.get(cand_id, 0.0), score)

        # Normalize content scores
        max_c = max(content_scores.values()) if content_scores else 0.0
        if max_c > 0:
            content_scores = {m: s / max_c for m, s in content_scores.items()}

        # 3. Collaborative scores
        collab_scores = self.collaborative_model.predict_user_scores(user_id) if user_id else {}

        # 4. Hybrid Blend
        candidates = set(content_scores.keys()) | set(collab_scores.keys())
        if not candidates:
            return self._cold_start_recommendations(top_n=top_n)

        scored_list = []
        for m_id in candidates:
            if m_id not in self.movie_metadata:
                continue

            meta = self.movie_metadata[m_id]
            c_score = content_scores.get(m_id, 0.0)
            cf_score = collab_scores.get(m_id, 0.0)
            pop_score = float(meta.get("rating", 7.0)) / 10.0

            final_score = (
                (ml_config.CONTENT_WEIGHT * c_score) +
                (ml_config.COLLABORATIVE_WEIGHT * cf_score) +
                (ml_config.POPULARITY_WEIGHT * pop_score)
            )

            # Generate explainability reason
            reason = self._generate_reason(m_id, user_history, c_score, cf_score)

            scored_list.append({
                "movie_id": m_id,
                "title": meta["title"],
                "slug": meta.get("slug", ""),
                "poster_url": meta.get("poster_url"),
                "rating": meta.get("rating", 0.0),
                "duration_minutes": meta.get("duration_minutes", 120),
                "genres": meta.get("genres", []),
                "score": round(final_score, 3),
                "reason": reason
            })

        scored_list.sort(key=lambda x: x["score"], reverse=True)
        return scored_list[:top_n]

    def _cold_start_recommendations(self, top_n: int = 6) -> List[Dict[str, Any]]:
        """Fallback strategy for new users with zero history: trending and highest rated."""
        all_movies = list(self.movie_metadata.values())
        # Sort by rating and vote count
        all_movies.sort(key=lambda m: (m.get("rating", 0.0), m.get("vote_count", 0)), reverse=True)

        results = []
        for m in all_movies[:top_n]:
            results.append({
                "movie_id": m["movie_id"],
                "title": m["title"],
                "slug": m.get("slug", ""),
                "poster_url": m.get("poster_url"),
                "rating": m.get("rating", 0.0),
                "duration_minutes": m.get("duration_minutes", 120),
                "genres": m.get("genres", []),
                "score": round(m.get("rating", 8.0) / 10.0, 3),
                "reason": "Top trending blockbuster loved by moviegoers"
            })
        return results

    def _generate_reason(
        self,
        movie_id: int,
        user_history: List[int],
        c_score: float,
        cf_score: float
    ) -> str:
        meta = self.movie_metadata.get(movie_id, {})
        genres = meta.get("genres", [])
        genre_str = genres[0] if genres else "movies"

        # Find which past movie was closest in content
        if user_history and c_score >= cf_score:
            closest_past = None
            highest_sim = 0.0
            for past_id in user_history:
                sims = dict(self.content_model.get_similar_movies(past_id, top_n=5))
                if movie_id in sims and sims[movie_id] > highest_sim:
                    highest_sim = sims[movie_id]
                    closest_past = self.movie_metadata.get(past_id, {}).get("title")

            if closest_past:
                return f"Because you enjoyed {closest_past}"
            return f"Matches your interest in acclaimed {genre_str} cinema"

        elif cf_score > 0.3:
            return "Popular among cinephiles with similar taste as you"

        return f"Trending top-rated {genre_str} release"

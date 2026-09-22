import numpy as np
from typing import List, Tuple, Dict
from sklearn.metrics.pairwise import cosine_similarity

class CollaborativeFilteringModel:
    """
    Item-Item Collaborative Filtering based on implicit and explicit user interaction signals.
    Builds interaction matrix and calculates cosine similarity across items.
    """
    def __init__(self):
        self.item_similarity_matrix = {}
        self.movie_ids = []
        self.user_history = {} # user_id -> dict of {movie_id: weight}

    def fit(self, interactions: List[Tuple[int, int, float]], all_movie_ids: List[int]) -> "CollaborativeFilteringModel":
        self.movie_ids = sorted(list(set(all_movie_ids)))
        movie_to_idx = {m_id: idx for idx, m_id in enumerate(self.movie_ids)}
        
        # Aggregate user history
        user_ids_set = set()
        user_movie_weights = {}

        for u_id, m_id, weight in interactions:
            user_ids_set.add(u_id)
            if u_id not in self.user_history:
                self.user_history[u_id] = {}
            self.user_history[u_id][m_id] = self.user_history[u_id].get(m_id, 0.0) + weight

        user_ids = sorted(list(user_ids_set))
        if not user_ids or not self.movie_ids:
            return self

        user_to_idx = {u_id: idx for idx, u_id in enumerate(user_ids)}

        # Build matrix: shape (len(user_ids), len(movie_ids))
        R = np.zeros((len(user_ids), len(self.movie_ids)))
        for u_id, m_dict in self.user_history.items():
            u_idx = user_to_idx[u_id]
            for m_id, w in m_dict.items():
                if m_id in movie_to_idx:
                    m_idx = movie_to_idx[m_id]
                    R[u_idx, m_idx] = w

        # Item-item similarity (cosine similarity of columns of R)
        item_vectors = R.T # shape: (num_movies, num_users)
        norm = np.linalg.norm(item_vectors, axis=1, keepdims=True)
        norm[norm == 0] = 1.0
        normalized_items = item_vectors / norm

        sim_mat = np.dot(normalized_items, normalized_items.T)

        for i, m1 in enumerate(self.movie_ids):
            self.item_similarity_matrix[m1] = {}
            for j, m2 in enumerate(self.movie_ids):
                self.item_similarity_matrix[m1][m2] = float(sim_mat[i, j])

        return self

    def predict_user_scores(self, user_id: int) -> Dict[int, float]:
        """Predict interest scores for all items based on item-item similarity with user's past interactions."""
        if user_id not in self.user_history:
            return {}

        user_ratings = self.user_history[user_id]
        scores = {}

        for candidate_movie in self.movie_ids:
            if candidate_movie in user_ratings:
                continue # Already interacted

            numerator = 0.0
            denominator = 0.0

            for interacted_movie, user_weight in user_ratings.items():
                sim = self.item_similarity_matrix.get(interacted_movie, {}).get(candidate_movie, 0.0)
                if sim > 0:
                    numerator += sim * user_weight
                    denominator += abs(sim)

            if denominator > 0:
                scores[candidate_movie] = float(numerator / denominator)

        # Normalize scores to 0.0 - 1.0
        max_s = max(scores.values()) if scores else 0.0
        if max_s > 0:
            scores = {m: round(s / max_s, 4) for m, s in scores.items()}

        return scores

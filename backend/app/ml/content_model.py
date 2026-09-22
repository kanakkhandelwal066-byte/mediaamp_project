import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.preprocessing import clean_text

class ContentBasedModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000
        )
        self.similarity_matrix = None
        self.movie_id_to_idx = {}
        self.idx_to_movie_id = {}
        self.movies_meta = {}

    def fit(self, movie_corpus: List[Dict[str, Any]]) -> "ContentBasedModel":
        if not movie_corpus:
            return self

        corpus_texts = []
        for idx, m in enumerate(movie_corpus):
            m_id = m["movie_id"]
            self.movie_id_to_idx[m_id] = idx
            self.idx_to_movie_id[idx] = m_id
            self.movies_meta[m_id] = m
            cleaned = clean_text(m["content_soup"])
            corpus_texts.append(cleaned)

        tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)
        self.similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
        return self

    def get_similar_movies(self, movie_id: int, top_n: int = 10) -> List[Tuple[int, float]]:
        if self.similarity_matrix is None or movie_id not in self.movie_id_to_idx:
            return []

        idx = self.movie_id_to_idx[movie_id]
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # Exclude itself (idx 0)
        results = []
        for other_idx, score in sim_scores[1:top_n + 1]:
            other_m_id = self.idx_to_movie_id[other_idx]
            results.append((other_m_id, float(score)))

        return results

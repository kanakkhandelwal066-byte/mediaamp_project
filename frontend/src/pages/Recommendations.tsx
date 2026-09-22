import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, Brain, Cpu, Star, Clock, ArrowRight, 
  Loader2, Film, CheckCircle2, Sliders, Zap 
} from "lucide-react";
import { recommendationService } from "../services/recommendationService";
import { Recommendation } from "../types";
import { useAuth } from "../hooks/useAuth";

export const Recommendations: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PERSONALIZED" | "GLOBAL">(
    isAuthenticated ? "PERSONALIZED" : "GLOBAL"
  );

  const fetchRecs = async (tab: "PERSONALIZED" | "GLOBAL") => {
    setLoading(true);
    try {
      if (tab === "PERSONALIZED" && isAuthenticated) {
        const data = await recommendationService.getMyRecommendations(8);
        setRecommendations(data);
      } else {
        const data = await recommendationService.getRecommendations(8);
        setRecommendations(data);
      }
    } catch (err) {
      console.error("Failed to load recommendations", err);
      // Fallback to global if personalized failed
      try {
        const fallbackData = await recommendationService.getRecommendations(8);
        setRecommendations(fallbackData);
      } catch (e) {
        console.error("Fallback failed", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs(activeTab);
  }, [activeTab, isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-cinema-border p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cinema-gold/10 to-cinema-red/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cinema-gold/10 border border-cinema-gold/30 text-cinema-gold text-xs font-bold">
            <Brain className="w-4 h-4" />
            <span>Hybrid Machine Learning Engine v1.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            AI-Powered Movie <span className="text-transparent bg-clip-text bg-gradient-to-r from-cinema-red via-orange-400 to-cinema-gold">Recommendations</span>
          </h1>

          <p className="text-sm text-cinema-muted leading-relaxed">
            Our recommendation engine combines <strong className="text-white">TF-IDF Vectorization</strong> (content-based feature cosine similarity across genre, plot, director, and cast) with <strong className="text-white">Item-Item Collaborative Filtering</strong> to surface cinema tailored specifically to your taste.
          </p>

          {/* Model Architecture Feature Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-cinema-surface border border-cinema-border text-[11px] font-semibold text-white flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cinema-cyan" /> 70% Content TF-IDF
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cinema-surface border border-cinema-border text-[11px] font-semibold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> 30% Collaborative Co-occurrence
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cinema-surface border border-cinema-border text-[11px] font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Inference & Explainability
            </span>
          </div>
        </div>
      </div>

      {/* Tabs / Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-cinema-border pb-4">
        <div className="flex items-center space-x-2 bg-cinema-card border border-cinema-border p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("PERSONALIZED")}
            disabled={!isAuthenticated}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "PERSONALIZED"
                ? "bg-cinema-red text-white shadow-glow"
                : "text-cinema-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized For You</span>
            {!isAuthenticated && <span className="text-[10px] ml-1">(Sign in required)</span>}
          </button>

          <button
            onClick={() => setActiveTab("GLOBAL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "GLOBAL"
                ? "bg-cinema-red text-white shadow-glow"
                : "text-cinema-muted hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Global Trending & High Similarity</span>
          </button>
        </div>

        <span className="text-xs text-cinema-muted">
          Showing {recommendations.length} machine-learning predicted titles
        </span>
      </div>

      {/* Recommendation Movie Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-cinema-gold animate-spin" />
          <p className="text-xs text-cinema-muted">Computing cosine vector similarities across movie catalog...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-cinema-border space-y-3">
          <Film className="w-10 h-10 text-cinema-muted mx-auto" />
          <h2 className="text-base font-bold text-white">No recommendations yet</h2>
          <p className="text-xs text-cinema-muted">Start booking shows or rating movies to help our ML engine learn your preferences!</p>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-red text-white text-xs font-bold shadow-glow"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((rec) => {
            const matchPercentage = Math.round(rec.score * 100);

            return (
              <div
                key={rec.movie_id}
                className="group relative rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border hover:border-cinema-gold/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
              >
                {/* Poster & Badges */}
                <div className="relative aspect-[2/3] overflow-hidden bg-cinema-surface">
                  {rec.poster_url ? (
                    <img
                      src={rec.poster_url}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-cinema-muted">
                      <Film className="w-12 h-12" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent opacity-80" />

                  {/* Similarity Score Pill */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-cinema-gold/40 text-cinema-gold text-xs font-black flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3 text-cinema-gold" />
                    <span>{matchPercentage}% Match</span>
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cinema-border text-white text-[11px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{rec.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Card Content & Explainability */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-cinema-gold transition-colors line-clamp-1">
                      {rec.title}
                    </h3>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.genres.map((g, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-cinema-surface text-cinema-muted border border-cinema-border"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Explainability Pill */}
                  <div className="p-2.5 rounded-xl bg-cinema-surface/90 border border-cinema-gold/20 text-cinema-gold/90 text-[11px] font-medium leading-snug flex items-start gap-1.5">
                    <Brain className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cinema-gold" />
                    <span className="line-clamp-2">{rec.reason}</span>
                  </div>

                  {/* Book Button */}
                  <Link
                    to={`/movies/${rec.movie_id}`}
                    className="w-full py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-glow"
                  >
                    <span>View Showtimes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

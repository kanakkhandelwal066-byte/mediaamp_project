import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Play, Star, MapPin, Ticket, ChevronRight, TrendingUp, Award, Film } from "lucide-react";
import { Movie, Recommendation, Theatre } from "../types";
import { movieService } from "../services/movieService";
import { recommendationService } from "../services/recommendationService";
import { theatreService } from "../services/theatreService";
import { useCity } from "../hooks/useCity";
import { MovieCard } from "../components/MovieCard";

export const Home: React.FC = () => {
  const { selectedCity } = useCity();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trending, recs, ths] = await Promise.all([
          movieService.getTrendingMovies(),
          recommendationService.getRecommendations(4),
          theatreService.getTheatres(selectedCity?.id),
        ]);
        setTrendingMovies(trending);
        setRecommendations(recs);
        setTheatres(ths);
      } catch (err) {
        console.error("Failed to load home page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  const heroMovie = trendingMovies[0] || null;

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      {heroMovie && (
        <section className="relative -mt-6 sm:-mt-8 min-h-[520px] sm:min-h-[600px] flex items-end overflow-hidden border-b border-cinema-border/50">
          {/* Backdrop Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroMovie.backdrop_url || heroMovie.poster_url}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/70 to-cinema-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/80 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-2xl space-y-4">
              
              {/* Badges */}
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full bg-cinema-red text-white text-xs font-bold tracking-wider uppercase shadow-glow">
                  Featured Premiere
                </span>
                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-cinema-gold">
                  <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                  <span>{heroMovie.rating.toFixed(1)}/10</span>
                </div>
                <span className="text-xs text-cinema-muted">
                  {heroMovie.duration_minutes}m • {heroMovie.certification || "UA"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                {heroMovie.title}
              </h1>

              {/* Genres */}
              <p className="text-sm font-semibold text-cinema-cyan">
                {heroMovie.genres.map((g) => g.name).join(" • ")}
              </p>

              {/* Description */}
              <p className="text-sm sm:text-base text-cinema-muted line-clamp-3 leading-relaxed">
                {heroMovie.description}
              </p>

              {/* Cast */}
              {heroMovie.cast && (
                <p className="text-xs text-cinema-muted">
                  <span className="text-white font-semibold">Starring:</span> {heroMovie.cast}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={`/movies/${heroMovie.id}`}
                  className="px-6 py-3.5 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white font-bold text-sm shadow-glow flex items-center space-x-2 transition-all hover:scale-105"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets Now</span>
                </Link>

                {heroMovie.trailer_url && (
                  <a
                    href={heroMovie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-full bg-cinema-surface/90 hover:bg-cinema-card text-white border border-cinema-border font-bold text-sm flex items-center space-x-2 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* City & Promotional Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl glass-card border border-cinema-border/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cinema-red/10 border border-cinema-red/20 flex items-center justify-center text-cinema-red shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-cinema-muted uppercase tracking-wider font-semibold">Showing in</span>
              <h3 className="text-base font-bold text-white">{selectedCity?.name || "All Cities"}</h3>
              <p className="text-xs text-cinema-muted">{theatres.length} multiplex theatres nearby</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-cinema-border/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cinema-gold/10 border border-cinema-gold/20 flex items-center justify-center text-cinema-gold shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-cinema-muted uppercase tracking-wider font-semibold">Offer Coupon</span>
              <h3 className="text-base font-bold text-white">WELCOME50</h3>
              <p className="text-xs text-cinema-gold">Get 50% discount up to ₹150</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-cinema-border/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cinema-cyan/10 border border-cinema-cyan/20 flex items-center justify-center text-cinema-cyan shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-cinema-muted uppercase tracking-wider font-semibold">AI Powered</span>
              <h3 className="text-base font-bold text-white">Hybrid Recommendation</h3>
              <p className="text-xs text-cinema-cyan">Personalized picks with explainability</p>
            </div>
          </div>
        </section>

        {/* Trending Movies Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cinema-red text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Popular in Cinemas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Trending Movies</h2>
            </div>
            <Link
              to="/movies"
              className="text-xs sm:text-sm font-semibold text-cinema-muted hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {trendingMovies.slice(0, 8).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* AI Recommendations Teaser */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cinema-card via-cinema-surface to-cinema-card border border-cinema-cyan/20 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-cinema-cyan text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>CineBook AI Hybrid Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Recommended For You</h2>
              <p className="text-xs text-cinema-muted mt-1">
                Blended recommendations based on content similarity, collaborative cinephile patterns, and top reviews.
              </p>
            </div>
            <Link
              to="/recommendations"
              className="px-5 py-2.5 rounded-full bg-cinema-cyan/10 hover:bg-cinema-cyan/20 text-cinema-cyan border border-cinema-cyan/30 text-xs font-bold flex items-center gap-2 self-start transition-all"
            >
              <span>Explore AI Picks</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.movie_id}
                to={`/movies/${rec.movie_id}`}
                className="p-4 rounded-2xl bg-cinema-surface/80 border border-cinema-border hover:border-cinema-cyan/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center space-x-3">
                  {rec.poster_url && (
                    <img
                      src={rec.poster_url}
                      alt={rec.title}
                      className="w-12 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 text-xs text-cinema-gold font-bold mb-0.5">
                      <Star className="w-3 h-3 fill-cinema-gold" />
                      <span>{rec.rating.toFixed(1)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cinema-cyan truncate">
                      {rec.title}
                    </h4>
                    <span className="text-[11px] text-cinema-muted truncate block">
                      {rec.genres.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-cinema-border/50 text-[11px] text-cinema-cyan/90 font-medium italic flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{rec.reason}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Multiplex Theatres */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cinema-gold text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>Multiplex Experiences</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Popular Theatres</h2>
            </div>
            <Link
              to="/theatres"
              className="text-xs sm:text-sm font-semibold text-cinema-muted hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>All Theatres</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {theatres.slice(0, 6).map((theatre) => (
              <div key={theatre.id} className="p-5 rounded-2xl glass-card border border-cinema-border flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">{theatre.name}</h4>
                  <p className="text-xs text-cinema-muted mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cinema-red shrink-0 mt-0.5" />
                    <span>{theatre.address}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-cinema-border/50">
                  {theatre.screens?.map((screen) => (
                    <span
                      key={screen.id}
                      className="px-2 py-0.5 rounded-md bg-cinema-surface border border-cinema-border text-[10px] font-semibold text-cinema-muted"
                    >
                      {screen.screen_type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

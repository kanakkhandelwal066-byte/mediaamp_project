import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Star, Clock, Calendar, MapPin, Play, Ticket, MessageSquare, 
  Sparkles, CheckCircle2, ChevronRight, User as UserIcon 
} from "lucide-react";
import { Movie, Show, Review, Recommendation } from "../types";
import { movieService } from "../services/movieService";
import { showService } from "../services/showService";
import { reviewService, recommendationService } from "../services/recommendationService";
import { useAuth } from "../hooks/useAuth";
import { useCity } from "../hooks/useCity";
import { MovieCard } from "../components/MovieCard";

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(9.0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Date buttons (Today + 3 days)
  const dateOptions = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split("T")[0],
      dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      formattedDate: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    };
  });

  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) {
      setSelectedDate(dateOptions[0].dateStr);
    }
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;
      setLoading(true);
      try {
        const [m, revs, recs] = await Promise.all([
          movieService.getMovieById(movieId),
          reviewService.getMovieReviews(movieId),
          recommendationService.getRecommendations(4),
        ]);
        setMovie(m);
        setReviews(revs);
        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to load movie details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Fetch shows when date or city changes
  useEffect(() => {
    const fetchShows = async () => {
      if (!movieId || !selectedDate) return;
      try {
        const sList = await showService.getShows({
          movieId,
          cityId: selectedCity?.id,
          dateStr: selectedDate
        });
        setShows(sList);
      } catch (err) {
        console.error("Failed to load shows", err);
      }
    };

    fetchShows();
  }, [movieId, selectedDate, selectedCity]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!newContent.trim()) return;

    setSubmittingReview(true);
    try {
      const added = await reviewService.addReview({
        movie_id: movieId,
        rating: newRating,
        title: newTitle || undefined,
        content: newContent
      });
      setReviews([added, ...reviews]);
      setReviewModalOpen(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
      </div>
    );
  }

  // Group shows by theatre
  const theatreShowsMap: { [theatreName: string]: { theatre: any; shows: Show[] } } = {};
  shows.forEach((s) => {
    if (!theatreShowsMap[s.theatre_name]) {
      theatreShowsMap[s.theatre_name] = {
        theatre: { name: s.theatre_name, address: s.theatre_address },
        shows: []
      };
    }
    theatreShowsMap[s.theatre_name].shows.push(s);
  });

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Backdrop Section */}
      <section className="relative min-h-[420px] sm:min-h-[500px] flex items-end overflow-hidden border-b border-cinema-border/50">
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/80 to-cinema-bg/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-bg via-cinema-bg/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          
          {/* Poster */}
          <div className="w-44 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
            <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Metadata */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-cinema-card/90 border border-cinema-border text-xs font-bold text-cinema-gold">
                <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                <span>{movie.rating.toFixed(1)} / 10 ({movie.vote_count} votes)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-xs font-semibold text-cinema-muted">
                {movie.certification || "UA"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-xs font-semibold text-cinema-muted">
                {movie.duration_minutes} Minutes
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white">{movie.title}</h1>

            <p className="text-sm font-semibold text-cinema-cyan">
              {movie.genres.map((g) => g.name).join(" • ")} | {movie.languages.map((l) => l.name).join(", ")}
            </p>

            <p className="text-sm text-cinema-muted leading-relaxed max-w-3xl">
              {movie.description}
            </p>

            <div className="text-xs text-cinema-muted space-y-1 pt-1">
              {movie.director && <p><span className="text-white font-semibold">Director:</span> {movie.director}</p>}
              {movie.cast && <p><span className="text-white font-semibold">Cast:</span> {movie.cast}</p>}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <button
                type="button"
                id="book-tickets-hero-btn"
                onClick={(e) => {
                  e.preventDefault();
                  const showtimesSection = document.getElementById("showtimes-section");
                  if (showtimesSection) {
                    showtimesSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white text-xs font-bold shadow-glow transition-all hover:scale-105 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Book Tickets</span>
              </button>

              {movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Watch Official Trailer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Date Selector & Showtimes */}
        <section id="showtimes-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cinema-border pb-6">
            <div>
              <h2 className="text-2xl font-black text-white">Select Showtime</h2>
              <p className="text-xs text-cinema-muted mt-0.5">Showing in {selectedCity?.name || "City"} Multiplexes</p>
            </div>

            {/* Date Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {dateOptions.map((opt) => (
                <button
                  key={opt.dateStr}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedDate(opt.dateStr);
                  }}
                  className={`px-4 py-2 rounded-xl text-center border transition-all shrink-0 cursor-pointer ${
                    selectedDate === opt.dateStr
                      ? "bg-cinema-red border-cinema-red text-white shadow-glow"
                      : "bg-cinema-card border-cinema-border text-cinema-muted hover:border-cinema-red/50 hover:text-white"
                  }`}
                >
                  <span className="block text-[11px] uppercase font-bold tracking-wider">{opt.dayName}</span>
                  <span className="block text-xs font-semibold">{opt.formattedDate}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Showtimes Grouped by Theatre */}
          {Object.keys(theatreShowsMap).length === 0 ? (
            <div className="p-10 rounded-2xl glass-card border border-cinema-border text-center space-y-2">
              <Clock className="w-8 h-8 text-cinema-muted mx-auto" />
              <p className="text-sm font-semibold text-white">No scheduled shows for this date in {selectedCity?.name}.</p>
              <p className="text-xs text-cinema-muted">Please choose another date or browse other now showing movies.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(theatreShowsMap).map(([tName, { theatre, shows: tShows }]) => (
                <div key={tName} className="p-6 rounded-2xl glass-card border border-cinema-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cinema-border/50 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cinema-red shrink-0" />
                        {tName}
                      </h3>
                      <p className="text-xs text-cinema-muted pl-6">{theatre.address}</p>
                    </div>
                  </div>

                  {/* Showtimes Chips */}
                  <div className="flex flex-wrap items-center gap-3">
                    {tShows.map((show) => {
                      const timeStr = new Date(show.start_time).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      });

                      return (
                        <button
                          key={show.id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!show || !show.id) {
                              console.error("Invalid show selected:", show);
                              return;
                            }
                            navigate(`/seats/${show.id}`);
                          }}
                          className="group p-3 rounded-xl bg-cinema-surface border border-cinema-border hover:border-cinema-red hover:bg-cinema-card transition-all flex flex-col items-center min-w-[110px] text-center cursor-pointer"
                        >
                          <span className="text-sm font-bold text-white group-hover:text-cinema-red font-mono">
                            {timeStr}
                          </span>
                          <span className="text-[10px] text-cinema-cyan font-semibold mt-0.5">
                            {show.format} • ₹{show.base_price.toFixed(0)}
                          </span>
                          <span className="text-[10px] text-cinema-muted group-hover:text-cinema-red mt-1 font-semibold flex items-center gap-1">
                            <Ticket className="w-3 h-3" /> Book Ticket
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* User Reviews Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-cinema-border pb-4">
            <div>
              <h2 className="text-2xl font-black text-white">Moviegoer Reviews</h2>
              <p className="text-xs text-cinema-muted mt-0.5">Real verified reviews and ratings</p>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) navigate("/login");
                else setReviewModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-cinema-card hover:bg-cinema-border border border-cinema-border text-xs font-bold text-white flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-cinema-muted">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl glass-card border border-cinema-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-cinema-red/20 text-cinema-red flex items-center justify-center text-xs font-bold">
                        {rev.user_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{rev.user_name}</h4>
                        {rev.is_verified_booking && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified Booking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cinema-surface text-xs font-bold text-cinema-gold">
                      <Star className="w-3 h-3 fill-cinema-gold" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {rev.title && <h5 className="text-sm font-bold text-white pt-1">{rev.title}</h5>}
                  <p className="text-xs text-cinema-muted leading-relaxed">{rev.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Recommendations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-cinema-cyan text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>If You Like This Movie</span>
              </div>
              <h2 className="text-2xl font-black text-white">Recommended Similar Movies</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.movie_id}
                to={`/movies/${rec.movie_id}`}
                className="group rounded-2xl glass-card border border-cinema-border p-4 flex flex-col justify-between hover:border-cinema-cyan transition-all"
              >
                <img
                  src={rec.poster_url}
                  alt={rec.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="text-sm font-bold text-white truncate">{rec.title}</h4>
                  <p className="text-[11px] text-cinema-cyan line-clamp-1 mt-1 font-medium italic">
                    {rec.reason}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-cinema-border pb-3">
              <h3 className="text-lg font-bold text-white">Review: {movie.title}</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-cinema-muted hover:text-white">✕</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Rating: {newRating} / 10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full accent-cinema-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Review Headline</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Masterpiece of cinematic tension"
                  className="w-full px-4 py-2 bg-cinema-surface border border-cinema-border rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Tell other moviegoers about the performances, sound design, and visuals..."
                  className="w-full px-4 py-2 bg-cinema-surface border border-cinema-border rounded-xl text-sm text-white focus:outline-none focus:border-cinema-red"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cinema-surface text-cinema-muted text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 rounded-xl bg-cinema-red text-white text-xs font-bold shadow-glow disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

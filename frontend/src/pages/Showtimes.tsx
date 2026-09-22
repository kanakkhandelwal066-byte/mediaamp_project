import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Film, Ticket, ChevronRight } from "lucide-react";
import { Show, Theatre, Movie } from "../types";
import { showService } from "../services/showService";
import { theatreService } from "../services/theatreService";
import { movieService } from "../services/movieService";
import { useCity } from "../hooks/useCity";

export const Showtimes: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theatreIdParam = searchParams.get("theatreId");
  const movieIdParam = searchParams.get("movieId");

  const { selectedCity } = useCity();
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedTheatreId, setSelectedTheatreId] = useState<number | undefined>(
    theatreIdParam ? Number(theatreIdParam) : undefined
  );
  const [selectedMovieId, setSelectedMovieId] = useState<number | undefined>(
    movieIdParam ? Number(movieIdParam) : undefined
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [tList, mList] = await Promise.all([
          theatreService.getTheatres(selectedCity?.id),
          movieService.getMovies({ page_size: 50 }),
        ]);
        setTheatres(tList);
        setMovies(mList.items);
      } catch (err) {
        console.error("Failed to load showtime filters", err);
      }
    };
    fetchMetadata();
  }, [selectedCity]);

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true);
      try {
        const list = await showService.getShows({
          cityId: selectedCity?.id,
          theatreId: selectedTheatreId,
          movieId: selectedMovieId,
        });
        setShows(list);
      } catch (err) {
        console.error("Failed to fetch showtimes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [selectedCity, selectedTheatreId, selectedMovieId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Showtimes & Schedules</h1>
        <p className="text-sm text-cinema-muted mt-1">
          Select a showtime to proceed to seat selection.
        </p>
      </div>

      {/* Filter Row */}
      <div className="p-5 rounded-2xl glass-card border border-cinema-border flex flex-wrap gap-4 items-center">
        {/* Theatre Select */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-cinema-muted mb-1">Filter by Theatre</label>
          <select
            value={selectedTheatreId || ""}
            onChange={(e) => setSelectedTheatreId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-xl bg-cinema-surface border border-cinema-border text-xs text-white focus:outline-none focus:border-cinema-red"
          >
            <option value="">All Multiplexes in {selectedCity?.name}</option>
            {theatres.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Movie Select */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-cinema-muted mb-1">Filter by Movie</label>
          <select
            value={selectedMovieId || ""}
            onChange={(e) => setSelectedMovieId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 rounded-xl bg-cinema-surface border border-cinema-border text-xs text-white focus:outline-none focus:border-cinema-red"
          >
            <option value="">All Movies</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>

        {(selectedTheatreId || selectedMovieId) && (
          <button
            onClick={() => {
              setSelectedTheatreId(undefined);
              setSelectedMovieId(undefined);
            }}
            className="self-end px-4 py-2 rounded-xl bg-cinema-surface text-xs font-semibold text-cinema-muted hover:text-white border border-cinema-border transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Shows List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
        </div>
      ) : shows.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-cinema-border">
          <Clock className="w-8 h-8 text-cinema-muted mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No showtimes found matching your filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => {
            const startDt = new Date(show.start_time);
            const dateStr = startDt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            const timeStr = startDt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={show.id} className="p-5 rounded-2xl glass-card border border-cinema-border flex flex-col justify-between space-y-4 hover:border-cinema-red/40 transition-all">
                <div className="flex items-start space-x-3">
                  {show.movie_poster && (
                    <img src={show.movie_poster} alt={show.movie_title} className="w-14 h-20 object-cover rounded-xl shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-cinema-cyan uppercase tracking-wider block">
                      {show.format} • {show.language}
                    </span>
                    <h3 className="text-base font-bold text-white truncate">{show.movie_title}</h3>
                    <p className="text-xs text-cinema-muted truncate mt-0.5">{show.theatre_name}</p>
                    <p className="text-xs font-mono font-bold text-white mt-2">
                      {dateStr} at {timeStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-cinema-border/50">
                  <div className="text-xs">
                    <span className="text-cinema-muted">From </span>
                    <span className="font-bold text-cinema-gold">₹{show.base_price.toFixed(0)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/seats/${show.id}`);
                    }}
                    className="px-4 py-2 rounded-xl bg-cinema-red hover:bg-cinema-redHover text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

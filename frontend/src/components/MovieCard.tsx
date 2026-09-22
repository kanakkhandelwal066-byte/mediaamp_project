import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, Ticket } from "lucide-react";
import { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const genreNames = movie.genres?.map((g) => g.name).slice(0, 2).join(" • ") || "Cinema";
  const languageNames = movie.languages?.map((l) => l.name).slice(0, 2).join(", ") || "English";

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-cinema-red/50 flex flex-col h-full">
      
      {/* Poster Image with Rating Badge */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-cinema-surface">
        <img
          src={movie.poster_url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Rating */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-cinema-gold">
            <Star className="w-3.5 h-3.5 fill-cinema-gold text-cinema-gold" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>

          {/* Certification or Trending */}
          {movie.is_trending && (
            <span className="px-2.5 py-0.5 rounded-full bg-cinema-red text-white text-[10px] font-bold uppercase tracking-wider shadow-glow">
              Trending
            </span>
          )}
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-cinema-muted mb-1">
            <span className="font-medium text-cinema-cyan truncate max-w-[150px]">{genreNames}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration_minutes}m
            </span>
          </div>

          <h3 className="font-bold text-base text-white group-hover:text-cinema-red transition-colors line-clamp-1">
            {movie.title}
          </h3>

          <p className="text-xs text-cinema-muted mt-0.5 line-clamp-1">
            {languageNames} • {movie.certification || "UA"}
          </p>
        </div>

        {/* Action Button */}
        <Link
          to={`/movies/${movie.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-cinema-surface hover:bg-cinema-red text-white border border-cinema-border hover:border-cinema-red text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-glow"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Book Tickets</span>
        </Link>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Movie, Genre, Language } from "../types";
import { movieService } from "../services/movieService";
import { MovieCard } from "../components/MovieCard";

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParam);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [gList, lList] = await Promise.all([
          movieService.getGenres(),
          movieService.getLanguages(),
        ]);
        setGenres(gList);
        setLanguages(lList);
      } catch (err) {
        console.error("Failed to load movie filters", err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await movieService.getMovies({
          search: search || undefined,
          genre: selectedGenre || undefined,
          language: selectedLanguage || undefined,
          rating_min: selectedRating,
          page,
          page_size: 12,
        });
        setMovies(res.items);
        setTotal(res.total);
        setTotalPages(res.total_pages);
      } catch (err) {
        console.error("Failed to fetch movies", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, selectedRating, page]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedGenre("");
    setSelectedLanguage("");
    setSelectedRating(undefined);
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Explore Movies</h1>
        <p className="text-sm text-cinema-muted mt-1">
          Browse blockbuster releases, critically acclaimed cinema, and upcoming spectacles.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-2xl glass-card border border-cinema-border space-y-4">
        
        {/* Top Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, director, cast, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-cinema-surface border border-cinema-border rounded-xl text-sm text-white focus:border-cinema-red focus:outline-none"
            />
          </div>

          {(search || selectedGenre || selectedLanguage || selectedRating) && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-border border border-cinema-border text-xs font-semibold text-cinema-muted hover:text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-cinema-border/50 text-xs">
          
          {/* Genre select */}
          <div className="flex items-center space-x-2">
            <span className="text-cinema-muted font-semibold">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => {
                setSelectedGenre(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-cinema-surface border border-cinema-border text-white text-xs focus:border-cinema-red focus:outline-none"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Language select */}
          <div className="flex items-center space-x-2">
            <span className="text-cinema-muted font-semibold">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-cinema-surface border border-cinema-border text-white text-xs focus:border-cinema-red focus:outline-none"
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center space-x-2">
            <span className="text-cinema-muted font-semibold">Min Rating:</span>
            <select
              value={selectedRating || ""}
              onChange={(e) => {
                setSelectedRating(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg bg-cinema-surface border border-cinema-border text-white text-xs focus:border-cinema-red focus:outline-none"
            >
              <option value="">Any Rating</option>
              <option value="8.5">⭐ 8.5+</option>
              <option value="8.0">⭐ 8.0+</option>
              <option value="7.5">⭐ 7.5+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
        </div>
      ) : movies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-cinema-border space-y-3">
          <p className="text-base text-cinema-muted">No movies matched your current filter criteria.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-cinema-red text-white text-xs font-bold shadow-glow"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center text-xs text-cinema-muted">
            <span>Showing {movies.length} of {total} movies</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-xl bg-cinema-card border border-cinema-border hover:border-cinema-red text-white disabled:opacity-40 disabled:hover:border-cinema-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-semibold text-cinema-muted px-3 py-2 rounded-xl bg-cinema-surface border border-cinema-border">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-xl bg-cinema-card border border-cinema-border hover:border-cinema-red text-white disabled:opacity-40 disabled:hover:border-cinema-border"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

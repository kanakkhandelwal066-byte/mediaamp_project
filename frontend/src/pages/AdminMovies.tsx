import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Film, Plus, Search, Edit2, Trash2, CheckCircle2, 
  XCircle, Star, ArrowLeft, Loader2, X, AlertCircle 
} from "lucide-react";
import { movieService } from "../services/movieService";
import { adminService } from "../services/adminService";
import { Movie, Genre, Language } from "../types";

export const AdminMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    duration_minutes: 120,
    release_date: new Date().toISOString().split("T")[0],
    poster_url: "",
    backdrop_url: "",
    certification: "UA",
    director: "",
    cast: "",
    keywords: "",
    is_trending: false,
    is_active: true,
    genre_ids: [] as number[],
    language_ids: [] as number[]
  });

  const fetchMoviesData = async () => {
    setLoading(true);
    try {
      const [moviesRes, genresRes, langsRes] = await Promise.all([
        movieService.getMovies({ search: search || undefined, page_size: 50 }),
        movieService.getGenres(),
        movieService.getLanguages()
      ]);
      setMovies(moviesRes.items);
      setGenres(genresRes);
      setLanguages(langsRes);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to load movie catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesData();
  }, [search]);

  const openCreateModal = () => {
    setEditingMovie(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      duration_minutes: 120,
      release_date: new Date().toISOString().split("T")[0],
      poster_url: "",
      backdrop_url: "",
      certification: "UA",
      director: "",
      cast: "",
      keywords: "",
      is_trending: false,
      is_active: true,
      genre_ids: genres.slice(0, 1).map((g) => g.id),
      language_ids: languages.slice(0, 1).map((l) => l.id)
    });
    setShowModal(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      duration_minutes: movie.duration_minutes,
      release_date: movie.release_date,
      poster_url: movie.poster_url || "",
      backdrop_url: movie.backdrop_url || "",
      certification: movie.certification || "UA",
      director: movie.director || "",
      cast: movie.cast || "",
      keywords: movie.keywords || "",
      is_trending: movie.is_trending || false,
      is_active: movie.is_active,
      genre_ids: movie.genres.map((g) => g.id),
      language_ids: movie.languages.map((l) => l.id)
    });
    setShowModal(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, title, slug: editingMovie ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (editingMovie) {
        await adminService.updateMovie(editingMovie.id, formData);
      } else {
        await adminService.createMovie(formData);
      }
      setShowModal(false);
      await fetchMoviesData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save movie");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this movie?")) return;
    try {
      await adminService.deleteMovie(id);
      await fetchMoviesData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Deactivation failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-cinema-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Film className="w-7 h-7 text-cinema-red" />
            <span>Movie Catalogue Management</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">Add, edit, or configure active movie inventory and media</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-xs shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-cinema-card border border-cinema-border p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, director, cast..."
            className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
          />
        </div>
        <span className="text-xs text-cinema-muted font-semibold">{movies.length} titles listed</span>
      </div>

      {/* Movies Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cinema-red animate-spin" />
          <p className="text-xs text-cinema-muted">Loading catalogue items...</p>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-cinema-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cinema-surface/50 text-cinema-muted border-b border-cinema-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Poster</th>
                  <th className="py-3 px-4 font-semibold">Title & Certification</th>
                  <th className="py-3 px-4 font-semibold">Genres</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border text-white">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-cinema-surface/30 transition-colors">
                    <td className="py-3 px-4">
                      {m.poster_url ? (
                        <img
                          src={m.poster_url}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg border border-cinema-border shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-lg bg-cinema-surface border border-cinema-border flex items-center justify-center">
                          <Film className="w-4 h-4 text-cinema-muted" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{m.title}</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-cinema-muted mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-cinema-surface border border-cinema-border">
                          {m.certification || "UA"}
                        </span>
                        <span>{m.release_date}</span>
                        {m.is_trending && (
                          <span className="text-cinema-gold font-bold">★ Trending</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {m.genres.map((g) => (
                          <span
                            key={g.id}
                            className="px-1.5 py-0.5 rounded bg-cinema-surface text-[10px] text-cinema-muted border border-cinema-border"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cinema-muted">{m.duration_minutes} mins</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-bold text-cinema-gold">
                        <Star className="w-3.5 h-3.5 fill-cinema-gold" />
                        <span>{m.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}>
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 rounded-lg bg-cinema-surface hover:bg-cinema-border text-cinema-muted hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Deactivate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cinema-card border border-cinema-border rounded-3xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cinema-border pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-cinema-red" />
                <span>{editingMovie ? "Edit Movie Details" : "Add New Movie"}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-cinema-surface text-cinema-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Plot Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Duration (mins) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Release Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.release_date}
                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Certification</label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  >
                    <option value="U">U (Universal)</option>
                    <option value="UA">UA (Parental Guidance)</option>
                    <option value="A">A (Adults Only)</option>
                    <option value="S">S (Specialized)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={formData.poster_url}
                    onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Star Cast (comma separated)</label>
                <input
                  type="text"
                  value={formData.cast}
                  onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                  placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page"
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-red"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="rounded border-cinema-border text-cinema-red focus:ring-cinema-red"
                  />
                  <span>Feature as Trending</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-cinema-border text-cinema-red focus:ring-cinema-red"
                  />
                  <span>Active & Bookable</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cinema-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cinema-red hover:bg-red-600 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMovie ? "Update Movie" : "Create Movie"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

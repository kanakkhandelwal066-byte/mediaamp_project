import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Clock, Plus, Trash2, ArrowLeft, Loader2, 
  X, AlertCircle, Film, Building2, DollarSign, Filter 
} from "lucide-react";
import { showService } from "../services/showService";
import { movieService } from "../services/movieService";
import { theatreService } from "../services/theatreService";
import { adminService } from "../services/adminService";
import { Show, Movie, Theatre } from "../types";

export const AdminShows: React.FC = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMovieId, setSelectedMovieId] = useState<number | "ALL">("ALL");
  const [selectedTheatreId, setSelectedTheatreId] = useState<number | "ALL">("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    movie_id: 0,
    theatre_id: 0,
    screen_id: 0,
    start_time: "",
    end_time: "",
    base_price: 250,
    format: "IMAX 2D",
    language: "English"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showService.getShows({
          movieId: selectedMovieId === "ALL" ? undefined : selectedMovieId,
          theatreId: selectedTheatreId === "ALL" ? undefined : selectedTheatreId
        }),
        movieService.getMovies({ page_size: 100 }),
        theatreService.getTheatres()
      ]);
      setShows(showsRes);
      setMovies(moviesRes.items);
      setTheatres(theatresRes);

      if (moviesRes.items.length > 0 && theatresRes.length > 0 && form.movie_id === 0) {
        const defaultTheatre = theatresRes[0];
        const defaultScreen = defaultTheatre.screens?.[0];
        const now = new Date();
        now.setHours(now.getHours() + 2);
        const later = new Date(now.getTime() + 2.5 * 60 * 60 * 1000);

        setForm({
          movie_id: moviesRes.items[0].id,
          theatre_id: defaultTheatre.id,
          screen_id: defaultScreen?.id || 1,
          start_time: now.toISOString().slice(0, 16),
          end_time: later.toISOString().slice(0, 16),
          base_price: 250,
          format: "IMAX 2D",
          language: "English"
        });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMovieId, selectedTheatreId]);

  const handleTheatreChange = (theatreId: number) => {
    const th = theatres.find((t) => t.id === theatreId);
    const firstScreen = th?.screens?.[0];
    setForm((prev) => ({
      ...prev,
      theatre_id: theatreId,
      screen_id: firstScreen?.id || 0
    }));
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await adminService.createShow({
        movie_id: form.movie_id,
        theatre_id: form.theatre_id,
        screen_id: form.screen_id,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        base_price: form.base_price,
        format: form.format,
        language: form.language
      });
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to schedule show");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel and remove this scheduled show?")) return;
    try {
      await adminService.deleteShow(id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete show");
    }
  };

  const selectedTheatreScreens = theatres.find((t) => t.id === form.theatre_id)?.screens || [];

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
            <Clock className="w-7 h-7 text-cinema-gold" />
            <span>Show Scheduling & Inventory</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">Publish auditorium show slots, seat allocations, and tier pricing</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-gold hover:bg-yellow-500 text-black font-bold text-xs shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Show</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-cinema-card border border-cinema-border p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-cinema-muted font-bold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>

        <select
          value={selectedMovieId}
          onChange={(e) => setSelectedMovieId(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}
          className="bg-cinema-surface border border-cinema-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-gold"
        >
          <option value="ALL">All Movies</option>
          {movies.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>

        <select
          value={selectedTheatreId}
          onChange={(e) => setSelectedTheatreId(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}
          className="bg-cinema-surface border border-cinema-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cinema-gold"
        >
          <option value="ALL">All Theatres</option>
          {theatres.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <span className="text-xs text-cinema-muted ml-auto font-semibold">{shows.length} shows scheduled</span>
      </div>

      {/* Shows Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cinema-gold animate-spin" />
          <p className="text-xs text-cinema-muted">Loading scheduled shows...</p>
        </div>
      ) : shows.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-cinema-border text-cinema-muted space-y-2">
          <Calendar className="w-10 h-10 mx-auto" />
          <p className="text-sm text-white font-bold">No shows matching filter criteria</p>
          <p className="text-xs">Schedule a new showtime above to populate inventory.</p>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-cinema-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cinema-surface/50 text-cinema-muted border-b border-cinema-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Movie</th>
                  <th className="py-3 px-4 font-semibold">Multiplex & Auditorium</th>
                  <th className="py-3 px-4 font-semibold">Show Time</th>
                  <th className="py-3 px-4 font-semibold">Format & Lang</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold">Seat Availability</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border text-white">
                {shows.map((s) => {
                  const startTime = new Date(s.start_time);
                  return (
                    <tr key={s.id} className="hover:bg-cinema-surface/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white text-sm">
                        <Link to={`/movies/${s.movie_id}`} className="hover:text-cinema-red transition-colors">
                          {s.movie_title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{s.theatre_name}</div>
                        <div className="text-[11px] text-cinema-cyan">{s.screen_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-cinema-gold">
                          {startTime.toLocaleDateString(undefined, { month: "short", day: "numeric" })},{" "}
                          {startTime.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-cinema-surface border border-cinema-border text-[10px] font-semibold text-white">
                          {s.format} • {s.language}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹{s.base_price.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <span className="font-bold text-white">{s.available_seats || 0}</span>
                          <span className="text-cinema-muted text-[11px]"> / {s.total_seats || 0} left</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteShow(s.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Cancel Show"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cinema-card border border-cinema-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cinema-border pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-cinema-gold" />
                <span>Schedule New Showtime</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-cinema-surface text-cinema-muted hover:text-white"
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

            <form onSubmit={handleCreateShow} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Select Movie *</label>
                <select
                  value={form.movie_id}
                  onChange={(e) => setForm({ ...form, movie_id: parseInt(e.target.value) })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.duration_minutes} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Theatre *</label>
                  <select
                    value={form.theatre_id}
                    onChange={(e) => handleTheatreChange(parseInt(e.target.value))}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  >
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Screen / Auditorium *</label>
                  <select
                    value={form.screen_id}
                    onChange={(e) => setForm({ ...form, screen_id: parseInt(e.target.value) })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  >
                    {selectedTheatreScreens.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.screen_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    min={50}
                    step={10}
                    required
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: parseFloat(e.target.value) || 200 })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  >
                    <option value="IMAX 4K">IMAX 4K</option>
                    <option value="IMAX 2D">IMAX 2D</option>
                    <option value="Dolby Atmos 2D">Dolby Atmos 2D</option>
                    <option value="4DX 3D">4DX 3D</option>
                    <option value="Standard 2D">Standard 2D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cinema-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cinema-gold hover:bg-yellow-500 text-black text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Publish Showtime</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

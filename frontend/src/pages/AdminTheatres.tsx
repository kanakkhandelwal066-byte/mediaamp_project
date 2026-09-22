import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, Plus, MapPin, Tv, ArrowLeft, Loader2, 
  X, AlertCircle, Phone, CheckCircle2 
} from "lucide-react";
import { theatreService } from "../services/theatreService";
import { adminService } from "../services/adminService";
import { Theatre, City } from "../types";

export const AdminTheatres: React.FC = () => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<number | "ALL">("ALL");

  // Modals
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [targetTheatre, setTargetTheatre] = useState<Theatre | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Theatre Form
  const [theatreForm, setTheatreForm] = useState({
    name: "",
    city_id: 1,
    address: "",
    phone: ""
  });

  // Screen Form
  const [screenForm, setScreenForm] = useState({
    screen_number: 1,
    name: "Screen 1 - Dolby Atmos",
    screen_type: "Dolby Atmos",
    total_seats: 112
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [theatresRes, citiesRes] = await Promise.all([
        theatreService.getTheatres(selectedCityId === "ALL" ? undefined : selectedCityId),
        theatreService.getCities()
      ]);
      setTheatres(theatresRes);
      setCities(citiesRes);
      if (citiesRes.length > 0 && !theatreForm.city_id) {
        setTheatreForm((prev) => ({ ...prev, city_id: citiesRes[0].id }));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to load theatres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCityId]);

  const handleCreateTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await adminService.createTheatre(theatreForm);
      setShowTheatreModal(false);
      setTheatreForm({ name: "", city_id: cities[0]?.id || 1, address: "", phone: "" });
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to create theatre");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTheatre) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await adminService.createScreen(targetTheatre.id, screenForm);
      setShowScreenModal(false);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to add screen");
    } finally {
      setSubmitting(false);
    }
  };

  const openAddScreen = (theatre: Theatre) => {
    setTargetTheatre(theatre);
    const nextNum = (theatre.screens?.length || 0) + 1;
    setScreenForm({
      screen_number: nextNum,
      name: `Screen ${nextNum} - Dolby Atmos`,
      screen_type: "Dolby Atmos",
      total_seats: 112
    });
    setShowScreenModal(true);
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
            <Building2 className="w-7 h-7 text-cinema-cyan" />
            <span>Multiplex Theatres & Auditoriums</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">Manage regional cinema properties, screens, and auditoriums</p>
        </div>

        <button
          onClick={() => setShowTheatreModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-cyan hover:bg-cyan-500 text-black font-bold text-xs shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Multiplex</span>
        </button>
      </div>

      {/* City Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCityId("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            selectedCityId === "ALL" ? "bg-cinema-cyan text-black" : "bg-cinema-card text-cinema-muted hover:text-white border border-cinema-border"
          }`}
        >
          All Cities ({theatres.length})
        </button>
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCityId(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCityId === c.id ? "bg-cinema-cyan text-black" : "bg-cinema-card text-cinema-muted hover:text-white border border-cinema-border"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Theatres List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cinema-cyan animate-spin" />
          <p className="text-xs text-cinema-muted">Loading multiplex locations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {theatres.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl glass-card border border-cinema-border p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-cinema-cyan uppercase tracking-wider">
                      {t.city?.name || "City"}, {t.city?.state || "India"}
                    </span>
                    <h2 className="text-lg font-black text-white mt-0.5">{t.name}</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Operational
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-cinema-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cinema-red shrink-0" />
                    <span>{t.address}</span>
                  </div>
                  {t.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cinema-cyan shrink-0" />
                      <span>{t.phone}</span>
                    </div>
                  )}
                </div>

                {/* Screens Breakdown */}
                <div className="pt-2 border-t border-cinema-border space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-cinema-muted">
                    <span>Configured Screens ({t.screens?.length || 0})</span>
                    <button
                      onClick={() => openAddScreen(t)}
                      className="text-cinema-cyan hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Screen</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {t.screens?.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-xl bg-cinema-surface border border-cinema-border flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-white block">{s.name}</span>
                          <span className="text-[10px] text-cinema-muted">{s.screen_type}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-cinema-gold px-2 py-0.5 rounded bg-cinema-card border border-cinema-border">
                          {s.total_seats} seats
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cinema-border flex justify-end">
                <Link
                  to={`/shows?theatre_id=${t.id}`}
                  className="text-xs font-bold text-cinema-cyan hover:underline flex items-center gap-1"
                >
                  <span>View Scheduled Shows</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Theatre Modal */}
      {showTheatreModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cinema-card border border-cinema-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cinema-border pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cinema-cyan" />
                <span>Add New Multiplex Location</span>
              </h2>
              <button
                onClick={() => setShowTheatreModal(false)}
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

            <form onSubmit={handleCreateTheatre} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Multiplex Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CineBook IMAX Forum Mall"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">City *</label>
                <select
                  value={theatreForm.city_id}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city_id: parseInt(e.target.value) })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-cyan"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Physical Address *</label>
                <textarea
                  required
                  rows={2}
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 80 4567 8900"
                  value={theatreForm.phone}
                  onChange={(e) => setTheatreForm({ ...theatreForm, phone: e.target.value })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cinema-border">
                <button
                  type="button"
                  onClick={() => setShowTheatreModal(false)}
                  className="px-4 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-cinema-cyan hover:bg-cyan-500 text-black text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Multiplex</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Screen Modal */}
      {showScreenModal && targetTheatre && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cinema-card border border-cinema-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-cinema-border pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-cinema-gold" />
                  <span>Add Screen to {targetTheatre.name}</span>
                </h2>
              </div>
              <button
                onClick={() => setShowScreenModal(false)}
                className="p-1 rounded-lg hover:bg-cinema-surface text-cinema-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateScreen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Screen Name *</label>
                <input
                  type="text"
                  required
                  value={screenForm.name}
                  onChange={(e) => setScreenForm({ ...screenForm, name: e.target.value })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Screen Number *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={screenForm.screen_number}
                    onChange={(e) => setScreenForm({ ...screenForm, screen_number: parseInt(e.target.value) || 1 })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cinema-muted mb-1">Screen Type</label>
                  <select
                    value={screenForm.screen_type}
                    onChange={(e) => setScreenForm({ ...screenForm, screen_type: e.target.value })}
                    className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                  >
                    <option value="IMAX 4K with Laser">IMAX 4K with Laser</option>
                    <option value="Dolby Atmos 7.1">Dolby Atmos 7.1</option>
                    <option value="4DX Motion">4DX Motion</option>
                    <option value="Standard 2D/3D">Standard 2D/3D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-cinema-muted mb-1">Total Seats</label>
                <input
                  type="number"
                  min={20}
                  max={500}
                  value={screenForm.total_seats}
                  onChange={(e) => setScreenForm({ ...screenForm, total_seats: parseInt(e.target.value) || 112 })}
                  className="w-full bg-cinema-surface border border-cinema-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cinema-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cinema-border">
                <button
                  type="button"
                  onClick={() => setShowScreenModal(false)}
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
                  <span>Save Screen</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

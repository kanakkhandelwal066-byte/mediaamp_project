import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Film, Phone, ChevronRight } from "lucide-react";
import { Theatre } from "../types";
import { theatreService } from "../services/theatreService";
import { useCity } from "../hooks/useCity";

export const Theatres: React.FC = () => {
  const { selectedCity, cities, setCity } = useCity();
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const list = await theatreService.getTheatres(selectedCity?.id);
        setTheatres(list);
      } catch (err) {
        console.error("Failed to load theatres", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatres();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Cinema Theatres</h1>
          <p className="text-sm text-cinema-muted mt-1">
            Experience movies in IMAX 3D, Dolby Atmos, and luxurious VIP Recliners.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedCity?.id === city.id
                  ? "bg-cinema-red text-white shadow-glow"
                  : "bg-cinema-card border border-cinema-border text-cinema-muted hover:text-white"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
        </div>
      ) : theatres.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-card border border-cinema-border">
          <p className="text-sm text-cinema-muted">No multiplex theatres listed in {selectedCity?.name} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((theatre) => (
            <div
              key={theatre.id}
              className="p-6 rounded-2xl glass-card border border-cinema-border hover:border-cinema-red/50 transition-all flex flex-col justify-between space-y-6 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-cinema-red/10 border border-cinema-red/20 flex items-center justify-center text-cinema-red">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cinema-surface border border-cinema-border text-cinema-muted font-medium">
                    {theatre.screens?.length || 3} Screens
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cinema-red transition-colors">
                  {theatre.name}
                </h3>

                <p className="text-xs text-cinema-muted flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-4 h-4 text-cinema-red shrink-0 mt-0.5" />
                  <span>{theatre.address}</span>
                </p>

                {theatre.phone && (
                  <p className="text-xs text-cinema-muted flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{theatre.phone}</span>
                  </p>
                )}
              </div>

              {/* Screens and Amenities */}
              <div className="space-y-4 pt-4 border-t border-cinema-border/50">
                <div className="flex flex-wrap gap-1.5">
                  {theatre.screens?.map((screen) => (
                    <span
                      key={screen.id}
                      className="px-2.5 py-1 rounded-lg bg-cinema-surface border border-cinema-border text-[11px] font-semibold text-cinema-cyan"
                    >
                      {screen.screen_type}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/showtimes?theatreId=${theatre.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-cinema-surface hover:bg-cinema-red text-white text-xs font-bold flex items-center justify-center gap-2 border border-cinema-border hover:border-cinema-red transition-all group-hover:shadow-glow"
                >
                  <span>View Showtimes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

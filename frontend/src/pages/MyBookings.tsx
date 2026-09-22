import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Ticket, Calendar, MapPin, Film, ChevronRight, AlertCircle, 
  Loader2, CheckCircle2, XCircle, Clock 
} from "lucide-react";
import { bookingService } from "../services/bookingService";
import { Booking } from "../types";

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "CANCELLED">("ALL");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-cinema-red" />
            <span>My Bookings</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-1">Review your tickets, showtimes, and digital boarding passes</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-cinema-card border border-cinema-border p-1 rounded-xl w-fit">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "ALL" ? "bg-cinema-red text-white" : "text-cinema-muted hover:text-white"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter("CONFIRMED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "CONFIRMED" ? "bg-cinema-red text-white" : "text-cinema-muted hover:text-white"
            }`}
          >
            Confirmed ({bookings.filter((b) => b.status === "CONFIRMED").length})
          </button>
          <button
            onClick={() => setFilter("CANCELLED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === "CANCELLED" ? "bg-cinema-red text-white" : "text-cinema-muted hover:text-white"
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === "CANCELLED").length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-cinema-red animate-spin" />
          <p className="text-xs text-cinema-muted">Loading your booking history...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty State */
        <div className="p-12 rounded-3xl glass-card border border-cinema-border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cinema-surface flex items-center justify-center mx-auto text-cinema-muted">
            <Film className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">No bookings found</h2>
            <p className="text-xs text-cinema-muted max-w-sm mx-auto">
              You haven't reserved any movie tickets in this category yet. Explore the latest blockbusters now!
            </p>
          </div>
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-xs shadow-glow transition-all"
          >
            Browse Movies Now
          </Link>
        </div>
      ) : (
        /* Booking List */
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const showDate = new Date(b.show_time);
            const seatsList = b.items?.map((item) => `${item.seat_row}${item.seat_number}`).join(", ") || "Seats Reserved";

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
              >
                {/* Left: Poster & Details */}
                <div className="flex items-start gap-4">
                  {b.movie_poster ? (
                    <img
                      src={b.movie_poster}
                      alt={b.movie_title}
                      className="w-16 h-24 object-cover rounded-xl border border-cinema-border shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-24 rounded-xl bg-cinema-surface border border-cinema-border flex items-center justify-center shrink-0">
                      <Film className="w-6 h-6 text-cinema-muted" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-white text-base group-hover:text-cinema-red transition-colors">
                        {b.movie_title}
                      </h2>
                      {getStatusBadge(b.status)}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-cinema-muted">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-cinema-red" />
                      <span>
                        {b.theatre_name} • {b.screen_name} ({b.screen_format})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-cinema-muted">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-cinema-gold" />
                      <span>
                        {showDate.toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short"
                        })}{" "}
                        at{" "}
                        {showDate.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-white pt-0.5">
                      <span className="text-cinema-muted">Seats: </span>
                      <span className="font-semibold text-cinema-gold">{seatsList}</span>
                      <span className="text-cinema-muted text-[10px] ml-2">({b.items?.length || 0} tickets)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Action Button */}
                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-cinema-border gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-cinema-muted block">Total Paid</span>
                    <span className="text-base font-black text-white">₹{b.final_amount.toFixed(2)}</span>
                  </div>

                  <Link
                    to={`/bookings/${b.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-red text-white text-xs font-bold border border-cinema-border hover:border-cinema-red transition-all shadow-sm"
                  >
                    <span>View Ticket & QR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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

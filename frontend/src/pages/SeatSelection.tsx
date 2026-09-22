import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ArrowRight, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { Show, ShowSeat } from "../types";
import { showService } from "../services/showService";
import { seatService } from "../services/seatService";
import { useAuth } from "../hooks/useAuth";
import { SeatMatrix } from "../components/SeatMatrix";
import { SeatLegend } from "../components/SeatLegend";
import { CountdownTimer } from "../components/CountdownTimer";

export const SeatSelection: React.FC = () => {
  const { showtimeId, id } = useParams<{ showtimeId?: string; id?: string }>();
  const showId = Number(showtimeId || id);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [show, setShow] = useState<Show | null>(null);
  const [seats, setSeats] = useState<ShowSeat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [lockExpiresIn, setLockExpiresIn] = useState<number | null>(null);
  const [lockingSeats, setLockingSeats] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSeats = useCallback(async () => {
    if (!showId || isNaN(showId)) return;
    try {
      const seatList = await seatService.getSeatsForShow(showId);
      setSeats(seatList);
    } catch (err) {
      console.error("Failed to fetch seats", err);
    }
  }, [showId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!showId || isNaN(showId)) {
        setLoading(false);
        setErrorMessage("Invalid showtime selected. Please choose a valid showtime.");
        return;
      }
      setLoading(true);
      try {
        const [s, sList] = await Promise.all([
          showService.getShowById(showId),
          seatService.getSeatsForShow(showId)
        ]);
        setShow(s);
        setSeats(sList);
      } catch (err: any) {
        console.error("Failed to load show details or seats", err);
        setErrorMessage(err?.response?.data?.message || "Failed to load show details or seat availability.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Polling refresh every 12 seconds to keep live seat availability in sync
    const interval = setInterval(fetchSeats, 12000);
    return () => clearInterval(interval);
  }, [showId, fetchSeats]);

  const handleToggleSeat = (seat: ShowSeat) => {
    setErrorMessage(null);
    if (selectedSeatIds.includes(seat.seat_id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.seat_id));
    } else {
      if (selectedSeatIds.length >= 10) {
        setErrorMessage("You can select up to 10 seats per booking.");
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.seat_id]);
    }
  };

  const selectedSeatsList = seats.filter((s) => selectedSeatIds.includes(s.seat_id));
  const subtotal = selectedSeatsList.reduce((sum, s) => sum + s.price, 0);

  const handleLockAndProceed = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnUrl: `/seats/${showId}` } });
      return;
    }

    if (selectedSeatIds.length === 0) {
      setErrorMessage("Please select at least one seat to proceed.");
      return;
    }

    setLockingSeats(true);
    setErrorMessage(null);

    try {
      // Concurrency-safe lock call
      const lockRes = await seatService.lockSeats(showId, selectedSeatIds);
      setLockExpiresIn(lockRes.expires_in_seconds);

      // Navigate to checkout with show & selected seat state
      navigate("/checkout", {
        state: {
          show,
          selectedSeats: selectedSeatsList,
          subtotal,
          expiresIn: lockRes.expires_in_seconds
        }
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to lock seats. One or more seats may have just been selected by another user.";
      setErrorMessage(msg);
      // Refresh seat state
      fetchSeats();
    } finally {
      setLockingSeats(false);
    }
  };

  if (loading || !show) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
      </div>
    );
  }

  const showDate = new Date(show.start_time).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
  const showTime = new Date(show.start_time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Show Details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-cinema-border">
        <div className="flex items-center space-x-4">
          <Link
            to={`/movies/${show.movie_id}`}
            className="p-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-cinema-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div>
            <span className="text-[11px] font-bold text-cinema-cyan uppercase tracking-wider block">
              {show.format} • {show.language}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{show.movie_title}</h1>
            <p className="text-xs text-cinema-muted">
              {show.theatre_name} • {show.screen_name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 self-end md:self-center">
          <div className="text-right">
            <span className="text-xs text-cinema-muted block">Show Schedule</span>
            <span className="text-sm font-bold text-white font-mono">{showDate} at {showTime}</span>
          </div>

          {lockExpiresIn && (
            <CountdownTimer
              initialSeconds={lockExpiresIn}
              onExpire={() => {
                setErrorMessage("Your seat lock has expired. Please select seats again.");
                fetchSeats();
              }}
            />
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Seat Layout */}
      <div className="rounded-3xl glass-card border border-cinema-border p-4 sm:p-8 space-y-8">
        <SeatMatrix
          seats={seats}
          selectedSeatIds={selectedSeatIds}
          onToggleSeat={handleToggleSeat}
        />

        <SeatLegend />
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-40 p-4 sm:p-5 rounded-2xl bg-cinema-card/95 backdrop-blur-xl border border-cinema-border shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-cinema-muted">Selected Seats:</span>
            {selectedSeatsList.length === 0 ? (
              <span className="text-xs text-cinema-muted italic">None selected</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedSeatsList.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-md bg-cinema-surface border border-cinema-border text-xs font-mono font-bold text-cinema-gold"
                  >
                    {s.row}{s.seat_number}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="text-[11px] text-cinema-muted block mt-0.5">
            Prices include standard seat pricing. Convenience fee and GST added at checkout.
          </span>
        </div>

        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            <span className="text-[11px] text-cinema-muted block text-right">Subtotal</span>
            <span className="text-xl font-black text-cinema-gold">₹{subtotal.toFixed(2)}</span>
          </div>

          <button
            type="button"
            disabled={selectedSeatIds.length === 0 || lockingSeats}
            onClick={handleLockAndProceed}
            className="px-6 py-3 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white font-bold text-sm shadow-glow flex items-center space-x-2 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {lockingSeats ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locking Seats...</span>
              </>
            ) : (
              <>
                <span>Lock & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

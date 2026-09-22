import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Ticket as TicketIcon, Film, Sparkles } from "lucide-react";
import { Ticket } from "../types";
import { bookingService } from "../services/bookingService";
import { TicketCard } from "../components/TicketCard";

export const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state as { bookingId?: number; bookingRef?: string; transactionId?: string } | undefined;
  const bookingId = state?.bookingId || (searchParams.get("booking_id") ? Number(searchParams.get("booking_id")) : undefined);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      if (bookingId) {
        try {
          const t = await bookingService.getTicket(bookingId);
          setTicket(t);
        } catch (err) {
          console.error("Failed to fetch confirmed ticket", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white">Payment Confirmed!</h1>
        <p className="text-sm text-cinema-muted max-w-md mx-auto">
          Your booking has been confirmed and seats have been marked <span className="text-emerald-400 font-bold">BOOKED</span>.
        </p>

        {state?.transactionId && (
          <p className="text-xs font-mono text-cinema-muted">
            Transaction Ref: <span className="text-white font-bold">{state.transactionId}</span>
          </p>
        )}
      </div>

      {/* Ticket Card Component */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cinema-red border-t-transparent animate-spin" />
        </div>
      ) : ticket ? (
        <TicketCard ticket={ticket} />
      ) : (
        <div className="p-8 rounded-2xl glass-card border border-cinema-border text-center space-y-4">
          <p className="text-sm text-white">Booking Reference: {state?.bookingRef || "Confirmed"}</p>
          <Link
            to="/bookings"
            className="inline-block px-6 py-2.5 rounded-full bg-cinema-red text-white text-xs font-bold"
          >
            View My Bookings
          </Link>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/bookings"
          className="px-6 py-3 rounded-full bg-cinema-surface hover:bg-cinema-card border border-cinema-border text-white text-xs font-bold flex items-center gap-2 transition-all"
        >
          <TicketIcon className="w-4 h-4 text-cinema-gold" />
          <span>Go to My Bookings</span>
        </Link>

        <Link
          to="/movies"
          className="px-6 py-3 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
        >
          <Film className="w-4 h-4" />
          <span>Explore More Movies</span>
        </Link>
      </div>
    </div>
  );
};

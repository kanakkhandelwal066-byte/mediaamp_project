import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Ticket as TicketIcon, AlertCircle, Loader2, 
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Receipt, Copy, Check 
} from "lucide-react";
import { bookingService } from "../services/bookingService";
import { Booking, Ticket } from "../types";
import { TicketCard } from "../components/TicketCard";

export const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const bookingId = parseInt(id);
        const bookingData = await bookingService.getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData.status === "CONFIRMED") {
          try {
            const ticketData = await bookingService.getTicket(bookingId);
            setTicket(ticketData);
          } catch (e) {
            console.error("Ticket generation error", e);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCopyRef = () => {
    if (booking?.booking_reference) {
      navigator.clipboard.writeText(booking.booking_reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const updated = await bookingService.cancelBooking(booking.id);
      setBooking(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-cinema-red animate-spin" />
        <p className="text-xs text-cinema-muted">Loading reservation and ticket details...</p>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Booking Not Found</h2>
        <p className="text-xs text-cinema-muted">{errorMsg || "The requested booking could not be retrieved."}</p>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-cinema-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs text-cinema-muted">Booking Reference:</span>
          <button
            onClick={handleCopyRef}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cinema-card border border-cinema-border hover:border-cinema-gold text-xs font-mono font-bold text-cinema-gold transition-colors"
          >
            <span>{booking.booking_reference}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Ticket Card Component (If Confirmed) */}
      {ticket && booking.status === "CONFIRMED" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cinema-muted flex items-center gap-2">
              <TicketIcon className="w-4 h-4 text-cinema-red" />
              <span>Digital Boarding Pass</span>
            </h2>
            <span className="text-[11px] text-cinema-muted">Show this QR code at cinema entry</span>
          </div>
          <TicketCard ticket={ticket} />
        </div>
      )}

      {/* Booking Status Alert if Cancelled */}
      {booking.status === "CANCELLED" && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">Reservation Cancelled</h3>
            <p className="text-xs text-red-300/80 mt-0.5">
              This reservation has been cancelled. Any refund has been credited back to your original payment method.
            </p>
          </div>
        </div>
      )}

      {/* Financial Breakdown & Itemized Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-cinema-border pb-3">
            <Receipt className="w-4 h-4 text-cinema-red" />
            <span>Itemized Payment Breakdown</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-cinema-muted">
              <span>Seats Base Price ({booking.items?.length || 0} tickets)</span>
              <span className="text-white font-medium">₹{booking.total_amount.toFixed(2)}</span>
            </div>

            {booking.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Coupon Discount</span>
                <span>-₹{booking.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-cinema-muted">
              <span>Convenience Fee</span>
              <span className="text-white font-medium">₹{booking.convenience_fee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-cinema-muted">
              <span>Integrated GST (18% on convenience fee)</span>
              <span className="text-white font-medium">₹{booking.tax_amount.toFixed(2)}</span>
            </div>

            <div className="border-t border-cinema-border pt-3 flex justify-between items-center text-sm font-black text-white">
              <span>Total Paid</span>
              <span className="text-lg text-cinema-gold">₹{booking.final_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Show & Cinema Details */}
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-cinema-border pb-3">
            <ShieldCheck className="w-4 h-4 text-cinema-cyan" />
            <span>Cinema & Venue Guidelines</span>
          </div>

          <ul className="space-y-2 text-xs text-cinema-muted list-disc list-inside">
            <li>Please arrive at the multiplex at least 15 minutes before showtime.</li>
            <li>Outside food and beverages are strictly prohibited on cinema premises.</li>
            <li>Carry a valid photo ID matching the reservation name.</li>
            <li>Mask guidelines and cinema protocols apply as per local authority rules.</li>
          </ul>

          {booking.status === "CONFIRMED" && (
            <div className="pt-4 border-t border-cinema-border">
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
              >
                Request Cancellation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cinema-card border border-cinema-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Cancel Reservation?</h3>
              <p className="text-xs text-cinema-muted">
                Are you sure you want to cancel your booking for <span className="text-white font-semibold">{booking.movie_title}</span>? This action releases your seats immediately.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white text-xs font-semibold transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 rounded-xl bg-cinema-red hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-glow"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

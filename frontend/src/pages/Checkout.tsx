import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  ShieldCheck, Tag, Ticket, Clock, MapPin, AlertCircle, 
  ArrowRight, Check, Loader2, ChevronLeft 
} from "lucide-react";
import { Show, ShowSeat } from "../types";
import { bookingService } from "../services/bookingService";
import { CountdownTimer } from "../components/CountdownTimer";

interface LocationState {
  show: Show;
  selectedSeats: ShowSeat[];
  subtotal: number;
  expiresIn: number;
}

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | undefined;

  if (!state || !state.show || !state.selectedSeats || state.selectedSeats.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-cinema-red mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Checkout Session</h2>
        <p className="text-xs text-cinema-muted">Please select a movie and lock your seats to proceed with checkout.</p>
        <Link to="/movies" className="inline-block px-6 py-2.5 rounded-full bg-cinema-red text-white text-xs font-bold shadow-glow">
          Browse Movies
        </Link>
      </div>
    );
  }

  const { show, selectedSeats, subtotal, expiresIn } = state;

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Financial figures
  const convenienceFee = round(30.0 + (0.05 * subtotal));
  const taxAmount = round(0.18 * convenienceFee);
  const finalAmount = Math.max(0, round(subtotal - discountAmount + convenienceFee + taxAmount));

  function round(val: number) {
    return Math.round(val * 100) / 100;
  }

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponMessage(null);
    setErrorMsg(null);

    try {
      const res = await bookingService.validateCoupon(couponCode.trim(), subtotal);
      if (res.valid) {
        setAppliedCoupon(res.code);
        setDiscountAmount(res.discount_amount);
        setCouponMessage(res.message);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid coupon code";
      setErrorMsg(msg);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponMessage(null);
  };

  const handleProceedToPayment = async () => {
    setCreatingBooking(true);
    setErrorMsg(null);

    try {
      const seatIds = selectedSeats.map((s) => s.seat_id);
      const booking = await bookingService.createBooking(
        show.id,
        seatIds,
        appliedCoupon || undefined
      );

      // Navigate to Payment page with booking details
      navigate(`/payment/${booking.id}`, { state: { booking } });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to initiate booking. Please try again.";
      setErrorMsg(msg);
    } finally {
      setCreatingBooking(false);
    }
  };

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cinema-border">
        <div className="flex items-center space-x-3">
          <Link
            to={`/seats/${show.id}`}
            className="p-2 rounded-xl bg-cinema-card hover:bg-cinema-border text-cinema-muted hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Order Checkout</h1>
            <p className="text-xs text-cinema-muted mt-0.5">Review your movie reservation details and apply discounts.</p>
          </div>
        </div>

        <CountdownTimer
          initialSeconds={expiresIn}
          onExpire={() => {
            setErrorMsg("Your seat lock has expired. Please select seats again.");
          }}
        />
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Movie & Reservation Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Reservation Card */}
          <div className="p-6 rounded-2xl glass-card border border-cinema-border space-y-6">
            <div className="flex items-start space-x-4">
              {show.movie_poster && (
                <img
                  src={show.movie_poster}
                  alt={show.movie_title}
                  className="w-20 h-28 object-cover rounded-xl border border-cinema-border shrink-0"
                />
              )}
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-cinema-cyan uppercase tracking-wider block">
                  {show.format} • {show.language}
                </span>
                <h2 className="text-xl font-bold text-white truncate">{show.movie_title}</h2>
                <p className="text-xs text-cinema-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cinema-red shrink-0" />
                  <span>{show.theatre_name} • {show.screen_name}</span>
                </p>
                <p className="text-xs font-mono text-white flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-cinema-gold shrink-0" />
                  <span>{showDate} at {showTime}</span>
                </p>
              </div>
            </div>

            {/* Selected Seats Table */}
            <div className="pt-4 border-t border-cinema-border/50">
              <h4 className="text-xs font-bold text-cinema-muted uppercase tracking-wider mb-3">
                Selected Seats ({selectedSeats.length})
              </h4>
              <div className="space-y-2">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="p-3 rounded-xl bg-cinema-surface border border-cinema-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-cinema-card border border-cinema-border">
                        {seat.row}{seat.seat_number}
                      </span>
                      <span className="text-cinema-muted capitalize">({seat.tier} Tier)</span>
                    </div>
                    <span className="font-bold text-cinema-gold">₹{seat.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coupon Input Card */}
          <div className="p-6 rounded-2xl glass-card border border-cinema-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-cinema-gold" />
              <span>Apply Promotional Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>Coupon {appliedCoupon} Applied!</span>
                  </div>
                  <p className="text-xs text-cinema-muted mt-0.5">{couponMessage}</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g. WELCOME50, CINE100)"
                  className="flex-1 px-4 py-2.5 bg-cinema-surface border border-cinema-border rounded-xl text-xs font-mono uppercase text-white focus:outline-none focus:border-cinema-red"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cinema-surface hover:bg-cinema-card border border-cinema-border text-white text-xs font-bold transition-all disabled:opacity-50 shrink-0"
                >
                  {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2 text-[11px] text-cinema-muted">
              <span>Available Demo Codes:</span>
              <button
                type="button"
                onClick={() => setCouponCode("WELCOME50")}
                className="font-mono text-cinema-gold hover:underline font-bold"
              >
                WELCOME50
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setCouponCode("CINE100")}
                className="font-mono text-cinema-gold hover:underline font-bold"
              >
                CINE100
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Price Summary & Checkout Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-cinema-border space-y-6">
            <h3 className="text-base font-bold text-white">Payment Summary</h3>

            <div className="space-y-3 text-xs border-b border-cinema-border/50 pb-4">
              <div className="flex justify-between text-cinema-muted">
                <span>Tickets Subtotal ({selectedSeats.length} seats)</span>
                <span className="text-white font-mono font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span className="font-mono">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-cinema-muted">
                <span>Convenience Fee (incl. tech & ops)</span>
                <span className="text-white font-mono">₹{convenienceFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-cinema-muted">
                <span>Integrated GST (18%)</span>
                <span className="text-white font-mono">₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-cinema-muted uppercase tracking-wider font-semibold block">Total Payable</span>
                <span className="text-2xl font-black text-cinema-gold">₹{finalAmount.toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Verified Amount
              </span>
            </div>

            {/* Terms notice */}
            <p className="text-[11px] text-cinema-muted leading-relaxed">
              By proceeding, you agree to CineBook AI terms of service. Backend verification guarantees price authenticity.
            </p>

            {/* CTA Button */}
            <button
              type="button"
              disabled={creatingBooking}
              onClick={handleProceedToPayment}
              className="w-full py-3.5 px-6 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {creatingBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Order...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

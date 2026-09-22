import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { ShieldCheck, CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Booking, PaymentInitiateResponse } from "../types";
import { paymentService } from "../services/paymentService";
import { bookingService } from "../services/bookingService";
import { DemoPaymentModal } from "../components/DemoPaymentModal";

export const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams<{ bookingId?: string }>();
  const [booking, setBooking] = useState<Booking | null>((location.state as any)?.booking || null);
  const [loadingBooking, setLoadingBooking] = useState<boolean>(!booking && !!bookingId);

  const [selectedProvider, setSelectedProvider] = useState<"DEMO_GATEWAY" | "PAYTM">("DEMO_GATEWAY");
  const [initiating, setInitiating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [initResponse, setInitResponse] = useState<PaymentInitiateResponse | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load booking if arrived via URL param or refreshed
  useEffect(() => {
    if (!booking && bookingId) {
      setLoadingBooking(true);
      bookingService.getBookingById(Number(bookingId))
        .then((b) => setBooking(b))
        .catch((err) => {
          console.error("Failed to load booking details", err);
          setErrorMsg("Could not load booking details. Please try again.");
        })
        .finally(() => setLoadingBooking(false));
    } else if (!booking && !bookingId) {
      navigate("/movies");
    }
  }, [booking, bookingId]);

  // Auto-initiate payment session with backend
  useEffect(() => {
    if (!booking) return;

    const initPayment = async () => {
      setInitiating(true);
      try {
        const resp = await paymentService.initiatePayment(booking.id, selectedProvider);
        setInitResponse(resp);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to initialize payment gateway");
      } finally {
        setInitiating(false);
      }
    };

    initPayment();
  }, [booking?.id, selectedProvider]);

  const handlePayNowClick = async () => {
    if (selectedProvider === "DEMO_GATEWAY" || initResponse?.is_mock) {
      // Direct payment confirmation simulation
      await handleSimulateOutcome("SUCCESS");
    } else {
      // In real Paytm Staging: submit HTML form with checksum params to Paytm payment_url
      alert("Redirecting to Paytm Sandbox... In testing environment, please use Demo Gateway for instant simulator.");
    }
  };

  const handleSimulateOutcome = async (outcome: "SUCCESS" | "FAILURE" | "PENDING") => {
    if (!initResponse || !booking) return;
    setProcessing(true);
    setErrorMsg(null);
    try {
      const result = await paymentService.simulateDemoPayment(initResponse.order_id, outcome);
      setDemoModalOpen(false);

      if (outcome === "SUCCESS") {
        navigate(`/payment/success?booking_id=${booking.id}`, {
          state: {
            bookingId: booking.id,
            bookingRef: booking.booking_reference,
            transactionId: result.transaction_id,
            amount: booking.final_amount
          }
        });
      } else if (outcome === "FAILURE") {
        navigate("/payment/failure", {
          state: {
            bookingRef: booking.booking_reference,
            reason: "Simulated payment failure: user rejected or bank decline"
          }
        });
      } else {
        alert("Payment is currently in PENDING state. Refresh your booking status in My Bookings.");
        navigate("/bookings");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Payment simulation encountered an error";
      if (outcome === "FAILURE") {
        navigate("/payment/failure", {
          state: {
            bookingRef: booking.booking_reference,
            reason: msg
          }
        });
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loadingBooking) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cinema-red animate-spin" />
        <p className="text-sm text-cinema-muted">Loading your order details...</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Payment Checkout</h1>
        <p className="text-xs text-cinema-muted mt-1">
          Select your payment channel to complete reservation #{booking.booking_reference}.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Gateway Selector */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Demo Gateway Simulator Option (Highlighted) */}
          <div
            onClick={() => setSelectedProvider("DEMO_GATEWAY")}
            className={`p-6 rounded-2xl cursor-pointer border transition-all ${
              selectedProvider === "DEMO_GATEWAY"
                ? "bg-cinema-surface border-cinema-red shadow-glow"
                : "bg-cinema-card border-cinema-border hover:border-cinema-border/80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Paytm Demo Simulator</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-cinema-muted mt-0.5">
                    Interactive sandbox allowing one-click simulation of SUCCESS, FAILURE, or PENDING.
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedProvider === "DEMO_GATEWAY" ? "border-cinema-red bg-cinema-red text-white" : "border-cinema-border"
              }`}>
                {selectedProvider === "DEMO_GATEWAY" && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Paytm Official Staging Option */}
          <div
            onClick={() => setSelectedProvider("PAYTM")}
            className={`p-6 rounded-2xl cursor-pointer border transition-all ${
              selectedProvider === "PAYTM"
                ? "bg-cinema-surface border-cinema-red shadow-glow"
                : "bg-cinema-card border-cinema-border hover:border-cinema-border/80"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Paytm Payment Gateway</h3>
                  <p className="text-xs text-cinema-muted mt-0.5">
                    Official Paytm staging integration with checksum hashing.
                  </p>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedProvider === "PAYTM" ? "border-cinema-red bg-cinema-red text-white" : "border-cinema-border"
              }`}>
                {selectedProvider === "PAYTM" && <CheckCircle className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cinema-surface/50 border border-cinema-border text-xs text-cinema-muted space-y-1">
            <p className="font-semibold text-white">Security & Anti-Tampering Guarantee:</p>
            <p>
              Payment amount is locked on backend. Transactions are strictly verified before tickets are marked BOOKED.
            </p>
          </div>
        </div>

        {/* Right Col: Amount Summary & CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card border border-cinema-border space-y-6">
            <h3 className="text-base font-bold text-white">Order Summary</h3>

            <div className="space-y-2 text-xs text-cinema-muted">
              <div className="flex justify-between">
                <span>Movie</span>
                <span className="text-white font-medium truncate max-w-[120px]">{booking.movie_title}</span>
              </div>
              <div className="flex justify-between">
                <span>Seats</span>
                <span className="text-white font-mono">{booking.items.map(i => `${i.seat_row}${i.seat_number}`).join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tickets</span>
                <span className="text-white">{booking.items.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-cinema-border/50 text-white font-bold text-sm">
                <span>Total Amount</span>
                <span className="text-cinema-gold text-lg">₹{booking.final_amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={initiating || processing}
              onClick={handlePayNowClick}
              className="w-full py-3.5 px-6 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {initiating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Payment & Booking...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{booking.final_amount.toFixed(2)} Securely</span>
                </>
              )}
            </button>

            {/* Test Edge Scenarios Trigger */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="text-[11px] text-cinema-muted hover:text-cinema-cyan transition-colors underline decoration-dotted"
              >
                ⚙️ Sandbox: Simulate Failure / Pending Scenarios
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Gateway Simulator Modal */}
      {initResponse && (
        <DemoPaymentModal
          isOpen={demoModalOpen}
          orderId={initResponse.order_id}
          amount={booking.final_amount}
          onSimulate={handleSimulateOutcome}
          onClose={() => setDemoModalOpen(false)}
        />
      )}
    </div>
  );
};

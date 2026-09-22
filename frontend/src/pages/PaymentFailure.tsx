import React from "react";
import { useLocation, Link } from "react-router-dom";
import { XCircle, RefreshCw, Film, ShieldAlert } from "lucide-react";

export const PaymentFailure: React.FC = () => {
  const location = useLocation();
  const state = location.state as { bookingRef?: string; reason?: string } | undefined;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      
      <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto shadow-glow">
        <XCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white">Payment Unsuccessful</h1>
        <p className="text-sm text-cinema-muted">
          {state?.reason || "Transaction was declined by the payment provider or simulated as failed."}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-cinema-card border border-cinema-border text-left text-xs space-y-2">
        <div className="flex items-center space-x-2 text-cinema-gold font-bold">
          <ShieldAlert className="w-4 h-4" />
          <span>Seat Release Notice:</span>
        </div>
        <p className="text-cinema-muted leading-relaxed">
          Your temporarily locked seats have been released back to the general seating pool. No charges were deducted from your account.
        </p>
        {state?.bookingRef && (
          <p className="font-mono text-cinema-muted pt-1">
            Cancelled Reference: <span className="text-white font-semibold">{state.bookingRef}</span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/movies"
          className="px-6 py-3 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Select New Showtime & Retry</span>
        </Link>

        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-cinema-surface hover:bg-cinema-card border border-cinema-border text-white text-xs font-bold flex items-center gap-2 transition-all"
        >
          <Film className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
};

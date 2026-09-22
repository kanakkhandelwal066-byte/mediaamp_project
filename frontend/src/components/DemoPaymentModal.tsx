import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";

interface DemoPaymentModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number;
  onSimulate: (outcome: "SUCCESS" | "FAILURE" | "PENDING") => Promise<void>;
  onClose: () => void;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  isOpen,
  orderId,
  amount,
  onSimulate,
  onClose,
}) => {
  const [loadingOutcome, setLoadingOutcome] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async (outcome: "SUCCESS" | "FAILURE" | "PENDING") => {
    setLoadingOutcome(outcome);
    try {
      await onSimulate(outcome);
    } finally {
      setLoadingOutcome(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-cinema-card border border-cinema-border p-6 sm:p-8 shadow-2xl">
        
        {/* Header with Paytm / Demo Branding */}
        <div className="flex items-center justify-between pb-6 border-b border-cinema-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Paytm Demo Gateway
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Sandbox Simulator
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cinema-muted hover:text-white text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Order Details */}
        <div className="my-6 p-4 rounded-2xl bg-cinema-surface/80 border border-cinema-border space-y-2">
          <div className="flex justify-between text-xs text-cinema-muted">
            <span>Gateway Mode</span>
            <span className="font-mono text-cinema-cyan font-bold">STAGING / MOCK</span>
          </div>
          <div className="flex justify-between text-xs text-cinema-muted">
            <span>Order Reference</span>
            <span className="font-mono text-white">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-cinema-border/50">
            <span>Payable Total</span>
            <span className="text-cinema-gold text-lg">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Evaluation Notice */}
        <div className="mb-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-relaxed">
            This interactive simulator demonstrates real-time transaction state handling. Choose a scenario below to test the database lifecycle, row unlocks, and ticket generation.
          </p>
        </div>

        {/* Simulation Action Buttons */}
        <div className="space-y-3">
          {/* SUCCESS */}
          <button
            type="button"
            disabled={!!loadingOutcome}
            onClick={() => handleAction("SUCCESS")}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
          >
            {loadingOutcome === "SUCCESS" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Simulate Payment SUCCESS</span>
          </button>

          {/* FAILURE */}
          <button
            type="button"
            disabled={!!loadingOutcome}
            onClick={() => handleAction("FAILURE")}
            className="w-full py-3 px-4 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loadingOutcome === "FAILURE" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>Simulate Payment FAILURE (Releases Seats)</span>
          </button>

          {/* PENDING */}
          <button
            type="button"
            disabled={!!loadingOutcome}
            onClick={() => handleAction("PENDING")}
            className="w-full py-3 px-4 rounded-xl bg-cinema-surface hover:bg-cinema-card text-cinema-muted hover:text-white border border-cinema-border font-medium text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loadingOutcome === "PENDING" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            <span>Simulate PENDING State</span>
          </button>
        </div>
      </div>
    </div>
  );
};

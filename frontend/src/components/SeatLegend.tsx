import React from "react";

export const SeatLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-4 px-6 rounded-2xl bg-cinema-card/50 border border-cinema-border/60 text-xs">
      {/* States */}
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-cinema-surface border border-cinema-border flex items-center justify-center text-[10px] text-cinema-muted">
          A1
        </div>
        <span className="text-cinema-muted">Available</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-cinema-red border border-cinema-red text-white flex items-center justify-center text-[10px] font-bold shadow-glow">
          ✓
        </div>
        <span className="text-white font-medium">Selected</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center text-[10px]">
          🔒
        </div>
        <span className="text-amber-400/90">Locked (In Checkout)</span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-zinc-500 flex items-center justify-center text-[10px] line-through">
          ✕
        </div>
        <span className="text-zinc-500">Booked</span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-4 w-px bg-cinema-border" />

      {/* Tiers */}
      <div className="flex items-center space-x-4">
        <span className="flex items-center gap-1.5 text-cinema-muted">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span> Standard (₹220)
        </span>
        <span className="flex items-center gap-1.5 text-cinema-muted">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span> Premium (₹310)
        </span>
        <span className="flex items-center gap-1.5 text-cinema-muted">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span> VIP Recliner (₹440)
        </span>
      </div>
    </div>
  );
};

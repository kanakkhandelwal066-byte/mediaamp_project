import React from "react";
import { ShowSeat } from "../types";

interface SeatMatrixProps {
  seats: ShowSeat[];
  selectedSeatIds: number[];
  onToggleSeat: (seat: ShowSeat) => void;
  maxSelectable?: number;
}

export const SeatMatrix: React.FC<SeatMatrixProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
  maxSelectable = 10,
}) => {
  // Group seats by row
  const rowsMap: { [row: string]: ShowSeat[] } = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.row]) {
      rowsMap[seat.row] = [];
    }
    rowsMap[seat.row].push(seat);
  });

  // Sort rows (H, G, F, E, D, C, B, A: screen at bottom or screen at top)
  // Traditional cinema seating maps have Screen at the front (top or bottom)
  // Let's place the Screen at the top with curved glow, then rows A to H
  const sortedRowKeys = Object.keys(rowsMap).sort();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "text-amber-400";
      case "PREMIUM":
        return "text-purple-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto py-6 px-4">
      
      {/* Curved Screen */}
      <div className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <div className="w-full cinema-screen-curve" />
        <div className="text-[11px] font-bold text-cinema-cyan/70 uppercase tracking-widest mt-3">
          All Eyes This Way • Cinema Screen
        </div>
      </div>

      {/* Seating Grid */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[650px] flex flex-col items-center space-y-3">
          {sortedRowKeys.map((rowKey) => {
            const rowSeats = rowsMap[rowKey].sort((a, b) => a.seat_number - b.seat_number);
            const rowTier = rowSeats[0]?.tier || "STANDARD";

            return (
              <div key={rowKey} className="flex items-center space-x-3">
                {/* Row Letter Left */}
                <span className={`w-6 text-center font-bold text-xs ${getTierColor(rowTier)}`}>
                  {rowKey}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center space-x-2">
                  {rowSeats.map((seat, index) => {
                    const isSelected = selectedSeatIds.includes(seat.seat_id);
                    const isBooked = seat.status === "BOOKED";
                    const isLockedByOther = seat.status === "LOCKED" && !seat.is_locked_by_me && !isSelected;

                    let btnClass = "bg-cinema-surface border-cinema-border text-white hover:border-cinema-red hover:scale-105";

                    if (isSelected) {
                      btnClass = "bg-cinema-red border-cinema-red text-white shadow-glow scale-105 font-bold";
                    } else if (isBooked) {
                      btnClass = "bg-zinc-800/60 border-zinc-800 text-zinc-600 cursor-not-allowed line-through";
                    } else if (isLockedByOther) {
                      btnClass = "bg-amber-500/10 border-amber-500/30 text-amber-500/50 cursor-not-allowed";
                    }

                    // Aisle gap after 7 seats
                    const isAisleGap = index === 6;

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          disabled={isBooked || isLockedByOther}
                          onClick={() => onToggleSeat(seat)}
                          title={`Seat ${seat.row}${seat.seat_number} - ${seat.tier} (₹${seat.price})`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] flex items-center justify-center transition-all ${btnClass}`}
                        >
                          {seat.seat_number}
                        </button>
                        {isAisleGap && <div className="w-6 sm:w-8" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Letter Right */}
                <span className={`w-6 text-center font-bold text-xs ${getTierColor(rowTier)}`}>
                  {rowKey}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

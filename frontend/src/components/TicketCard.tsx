import React from "react";
import { Ticket as TicketType } from "../types";
import { Calendar, Clock, MapPin, Film, CheckCircle, Download, Printer } from "lucide-react";

interface TicketCardProps {
  ticket: TicketType;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const showDate = new Date(ticket.show_time).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const showTime = new Date(ticket.show_time).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden glass-card border border-cinema-border shadow-2xl relative">
      
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-cinema-red/20 via-cinema-card to-cinema-card border-b border-cinema-border flex items-start justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wider mb-2">
            <CheckCircle className="w-3 h-3" />
            <span>{ticket.status}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{ticket.movie_title}</h2>
          <p className="text-xs text-cinema-muted mt-0.5">Booking Ref: <span className="font-mono text-white font-bold">{ticket.booking_reference}</span></p>
        </div>

        {ticket.movie_poster && (
          <img
            src={ticket.movie_poster}
            alt={ticket.movie_title}
            className="w-16 h-24 object-cover rounded-xl border border-cinema-border shadow-md"
          />
        )}
      </div>

      {/* Ticket Details Grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6 bg-cinema-card/90">
        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block">Theatre</span>
          <p className="text-sm font-bold text-white mt-1 line-clamp-1">{ticket.theatre_name}</p>
          <p className="text-[11px] text-cinema-muted line-clamp-1">{ticket.theatre_address}</p>
        </div>

        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block">Screen</span>
          <p className="text-sm font-bold text-cinema-cyan mt-1">{ticket.screen_name}</p>
        </div>

        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block">Seats ({ticket.total_seats})</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {ticket.seats.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-cinema-surface border border-cinema-border font-mono text-xs font-bold text-cinema-gold">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </span>
          <p className="text-sm font-bold text-white mt-1">{showDate}</p>
        </div>

        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time
          </span>
          <p className="text-sm font-bold text-white mt-1">{showTime}</p>
        </div>

        <div>
          <span className="text-[11px] text-cinema-muted uppercase tracking-wider font-semibold block">Total Paid</span>
          <p className="text-base font-black text-cinema-gold mt-1">₹{ticket.final_amount.toFixed(2)}</p>
        </div>
      </div>

      {/* Perforated Divider Line */}
      <div className="relative py-2 flex items-center justify-between px-[-12px]">
        <div className="w-5 h-8 bg-cinema-bg rounded-r-full -ml-2.5 border-r border-cinema-border" />
        <div className="flex-1 border-b-2 border-dashed border-cinema-border mx-2" />
        <div className="w-5 h-8 bg-cinema-bg rounded-l-full -mr-2.5 border-l border-cinema-border" />
      </div>

      {/* Ticket Footer with QR Code */}
      <div className="p-6 bg-cinema-surface/90 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white rounded-2xl shadow-inner border border-white/20">
            <img
              src={ticket.qr_code_base64}
              alt="Booking QR Code"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Scan at Multiplex Turnstile</p>
            <p className="text-[11px] text-cinema-muted leading-relaxed">
              Show this QR code at cinema entry. Physical ticket reprint is not mandatory.
            </p>
            <p className="text-[10px] font-mono text-cinema-muted pt-1">
              Booked on {new Date(ticket.booking_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cinema-card hover:bg-cinema-border border border-cinema-border text-xs font-bold text-white flex items-center justify-center space-x-2 transition-colors shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save</span>
        </button>
      </div>
    </div>
  );
};

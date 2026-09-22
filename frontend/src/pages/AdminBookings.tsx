import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Ticket, Search, ArrowLeft, Loader2, Calendar, 
  CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, Filter 
} from "lucide-react";
import { adminService } from "../services/adminService";
import { Booking } from "../types";

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const fetchBookings = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await adminService.getAllBookings(targetPage, 15);
      if (res.success) {
        setBookings(res.data.items);
        setPage(res.data.page);
        setTotalPages(res.data.total_pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error("Failed to load admin bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.booking_reference.toLowerCase().includes(q) ||
        b.movie_title.toLowerCase().includes(q) ||
        b.theatre_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-cinema-muted hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-purple-400" />
            <span>Customer Booking Audit Trail</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">Comprehensive platform ledger of reservations, status events, and transactions</p>
        </div>

        <div className="text-xs text-cinema-muted bg-cinema-card border border-cinema-border px-4 py-2 rounded-xl">
          Total Bookings: <span className="text-white font-bold">{totalCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-cinema-card border border-cinema-border p-3 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or movie..."
              className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-cinema-muted/50 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {["ALL", "CONFIRMED", "CANCELLED", "PENDING"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s ? "bg-purple-600 text-white" : "text-cinema-muted hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-xs text-cinema-muted">Loading platform booking ledger...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-cinema-border text-cinema-muted">
          <p className="text-sm font-bold text-white">No transactions found</p>
          <p className="text-xs mt-1">No bookings match the current search or filter criteria.</p>
        </div>
      ) : (
        <div className="rounded-3xl glass-card border border-cinema-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cinema-surface/50 text-cinema-muted border-b border-cinema-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">Movie</th>
                  <th className="py-3 px-4 font-semibold">Cinema & Auditorium</th>
                  <th className="py-3 px-4 font-semibold">Show Time</th>
                  <th className="py-3 px-4 font-semibold">Seats</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border text-white">
                {filteredBookings.map((b) => {
                  const seats = b.items?.map((i) => `${i.seat_row}${i.seat_number}`).join(", ") || "N/A";
                  return (
                    <tr key={b.id} className="hover:bg-cinema-surface/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cinema-gold">{b.booking_reference}</td>
                      <td className="py-3 px-4 font-bold text-white">{b.movie_title}</td>
                      <td className="py-3 px-4">
                        <div>{b.theatre_name}</div>
                        <div className="text-[11px] text-cinema-muted">{b.screen_name}</div>
                      </td>
                      <td className="py-3 px-4 text-cinema-muted">
                        {new Date(b.show_time).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-cinema-cyan">{seats}</span>
                      </td>
                      <td className="py-3 px-4 font-bold font-mono">₹{b.final_amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : b.status === "CANCELLED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-cinema-muted text-[11px]">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-cinema-card border-t border-cinema-border flex items-center justify-between">
              <span className="text-xs text-cinema-muted">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg bg-cinema-surface hover:bg-cinema-border text-cinema-muted hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-cinema-surface hover:bg-cinema-border text-cinema-muted hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

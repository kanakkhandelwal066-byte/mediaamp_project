import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, Film, DollarSign, Ticket, Users, Building2, 
  TrendingUp, BarChart3, Clock, AlertCircle, Loader2, ArrowRight, 
  Calendar, CheckCircle2 
} from "lucide-react";
import { adminService } from "../services/adminService";
import { AdminAnalytics, Booking } from "../types";

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, bookingsRes] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getAllBookings(1, 5)
        ]);
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data);
        }
        if (bookingsRes.success) {
          setRecentBookings(bookingsRes.data.items);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-xs text-cinema-muted">Loading administrative KPIs and statistics...</p>
      </div>
    );
  }

  const overview = analytics?.overview;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Portal Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cinema-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Control & Telemetry</span>
          </div>
          <h1 className="text-3xl font-black text-white">Admin Management Dashboard</h1>
          <p className="text-xs text-cinema-muted mt-1">Platform overview, revenue metrics, resource catalogs, and customer activity</p>
        </div>

        {/* Quick Links Header */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/analytics"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Revenue Analytics</span>
          </Link>
          <Link
            to="/admin/movies"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white border border-cinema-border text-xs font-bold transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-cinema-red" />
            <span>Movies</span>
          </Link>
          <Link
            to="/admin/shows"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cinema-surface hover:bg-cinema-border text-white border border-cinema-border text-xs font-bold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-cinema-gold" />
            <span>Showtimes</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* KPI Overview Grid */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold">
              <span>Gross Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              ₹{overview.total_revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>{overview.payment_success_rate.toFixed(1)}% payment success rate</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold">
              <span>Platform Bookings</span>
              <div className="p-2 rounded-xl bg-cinema-red/10 text-cinema-red">
                <Ticket className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {overview.total_bookings.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-cinema-muted">
              <span>Cancellation rate: {overview.cancellation_rate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Active Theatres & Screens */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold">
              <span>Theatres & Shows</span>
              <div className="p-2 rounded-xl bg-cinema-cyan/10 text-cinema-cyan">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">
              {overview.active_theatres} <span className="text-sm font-normal text-cinema-muted">Theatres</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-cinema-muted">
              <span>{overview.total_shows} scheduled showtimes</span>
            </div>
          </div>

          {/* Average Occupancy Rate */}
          <div className="p-6 rounded-3xl bg-cinema-card border border-cinema-border space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold">
              <span>Avg Occupancy Rate</span>
              <div className="p-2 rounded-xl bg-cinema-gold/10 text-cinema-gold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-cinema-gold">
              {overview.average_occupancy_rate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-cinema-muted">
              <span>Across all operational auditoriums</span>
            </div>
          </div>
        </div>
      )}

      {/* Module Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/movies"
          className="p-5 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <Film className="w-6 h-6 text-cinema-red" />
            <ArrowRight className="w-4 h-4 text-cinema-muted group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-cinema-red transition-colors">Movie Catalogue</h2>
            <p className="text-xs text-cinema-muted mt-0.5">Manage titles, release dates, ratings, and media</p>
          </div>
        </Link>

        <Link
          to="/admin/theatres"
          className="p-5 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-6 h-6 text-cinema-cyan" />
            <ArrowRight className="w-4 h-4 text-cinema-muted group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-cinema-cyan transition-colors">Theatres & Screens</h2>
            <p className="text-xs text-cinema-muted mt-0.5">Configure multiplex properties, auditoriums, and seat maps</p>
          </div>
        </Link>

        <Link
          to="/admin/shows"
          className="p-5 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-cinema-gold" />
            <ArrowRight className="w-4 h-4 text-cinema-muted group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-cinema-gold transition-colors">Show Scheduling</h2>
            <p className="text-xs text-cinema-muted mt-0.5">Publish show slots, adjust pricing tiers, and manage inventory</p>
          </div>
        </Link>

        <Link
          to="/admin/bookings"
          className="p-5 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <Ticket className="w-6 h-6 text-purple-400" />
            <ArrowRight className="w-4 h-4 text-cinema-muted group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">Booking Audit Logs</h2>
            <p className="text-xs text-cinema-muted mt-0.5">Live platform ledger, transaction states, and QR tokens</p>
          </div>
        </Link>
      </div>

      {/* Recent Platform Bookings Ledger */}
      <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
        <div className="flex items-center justify-between border-b border-cinema-border pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-cinema-red" />
            <h2 className="text-base font-bold text-white">Recent System Transactions</h2>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-cinema-red hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-xs text-cinema-muted py-4 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-cinema-muted border-b border-cinema-border">
                <tr>
                  <th className="py-2.5 font-semibold">Ref ID</th>
                  <th className="py-2.5 font-semibold">Movie</th>
                  <th className="py-2.5 font-semibold">Cinema</th>
                  <th className="py-2.5 font-semibold">Show Time</th>
                  <th className="py-2.5 font-semibold">Amount</th>
                  <th className="py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cinema-border text-white">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-cinema-surface/50 transition-colors">
                    <td className="py-3 font-mono text-cinema-gold font-semibold">{b.booking_reference}</td>
                    <td className="py-3 font-bold">{b.movie_title}</td>
                    <td className="py-3 text-cinema-muted">{b.theatre_name}</td>
                    <td className="py-3 text-cinema-muted">{new Date(b.show_time).toLocaleString()}</td>
                    <td className="py-3 font-semibold">₹{b.final_amount.toFixed(2)}</td>
                    <td className="py-3">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User as UserIcon, Mail, Phone, ShieldCheck, Ticket, LogOut, 
  Calendar, Award, Sparkles, ExternalLink, CheckCircle2 
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { bookingService } from "../services/bookingService";
import { Booking } from "../types";

export const Profile: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error("Failed to load booking stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.final_amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-cinema-border shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cinema-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cinema-red to-orange-500 p-1 flex items-center justify-center shadow-glow">
            <div className="w-full h-full rounded-[22px] bg-cinema-surface flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-cinema-red" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.full_name || "User"}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0 ${
                isAdmin
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-cinema-red/20 text-cinema-red border border-cinema-red/30"
              }`}>
                {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 mr-1" /> : <Award className="w-3.5 h-3.5 mr-1" />}
                {isAdmin ? "Admin Access" : "CinePass Club Member"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-cinema-muted pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cinema-muted" />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cinema-muted" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cinema-muted" />
                <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-surface hover:bg-red-500/20 text-cinema-muted hover:text-red-400 border border-cinema-border transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border">
          <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold mb-2">
            <span>Total Bookings</span>
            <Ticket className="w-4 h-4 text-cinema-red" />
          </div>
          <div className="text-2xl font-black text-white">{loading ? "..." : bookings.length}</div>
          <p className="text-[11px] text-cinema-muted mt-1">Confirmed & past reservations</p>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border">
          <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold mb-2">
            <span>Confirmed Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{loading ? "..." : confirmedBookings.length}</div>
          <p className="text-[11px] text-cinema-muted mt-1">Active cinema tickets</p>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border">
          <div className="flex items-center justify-between text-cinema-muted text-xs font-semibold mb-2">
            <span>Total Expenditure</span>
            <Sparkles className="w-4 h-4 text-cinema-gold" />
          </div>
          <div className="text-2xl font-black text-cinema-gold">₹{loading ? "..." : totalSpent.toFixed(2)}</div>
          <p className="text-[11px] text-cinema-muted mt-1">Total entertainment spend</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/bookings"
          className="p-6 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-cinema-red" />
              <h2 className="font-bold text-white group-hover:text-cinema-red transition-colors">My Bookings & Tickets</h2>
            </div>
            <p className="text-xs text-cinema-muted">View confirmed tickets, QR code boarding passes, and cancellation history</p>
          </div>
          <ExternalLink className="w-5 h-5 text-cinema-muted group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/recommendations"
          className="p-6 rounded-2xl bg-cinema-card hover:bg-cinema-surface border border-cinema-border transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cinema-gold" />
              <h2 className="font-bold text-white group-hover:text-cinema-gold transition-colors">AI Recommendations</h2>
            </div>
            <p className="text-xs text-cinema-muted">Personalized movie picks generated by our hybrid machine learning engine</p>
          </div>
          <ExternalLink className="w-5 h-5 text-cinema-muted group-hover:text-white transition-colors" />
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="md:col-span-2 p-6 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h2 className="font-bold text-white group-hover:text-purple-300 transition-colors">Admin Management Portal</h2>
              </div>
              <p className="text-xs text-cinema-muted">Manage movies, multiplex theatres, shows, revenue analytics, and system audit logs</p>
            </div>
            <ExternalLink className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
};

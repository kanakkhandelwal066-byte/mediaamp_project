import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, TrendingUp, DollarSign, Users, Ticket, 
  ArrowLeft, Loader2, AlertCircle, PieChart as PieChartIcon, 
  Film, Building2 
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { adminService } from "../services/adminService";
import { AdminAnalytics as AdminAnalyticsType } from "../types";

const COLORS = ["#e50914", "#ffb800", "#00e5ff", "#a855f7", "#22c55e", "#ec4899", "#3b82f6"];

export const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AdminAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await adminService.getAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <p className="text-xs text-cinema-muted">Aggregating telemetry & financial metrics...</p>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h2 className="text-base font-bold text-white">Analytics Unavailable</h2>
        <p className="text-xs text-cinema-muted">{errorMsg || "Could not retrieve analytics data."}</p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cinema-surface text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { overview, daily_revenue, popular_movies, genre_distribution, theatre_occupancy } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
            <BarChart3 className="w-7 h-7 text-purple-400" />
            <span>Business Intelligence & Analytics</span>
          </h1>
          <p className="text-xs text-cinema-muted mt-0.5">Real-time charts, box-office performance, and occupancy distribution</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 rounded-2xl bg-cinema-card border border-cinema-border text-right">
            <span className="text-[10px] text-cinema-muted block">Gross Platform Volume</span>
            <span className="text-base font-black text-white">
              ₹{overview.total_revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Top Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-semibold">Conversion Rate</span>
          <div className="text-xl font-black text-emerald-400">{overview.payment_success_rate.toFixed(1)}%</div>
          <p className="text-[10px] text-cinema-muted">Payments settled</p>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-semibold">Total Users</span>
          <div className="text-xl font-black text-white">{overview.total_users}</div>
          <p className="text-[10px] text-cinema-muted">Registered accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-semibold">Total Bookings</span>
          <div className="text-xl font-black text-cinema-gold">{overview.total_bookings}</div>
          <p className="text-[10px] text-cinema-muted">Reservations logged</p>
        </div>

        <div className="p-5 rounded-2xl bg-cinema-card border border-cinema-border space-y-1">
          <span className="text-[11px] text-cinema-muted font-semibold">Avg Occupancy</span>
          <div className="text-xl font-black text-cinema-cyan">{overview.average_occupancy_rate.toFixed(1)}%</div>
          <p className="text-[10px] text-cinema-muted">Platform utilization</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Daily Revenue Trend */}
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center justify-between border-b border-cinema-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Daily Revenue Velocity (₹)</h2>
            </div>
            <span className="text-[10px] text-cinema-muted">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_revenue}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#737373" fontSize={11} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Popular Movies by Box Office Revenue */}
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center justify-between border-b border-cinema-border pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-cinema-red" />
              <h2 className="text-sm font-bold text-white">Top Movies by Revenue (₹)</h2>
            </div>
            <span className="text-[10px] text-cinema-muted">Gross Earnings</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popular_movies}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="title" stroke="#737373" fontSize={10} tickFormatter={(t) => (t.length > 10 ? `${t.substring(0, 8)}...` : t)} />
                <YAxis stroke="#737373" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, "Gross Revenue"]}
                />
                <Bar dataKey="revenue" fill="#e50914" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Genre Distribution */}
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center justify-between border-b border-cinema-border pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-cinema-gold" />
              <h2 className="text-sm font-bold text-white">Genre Share in Catalogue</h2>
            </div>
            <span className="text-[10px] text-cinema-muted">Total Titles</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genre_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="count"
                  nameKey="genre"
                  label={(entry: any) => `${entry.genre} ${(entry.percent ? entry.percent * 100 : 0).toFixed(0)}%`}
                  labelLine={false}
                >
                  {genre_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Multiplex Auditorium Occupancy */}
        <div className="p-6 rounded-3xl glass-card border border-cinema-border space-y-4">
          <div className="flex items-center justify-between border-b border-cinema-border pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cinema-cyan" />
              <h2 className="text-sm font-bold text-white">Theatre Occupancy Percentage (%)</h2>
            </div>
            <span className="text-[10px] text-cinema-muted">Seat Fill Rate</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={theatre_occupancy} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" domain={[0, 100]} stroke="#737373" fontSize={11} />
                <YAxis dataKey="theatre_name" type="category" stroke="#737373" fontSize={9} width={120} tickFormatter={(t) => (t.length > 18 ? `${t.substring(0, 16)}...` : t)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#171717", borderColor: "#404040", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Occupancy Rate"]}
                />
                <Bar dataKey="occupancy_percentage" fill="#00e5ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

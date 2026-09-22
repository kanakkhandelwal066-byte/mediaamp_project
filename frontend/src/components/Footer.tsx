import React from "react";
import { Link } from "react-router-dom";
import { Film, Heart, Shield, Cpu, CreditCard, Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-cinema-border bg-cinema-bg/95 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cinema-red to-orange-500 flex items-center justify-center shadow-glow">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                CINEBOOK <span className="text-xs px-2 py-0.5 rounded-full bg-cinema-red text-white font-bold">AI</span>
              </span>
            </div>
            <p className="text-sm text-cinema-muted leading-relaxed">
              Enterprise cinema & event booking platform featuring concurrency-safe seat locking, real-time Paytm checkout, and a hybrid AI recommendation engine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-cinema-muted">
              <li><Link to="/movies" className="hover:text-cinema-red transition-colors">Now Showing Movies</Link></li>
              <li><Link to="/theatres" className="hover:text-cinema-red transition-colors">Multiplex Theatres</Link></li>
              <li><Link to="/recommendations" className="hover:text-cinema-cyan flex items-center gap-1.5 transition-colors"><Sparkles className="w-3.5 h-3.5 text-cinema-cyan" /> AI Recommendations</Link></li>
              <li><Link to="/bookings" className="hover:text-cinema-red transition-colors">Booking History</Link></li>
            </ul>
          </div>

          {/* Technology Highlights */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-sm text-cinema-muted">
              <li className="flex items-center gap-2"><Cpu className="w-4 h-4 text-cinema-cyan" /> Hybrid ML (TF-IDF + Collab)</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Row Locks (Double-Booking Proof)</li>
              <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-cinema-gold" /> Paytm Staging & Demo Gateway</li>
              <li className="flex items-center gap-2"><Film className="w-4 h-4 text-cinema-red" /> Dynamic QR Code E-Tickets</li>
            </ul>
          </div>

          {/* Demo Credentials */}
          <div className="bg-cinema-surface/60 rounded-xl p-4 border border-cinema-border">
            <h4 className="text-xs font-bold text-cinema-gold uppercase tracking-wider mb-2">Technical Interview Demo</h4>
            <div className="text-xs space-y-1 text-cinema-muted">
              <p><span className="text-white font-semibold">User:</span> user@cinebook.ai / User@123</p>
              <p><span className="text-white font-semibold">Admin:</span> admin@cinebook.ai / Admin@123</p>
              <p className="pt-1 text-[11px] text-emerald-400 font-mono">Coupons: WELCOME50, CINE100</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-cinema-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-cinema-muted gap-4">
          <p>© {new Date().getFullYear()} CineBook AI Platform. Built for Senior Technical Evaluation.</p>
          <div className="flex items-center space-x-6">
            <span>FastAPI + SQLAlchemy 2.0</span>
            <span>•</span>
            <span>React + TypeScript + Vite</span>
            <span>•</span>
            <span>PostgreSQL & SQLite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Film, Mail, Lock, LogIn, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = (location.state as any)?.from?.pathname || (location.state as any)?.returnUrl || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await login({ email, password });
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail("user@cinebook.ai");
    setPassword("User@123");
    setErrorMsg(null);
  };

  const handleFillDemoAdmin = () => {
    setEmail("admin@cinebook.ai");
    setPassword("Admin@123");
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cinema-red to-orange-500 flex items-center justify-center shadow-glow mx-auto mb-3">
          <Film className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome Back</h1>
        <p className="text-xs text-cinema-muted">Sign in to your CineBook AI account to reserve tickets</p>
      </div>

      {/* Demo Credentials Quick-Fill Strip */}
      <div className="p-4 rounded-2xl bg-cinema-card border border-cinema-border space-y-2.5">
        <div className="flex items-center space-x-1.5 text-cinema-gold text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Demo Credentials (One-Click Fill)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleFillDemoUser}
            className="p-2 rounded-xl bg-cinema-surface hover:bg-cinema-border border border-cinema-border text-left text-xs transition-colors"
          >
            <span className="font-bold text-white block">Standard User</span>
            <span className="text-[10px] text-cinema-muted block">user@cinebook.ai</span>
          </button>

          <button
            type="button"
            onClick={handleFillDemoAdmin}
            className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left text-xs transition-colors"
          >
            <span className="font-bold text-purple-300 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </span>
            <span className="text-[10px] text-cinema-muted block">admin@cinebook.ai</span>
          </button>
        </div>
      </div>

      {/* Login Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-cinema-border shadow-2xl space-y-6">
        
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2.5 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-cinema-surface border border-cinema-border rounded-xl text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-cinema-surface border border-cinema-border rounded-xl text-sm text-white focus:outline-none focus:border-cinema-red"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-cinema-border/50">
          <p className="text-xs text-cinema-muted">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-cinema-red font-semibold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

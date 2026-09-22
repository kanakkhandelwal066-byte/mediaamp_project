import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock, User as UserIcon, Phone, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await register({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cinema-red to-orange-500 flex items-center justify-center shadow-glow mx-auto mb-3">
          <Film className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Create Account</h1>
        <p className="text-xs text-cinema-muted">Join CineBook AI for seamless cinema reservations & smart recommendations</p>
      </div>

      {/* Register Form */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-cinema-border shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2.5 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cinema-muted mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className="w-full bg-cinema-surface border border-cinema-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-cinema-muted/50 focus:outline-none focus:border-cinema-red transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-cinema-red hover:bg-red-600 text-white font-bold text-sm shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Register & Continue</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-cinema-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-cinema-red hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

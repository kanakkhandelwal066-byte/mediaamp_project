import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Film, 
  MapPin, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Ticket, 
  Search,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCity } from "../hooks/useCity";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, cities, setCity } = useCity();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cinema-red to-orange-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                CINEBOOK <span className="text-xs px-2 py-0.5 rounded-full bg-cinema-red text-white font-bold tracking-wide">AI</span>
              </span>
              <span className="text-[10px] text-cinema-muted -mt-1 tracking-wider uppercase font-semibold">Cinema & Events</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-cinema-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, genres, actors, directors..."
                className="w-full pl-10 pr-4 py-2 bg-cinema-card/80 border border-cinema-border rounded-full text-sm text-white placeholder-cinema-muted focus:outline-none focus:border-cinema-red focus:ring-1 focus:ring-cinema-red transition-all"
              />
            </div>
          </form>

          {/* Nav Links & Controls */}
          <div className="hidden lg:flex items-center space-x-6">
            
            {/* City Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cinema-card border border-cinema-border text-sm font-medium text-cinema-text hover:border-cinema-red transition-colors"
              >
                <MapPin className="w-4 h-4 text-cinema-red" />
                <span>{selectedCity?.name || "Select City"}</span>
              </button>

              {cityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-cinema-card border border-cinema-border shadow-2xl py-2 z-50">
                  <div className="px-3 py-1 text-xs font-semibold text-cinema-muted uppercase tracking-wider border-b border-cinema-border mb-1">
                    Select Your City
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setCity(city);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-cinema-surface ${
                        selectedCity?.id === city.id ? "text-cinema-red font-semibold" : "text-cinema-text"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-xs text-cinema-muted">{city.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/movies" className="text-sm font-medium text-cinema-text hover:text-cinema-red transition-colors">
              Movies
            </Link>

            <Link to="/theatres" className="text-sm font-medium text-cinema-text hover:text-cinema-red transition-colors">
              Theatres
            </Link>

            <Link to="/recommendations" className="text-sm font-medium text-cinema-text hover:text-cinema-cyan flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-4 h-4 text-cinema-cyan animate-pulse" />
              AI Picks
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold flex items-center gap-1 hover:bg-purple-500/30 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ADMIN
              </Link>
            )}

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/bookings"
                  className="p-2 rounded-lg bg-cinema-card border border-cinema-border hover:border-cinema-red text-cinema-text transition-colors"
                  title="My Bookings"
                >
                  <Ticket className="w-4 h-4 text-cinema-gold" />
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cinema-card border border-cinema-border hover:border-cinema-red transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-cinema-red/30 flex items-center justify-center text-xs font-bold text-cinema-red">
                    {user?.full_name.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-medium text-white max-w-[100px] truncate">{user?.full_name}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-cinema-card border border-cinema-border hover:text-cinema-red text-cinema-muted transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-cinema-text hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full bg-cinema-red hover:bg-cinema-redHover text-white text-sm font-semibold shadow-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-cinema-card border border-cinema-border text-cinema-text"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cinema-border flex flex-col space-y-3">
            <form onSubmit={handleSearchSubmit} className="mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full px-4 py-2 bg-cinema-card border border-cinema-border rounded-lg text-sm text-white"
              />
            </form>
            <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-white">Movies</Link>
            <Link to="/theatres" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-white">Theatres</Link>
            <Link to="/recommendations" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-cinema-cyan flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> AI Recommendations
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-purple-400">Admin Dashboard</Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-cinema-gold">My Bookings</Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm py-1 font-medium text-white">Profile ({user?.full_name})</Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-sm py-1 font-medium text-cinema-red">Logout</button>
              </>
            ) : (
              <div className="pt-2 flex gap-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-cinema-card border border-cinema-border text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-cinema-red text-white text-sm font-semibold">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

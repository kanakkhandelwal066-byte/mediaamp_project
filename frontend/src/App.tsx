import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/useAuth";
import { CityProvider } from "./hooks/useCity";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Customer Pages
import { Home } from "./pages/Home";
import { Movies } from "./pages/Movies";
import { MovieDetails } from "./pages/MovieDetails";
import { Theatres } from "./pages/Theatres";
import { Showtimes } from "./pages/Showtimes";
import { SeatSelection } from "./pages/SeatSelection";
import { Checkout } from "./pages/Checkout";
import { Payment } from "./pages/Payment";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentFailure } from "./pages/PaymentFailure";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { MyBookings } from "./pages/MyBookings";
import { BookingDetails } from "./pages/BookingDetails";
import { Recommendations } from "./pages/Recommendations";

// Admin Pages
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminMovies } from "./pages/AdminMovies";
import { AdminTheatres } from "./pages/AdminTheatres";
import { AdminShows } from "./pages/AdminShows";
import { AdminBookings } from "./pages/AdminBookings";
import { AdminAnalytics } from "./pages/AdminAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CityProvider>
          <Router>
            <div className="min-h-screen bg-cinema-dark text-cinema-text flex flex-col font-sans selection:bg-cinema-red selection:text-white">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Public Browsing Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Movies />} />
                  <Route path="/movies/:id" element={<MovieDetails />} />
                  <Route path="/theatres" element={<Theatres />} />
                  <Route path="/shows" element={<Showtimes />} />
                  <Route path="/seats/:showtimeId" element={<SeatSelection />} />
                  <Route path="/shows/:id/seats" element={<SeatSelection />} />
                  <Route path="/recommendations" element={<Recommendations />} />

                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment"
                    element={
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/:bookingId"
                    element={
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-success"
                    element={
                      <ProtectedRoute>
                        <PaymentSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/success"
                    element={
                      <ProtectedRoute>
                        <PaymentSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment-failure"
                    element={
                      <ProtectedRoute>
                        <PaymentFailure />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payment/failure"
                    element={
                      <ProtectedRoute>
                        <PaymentFailure />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bookings/:id"
                    element={
                      <ProtectedRoute>
                        <BookingDetails />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/movies"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminMovies />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/theatres"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminTheatres />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/shows"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminShows />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bookings"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </CityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

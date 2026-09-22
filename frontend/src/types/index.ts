export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string;
  details?: Record<string, any>;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: "USER" | "ADMIN";
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Language {
  id: number;
  name: string;
  code: string;
}

export interface Movie {
  id: number;
  title: string;
  slug: string;
  description: string;
  duration_minutes: number;
  release_date: string;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  rating: number;
  vote_count: number;
  director?: string;
  cast?: string;
  keywords?: string;
  certification?: string;
  is_trending?: boolean;
  is_active: boolean;
  genres: Genre[];
  languages: Language[];
}

export interface City {
  id: number;
  name: string;
  state: string;
}

export interface Screen {
  id: number;
  theatre_id: number;
  screen_number: number;
  name: string;
  screen_type: string;
  total_seats: number;
}

export interface Theatre {
  id: number;
  name: string;
  city_id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  is_active: boolean;
  city?: City;
  screens?: Screen[];
}

export interface Show {
  id: number;
  movie_id: number;
  movie_title: string;
  movie_poster?: string;
  theatre_id: number;
  theatre_name: string;
  theatre_address?: string;
  city_name?: string;
  screen_id: number;
  screen_name: string;
  start_time: string;
  end_time: string;
  base_price: number;
  format: string;
  language: string;
  is_active: boolean;
  available_seats?: number;
  total_seats?: number;
}

export interface ShowSeat {
  id: number;
  show_id: number;
  seat_id: number;
  row: string;
  seat_number: number;
  tier: "STANDARD" | "PREMIUM" | "VIP";
  price: number;
  status: "AVAILABLE" | "LOCKED" | "BOOKED";
  is_locked_by_me: boolean;
  locked_until?: string;
}

export interface BookingItem {
  id: number;
  show_seat_id: number;
  seat_row: string;
  seat_number: number;
  seat_tier: string;
  price: number;
}

export interface Booking {
  id: number;
  booking_reference: string;
  user_id: number;
  show_id: number;
  movie_title: string;
  movie_poster?: string;
  theatre_name: string;
  theatre_address?: string;
  city_name?: string;
  screen_name: string;
  screen_format: string;
  show_time: string;
  items: BookingItem[];
  total_amount: number;
  discount_amount: number;
  convenience_fee: number;
  tax_amount: number;
  final_amount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
  created_at: string;
  qr_code_token?: string;
}

export interface Ticket {
  booking_id: number;
  booking_reference: string;
  movie_title: string;
  movie_poster?: string;
  theatre_name: string;
  theatre_address: string;
  screen_name: string;
  show_time: string;
  seats: string[];
  total_seats: number;
  final_amount: number;
  status: string;
  qr_code_base64: string;
  booking_date: string;
}

export interface PaymentInitiateResponse {
  payment_id: number;
  order_id: string;
  booking_id: number;
  amount: number;
  currency: string;
  provider: string;
  is_mock: boolean;
  gateway_data: Record<string, any>;
}

export interface Payment {
  id: number;
  booking_id: number;
  user_id: number;
  amount: number;
  currency: string;
  provider: string;
  transaction_id?: string;
  order_id: string;
  status: "INITIATED" | "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  payment_method?: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discount_type: "PERCENTAGE" | "FLAT";
  discount_value: number;
  min_amount: number;
  max_discount?: number;
  valid_to: string;
  is_active: boolean;
}

export interface Recommendation {
  movie_id: number;
  title: string;
  slug: string;
  poster_url?: string;
  rating: number;
  duration_minutes: number;
  genres: string[];
  score: number;
  reason: string;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  movie_id: number;
  rating: number;
  title?: string;
  content: string;
  is_verified_booking: boolean;
  created_at: string;
}

export interface AdminOverviewStats {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  active_movies: number;
  active_theatres: number;
  total_shows: number;
  average_occupancy_rate: number;
  payment_success_rate: number;
  cancellation_rate: number;
}

export interface DailyRevenueItem {
  date: string;
  revenue: number;
  bookings_count: number;
}

export interface PopularMovieStat {
  movie_id: number;
  title: string;
  poster_url?: string;
  bookings_count: number;
  revenue: number;
}

export interface PopularGenreStat {
  genre: string;
  count: number;
}

export interface TheatreOccupancyStat {
  theatre_id: number;
  theatre_name: string;
  city_name: string;
  total_seats: number;
  booked_seats: number;
  occupancy_percentage: number;
}

export interface AdminAnalytics {
  overview: AdminOverviewStats;
  daily_revenue: DailyRevenueItem[];
  popular_movies: PopularMovieStat[];
  genre_distribution: PopularGenreStat[];
  theatre_occupancy: TheatreOccupancyStat[];
}

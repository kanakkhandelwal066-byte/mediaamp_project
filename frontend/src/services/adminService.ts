import { api } from "./api";
import {
  ApiResponse,
  AdminAnalytics,
  PaginatedData,
  Booking,
  User,
  Movie,
  Theatre,
  Show
} from "../types";

export const adminService = {
  getAnalytics: async (): Promise<ApiResponse<AdminAnalytics>> => {
    const response = await api.get<ApiResponse<AdminAnalytics>>("/admin/analytics");
    return response.data;
  },

  getAllBookings: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedData<Booking>>> => {
    const response = await api.get<ApiResponse<PaginatedData<Booking>>>(
      `/admin/bookings?page=${page}&page_size=${pageSize}`
    );
    return response.data;
  },

  getUsers: async (skip: number = 0, limit: number = 50): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  createMovie: async (movieData: Partial<Movie> & { genre_ids?: number[]; language_ids?: number[] }): Promise<ApiResponse<Movie>> => {
    const response = await api.post<ApiResponse<Movie>>("/movies", movieData);
    return response.data;
  },

  updateMovie: async (id: number, movieData: Partial<Movie>): Promise<ApiResponse<Movie>> => {
    const response = await api.put<ApiResponse<Movie>>(`/movies/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/movies/${id}`);
    return response.data;
  },

  createTheatre: async (theatreData: {
    name: string;
    city_id: number;
    address: string;
    phone?: string;
    screens?: Array<{ name: string; screen_number: number; screen_type: string; total_seats: number }>;
  }): Promise<ApiResponse<Theatre>> => {
    const response = await api.post<ApiResponse<Theatre>>("/theatres", theatreData);
    return response.data;
  },

  createScreen: async (theatreId: number, screenData: {
    screen_number: number;
    name: string;
    screen_type?: string;
    total_seats?: number;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(`/theatres/${theatreId}/screens`, screenData);
    return response.data;
  },

  createShow: async (showData: {
    movie_id: number;
    theatre_id: number;
    screen_id: number;
    start_time: string;
    end_time: string;
    base_price: number;
    format?: string;
    language?: string;
  }): Promise<ApiResponse<Show>> => {
    const response = await api.post<ApiResponse<Show>>("/shows", showData);
    return response.data;
  },

  deleteShow: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/shows/${id}`);
    return response.data;
  }
};

import { api } from "./api";
import { ApiResponse, Recommendation, AdminAnalytics, Booking, User, PaginatedData, Review } from "../types";

export const recommendationService = {
  async getRecommendations(topN: number = 6): Promise<Recommendation[]> {
    const res = await api.get<ApiResponse<{ recommendations: Recommendation[]; model_type: string }>>("/recommendations", {
      params: { top_n: topN }
    });
    return res.data.data.recommendations;
  },

  async getMyRecommendations(topN: number = 6): Promise<Recommendation[]> {
    const res = await api.get<ApiResponse<{ recommendations: Recommendation[]; model_type: string }>>("/recommendations/me", {
      params: { top_n: topN }
    });
    return res.data.data.recommendations;
  }
};

export const reviewService = {
  async getMovieReviews(movieId: number): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/movie/${movieId}`);
    return res.data.data;
  },

  async addReview(data: { movie_id: number; rating: number; title?: string; content: string }): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>("/reviews", data);
    return res.data.data;
  }
};

export const adminService = {
  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get<ApiResponse<AdminAnalytics>>("/admin/analytics");
    return res.data.data;
  },

  async getBookings(page: number = 1, pageSize: number = 20): Promise<PaginatedData<Booking>> {
    const res = await api.get<ApiResponse<PaginatedData<Booking>>>("/admin/bookings", {
      params: { page, page_size: pageSize }
    });
    return res.data.data;
  },

  async getUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>("/admin/users");
    return res.data.data;
  }
};

import { api } from "./api";
import { ApiResponse, PaginatedData, Movie, Genre, Language } from "../types";

export interface MovieFilterOptions {
  search?: string;
  genre?: string;
  language?: string;
  rating_min?: number;
  city_id?: number;
  is_trending?: boolean;
  page?: number;
  page_size?: number;
}

export const movieService = {
  async getMovies(options?: MovieFilterOptions): Promise<PaginatedData<Movie>> {
    const res = await api.get<ApiResponse<PaginatedData<Movie>>>("/movies", { params: options });
    return res.data.data;
  },

  async getTrendingMovies(): Promise<Movie[]> {
    const res = await api.get<ApiResponse<Movie[]>>("/movies/trending");
    return res.data.data;
  },

  async getMovieById(id: number): Promise<Movie> {
    const res = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
    return res.data.data;
  },

  async getGenres(): Promise<Genre[]> {
    const res = await api.get<ApiResponse<Genre[]>>("/movies/genres");
    return res.data.data;
  },

  async getLanguages(): Promise<Language[]> {
    const res = await api.get<ApiResponse<Language[]>>("/movies/languages");
    return res.data.data;
  },

  async createMovie(data: any): Promise<Movie> {
    const res = await api.post<ApiResponse<Movie>>("/movies", data);
    return res.data.data;
  },

  async updateMovie(id: number, data: any): Promise<Movie> {
    const res = await api.put<ApiResponse<Movie>>(`/movies/${id}`, data);
    return res.data.data;
  },

  async deleteMovie(id: number): Promise<void> {
    await api.delete(`/movies/${id}`);
  }
};

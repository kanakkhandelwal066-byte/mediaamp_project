import { api } from "./api";
import { ApiResponse, Show } from "../types";

export const showService = {
  async getShows(params?: { movieId?: number; theatreId?: number; cityId?: number; dateStr?: string }): Promise<Show[]> {
    const res = await api.get<ApiResponse<Show[]>>("/shows", {
      params: {
        movie_id: params?.movieId,
        theatre_id: params?.theatreId,
        city_id: params?.cityId,
        date_str: params?.dateStr
      }
    });
    return res.data.data;
  },

  async getShowById(id: number): Promise<Show> {
    const res = await api.get<ApiResponse<Show>>(`/shows/${id}`);
    return res.data.data;
  },

  async createShow(data: any): Promise<Show> {
    const res = await api.post<ApiResponse<Show>>("/shows", data);
    return res.data.data;
  },

  async cancelShow(id: number): Promise<void> {
    await api.delete(`/shows/${id}`);
  }
};

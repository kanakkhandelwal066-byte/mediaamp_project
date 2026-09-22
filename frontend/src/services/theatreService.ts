import { api } from "./api";
import { ApiResponse, Theatre, City } from "../types";

export const theatreService = {
  async getCities(): Promise<City[]> {
    const res = await api.get<ApiResponse<City[]>>("/theatres/cities");
    return res.data.data;
  },

  async getTheatres(cityId?: number): Promise<Theatre[]> {
    const res = await api.get<ApiResponse<Theatre[]>>("/theatres", {
      params: { city_id: cityId }
    });
    return res.data.data;
  },

  async getTheatreById(id: number): Promise<Theatre> {
    const res = await api.get<ApiResponse<Theatre>>(`/theatres/${id}`);
    return res.data.data;
  },

  async createTheatre(data: any): Promise<Theatre> {
    const res = await api.post<ApiResponse<Theatre>>("/theatres", data);
    return res.data.data;
  },

  async addScreen(data: any): Promise<any> {
    const res = await api.post<ApiResponse<any>>("/theatres/screens", data);
    return res.data.data;
  }
};

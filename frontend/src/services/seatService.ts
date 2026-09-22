import { api } from "./api";
import { ApiResponse, ShowSeat } from "../types";

export interface SeatLockResponse {
  show_id: number;
  locked_seat_ids: number[];
  lock_expires_at: string;
  expires_in_seconds: number;
  subtotal: number;
}

export const seatService = {
  async getSeatsForShow(showId: number): Promise<ShowSeat[]> {
    const res = await api.get<ApiResponse<ShowSeat[]>>(`/shows/${showId}/seats`);
    return res.data.data;
  },

  async lockSeats(showId: number, seatIds: number[]): Promise<SeatLockResponse> {
    const res = await api.post<ApiResponse<SeatLockResponse>>("/seats/lock", {
      show_id: showId,
      seat_ids: seatIds,
    });
    return res.data.data;
  }
};

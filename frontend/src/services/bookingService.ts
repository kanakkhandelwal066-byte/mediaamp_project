import { api } from "./api";
import { ApiResponse, Booking, Ticket, Coupon } from "../types";

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discount_amount: number;
  discount_type: string;
  message: string;
}

export const bookingService = {
  async createBooking(showId: number, seatIds: number[], couponCode?: string): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>("/bookings", {
      show_id: showId,
      seat_ids: seatIds,
      coupon_code: couponCode || null,
    });
    return res.data.data;
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await api.get<ApiResponse<Booking[]>>("/bookings/me");
    return res.data.data;
  },

  async getBookingById(id: number): Promise<Booking> {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  async cancelBooking(id: number): Promise<Booking> {
    const res = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return res.data.data;
  },

  async getTicket(bookingId: number): Promise<Ticket> {
    const res = await api.get<ApiResponse<Ticket>>(`/bookings/${bookingId}/ticket`);
    return res.data.data;
  },

  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidationResult> {
    const res = await api.post<ApiResponse<CouponValidationResult>>("/coupons/validate", {
      code,
      order_amount: orderAmount
    });
    return res.data.data;
  },

  async getCoupons(): Promise<Coupon[]> {
    const res = await api.get<ApiResponse<Coupon[]>>("/coupons");
    return res.data.data;
  }
};

import { api } from "./api";
import { ApiResponse, PaymentInitiateResponse, Payment } from "../types";

export const paymentService = {
  async initiatePayment(bookingId: number, provider: "PAYTM" | "DEMO_GATEWAY" = "DEMO_GATEWAY"): Promise<PaymentInitiateResponse> {
    const res = await api.post<ApiResponse<PaymentInitiateResponse>>("/payments/create", {
      booking_id: bookingId,
      provider,
      payment_method: "UPI"
    });
    return res.data.data;
  },

  async verifyPayment(orderId: string, status: "SUCCESS" | "FAILURE" | "PENDING"): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>("/payments/verify", {
      order_id: orderId,
      status,
      transaction_id: `TXN_${Date.now()}`
    });
    return res.data.data;
  },

  async simulateDemoPayment(orderId: string, outcome: "SUCCESS" | "FAILURE" | "PENDING"): Promise<Payment> {
    const res = await api.post<ApiResponse<Payment>>("/payments/simulate-demo", {
      order_id: orderId,
      outcome
    });
    return res.data.data;
  }
};

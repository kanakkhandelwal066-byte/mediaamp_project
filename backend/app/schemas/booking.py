from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class BookingItemOut(BaseModel):
    id: int
    show_seat_id: int
    seat_row: str
    seat_number: int
    seat_tier: str
    price: float

    class Config:
        from_attributes = True

class BookingCreateRequest(BaseModel):
    show_id: int
    seat_ids: List[int] = Field(..., min_items=1, description="List of Seat IDs reserved/locked")
    coupon_code: Optional[str] = None

class BookingPricingCalculation(BaseModel):
    total_amount: float
    discount_amount: float
    convenience_fee: float
    tax_amount: float
    final_amount: float
    coupon_code: Optional[str] = None

class BookingOut(BaseModel):
    id: int
    booking_reference: str
    user_id: int
    show_id: int
    movie_title: str
    movie_poster: Optional[str] = None
    theatre_name: str
    theatre_address: Optional[str] = None
    city_name: Optional[str] = None
    screen_name: str
    screen_format: str
    show_time: datetime
    items: List[BookingItemOut]
    total_amount: float
    discount_amount: float
    convenience_fee: float
    tax_amount: float
    final_amount: float
    status: str
    created_at: datetime
    qr_code_token: Optional[str] = None

    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    booking_id: int
    booking_reference: str
    movie_title: str
    movie_poster: Optional[str] = None
    theatre_name: str
    theatre_address: str
    screen_name: str
    show_time: datetime
    seats: List[str] # ["A1", "A2"]
    total_seats: int
    final_amount: float
    status: str
    qr_code_base64: str
    booking_date: datetime

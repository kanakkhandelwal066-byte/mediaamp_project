from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class SeatOut(BaseModel):
    id: int
    screen_id: int
    row: str
    seat_number: int
    tier: str
    price_multiplier: float

    class Config:
        from_attributes = True

class ShowSeatOut(BaseModel):
    id: int
    show_id: int
    seat_id: int
    row: str
    seat_number: int
    tier: str
    price: float
    status: str  # AVAILABLE, LOCKED, BOOKED
    is_locked_by_me: bool = False
    locked_until: Optional[datetime] = None

class SeatLockRequest(BaseModel):
    show_id: int
    seat_ids: List[int] = Field(..., min_items=1, max_items=10, description="Seats to lock (1 to 10)")

class SeatLockResponse(BaseModel):
    show_id: int
    locked_seat_ids: List[int]
    lock_expires_at: datetime
    expires_in_seconds: int
    subtotal: float

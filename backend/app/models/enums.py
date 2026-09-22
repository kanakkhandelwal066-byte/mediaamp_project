from enum import Enum

class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class SeatTier(str, Enum):
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"
    VIP = "VIP"

class SeatStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    LOCKED = "LOCKED"
    BOOKED = "BOOKED"

class ScreenType(str, Enum):
    STANDARD_2D = "2D"
    IMAX_3D = "IMAX 3D"
    FOUR_DX = "4DX"
    DOLBY_ATMOS = "Dolby Atmos"

class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class PaymentStatus(str, Enum):
    INITIATED = "INITIATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentProvider(str, Enum):
    PAYTM = "PAYTM"
    DEMO = "DEMO_GATEWAY"

class DiscountType(str, Enum):
    PERCENTAGE = "PERCENTAGE"
    FLAT = "FLAT"

class RecommendationEventType(str, Enum):
    VIEW = "movie_view"
    SEARCH = "movie_search"
    FAVORITE = "favorite"
    BOOKING = "booking"
    RATING = "rating"
    REVIEW = "review"

class NotificationType(str, Enum):
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED"
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    SHOW_CANCELLED = "SHOW_CANCELLED"

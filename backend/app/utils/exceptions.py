from typing import Optional, Any, Dict

class CineBookException(Exception):
    """Base application exception with error code and detail."""
    def __init__(self, message: str, error_code: str = "INTERNAL_ERROR", status_code: int = 400, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}

class SeatUnavailableException(CineBookException):
    def __init__(self, message: str = "One or more selected seats are no longer available", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="SEAT_UNAVAILABLE", status_code=409, details=details)

class DoubleBookingException(CineBookException):
    def __init__(self, message: str = "Seat has already been reserved by another user", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="DOUBLE_BOOKING_CONFLICT", status_code=409, details=details)

class SeatLockExpiredException(CineBookException):
    def __init__(self, message: str = "Seat lock has expired. Please select seats again.", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="SEAT_LOCK_EXPIRED", status_code=410, details=details)

class BookingNotFoundException(CineBookException):
    def __init__(self, message: str = "Booking not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="BOOKING_NOT_FOUND", status_code=404, details=details)

class BookingAlreadyCancelledException(CineBookException):
    def __init__(self, message: str = "Booking has already been cancelled", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="BOOKING_ALREADY_CANCELLED", status_code=400, details=details)

class PaymentFailedException(CineBookException):
    def __init__(self, message: str = "Payment processing failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="PAYMENT_FAILED", status_code=402, details=details)

class UnauthorizedException(CineBookException):
    def __init__(self, message: str = "Could not validate credentials", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="UNAUTHORIZED", status_code=401, details=details)

class ForbiddenException(CineBookException):
    def __init__(self, message: str = "You do not have permission to access this resource", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="FORBIDDEN", status_code=403, details=details)

class InvalidCouponException(CineBookException):
    def __init__(self, message: str = "Invalid or expired coupon code", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="INVALID_COUPON", status_code=400, details=details)

class ShowNotAvailableException(CineBookException):
    def __init__(self, message: str = "Show is not available for booking", details: Optional[Dict[str, Any]] = None):
        super().__init__(message=message, error_code="SHOW_NOT_AVAILABLE", status_code=400, details=details)

class EntityNotFoundException(CineBookException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id {entity_id} not found",
            error_code="NOT_FOUND",
            status_code=404,
            details={"entity": entity_name, "id": str(entity_id)}
        )

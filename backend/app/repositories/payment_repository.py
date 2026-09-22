import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.repositories.base import BaseRepository

class PaymentRepository(BaseRepository[Payment]):
    def __init__(self, db: Session):
        super().__init__(Payment, db)

    def generate_order_id(self) -> str:
        return f"ORD_{uuid.uuid4().hex[:12].upper()}"

    def get_by_order_id(self, order_id: str) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.order_id == order_id).first()

    def get_by_transaction_id(self, transaction_id: str) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.transaction_id == transaction_id).first()

    def get_by_booking_id(self, booking_id: int) -> Optional[Payment]:
        return self.db.query(Payment).filter(Payment.booking_id == booking_id).order_by(Payment.id.desc()).first()

    def count_successful_payments(self) -> int:
        return self.db.query(Payment).filter(Payment.status == "SUCCESS").count()

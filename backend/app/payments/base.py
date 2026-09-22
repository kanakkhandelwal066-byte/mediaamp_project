from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BasePaymentGateway(ABC):
    @abstractmethod
    async def create_order(
        self,
        order_id: str,
        amount: float,
        customer_id: str,
        customer_email: str,
        customer_phone: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create payment order/token with gateway."""
        pass

    @abstractmethod
    async def verify_payment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Verify payment response from gateway."""
        pass

    @abstractmethod
    async def refund_payment(self, order_id: str, amount: float, reason: str) -> Dict[str, Any]:
        """Process refund through gateway."""
        pass

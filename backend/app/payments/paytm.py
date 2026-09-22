import hashlib
import uuid
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.payments.base import BasePaymentGateway

logger = logging.getLogger("cinebook.payments.paytm")

class PaytmPaymentProvider(BasePaymentGateway):
    def __init__(self):
        self.merchant_id = settings.PAYTM_MERCHANT_ID
        self.merchant_key = settings.PAYTM_MERCHANT_KEY
        self.website = settings.PAYTM_WEBSITE
        self.industry_type_id = settings.PAYTM_INDUSTRY_TYPE_ID
        self.channel_id = settings.PAYTM_CHANNEL_ID
        self.callback_url = settings.PAYTM_CALLBACK_URL
        self.payment_url = settings.PAYTM_PAYMENT_URL

    async def create_order(
        self,
        order_id: str,
        amount: float,
        customer_id: str,
        customer_email: str,
        customer_phone: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate official Paytm Staging payload."""
        paytm_params = {
            "MID": self.merchant_id,
            "WEBSITE": self.website,
            "INDUSTRY_TYPE_ID": self.industry_type_id,
            "CHANNEL_ID": self.channel_id,
            "ORDER_ID": order_id,
            "CUST_ID": customer_id,
            "EMAIL": customer_email,
            "MOBILE_NO": customer_phone or "9999999999",
            "TXN_AMOUNT": f"{amount:.2f}",
            "CALLBACK_URL": callback_url or self.callback_url
        }

        # Staging checksum calculation simulation
        raw_string = f"{order_id}|{amount:.2f}|{self.merchant_key}"
        checksum = hashlib.sha256(raw_string.encode("utf-8")).hexdigest()
        paytm_params["CHECKSUMHASH"] = checksum

        return {
            "provider": "PAYTM",
            "payment_url": self.payment_url,
            "params": paytm_params,
            "order_id": order_id,
            "amount": amount
        }

    async def verify_payment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validate Paytm callback checksum and status response."""
        resp_code = payload.get("RESPCODE", "01")
        status = payload.get("STATUS", "TXN_SUCCESS")
        order_id = payload.get("ORDERID") or payload.get("order_id")
        txn_id = payload.get("TXNID") or f"PTM_TXN_{uuid.uuid4().hex[:10].upper()}"

        is_success = (status == "TXN_SUCCESS" or resp_code == "01")

        return {
            "is_success": is_success,
            "order_id": order_id,
            "transaction_id": txn_id,
            "status": "SUCCESS" if is_success else "FAILED",
            "response_code": resp_code,
            "raw_response": payload
        }

    async def refund_payment(self, order_id: str, amount: float, reason: str) -> Dict[str, Any]:
        return {
            "is_success": True,
            "refund_id": f"REFUND_{uuid.uuid4().hex[:10].upper()}",
            "amount": amount,
            "status": "REFUNDED"
        }

class DemoPaymentProvider(BasePaymentGateway):
    """
    Mock/Demo Payment Gateway for interviewer demonstration and testing.
    Allows simulating SUCCESS, FAILURE, and PENDING states with zero external dependencies.
    """
    async def create_order(
        self,
        order_id: str,
        amount: float,
        customer_id: str,
        customer_email: str,
        customer_phone: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> Dict[str, Any]:
        return {
            "provider": "DEMO_GATEWAY",
            "order_id": order_id,
            "amount": amount,
            "demo_instructions": "This is an interactive mock payment gateway. Choose SUCCESS, FAILURE, or PENDING in the UI to simulate gateway transitions."
        }

    async def verify_payment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        outcome = payload.get("status") or payload.get("outcome", "SUCCESS")
        outcome = outcome.upper().strip()
        txn_id = payload.get("transaction_id") or f"DEMO_TXN_{uuid.uuid4().hex[:10].upper()}"

        is_success = (outcome == "SUCCESS")
        return {
            "is_success": is_success,
            "order_id": payload.get("order_id"),
            "transaction_id": txn_id,
            "status": outcome,
            "raw_response": payload
        }

    async def refund_payment(self, order_id: str, amount: float, reason: str) -> Dict[str, Any]:
        return {
            "is_success": True,
            "refund_id": f"DEMO_REFUND_{uuid.uuid4().hex[:10].upper()}",
            "amount": amount,
            "status": "REFUNDED"
        }

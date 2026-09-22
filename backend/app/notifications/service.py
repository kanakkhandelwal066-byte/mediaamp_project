import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.system import Notification
import json

logger = logging.getLogger("cinebook.notifications")

class NotificationService:
    @staticmethod
    def send_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """
        Decoupled notification dispatch.
        Persists in-app notification and outputs structured log / simulated email.
        """
        meta_str = json.dumps(metadata) if metadata else None
        notif = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
            metadata_json=meta_str
        )
        db.add(notif)
        db.flush()

        logger.info(f"📬 [NOTIFICATION DISPATCHED] To User #{user_id} | Type: {notification_type} | Title: '{title}'")
        return notif

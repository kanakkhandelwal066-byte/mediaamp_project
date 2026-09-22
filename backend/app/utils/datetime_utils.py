from datetime import datetime, timezone
from typing import Optional

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def is_past(dt: Optional[datetime]) -> bool:
    """Safely check if datetime is in the past, handling naive/aware differences."""
    if not dt:
        return False
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt < now.replace(tzinfo=None)
    return dt < now

def is_future(dt: Optional[datetime]) -> bool:
    """Safely check if datetime is in the future, handling naive/aware differences."""
    if not dt:
        return False
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        return dt > now.replace(tzinfo=None)
    return dt > now

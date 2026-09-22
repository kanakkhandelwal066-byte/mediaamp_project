import re
from typing import List

def clean_text(text: str) -> str:
    """Normalize text: lowercases, strips special characters, collapses whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    tokens = [t.strip() for t in text.split() if len(t.strip()) > 1]
    return " ".join(tokens)

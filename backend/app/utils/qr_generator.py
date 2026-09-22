import qrcode
import io
import base64
import json
from typing import Dict, Any

def generate_qr_code_base64(payload_data: Dict[str, Any]) -> str:
    """Generate a Base64-encoded PNG image of a QR code containing ticket verification data."""
    qr_text = json.dumps(payload_data)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(qr_text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0b0f19", back_color="#ffffff")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    b64_str = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"

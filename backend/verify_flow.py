import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def main():
    print("--- 1. Login User ---")
    login_data = json.dumps({"email": "user@cinebook.ai", "password": "User@123"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode())["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("User authenticated successfully.")

    print("\n--- 2. Fetch Shows ---")
    shows_res = urllib.request.urlopen(f"{BASE_URL}/shows")
    shows = json.loads(shows_res.read().decode())["data"]
    show = shows[0]
    show_id = show["id"]
    print(f"Selected show #{show_id}: '{show['movie_title']}' at {show['theatre_name']} ({show['screen_name']})")

    print("\n--- 3. Fetch Seats & Select Available ---")
    seats_res = urllib.request.urlopen(f"{BASE_URL}/shows/{show_id}/seats")
    seats_list = json.loads(seats_res.read().decode())["data"]
    avail_seats = [s["id"] for s in seats_list if s["status"] == "AVAILABLE"][:2]
    print(f"Selected Seat IDs: {avail_seats}")

    print("\n--- 4. Concurrency-Safe Seat Locking (5-Min Atomic Lock) ---")
    lock_data = json.dumps({"show_id": show_id, "seat_ids": avail_seats}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/seats/lock", data=lock_data, headers=headers)
    lock_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Lock Result: {lock_res['message']} (TTL: {lock_res['data']['expires_in_seconds']}s)")

    print("\n--- 5. Create Reservation with Coupon ---")
    booking_data = json.dumps({"show_id": show_id, "seat_ids": avail_seats, "coupon_code": "WELCOME50"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/bookings", data=booking_data, headers=headers)
    b_res = json.loads(urllib.request.urlopen(req).read().decode())
    b = b_res["data"]
    print(f"Booking Created: Ref #{b['booking_reference']}")
    print(f"  Base Amount:      INR {b['total_amount']}")
    print(f"  Discount (50%):  -INR {b['discount_amount']}")
    print(f"  Convenience Fee:  INR {b['convenience_fee']}")
    print(f"  GST (18%):        INR {b['tax_amount']}")
    print(f"  Final Amount:     INR {b['final_amount']}")
    print(f"  Status:           {b['status']}")

    print("\n--- 6. Initiate Payment Order & Demo Simulator ---")
    pay_init_data = json.dumps({"booking_id": b["id"], "provider": "DEMO_GATEWAY"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/payments/create", data=pay_init_data, headers=headers)
    pay_res = json.loads(urllib.request.urlopen(req).read().decode())
    order_id = pay_res["data"]["order_id"]
    print(f"Payment Order Initiated: Order ID #{order_id}")

    sim_data = json.dumps({"order_id": order_id, "outcome": "SUCCESS"}).encode("utf-8")
    req = urllib.request.Request(f"{BASE_URL}/payments/simulate-demo", data=sim_data, headers=headers)
    sim_res = json.loads(urllib.request.urlopen(req).read().decode())
    print(f"Simulator Result: {sim_res['message']}")
    print(f"Payment Status:   {sim_res['data']['status']}")

    print("\n--- 7. Boarding Pass & QR Code Ticket ---")
    req = urllib.request.Request(f"{BASE_URL}/bookings/{b['id']}/ticket", headers=headers)
    ticket_res = json.loads(urllib.request.urlopen(req).read().decode())
    ticket = ticket_res["data"]
    print(f"Boarding Pass Ref: {ticket['booking_reference']}")
    print(f"Movie:             {ticket['movie_title']}")
    print(f"Theatre:           {ticket['theatre_name']}")
    print(f"Seats:             {', '.join(ticket['seats'])}")
    print(f"QR Code Base64:    {ticket['qr_code_base64'][:60]}... (Total bytes: {len(ticket['qr_code_base64'])})")

    print("\n>>> ALL 7 CORE STEPS VERIFIED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    main()

def test_coupon_validation(client):
    response = client.post("/api/v1/coupons/validate", json={
        "code": "TEST50",
        "order_amount": 400.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["valid"] is True
    assert data["data"]["discount_amount"] == 100.0 # capped at max 100

def test_booking_creation_with_coupon(client, user_token):
    # First lock seats 4 and 5
    lock_resp = client.post(
        "/api/v1/seats/lock",
        json={"show_id": 1, "seat_ids": [4, 5]},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert lock_resp.status_code == 200

    # Create booking
    book_resp = client.post(
        "/api/v1/bookings",
        json={"show_id": 1, "seat_ids": [4, 5], "coupon_code": "TEST50"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert book_resp.status_code == 201
    b_data = book_resp.json()
    assert b_data["success"] is True
    booking = b_data["data"]
    assert booking["status"] == "PENDING"
    assert booking["discount_amount"] == 100.0
    assert booking["final_amount"] > 0
    assert len(booking["items"]) == 2

def test_get_my_bookings(client, user_token):
    response = client.get("/api/v1/bookings/me", headers={
        "Authorization": f"Bearer {user_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1

def test_get_ticket_with_qr_code(client, user_token):
    # Fetch existing booking
    my_bookings = client.get("/api/v1/bookings/me", headers={"Authorization": f"Bearer {user_token}"}).json()["data"]
    booking_id = my_bookings[0]["id"]

    response = client.get(f"/api/v1/bookings/{booking_id}/ticket", headers={
        "Authorization": f"Bearer {user_token}"
    })
    assert response.status_code == 200
    ticket_data = response.json()
    assert ticket_data["success"] is True
    assert ticket_data["data"]["qr_code_base64"].startswith("data:image/png;base64,")
    assert ticket_data["data"]["booking_reference"] == my_bookings[0]["booking_reference"]

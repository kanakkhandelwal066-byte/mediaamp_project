def test_payment_initiation_and_demo_success(client, user_token):
    # Lock seats 6 and 7
    client.post(
        "/api/v1/seats/lock",
        json={"show_id": 1, "seat_ids": [6, 7]},
        headers={"Authorization": f"Bearer {user_token}"}
    )

    # Create pending booking
    booking_resp = client.post(
        "/api/v1/bookings",
        json={"show_id": 1, "seat_ids": [6, 7]},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert booking_resp.status_code == 201
    booking_id = booking_resp.json()["data"]["id"]

    # Initiate payment order
    init_resp = client.post(
        "/api/v1/payments/create",
        json={"booking_id": booking_id, "provider": "DEMO_GATEWAY"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert init_resp.status_code == 201
    pay_data = init_resp.json()["data"]
    order_id = pay_data["order_id"]
    assert pay_data["is_mock"] is True

    # Simulate Demo Gateway SUCCESS
    sim_resp = client.post(
        "/api/v1/payments/simulate-demo",
        json={"order_id": order_id, "outcome": "SUCCESS"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert sim_resp.status_code == 200
    assert sim_resp.json()["data"]["status"] == "SUCCESS"

    # Verify booking is now CONFIRMED
    booking_check = client.get(f"/api/v1/bookings/{booking_id}", headers={"Authorization": f"Bearer {user_token}"}).json()["data"]
    assert booking_check["status"] == "CONFIRMED"

    # Verify seats are now BOOKED
    seats_resp = client.get("/api/v1/shows/1/seats").json()["data"]
    seat6 = next(s for s in seats_resp if s["seat_id"] == 6)
    seat7 = next(s for s in seats_resp if s["seat_id"] == 7)
    assert seat6["status"] == "BOOKED"
    assert seat7["status"] == "BOOKED"

def test_payment_failure_releases_seats(client, user_token):
    # Lock seat 8
    client.post(
        "/api/v1/seats/lock",
        json={"show_id": 1, "seat_ids": [8]},
        headers={"Authorization": f"Bearer {user_token}"}
    )

    # Create pending booking
    booking_resp = client.post(
        "/api/v1/bookings",
        json={"show_id": 1, "seat_ids": [8]},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    booking_id = booking_resp.json()["data"]["id"]

    # Initiate payment
    init_resp = client.post(
        "/api/v1/payments/create",
        json={"booking_id": booking_id, "provider": "DEMO_GATEWAY"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    order_id = init_resp.json()["data"]["order_id"]

    # Simulate FAILURE
    sim_resp = client.post(
        "/api/v1/payments/simulate-demo",
        json={"order_id": order_id, "outcome": "FAILURE"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert sim_resp.status_code == 402
    assert sim_resp.json()["error_code"] == "PAYMENT_FAILED"

    # Verify seat 8 is released back to AVAILABLE
    seats_resp = client.get("/api/v1/shows/1/seats").json()["data"]
    seat8 = next(s for s in seats_resp if s["seat_id"] == 8)
    assert seat8["status"] == "AVAILABLE"

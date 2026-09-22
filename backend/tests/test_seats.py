def test_get_show_seats_layout(client):
    response = client.get("/api/v1/shows/1/seats")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 10
    assert data["data"][0]["status"] in ["AVAILABLE", "LOCKED", "BOOKED"]

def test_seat_locking_success(client, user_token):
    response = client.post(
        "/api/v1/seats/lock",
        json={"show_id": 1, "seat_ids": [1, 2]},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["locked_seat_ids"] == [1, 2]
    assert data["data"]["expires_in_seconds"] == 300

def test_double_booking_prevention_conflict(client, user2_token):
    """User 2 attempts to lock seat 1 which is currently locked by User 1."""
    response = client.post(
        "/api/v1/seats/lock",
        json={"show_id": 1, "seat_ids": [1, 3]},
        headers={"Authorization": f"Bearer {user2_token}"}
    )
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "DOUBLE_BOOKING_CONFLICT"

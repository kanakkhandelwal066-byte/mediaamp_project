def test_regular_user_forbidden_from_admin_analytics(client, user_token):
    response = client.get("/api/v1/admin/analytics", headers={
        "Authorization": f"Bearer {user_token}"
    })
    assert response.status_code == 403
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "FORBIDDEN"

def test_admin_user_can_access_analytics(client, admin_token):
    response = client.get("/api/v1/admin/analytics", headers={
        "Authorization": f"Bearer {admin_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overview" in data["data"]
    assert "daily_revenue" in data["data"]
    assert "popular_movies" in data["data"]

def test_admin_can_view_all_bookings(client, admin_token):
    response = client.get("/api/v1/admin/bookings", headers={
        "Authorization": f"Bearer {admin_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "items" in data["data"]

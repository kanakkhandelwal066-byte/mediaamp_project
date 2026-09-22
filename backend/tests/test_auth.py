def test_user_registration_success(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@cinebook.ai",
        "password": "Password@123",
        "full_name": "New Cinephile",
        "phone": "+919876500099"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["user"]["email"] == "newuser@cinebook.ai"

def test_duplicate_registration_fails(client):
    response = client.post("/api/v1/auth/register", json={
        "email": "testuser@cinebook.ai",
        "password": "Password@123",
        "full_name": "Duplicate User"
    })
    assert response.status_code == 409
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "EMAIL_ALREADY_EXISTS"

def test_user_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testuser@cinebook.ai",
        "password": "User@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]

def test_user_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "testuser@cinebook.ai",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "UNAUTHORIZED"

def test_get_current_user_profile(client, user_token):
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {user_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "testuser@cinebook.ai"

def test_get_recommendations(client):
    response = client.get("/api/v1/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "recommendations" in data["data"]
    assert len(data["data"]["recommendations"]) >= 1
    rec = data["data"]["recommendations"][0]
    assert "movie_id" in rec
    assert "title" in rec
    assert "score" in rec
    assert "reason" in rec

def test_personalized_recommendations_authenticated(client, user_token):
    response = client.get("/api/v1/recommendations/me", headers={
        "Authorization": f"Bearer {user_token}"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "recommendations" in data["data"]

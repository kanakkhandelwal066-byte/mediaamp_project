def test_list_movies(client):
    response = client.get("/api/v1/movies")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["items"]) >= 1

def test_search_movie_by_title(client):
    response = client.get("/api/v1/movies?search=Inception")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert any("Inception" in m["title"] for m in data["data"]["items"])

def test_get_movie_by_id(client):
    response = client.get("/api/v1/movies/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["id"] == 1

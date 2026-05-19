def test_get_activities(client):
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data
    assert isinstance(data["Chess Club"]["participants"], list)


from urllib.parse import quote


def test_signup_success(client):
    email = "teststudent@example.com"
    activity = quote("Chess Club", safe="")
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert resp.status_code == 200
    assert email in client.get("/activities").json()["Chess Club"]["participants"]


def test_signup_duplicate(client):
    email = "duplicate@example.com"
    activity = quote("Chess Club", safe="")
    first = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert first.status_code == 200
    second = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert second.status_code == 400
    assert "already signed up" in second.json()["detail"].lower()


def test_unregister_success(client):
    email = "michael@mergington.edu"
    activity = quote("Chess Club", safe="")
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})
    assert resp.status_code == 200
    assert email not in client.get("/activities").json()["Chess Club"]["participants"]


def test_unregister_not_found(client):
    activity = quote("Chess Club", safe="")
    resp = client.delete(f"/activities/{activity}/participants", params={"email": "missing@example.com"})
    assert resp.status_code == 404
    assert "participant not found" in resp.json()["detail"].lower()

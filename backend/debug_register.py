from fastapi.testclient import TestClient
from app.main import app
import traceback

client = TestClient(app)

def test_register():
    data = {
        "email": "debug_test@example.com",
        "password": "password123",
        "full_name": "Debug User",
        "role": "user"
    }
    try:
        response = client.post("/api/v1/auth/register", json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        if response.status_code == 500:
            print("Got 500 Error. Checking server logs (simulated via TestClient)...")
            # TestClient raises exceptions directly if raise_server_exceptions is True (default)
            # But we want to catch it to see the traceback if it wasn't caught by a middleware
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    test_register()

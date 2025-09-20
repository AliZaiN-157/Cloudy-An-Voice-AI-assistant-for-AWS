"""
Basic tests for the Real-time Voice AI Assistant Backend.
"""

import pytest
from fastapi.testclient import TestClient
from src.realtime_assistant_service.main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


def test_root_endpoint(client):
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "status" in data


def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "uptime" in data


def test_metrics_endpoint(client):
    """Test the metrics endpoint."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "active_connections" in data
    assert "total_sessions" in data
    assert "memory_usage" in data
    assert "cpu_usage" in data


def test_websocket_endpoint_exists():
    """Test that the WebSocket endpoint is defined."""
    # Check if the LiveKit WebSocket route is registered
    routes = [route.path for route in app.routes]
    assert "/ws/livekit" in routes


def test_rest_routes_exist():
    """Test that REST API routes are defined."""
    # Check if REST API routes are registered
    routes = [route.path for route in app.routes]
    assert "/api/v1" in str(routes)
    assert "/api/v1/livekit" in str(routes)


def test_cors_middleware():
    """Test that CORS middleware is configured."""
    # This is a basic test to ensure the app has middleware
    assert len(app.user_middleware) > 0


if __name__ == "__main__":
    pytest.main([__file__]) 
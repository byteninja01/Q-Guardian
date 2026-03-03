import httpx
import pytest
import asyncio

BASE_URL = "http://127.0.0.1:8000/api/v1"

@pytest.mark.asyncio
async def test_health():
    async with httpx.AsyncClient() as client:
        response = await client.get("http://127.0.0.1:8000/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_portfolio_summary():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/portfolio/summary")
        assert response.status_code == 200
        data = response.json()
        assert "assets_scanned" in data
        assert "quantum_debt_rate" in data

@pytest.mark.asyncio
async def test_portfolio_cbom():
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/portfolio/cbom")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) > 0
        asset = data["data"][0]
        assert "hostname" in asset
        assert "survival_curve" in asset
        assert "semantic_classification" in asset

@pytest.mark.asyncio
async def test_portfolio_scenario():
    async with httpx.AsyncClient() as client:
        payload = {"crqc_year": 2030, "migration_start_year": 2025}
        response = await client.post(f"{BASE_URL}/portfolio/scenario", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"][0]["scenario"]["crqc_year"] == 2030

if __name__ == "__main__":
    # For quick manual run
    async def run_manual():
        print("Testing health...")
        await test_health()
        print("Testing summary...")
        await test_portfolio_summary()
        print("Testing CBOM...")
        await test_portfolio_cbom()
        print("Testing Scenario...")
        await test_portfolio_scenario()
        print("All basic API tests passed!")

    asyncio.run(run_manual())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/route")
async def get_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    url = f"https://api.openrouteservice.org/v2/directions/driving-car"
    params = {
        "start": f"{start_lon},{start_lat}",
        "end": f"{end_lon},{end_lat}"
    }
    headers = {"Authorization": "TU_API_KEY_AQUI"}
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, headers=headers)
        return resp.json()
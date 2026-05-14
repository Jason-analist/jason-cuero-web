import os
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

ORS_API_KEY = "tu_api_key_aqui"  # sácala en openrouteservice.org, es gratis

@app.get("/route")
async def get_route(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    headers = {"Authorization": ORS_API_KEY}
    params = {
        "start": f"{start_lon},{start_lat}",
        "end": f"{end_lon},{end_lat}"
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers=headers, params=params)
    return r.json()
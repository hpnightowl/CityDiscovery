from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Service(BaseModel):
    name: str
    category: str
    description: str
    website: str
    cities: List[str]

class ServiceSubmission(BaseModel):
    name: str
    category: str
    description: str
    website: str
    city: str

def load_data():
    if os.path.exists('services_db.json'):
        with open('services_db.json', 'r') as f:
            return json.load(f)
    return {"services": []}

def save_data(data):
    with open('services_db.json', 'w') as f:
        json.dump(data, f, indent=2)

@app.get("/services/{city}")
async def get_services_by_city(city: str):
    data = load_data()
    city_services = []
    
    # Case-insensitive search
    city = city.lower().strip()
    for service in data["services"]:
        # Check if the city exists in the service's cities (case-insensitive)
        if any(c.lower().strip() == city for c in service["cities"]):
            city_services.append(service)
    
    return {"services": city_services}

@app.get("/cities")
async def get_all_cities():
    data = load_data()
    # Get unique cities (case-insensitive)
    cities = set()
    for service in data["services"]:
        cities.update([city.strip() for city in service["cities"]])
    return {"cities": sorted(list(cities), key=str.lower)}

@app.post("/submit-service")
async def submit_service(submission: ServiceSubmission):
    data = load_data()
    
    # Case-insensitive service name check
    for service in data["services"]:
        if service["name"].lower() == submission.name.lower():
            # Add city if it doesn't exist (case-insensitive)
            if not any(c.lower() == submission.city.lower() for c in service["cities"]):
                service["cities"].append(submission.city)
            save_data(data)
            return {"message": "Service updated successfully"}
    
    # Add new service
    new_service = {
        "name": submission.name,
        "category": submission.category,
        "description": submission.description,
        "website": submission.website,
        "cities": [submission.city]
    }
    data["services"].append(new_service)
    save_data(data)
    return {"message": "Service added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
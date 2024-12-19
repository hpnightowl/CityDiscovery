from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
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

class ServiceArea(BaseModel):
    city: str
    localities: List[str] = []
    is_verified: bool = False
    verified_date: Optional[datetime] = None
    coverage_note: Optional[str] = None

class OperatingHours(BaseModel):
    opens_at: str
    closes_at: str
    days: List[str]

class PricingTier(BaseModel):
    name: str
    description: str
    price_range: str  # e.g. "₹100-500" or "Free"

class Service(BaseModel):
    name: str
    category: str
    description: str
    website: HttpUrl
    areas: List[ServiceArea]
    operating_hours: Optional[OperatingHours] = None
    pricing_tiers: List[PricingTier] = []
    features: List[str] = []
    is_verified: bool = False
    verified_date: Optional[datetime] = None
    rating: float = 0.0
    total_ratings: int = 0
    total_reviews: int = 0
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    @validator('category')
    def category_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('category must not be empty')
        return v.strip()

class ServiceSubmission(BaseModel):
    name: str
    category: str
    description: str
    website: HttpUrl
    city: str
    localities: List[str] = []
    operating_hours: Optional[OperatingHours] = None
    pricing_tiers: List[PricingTier] = []
    features: List[str] = []

class ServiceUpdate(BaseModel):
    description: Optional[str] = None
    website: Optional[HttpUrl] = None
    operating_hours: Optional[OperatingHours] = None
    pricing_tiers: Optional[List[PricingTier]] = None
    features: Optional[List[str]] = None

def load_data():
    if os.path.exists('services_db.json'):
        with open('services_db.json', 'r') as f:
            return json.load(f)
    return {"services": []}

def save_data(data):
    with open('services_db.json', 'w') as f:
        json.dump(data, f, indent=2, default=str)

@app.get("/services/{city}")
async def get_services_by_city(city: str):
    data = load_data()
    city_services = []
    
    # Case-insensitive search
    city = city.lower().strip()
    for service in data["services"]:
        # Check if the city exists in the service's areas (case-insensitive)
        if any(area["city"].lower().strip() == city for area in service["areas"]):
            city_services.append(service)
    
    return {"services": city_services}

@app.get("/cities")
async def get_all_cities():
    data = load_data()
    # Get unique cities from all service areas
    cities = set()
    for service in data["services"]:
        for area in service["areas"]:
            cities.add(area["city"].strip())
    return {"cities": sorted(list(cities), key=str.lower)}

@app.post("/submit-service")
async def submit_service(submission: ServiceSubmission):
    data = load_data()
    
    # Check if service exists
    existing_service = None
    for service in data["services"]:
        if service["name"].lower() == submission.name.lower():
            existing_service = service
            break
    
    if existing_service:
        # Update existing service with new city
        area_exists = False
        for area in existing_service["areas"]:
            if area["city"].lower() == submission.city.lower():
                area["localities"].extend(submission.localities)
                area["localities"] = list(set(area["localities"]))  # Remove duplicates
                area_exists = True
                break
        
        if not area_exists:
            existing_service["areas"].append({
                "city": submission.city,
                "localities": submission.localities,
                "is_verified": False,
                "verified_date": None,
                "coverage_note": None
            })
        
        existing_service["updated_at"] = datetime.now()
    else:
        # Add new service
        new_service = {
            "name": submission.name,
            "category": submission.category,
            "description": submission.description,
            "website": str(submission.website),
            "areas": [{
                "city": submission.city,
                "localities": submission.localities,
                "is_verified": False,
                "verified_date": None,
                "coverage_note": None
            }],
            "operating_hours": submission.operating_hours.dict() if submission.operating_hours else None,
            "pricing_tiers": [tier.dict() for tier in submission.pricing_tiers],
            "features": submission.features,
            "is_verified": False,
            "verified_date": None,
            "rating": 0.0,
            "total_ratings": 0,
            "total_reviews": 0,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        data["services"].append(new_service)
    
    save_data(data)
    return {"message": "Service submitted successfully"}

@app.get("/service/{name}")
async def get_service_by_name(name: str):
    data = load_data()
    for service in data["services"]:
        if service["name"].lower() == name.lower():
            return service
    raise HTTPException(status_code=404, detail="Service not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
# routers/meal.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.pydantic import MealPlanRequest
from services.meal_service import meal_service # Assuming you have this service
from utils.database import get_db
from utils.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/generate", response_model=dict)
@limiter.limit(settings.rate_limit)
async def generate_meal_plan(
    request: Request,
    meal_request: MealPlanRequest,
    db: Session = Depends(get_db)
) -> dict:
    """Generates a personalized meal plan based on the user's dietary profile."""
    try:
        meal_plan = await meal_service.create_meal_plan(
            db, 
            meal_request.user_profile
        )
        return {"status": "success", "meal_plan": meal_plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Meal service unavailable: {str(e)}")
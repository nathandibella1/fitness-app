# routers/meal.py
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.pydantic import MealPlanRequest
from services.meal_service import meal_service
from utils.database import get_db, log_meal_plan
from utils.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate_meal_plan")
@limiter.limit("5/minute")
async def generate_meal_plan(
    request: Request,
    meal_request: MealPlanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate personalized meal plan"""
    try:
        meal_plan = await meal_service.generate_meal_plan(meal_request.user_profile)
        
        # Log meal plan in background
        background_tasks.add_task(
            log_meal_plan,
            db,
            meal_request.user_profile.name,
            meal_plan
        )
        
        return {"meal_plan": meal_plan}
        
    except Exception as e:
        logger.error(f"Meal plan generation error: {e}")
        raise HTTPException(status_code=500, detail="Meal plan generation failed")

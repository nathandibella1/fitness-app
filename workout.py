# routers/workout.py
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.pydantic import WorkoutRequest, PlateauRequest
from services.workout_service import workout_service
from services.openai_service import openai_service
from utils.database import get_db, log_workout
from utils.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate_workout")
@limiter.limit("10/minute")
async def generate_workout(
    request: Request,
    workout_request: WorkoutRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate personalized workout plan"""
    try:
        workout_plan = await workout_service.generate_workout(
            workout_request.user_profile, 
            workout_request.daily_state
        )
        
        # Log workout in background
        background_tasks.add_task(
            log_workout,
            db,
            workout_request.user_profile.name,
            workout_plan
        )
        
        return {"workout_plan": workout_plan}
        
    except Exception as e:
        logger.error(f"Workout generation error: {e}")
        raise HTTPException(status_code=500, detail="Workout generation failed")

@router.post("/handle_plateau")
@limiter.limit("5/minute")
async def handle_plateau(
    request: Request,
    plateau_request: PlateauRequest
):
    """Handle fitness plateau with AI guidance"""
    try:
        prompt = f"""
{plateau_request.user_profile.name} has hit a fitness plateau.

User Profile:
- Goal: {plateau_request.user_profile.fitness_goal}
- Experience: {plateau_request.user_profile.experience_level}
- Available days: {plateau_request.user_profile.available_days}

Progress Data: {plateau_request.progress_data}

Provide plateau-breaking strategy with:
1. Diagnosis of likely causes
2. Specific workout modifications
3. Nutrition adjustments
4. Recovery recommendations
5. Motivation and mindset tips

Be specific and actionable.
"""
        
        strategy = await openai_service.call_openai(prompt)
        return {"plateau_strategy": strategy}
        
    except Exception as e:
        logger.error(f"Plateau handling error: {e}")
        raise HTTPException(status_code=500, detail="Plateau analysis failed")

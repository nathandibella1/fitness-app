# routers/workout.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from models.pydantic import WorkoutRequest
from services.workout_service import workout_service # Assuming you have this service
from utils.database import get_db
from utils.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

@router.post("/generate", response_model=dict)
@limiter.limit(settings.rate_limit)
async def generate_workout(
    request: Request,
    workout_request: WorkoutRequest,
    db: Session = Depends(get_db)
) -> dict:
    """Generates a personalized workout based on user profile and daily check-in."""
    try:
        # Pass the validated Pydantic models to your AI service
        workout_plan = await workout_service.create_workout_plan(
            db, 
            workout_request.user_profile, 
            workout_request.daily_state
        )
        return {"status": "success", "workout_plan": workout_plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workout service unavailable: {str(e)}")
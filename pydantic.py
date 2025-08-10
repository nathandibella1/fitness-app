# models/pydantic.py
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator

class LastCheckIn(BaseModel):
    mood: str = Field(..., min_length=1, max_length=50)
    sleep_hours: int = Field(..., ge=0, le=24)
    soreness: str = Field(..., min_length=1, max_length=50)
    stress: str = Field(..., min_length=1, max_length=50)
    workout_completed: str = Field(..., min_length=1, max_length=200)

class UserProfile(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=13, le=120)
    gender: str = Field(..., regex="^(male|female|other)$")
    fitness_goal: str = Field(..., min_length=1, max_length=100)
    experience_level: str = Field(..., regex="^(beginner|intermediate|advanced)$")
    available_days: int = Field(..., ge=1, le=7)
    equipment: List[str] = Field(default_factory=list, max_items=20)
    diet_type: str = Field(..., min_length=1, max_length=50)
    allergies: List[str] = Field(default_factory=list, max_items=20)
    meal_pref: str = Field(..., min_length=1, max_length=100)
    injuries: List[str] = Field(default_factory=list, max_items=10)
    tracking_devices: List[str] = Field(default_factory=list, max_items=10)
    
    @validator('equipment', 'allergies', 'injuries', 'tracking_devices')
    def validate_lists(cls, v):
        return [item.strip() for item in v if item.strip()]

class DailyState(BaseModel):
    week: int = Field(..., ge=1, le=52)
    day: str = Field(..., regex="^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$")
    last_check_in: LastCheckIn
    streak: Dict[str, int] = Field(default_factory=dict)
    recent_progress: Dict[str, str] = Field(default_factory=dict)

class WorkoutRequest(BaseModel):
    user_profile: UserProfile
    daily_state: DailyState

class MealPlanRequest(BaseModel):
    user_profile: UserProfile

class PlateauRequest(BaseModel):
    user_profile: UserProfile
    progress_data: Dict[str, str] = Field(..., description="Progress tracking data")
    
    @validator('progress_data')
    def progress_data_not_empty(cls, v):
        if not v:
            raise ValueError('progress_data cannot be empty')
        return v

class ChatInput(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=50)
    message: str = Field(..., min_length=1, max_length=2000)

class ChatResponse(BaseModel):
    reply: str
    stage: Optional[str] = None
    progress: Optional[Dict[str, Any]] = None
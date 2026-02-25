# utils/database.py
import logging
from contextlib import asynccontextmanager
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from models.database import SessionLocal, UserProfileDB, WorkoutLog, MealPlanLog

logger = logging.getLogger(__name__)

def get_db():
    """Database dependency"""
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database operation failed")
    finally:
        db.close()

@asynccontextmanager
async def get_db_session():
    """Async context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database operation failed")
    finally:
        db.close()

def get_or_create_user(db: Session, name: str) -> Optional[UserProfileDB]:
    """Get or create user profile"""
    try:
        return db.query(UserProfileDB).filter(UserProfileDB.name == name).first()
    except SQLAlchemyError as e:
        logger.error(f"Error fetching user {name}: {e}")
        return None

def log_workout(db: Session, user_name: str, content: str):
    """Background task to log workout"""
    try:
        user = get_or_create_user(db, user_name)
        if user:
            workout_log = WorkoutLog(
                user_id=user.id,
                content=content,
                workout_type="ai_generated"
            )
            db.add(workout_log)
            db.commit()
    except Exception as e:
        logger.error(f"Error logging workout for {user_name}: {e}")

def log_meal_plan(db: Session, user_name: str, content: str, plan_type: str = "ai_generated", days_count: int = 5):
    """Background task to log meal plan"""
    try:
        user = get_or_create_user(db, user_name)
        if user:
            meal_plan_log = MealPlanLog(
                user_id=user.id,
                content=content,
                plan_type=plan_type,
                days_count=days_count
            )
            db.add(meal_plan_log)
            db.commit()
            logger.info(f"Logged meal plan for {user_name}")
    except Exception as e:
        logger.error(f"Error logging meal plan for {user_name}: {e}")
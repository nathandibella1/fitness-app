# models/database.py
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, 
    JSON, Boolean, Index, ForeignKey
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from utils.config import get_settings

settings = get_settings()

# Database setup
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class UserProfileDB(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    fitness_goal = Column(String(100), nullable=False)
    experience_level = Column(String(50), nullable=False)
    available_days = Column(Integer, nullable=False)
    equipment = Column(JSON, default=list)
    diet_type = Column(String(50), nullable=False)
    allergies = Column(JSON, default=list)
    meal_pref = Column(String(100))
    injuries = Column(JSON, default=list)
    tracking_devices = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    workout_logs = relationship("WorkoutLog", back_populates="user", cascade="all, delete-orphan")
    meal_plan_logs = relationship("MealPlanLog", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    workout_type = Column(String(50))
    duration_minutes = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("UserProfileDB", back_populates="workout_logs")

class MealPlanLog(Base):
    __tablename__ = "meal_plan_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    content = Column(Text, nullable=False)
    plan_type = Column(String(50))
    days_count = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("UserProfileDB", back_populates="meal_plan_logs")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=False)
    session_data = Column(JSON, default=dict)
    stage = Column(String(50), default="collecting")
    current_question = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("UserProfileDB", back_populates="chat_sessions")

# Create indexes
Index('idx_workout_logs_user_date', WorkoutLog.user_id, WorkoutLog.created_at)
Index('idx_meal_plan_logs_user_date', MealPlanLog.user_id, MealPlanLog.created_at)

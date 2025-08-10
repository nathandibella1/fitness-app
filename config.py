# utils/config.py
from functools import lru_cache
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    database_url: str = "sqlite:///fitness_coach.db"
    cors_origins: List[str] = ["http://localhost:3000"]
    secret_key: str = "your-secret-key-change-this"
    rate_limit: str = "30/minute"
    max_tokens: int = 1000
    openai_temperature: float = 0.7
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
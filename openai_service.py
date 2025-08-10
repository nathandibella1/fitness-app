# services/openai_service.py
import hashlib
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import asyncio

from openai import OpenAI
from fastapi import HTTPException

from utils.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.cache = {}
        self.cache_ttl = 3600  # 1 hour
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        
    def _generate_cache_key(self, prompt: str) -> str:
        """Generate cache key for prompt"""
        return hashlib.md5(prompt.encode()).hexdigest()
    
    def _is_cache_valid(self, timestamp: datetime) -> bool:
        """Check if cache entry is still valid"""
        return datetime.utcnow() - timestamp < timedelta(seconds=self.cache_ttl)
    
    async def call_openai(self, prompt: str, system_message: str = None) -> str:
        """Call OpenAI API with caching and error handling"""
        if not system_message:
            system_message = "You are a professional fitness and nutrition coach."
            
        # Check cache
        cache_key = self._generate_cache_key(f"{system_message}:{prompt}")
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                logger.info("Using cached OpenAI response")
                return cached_data
        
        try:
            def _make_request():
                return self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=settings.max_tokens,
                    temperature=settings.openai_temperature
                )
            
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(self.thread_pool, _make_request)
            
            content = response.choices[0].message.content.strip()
            
            # Cache the response
            self.cache[cache_key] = (content, datetime.utcnow())
            
            # Clean old cache entries
            await self._cleanup_cache()
            
            return content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise HTTPException(
                status_code=500, 
                detail="AI service temporarily unavailable. Please try again."
            )
    
    async def _cleanup_cache(self):
        """Remove expired cache entries"""
        current_time = datetime.utcnow()
        expired_keys = [
            key for key, (_, timestamp) in self.cache.items()
            if not self._is_cache_valid(timestamp)
        ]
        for key in expired_keys:
            del self.cache[key]

# Global instance
openai_service = OpenAIService()

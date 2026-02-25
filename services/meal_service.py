# services/meal_service.py
from models.pydantic import UserProfile
from services.openai_service import openai_service

class MealPlanService:
    @staticmethod
    def generate_meal_prompt(profile: UserProfile) -> str:
        allergies_text = ", ".join(profile.allergies) if profile.allergies else "none"
        
        return f"""
Create a detailed 5-day meal plan for {profile.name}, a {profile.age}-year-old {profile.gender}.

Requirements:
- Fitness Goal: {profile.fitness_goal}
- Diet Type: {profile.diet_type}
- Allergies: {allergies_text}
- Meal Preference: {profile.meal_pref}

Provide:
- Daily macros (calories, protein, carbs, fats)
- Breakfast, lunch, dinner, and 2 snacks
- Portion sizes and simple cooking instructions
- Grocery list for the week
- Meal prep tips

Format day-by-day with clear structure and practical advice.
"""
    
    @staticmethod
    async def generate_meal_plan(profile: UserProfile) -> str:
        prompt = MealPlanService.generate_meal_prompt(profile)
        return await openai_service.call_openai(prompt)

meal_service = MealPlanService()

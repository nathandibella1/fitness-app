# services/workout_service.py
from models.pydantic import UserProfile, DailyState
from services.openai_service import openai_service

class WorkoutService:
    @staticmethod
    def generate_workout_prompt(profile: UserProfile, state: DailyState) -> str:
        c = state.last_check_in
        equipment_list = ', '.join(profile.equipment) if profile.equipment else "bodyweight only"
        
        return f"""
You are {profile.name}'s personal AI fitness coach. Today is {state.day} of week {state.week}.

User Profile:
- Age: {profile.age}, Gender: {profile.gender}
- Fitness Goal: {profile.fitness_goal}
- Experience Level: {profile.experience_level}
- Available Equipment: {equipment_list}
- Injuries/Limitations: {', '.join(profile.injuries) if profile.injuries else 'None'}

Current State:
- Mood: {c.mood}
- Sleep Duration: {c.sleep_hours} hours
- Muscle Soreness Level: {c.soreness}
- Stress Level: {c.stress}
- Last Workout: {c.workout_completed}
- Workout Streak: {state.streak.get('days', 0)} days

Tasks:
1. Greet {profile.name} warmly and assess readiness
2. Adjust workout intensity based on current state
3. Generate detailed workout plan with exercises, sets, reps, rest periods
4. Include appropriate warm-up and cool-down
5. Provide 2 motivational tips specific to current state

Format as clear, step-by-step guide with safety considerations.
"""
    
    @staticmethod
    async def generate_workout(profile: UserProfile, state: DailyState) -> str:
        prompt = WorkoutService.generate_workout_prompt(profile, state)
        return await openai_service.call_openai(prompt)

workout_service = WorkoutService()
# services/chat_service.py
import logging
from sqlalchemy.orm import Session

from models.database import ChatSession, UserProfileDB
from models.pydantic import ChatResponse
from services.openai_service import openai_service
from utils.database import get_or_create_user

logger = logging.getLogger(__name__)

class ChatService:
    QUESTIONS = [
        "What is your age, height, and current weight?",
        "What is your estimated body fat %, and your target body fat or physique goal?",
        "What is your training split (e.g., PPL, Upper/Lower, Bro Split)?",
        "Do you have any injuries, limitations, or movement issues I should protect?",
        "What are your current top lifts or strength benchmarks (bench, squat, pull, etc.)?",
        "What tempo do you use (if any)?",
        "What are your macros or calorie target, if tracking?",
        "List your staple foods, supplements, or meal style (e.g., Indian food, high-protein, meal prep)?",
        "Do you track sleep, hydration, or recovery routines (meditation, cold showers, etc.)?",
        "What's your mindset or life philosophy (e.g., stoicism, self-mastery, etc.)?",
        "What non-gym areas should I coach you on? (e.g., study, time management, money, discipline)"
    ]
    
    @classmethod
    def get_or_create_session(cls, db: Session, user_id: str) -> ChatSession:
        """Get existing session or create new one"""
        user = get_or_create_user(db, user_id)
        if not user:
            # Create user profile
            user = UserProfileDB(
                name=user_id,
                age=25, gender="other", fitness_goal="general fitness",
                experience_level="beginner", available_days=3,
                diet_type="balanced", meal_pref="no preference"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Get or create active session
        session = db.query(ChatSession).filter(
            ChatSession.user_id == user.id,
            ChatSession.is_active == True
        ).first()
        
        if not session:
            session = ChatSession(
                user_id=user.id,
                session_data={"answers": []},
                stage="collecting",
                current_question=0
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        return session
    
    @classmethod
    async def process_chat_message(cls, db: Session, user_id: str, message: str) -> ChatResponse:
        """Process chat message and return response"""
        try:
            session = cls.get_or_create_session(db, user_id)
            user_message = message.strip()
            
            if session.stage == "collecting":
                if session.current_question < len(cls.QUESTIONS) and user_message:
                    # Store answer
                    answers = session.session_data.get("answers", [])
                    answers.append(user_message)
                    session.session_data = {"answers": answers}
                    session.current_question += 1
                    
                    db.commit()
                
                if session.current_question >= len(cls.QUESTIONS):
                    # Transition to coach mode
                    session.stage = "coach_mode"
                    db.commit()
                    
                    # Generate profile summary
                    answers = session.session_data["answers"]
                    profile_summary = "\n".join([
                        f"{i+1}. {q} — {a}" 
                        for i, (q, a) in enumerate(zip(cls.QUESTIONS, answers))
                    ])
                    
                    prompt = f"""
You are now activated as my Elite Gym and Life Coach.

Here is my profile:
{profile_summary}

Analyze my profile and provide an action plan across:
- Physique development
- Nutrition strategy  
- Mindset optimization
- Time management
- Career/wealth building

Be specific, actionable, and honest. Use structured format.
"""
                    
                    reply = await openai_service.call_openai(prompt)
                    return ChatResponse(
                        reply=reply,
                        stage="coach_mode",
                        progress={"completed_questions": len(cls.QUESTIONS)}
                    )
                
                # Return next question
                return ChatResponse(
                    reply=cls.QUESTIONS[session.current_question],
                    stage="collecting",
                    progress={
                        "current_question": session.current_question + 1,
                        "total_questions": len(cls.QUESTIONS)
                    }
                )
            
            elif session.stage == "coach_mode":
                # Handle coach mode conversation
                answers = session.session_data["answers"]
                profile_summary = "\n".join([
                    f"{i+1}. {q} — {a}" 
                    for i, (q, a) in enumerate(zip(cls.QUESTIONS, answers))
                ])
                
                prompt = f"""
You are in Coach Mode for this user. Profile:
{profile_summary}

User input: "{user_message}"

Provide coaching response following these rules:
- Be direct and actionable
- Use Quick Mode unless user asks for details
- Track patterns and provide feedback
- Give specific next steps
"""
                
                reply = await openai_service.call_openai(prompt)
                return ChatResponse(reply=reply, stage="coach_mode")
            
            return ChatResponse(reply="Session error. Please restart.", stage="error")
            
        except Exception as e:
            logger.error(f"Chat processing error: {e}")
            raise

chat_service = ChatService()
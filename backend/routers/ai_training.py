from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import requests
import json
from ..llm_helper import generate_roleplay_chat_response

router = APIRouter(prefix="/ai-training", tags=["AI Training"])

class RoleplayChatRequest(BaseModel):
    message: str
    user_role: str
    conversation_history: Optional[List[dict]] = []
    test_history: Optional[List[dict]] = []

class RoleplayFeedbackRequest(BaseModel):
    scenario_id: str
    user_response: str
    user_role: str
    scenario_history: Optional[List[dict]] = []

@router.post("/roleplay-chat")
async def roleplay_chat(req: RoleplayChatRequest):
    """
    AI roleplay chat endpoint for skill testing scenarios
    """
    try:
        response = generate_roleplay_chat_response(
            user_message=req.message,
            topic=req.user_role,  # Use user_role as topic for now
            test_history=req.test_history
        )
        
        return {
            "status": "success",
            "response": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

@router.post("/roleplay-feedback")
async def roleplay_feedback(req: RoleplayFeedbackRequest):
    """
    Get AI-generated feedback for roleplay training scenarios
    """
    try:
        from ..llm_helper import generate_roleplay_scenario_feedback
        
        feedback = generate_roleplay_scenario_feedback(
            scenario=req.scenario_id,
            user_response=req.user_response,
            test_history=req.scenario_history
        )
        
        return {
            "status": "success",
            "feedback": feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feedback generation error: {str(e)}")

@router.post("/generate-questions")
async def generate_ai_test_questions(
    category: str,
    difficulty: str,
    count: int,
    user_role: str
):
    """
    Generate AI test questions for skill assessment
    """
    try:
        # For now, return a simple response
        # In a full implementation, this would call the LLM to generate questions
        return {
            "status": "success",
            "questions": [
                {
                    "id": 1,
                    "question": f"Test question for {category} at {difficulty} level",
                    "type": "scenario",
                    "difficulty": difficulty,
                    "category": category
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation error: {str(e)}")

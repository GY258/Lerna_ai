from ssl import Options
from fastapi import APIRouter, Body
from pydantic import BaseModel
from backend.llm_helper import generate_quiz_from_sop
from backend.db import save_quiz_to_db,grade_quiz_attempt,get_random_quizzes,get_quiz_info
from typing import List, Optional

router = APIRouter(prefix="/quiz", tags=["quiz"])

class QuizRequest(BaseModel):
    sop_text: str



class QuizItem(BaseModel):
    sop_topic: str
    question: str
    options: Optional[List[str]] = []
    answer: str
    type: str  # e.g., "choice" or "fill_blank"
    difficulty: Optional[str] = "easy"
    source_text: Optional[str] = ""
    tags: Optional[List[str]] = []

class QuizSaveRequest(BaseModel):
    quiz: List[QuizItem]

@router.post("/generate")
async def generate_quiz(req: QuizRequest):
    return generate_quiz_from_sop(req.sop_text)


@router.post("/save")
async def save_quiz(payload: QuizSaveRequest):
    # This is where you'd save to a database or file
    print("Received quiz:", payload.quiz)

    # Example: just write to a local JSON file for now
    for q in payload.quiz:
        save_quiz_to_db(q.dict())
    return {"status": "success", "message": "Quiz saved to Supabase"}

@router.get("/{quiz_id}")
async def get_quiz_by_id(quiz_id: str):
    selected_quiz = get_quiz_info(quiz_id)
    return selected_quiz
    
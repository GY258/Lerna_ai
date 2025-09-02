from supabase import create_client, Client
import os
from dotenv import load_dotenv
import random

load_dotenv()

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def save_quiz_to_db(question_obj: dict):
    data = {
        "sop_topic": question_obj["sop_topic"],
        "question": question_obj["question"],
        "options": question_obj.get("options", []),
        "answer": question_obj.get("answer", ""),
        "type": question_obj.get("type", ""),
        "difficulty": question_obj.get("difficulty", ""),
        "source_text": question_obj.get("source_text", ""),
        "tags": question_obj.get("tags", []),
    }
    print("Inserting:", data)
    supabase.table("quizzes").insert(data).execute()

def grade_quiz_attempt(questions: list, responses: list):
    score = 0
    for q, user_answer in zip(questions, responses):
        correct_answer = q.get("answer")
        if user_answer.strip().lower() == correct_answer.strip().lower():
            score += 1
    return score, len(questions)

import random

def get_random_quizzes(count: int = 5, topic: str = None, difficulty: str = None):
    # Build filter
    query = supabase.table("quizzes").select("*")
    if topic:
        query = query.eq("sop_topic", topic)
    if difficulty:
        query = query.eq("difficulty", difficulty)

    # Fetch from supabase
    result = query.execute()
    all_quizzes = result.data or []
    # Random sample
    if len(all_quizzes) <= count:
        return all_quizzes
    return random.sample(all_quizzes, count)


def get_quiz_info(quiz_id: str):
    """
    Retrieve a single quiz by its ID.
    """
    result = supabase.table("quizzes").select("*").eq("id", quiz_id).single().execute()
    return result.data


def save_quiz_attempt(user_id: str, quiz_id: str, answer: str, correct: bool):
    data = {
        "user_id": user_id,
        "quiz_id": quiz_id,
        "answer": answer,
        "is_correct": correct
    }
    print("Logging attempt:", data)
    supabase.table("quiz_attempts").insert(data).execute()


def get_all_submissions():
    
    response = (
        supabase.table("quiz_attempts")
        .select("""
            id,
            answer,
            is_correct,
            answered_at,
            quizzes (
                sop_topic,
                question,
                source_text,
                answer
            ),
            users (
                name
            )
        """)
        .order("answered_at", desc=True)
        .execute()
    )
    return response.data or []

def get_user_submissions(user_id: str):
    
    response = (
        supabase.table("quiz_attempts")
        .select("""
            id,
            answer,
            is_correct,
            answered_at,
            quizzes (
                sop_topic,
                question,
                source_text,
                answer
            ),
            users (
                name
            )
        """)
        .order("answered_at", desc=True)
        .eq("user_id", user_id)
        .execute()
    )

    return response.data or []

def save_user_report_to_db(user_id: str, summary: str):
    result = supabase.table("user_reports").upsert({
        "user_id": user_id,
        "summary": summary
    }).execute()
    return result

def get_user_report(user_id: str):
    response = (
        supabase.table("user_reports")
        .select("summary")
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    print(response)
    if response.data:
        return {"user_id": user_id, "summary": response.data[0]["summary"]}
    return None

def get_problem_solving_cases(dimension: str = None, role: str = None, limit: int = 1):
    """
    Fetch problem solving cases from the database
    """
    query = supabase.table("problem_solving_cases").select("*")
    
    if dimension:
        query = query.eq("dimension", dimension)
    if role:
        query = query.eq("role", role)
    
    query = query.limit(limit)
    
    result = query.execute()
    return result.data or []

def get_problem_solving_case_by_id(case_id: int):
    """
    Fetch a specific problem solving case by ID
    """
    result = supabase.table("problem_solving_cases").select("*").eq("id", case_id).single().execute()
    return result.data

from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def save_quiz_to_db(topic: str, question_obj: dict):
    data = {
        "sop_topic": topic,
        "question": question_obj["question"],
        "options": question_obj.get("options", []),  # must be list/JSON
        "answer": question_obj.get("answer", "")
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
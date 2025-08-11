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

    # return generate_quiz_from_sop(sop_text)
    quiz = [
  {
    "sop_topic": "Corporate Culture",
    "question": "What is Laicai’s brand positioning?",
    "options": [],
    "answer": "The No.1 Hubei Cuisine Brand",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Brand Positioning: The No.1 Hubei Cuisine Brand",
    "tags": ["brand"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What are the core values of Laicai?",
    "options": [
      "Customer First",
      "Respect and Humility",
      "Pragmatic and Diligent",
      "Proactive and Ambitious",
      "Courage and Responsibility",
      "Integrity-based",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Values: 1. Customer First 2. Respect and Humility 3. Pragmatic and Diligent 4. Proactive and Ambitious 5. Courage and Responsibility 6. Integrity-based",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "Which of the following is NOT part of Laicai’s Four Prohibitions?",
    "options": [
      "Corruption and misuse of power",
      "Conflicts with customers",
      "Leaking company secrets",
      "Breaking the law"
    ],
    "answer": "Conflicts with customers",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Four Prohibitions: 1. Corruption and misuse of power 2. Fraud and deception 3. Leaking company secrets 4. Breaking the law",
    "tags": ["rules"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "In which year was Laicai founded?",
    "options": [],
    "answer": "2018",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Founded: 2018",
    "tags": ["history"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is Laicai’s mission?",
    "options": [],
    "answer": "Craft each bowl of lotus root soup with dedication to deliver customer satisfaction",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Mission: Craft each bowl of lotus root soup with dedication to deliver customer satisfaction",
    "tags": ["mission"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is Laicai’s vision?",
    "options": [],
    "answer": "Expand nationwide and become the most loved soup brand",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Vision: Expand nationwide and become the most loved soup brand",
    "tags": ["vision"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "Which behavior demonstrates the value of 'Customer First'?",
    "options": [
      "Immediate response to customer needs",
      "Maintain four attitudes: sincerity, honesty, attentiveness, and patience",
      "Treat employees like family",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Customer First: Respond promptly to customer needs, create satisfaction, uphold sincerity, honesty, care, and patience; treat employees like family",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What does 'Respect and Humility' require employees to do?",
    "options": [
      "Strictly follow standards and procedures",
      "Continuously understand customer needs and innovate proactively",
      "Maintain a humble learning attitude",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Respect and Humility: Follow procedures, stay respectful, keep learning with an open mind, understand customers, and continuously improve",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "Which behavior reflects the value of 'Pragmatic and Diligent'?",
    "options": [
      "Perform duties responsibly and thoroughly",
      "Stay determined and hardworking toward goals",
      "Embrace new challenges and persist through difficulties",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Pragmatic and Diligent: Be responsible, goal-driven, hardworking, and embrace new challenges with perseverance",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "How does the value 'Proactive and Ambitious' encourage employees?",
    "options": [
      "Maintain a positive mindset",
      "Seize personal and company growth opportunities",
      "Adapt to changes and improve oneself",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Proactive and Ambitious: Stay optimistic, seize opportunities, embrace change, and strive for breakthroughs",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What behaviors are included in the value 'Courage and Responsibility'?",
    "options": [
      "Admit mistakes willingly",
      "Support teammates when they make mistakes",
      "Take the lead in facing difficulties",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Courage and Responsibility: Admit mistakes, help others solve issues, and lead in difficult situations",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What does 'Integrity-based' require employees to do?",
    "options": [
      "Deliver on promises to customers and teammates",
      "Speak honestly and transparently",
      "Keep confidentiality and protect others' privacy",
      "All of the above"
    ],
    "answer": "All of the above",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Integrity-based: Keep commitments, communicate honestly, and maintain confidentiality",
    "tags": ["values"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "Which of the following is NOT part of Laicai’s Six Prohibitions?",
    "options": [
      "No conflicts with customers",
      "No gambling or fighting",
      "No being late or leaving early",
      "No borrowing money from subordinates or suppliers"
    ],
    "answer": "No being late or leaving early",
    "type": "choice",
    "difficulty": "medium",
    "source_text": "Six Prohibitions: 1. No conflicts with customers 2. No manipulating reviews 3. No intentional damage or theft of company property 4. No gossip or rumors 5. No gambling or fighting 6. No borrowing money from subordinates or partners",
    "tags": ["rules"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is the full brand name of Laicai?",
    "options": [],
    "answer": "Laicai · Hubei’s Signature Lotus Root Soup",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Full Brand Name: Laicai · Hubei’s Signature Lotus Root Soup",
    "tags": ["brand"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is Laicai’s product positioning?",
    "options": [],
    "answer": "Innovative Peach Sauce Duck Lotus Root Soup + Traditional Hubei Signature Dishes + Hubei Comfort Food + Hubei Home-style Dishes",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Product Positioning: Peach Sauce Duck Lotus Root Soup + Traditional Hubei Dishes + Hubei Comfort Food + Hubei Home-style Cuisine",
    "tags": ["product"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is the target average customer spend per order at Laicai?",
    "options": [],
    "answer": "80 RMB",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Customer Spend Target: 80 RMB",
    "tags": ["product"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is Laicai’s target customer group?",
    "options": [],
    "answer": "Year-round dining demand + small gathering needs",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Target Group: Year-round essential dining and small gathering customer segments",
    "tags": ["product"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "How many Laicai stores are there?",
    "options": [],
    "answer": "30 stores",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Number of Stores: 30",
    "tags": ["business"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "Which cities does Laicai operate in?",
    "options": [],
    "answer": "Wuhan, Beijing, Shenzhen",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "Store Locations: Wuhan, Beijing, Shenzhen",
    "tags": ["business"]
  },
  {
    "sop_topic": "Corporate Culture",
    "question": "What is the origin of the brand name 'Laicai'?",
    "options": [],
    "answer": "A Wuhan dialect phrase meaning 'fortune, good luck, and prosperity in marriage'",
    "type": "fill_blank",
    "difficulty": "easy",
    "source_text": "The word 'Laicai' originates from the Wuhan dialect, meaning wealth, good luck, and a prosperous start",
    "tags": ["brand"]
  }
]

       
            
    return quiz


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
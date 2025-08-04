from fastapi import FastAPI, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.llm_quiz_generator import generate_quiz_from_sop
from backend.db import save_quiz_to_db,grade_quiz_attempt
import json

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate_quiz/")
async def generate_quiz(sop_text: str = Form(...), topic: str = Form(...)):
    # quiz = generate_quiz_from_sop(sop_text)
    quiz = [
  {
    "question": "筒子骨腌制时，每件（26根）应使用的腌制盐重量是多少？",
    "options": ["800克", "1600克", "1000克", "500克"],
    "answer": "800克",
    "type": "choice"
  },
  {
    "question": "藕块改刀的标准尺寸是多少？",
    "options": ["1cm*1cm", "2.5cm*3cm", "3cm*4cm", "2cm*2cm"],
    "answer": "2.5cm*3cm",
    "type": "choice"
  },
  {
    "question": "藕泥加工时，藕块与原汤的比例是多少？",
    "options": ["1:1", "0.8:1", "1:0.5", "1:1.2"],
    "answer": "0.8:1",
    "type": "choice"
  },
  {
    "question": "藕汤尝味时，盐度值的标准范围是____至____。",
    "answer": "0.71~0.90",
    "type": "fill_blank"
  }
]

    for q in quiz:
        save_quiz_to_db(topic, q)
    return {"quiz": quiz}

@app.post("/grade_quiz/")
async def grade_quiz(request: Request):
    data = await request.json()
    questions = data.get("questions")
    responses = data.get("responses")
    score, total = grade_quiz_attempt(questions, responses)
    return {"score": score, "total": total, "accuracy": round(score / total, 2)}

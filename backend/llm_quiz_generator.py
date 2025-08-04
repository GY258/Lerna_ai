import requests
import os
from dotenv import load_dotenv

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"  # Adjust if self-hosted

def generate_quiz_from_sop(sop_text: str):
    prompt = f"""
You are a training content generator for restaurant employees.
Based on the following SOP, generate 3 multiple choice questions and 1 fill-in-the-blank question.
Format the output as a JSON list of dictionaries.

SOP:
\"\"\"
{sop_text}
\"\"\"
"""

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "deepseek-chat",  # or your hosted model name
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }

    response = requests.post(DEEPSEEK_API_URL, headers=headers, json=body)
    content = response.json()["choices"][0]["message"]["content"]
    return json.loads(content)

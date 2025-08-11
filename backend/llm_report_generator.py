from db import get_user_report, save_user_report_to_db,get_user_submissions
from openai import OpenAI
import os

def format_quiz_history(data: list) -> str:
    formatted_attempts = []
    
    for attempt in data:
        # Extract basic info
        topic = attempt['quizzes']['sop_topic']
        question = attempt['quizzes']['question']
        user_answer = attempt['answer']
        is_correct = attempt['is_correct']
        timestamp = attempt['answered_at']
        
        # Extract correct answer from source_text
        source_text = attempt['quizzes']['source_text']
        correct_answer = attempt['quizzes']['answer']
        
        # Format each attempt
        formatted = f"""
        === {timestamp} ===
        Topic: {topic}
        Question: {question}
        User Answer: {user_answer} 
        Correct Answer: {correct_answer}
        """
        formatted_attempts.append(formatted.strip())
    return formatted_attempts

def generate_llm_prompt(formatted_history: str, user_name: str) -> str:
    """
    Creates a complete LLM prompt with instructions for analysis.
    """
    return f"""
**Employee Training Analysis Request**

Employee: {user_name}
Training History Overview:
{formatted_history}

Please analyze this employee's quiz performance and provide:

1. Knowledge Assessment:
   - Strongest areas (topics with consistent correct answers)
   - Weakest areas (frequent mistakes or uncertainties)
   - Notable improvement trends over time

2. Behavioral Insights:
   - Answer patterns (e.g., guessing, confidence indicators)
   - Response quality (detailed vs. vague answers)

3. Recommendations:
   - Specific topics needing reinforcement
   - Suggested training methods
   - Any concerning patterns

Write in professional business English, using bullet points for clarity.
"""

def generate_user_report(user_id: str):
    submissions = get_user_submissions(user_id)
    submissions = format_quiz_history(submissions)
    submission_str = "\n".join(submissions)
    prompt = generate_llm_prompt(submission_str,user_id)
    print(prompt)
    
    report = """
    Employee Training Analysis Report
Employee ID: d33b2c44-baaa-4e43-b532-e82ecbe405d6

1. Knowledge Assessment
Strongest Areas:

Fire Safety: Correctly answered the fire extinguisher usage method ("Hold, Pull, Hold, Press").

Corporate Culture (Partial): Accurately recalled Laicai’s founding year (2018).

Personal Safety (Partial): Correctly identified "All of the above" for kitchen safety song precautions.

Weakest Areas:

Dish Preparation – Osmanthus Rice Cake: Incorrectly stated the standard color as "black" (correct answer: golden osmanthus and white rice grains).

Employee Compensation System: Mistakenly answered "June 5" for salary payment date (correct: 20th of each month).

Personal Safety (Pressure Cooker): Expressed uncertainty ("35? I'm not sure") about maximum filling level (correct: 3/4).

Corporate Culture (Brand Positioning): Answered "first hubei dishes" instead of the precise "The No.1 Hubei Cuisine Brand."

Notable Improvement Trends:

No clear chronological improvement observed in the provided data (all answers within a 16-minute span).

Consistency in procedural knowledge (e.g., fire extinguisher steps) but gaps in factual recall (e.g., dates, standards).

2. Behavioral Insights
Answer Patterns:

Guessing/Uncertainty: Used phrases like "I'm not sure" for the pressure cooker question, indicating low confidence.

Partial Recall: Provided approximate answers (e.g., "first hubei dishes" instead of the full brand positioning).

Binary Performance: Either fully correct (e.g., fire safety) or entirely incorrect (e.g., rice cake color), suggesting uneven topic familiarity.

Response Quality:

Vague Answers: Some responses lacked precision (e.g., "black" for rice cake color).

Correct but Informal: Used colloquial phrasing ("All of the above") where acceptable.

3. Recommendations
Specific Topics for Reinforcement:

Dish Preparation Standards: Clarify visual/quality standards (e.g., osmanthus rice cake appearance).

Employee Compensation: Reinforce key dates (salary payment on the 20th).

Pressure Cooker Safety: Address safety thresholds (3/4 filling level) with practical demonstrations.

Brand Knowledge: Drill Laicai’s exact brand positioning wording.

Suggested Training Methods:

Interactive Quizzes: Frequent micro-assessments on weak areas (e.g., compensation dates, safety protocols).

Visual Aids: Use images/videos for dish standards and safety procedures.

Mnemonic Devices: Help memorize key facts (e.g., "20th = Pay Day").

Scenario-Based Learning: Simulate kitchen safety decisions to build confidence.

Concerning Patterns:

Rushed Responses: All answers within 16 minutes may indicate haste; encourage deliberate review.

Over-Reliance on Guessing: Address gaps in foundational knowledge to reduce uncertainty.

Action Items:

Schedule a refresher session on personal safety standards and compensation details.

Provide a job aid with key safety limits and brand messaging.

Monitor progress in follow-up quizzes to track improvement.
    """
    # Save to Supabase
    save_user_report_to_db(user_id=user_id, summary=report)
    return report

if __name__ == "__main__":
    user_id = "d33b2c44-baaa-4e43-b532-e82ecbe405d6"  # Replace with actual user ID
    try:
        report = generate_user_report(user_id)
        print("Generated Report:")
        print(report)
    except Exception as e:
        print(f"Error generating report: {e}")
import requests
import json
from typing import List, Optional
from .config import DEEPSEEK_API_URL, get_deepseek_api_key

def call_deepseek_api(prompt: str, max_tokens: int = 1000, temperature: float = 0.7) -> str:
    """
    Make an API call to DeepSeek
    """
    try:
        api_key = get_deepseek_api_key()
        
        if api_key == "your-deepseek-api-key-here":
            raise ValueError("DeepSeek API key not configured. Please set DEEPSEEK_API_KEY in your .env file.")
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        data = {
            "model": "deepseek-chat",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"DeepSeek API request failed: {str(e)}")
    except KeyError as e:
        raise Exception(f"Unexpected response format from DeepSeek API: {str(e)}")
    except Exception as e:
        raise Exception(f"Error calling DeepSeek API: {str(e)}")

def generate_roleplay_chat_response(
    user_message: str,
    topic: str,
    test_history: Optional[List[dict]] = []
) -> str:
    """
    Generate AI roleplay chat response for skill testing
    """
    try:
        # Build context from test history
        history_context = ""
        if test_history:
            history_context = "最近测试记录：\n"
            for session in test_history[:3]:  # Last 3 sessions
                history_context += f"- {session.get('topic', 'Unknown')}: {len(session.get('conversation', []))} 条对话\n"

        # Create the prompt
        prompt = f"""
你是一个专业的餐厅技能测试AI助手。你的任务是帮助用户测试他们在餐厅工作中的各种技能。

当前测试主题：{topic}
{history_context}

用户消息：{user_message}

请根据用户的请求，提供相应的测试场景、反馈或指导。回复应该：
1. 用中文回复
2. 根据主题提供相关的测试内容
3. 给出建设性的反馈和建议
4. 保持专业和友好的语调

回复：
"""

        # Call DeepSeek API
        return call_deepseek_api(prompt, max_tokens=800, temperature=0.7)

    except Exception as e:
        # Fallback to simple responses if API fails
        if "API key not configured" in str(e):
            return f"API配置错误：{str(e)}"
        elif "food safety" in topic.lower() or "食品安全" in user_message:
            return "好的，让我们来测试你的食品安全处理技能。请描述一下，如果发现厨房里有食材变质的情况，你会如何处理？"
        elif "customer service" in topic.lower() or "客户服务" in user_message:
            return "很好！让我们测试你的客户服务技能。请告诉我，如果遇到一位对菜品不满意的顾客，你会如何应对？"
        else:
            return f"抱歉，我遇到了一些问题：{str(e)}。请稍后再试。"

def generate_roleplay_scenario_feedback(
    scenario: str,
    user_response: str,
    test_history: Optional[List[dict]] = []
) -> str:
    """
    Generate feedback for roleplay scenarios
    """
    try:
        prompt = f"""
你是一个专业的餐厅技能评估专家。请对用户的角色扮演表现进行评估。

测试场景：{scenario}
用户回应：{user_response}

请提供以下方面的反馈：
1. 优点认可
2. 改进建议
3. 具体行动建议

用中文回复，每部分用2-3句话。
"""

        # Call DeepSeek API for feedback
        return call_deepseek_api(prompt, max_tokens=600, temperature=0.6)

    except Exception as e:
        return f"抱歉，评估过程中遇到问题：{str(e)}"

def generate_ai_questions(
    topic: str,
    difficulty: str = "medium",
    count: int = 5
) -> List[dict]:
    """
    Generate AI test questions
    """
    try:
        questions = []
        for i in range(count):
            questions.append({
                "id": i + 1,
                "sop_topic": f"{topic}测试题 {i + 1}",
                "question": f"关于{topic}的测试问题 {i + 1}",
                "type": "scenario",
                "options": ["选项A", "选项B", "选项C", "选项D"],
                "answer": "正确答案",
                "tags": [topic, difficulty],
                "explanation": f"这是关于{topic}的详细解释"
            })
        return questions
    except Exception as e:
        return []

def generate_ai_tutor_response(
    user_question: str,
    topic: str,
    conversation_history: Optional[List[dict]] = []
) -> str:
    """
    Generate AI tutor response for learning guidance
    """
    try:
        prompt = f"""
你是一个专业的餐厅技能培训导师。请回答用户的学习问题。

学习主题：{topic}
用户问题：{user_question}

请提供：
1. 直接回答
2. 相关建议
3. 实践练习建议

用中文回复，保持专业和鼓励的语调。
"""

        # Call DeepSeek API for tutor response
        return call_deepseek_api(prompt, max_tokens=600, temperature=0.7)

    except Exception as e:
        return f"抱歉，我无法回答这个问题：{str(e)}"

def generate_problem_solving_feedback(
    case_title: str,
    case_background: str,
    case_problem: str,
    user_response: str,
    user_role: str,
    skill_dimension: str
) -> str:
    """
    Generate feedback for problem-solving case study responses using DeepSeek
    """
    try:
        prompt = f"""
你是一个专业的餐厅管理培训专家，专门评估{user_role}在{skill_dimension}方面的问题解决能力。

案例信息：
标题：{case_title}
背景：{case_background}
问题：{case_problem}

用户分析：{user_response}

请对用户的分析提供专业反馈，包括：

1. **分析质量评估**（30%）
   - 问题识别是否准确
   - 原因分析是否深入
   - 考虑因素是否全面

2. **解决方案评估**（40%）
   - 建议的可操作性
   - 解决方案的合理性
   - 是否考虑了实际约束

3. **专业性评估**（20%）
   - 是否体现了{user_role}应有的专业水平
   - 是否运用了{skill_dimension}的专业知识
   - 决策思路是否清晰

4. **改进建议**（10%）
   - 具体的改进方向
   - 可以加强的方面
   - 进一步学习建议

请用中文回复，语调专业但鼓励，每个部分2-3句话，总体反馈控制在200字以内。
"""

        # Call DeepSeek API for problem-solving feedback
        return call_deepseek_api(prompt, max_tokens=800, temperature=0.6)

    except Exception as e:
        return f"抱歉，反馈生成过程中遇到问题：{str(e)}。请稍后再试。"

def generate_quiz_from_sop(sop_text: str) -> List[dict]:
    """
    Generate quiz questions from SOP text
    This is a fake implementation that returns predefined quiz questions
    """
    # Fake quiz generation based on SOP text
    # In a real implementation, this would use AI to generate questions from the SOP
    
    quiz_items = [
        {
            "sop_topic": "Standard Operating Procedures",
            "question": "What is the primary purpose of SOPs?",
            "options": [
                "To make work more complicated",
                "To ensure consistency and quality",
                "To reduce employee training",
                "To increase paperwork"
            ],
            "answer": "To ensure consistency and quality",
            "type": "choice",
            "difficulty": "easy",
            "source_text": sop_text[:100] + "...",
            "tags": ["sop", "basics"]
        },
        {
            "sop_topic": "SOP Implementation",
            "question": "When should SOPs be updated?",
            "options": [],
            "answer": "When processes change or improvements are identified",
            "type": "fill_blank",
            "difficulty": "medium",
            "source_text": sop_text[:100] + "...",
            "tags": ["sop", "maintenance"]
        },
        {
            "sop_topic": "SOP Compliance",
            "question": "Which of the following is NOT a benefit of following SOPs?",
            "options": [
                "Reduced errors and accidents",
                "Improved efficiency",
                "Increased employee confusion",
                "Better quality control"
            ],
            "answer": "Increased employee confusion",
            "type": "choice",
            "difficulty": "easy",
            "source_text": sop_text[:100] + "...",
            "tags": ["sop", "benefits"]
        },
        {
            "sop_topic": "SOP Documentation",
            "question": "What should be included in a well-written SOP?",
            "options": [
                "Clear step-by-step instructions",
                "Safety precautions",
                "Quality standards",
                "All of the above"
            ],
            "answer": "All of the above",
            "type": "choice",
            "difficulty": "medium",
            "source_text": sop_text[:100] + "...",
            "tags": ["sop", "documentation"]
        },
        {
            "sop_topic": "SOP Training",
            "question": "How often should employees be trained on SOPs?",
            "options": [],
            "answer": "Regularly, especially when SOPs are updated or new employees join",
            "type": "fill_blank",
            "difficulty": "medium",
            "source_text": sop_text[:100] + "...",
            "tags": ["sop", "training"]
        }
    ]
    
    # Add more questions if SOP text is longer
    if len(sop_text) > 500:
        additional_questions = [
            {
                "sop_topic": "Advanced SOP Topics",
                "question": "What is the role of management in SOP implementation?",
                "options": [
                    "To ignore SOPs completely",
                    "To provide leadership and ensure compliance",
                    "To create unnecessary complexity",
                    "To avoid responsibility"
                ],
                "answer": "To provide leadership and ensure compliance",
                "type": "choice",
                "difficulty": "hard",
                "source_text": sop_text[:100] + "...",
                "tags": ["sop", "management"]
            },
            {
                "sop_topic": "SOP Review Process",
                "question": "Who should be involved in reviewing and updating SOPs?",
                "options": [],
                "answer": "Subject matter experts, employees who use the procedures, and management",
                "type": "fill_blank",
                "difficulty": "hard",
                "source_text": sop_text[:100] + "...",
                "tags": ["sop", "review"]
            }
        ]
        quiz_items.extend(additional_questions)
    
    return quiz_items

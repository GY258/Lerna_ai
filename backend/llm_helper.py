import requests
import json
from typing import List, Optional

# DeepSeek AI API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = "your-deepseek-api-key-here"  # Replace with actual API key

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

        # For now, return a simple response since we don't have the actual API key
        # In a real implementation, this would call the DeepSeek API
        if "food safety" in topic.lower() or "食品安全" in user_message:
            return "好的，让我们来测试你的食品安全处理技能。请描述一下，如果发现厨房里有食材变质的情况，你会如何处理？"
        elif "customer service" in topic.lower() or "客户服务" in user_message:
            return "很好！让我们测试你的客户服务技能。请告诉我，如果遇到一位对菜品不满意的顾客，你会如何应对？"
        else:
            return f"欢迎来到{topic}技能测试！请告诉我你想要测试的具体方面，我会为你提供相应的测试场景和指导。"

    except Exception as e:
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

        # Simple feedback response
        return f"""
**优点认可：** 你的回应显示了良好的问题意识，能够识别场景中的关键问题。

**改进建议：** 可以更详细地描述具体的处理步骤，并考虑更多的细节情况。

**具体行动建议：** 建议在实际工作中多练习类似场景，并记录处理经验以便改进。
"""

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

        return f"关于你的问题'{user_question}'，我建议你从{topic}的基础知识开始，然后逐步深入。建议多进行实践练习，这样能更好地掌握相关技能。"

    except Exception as e:
        return f"抱歉，我无法回答这个问题：{str(e)}"

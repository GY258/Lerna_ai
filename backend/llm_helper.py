import requests
import json
import re
from typing import List, Optional
from .config import DEEPSEEK_API_URL, get_deepseek_api_key

def extract_and_validate_json(response_text: str) -> str:
    """
    Extract and validate JSON from LLM response, handling common formatting issues
    """
    try:
        # Remove common prefixes and suffixes that LLMs sometimes add
        cleaned_text = response_text.strip()
        
        # Remove various prefixes
        cleaned_text = re.sub(r'^["\s]*json["\s]*', '', cleaned_text, flags=re.IGNORECASE)
        cleaned_text = re.sub(r'^```json\s*', '', cleaned_text, flags=re.IGNORECASE)
        cleaned_text = re.sub(r'^json\s*', '', cleaned_text, flags=re.IGNORECASE)
        cleaned_text = re.sub(r'\s*```\s*$', '', cleaned_text)
        
        # Find JSON content between braces (greedy match to get complete JSON)
        json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
        else:
            # If no braces found, use the cleaned text
            json_str = cleaned_text.strip()
        
        # Try to parse the JSON to validate it
        parsed = json.loads(json_str)
        
        # Validate required fields
        required_fields = ['overall_evaluation', 'analysis_feedback', 'solution_feedback', 
                         'professionalism_feedback', 'improvement_suggestions', 'scores', 'pass']
        
        missing_fields = [field for field in required_fields if field not in parsed]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        # Validate scores structure
        if 'scores' in parsed and isinstance(parsed['scores'], dict):
            score_fields = ['analysis', 'solution', 'professionalism', 'improvement', 'weighted_total']
            for field in score_fields:
                if field not in parsed['scores']:
                    parsed['scores'][field] = 0
        
        # Ensure redlines and assumptions are arrays
        if 'redlines' not in parsed or not isinstance(parsed['redlines'], list):
            parsed['redlines'] = []
        if 'assumptions' not in parsed or not isinstance(parsed['assumptions'], list):
            parsed['assumptions'] = []
        
        # Return the cleaned and validated JSON
        return json.dumps(parsed, ensure_ascii=False, indent=2)
        
    except (json.JSONDecodeError, ValueError) as e:
        # If JSON parsing fails, return a fallback structured response
        fallback_response = {
            "overall_evaluation": "系统解析反馈时出现问题，请重新尝试",
            "analysis_feedback": "无法解析分析反馈，请重新生成",
            "solution_feedback": "无法解析解决方案反馈，请重新生成", 
            "professionalism_feedback": "无法解析专业性反馈，请重新生成",
            "improvement_suggestions": "建议重新提交分析以获得准确反馈",
            "scores": {
                "analysis": 0,
                "solution": 0,
                "professionalism": 0,
                "improvement": 0,
                "weighted_total": 0
            },
            "pass": False,
            "redlines": [f"JSON解析错误: {str(e)}"],
            "assumptions": ["由于解析错误，无法提供准确评估"]
        }
        return json.dumps(fallback_response, ensure_ascii=False, indent=2)

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
    - Structured JSON output
    - Weights & rubric aligned with Laicai SOP & safety standards
    - Redline penalties; pass threshold
    """
    try:
        # Debug: Print user response details
        print(f"[DEBUG] Received user_response: '{user_response}'")
        print(f"[DEBUG] Length: {len(user_response)} characters")
        print(f"[DEBUG] Is empty or whitespace: {not user_response.strip()}")
        
        prompt = f"""
你是一名面向“来菜”连锁餐厅的资深培训考官与质量教练。请基于公司强调的：
- 标准化与SOP/SOC执行（出品一致、操作卡、时间/火候/配比）
- 食安与安全（消防/燃气/用电/高压锅、温控、交叉污染、留样）
- 成本与产能（损耗、油量与用料、出菜时长、峰值产能）
- 供应链协同（缺料应急、替代方案、前厅联动）
- 数据与复盘（记录、复盘闭环、培训跟进）

对员工“问题解决类”作答进行评估。务必客观、克制臆断；如信息不足，请先显式提出“合理假设”。

【案例信息】
- 标题：{case_title}
- 背景：{case_background}
- 问题：{case_problem}

【作答角色/能力维度】
- 角色：{user_role}
- 能力维度：{skill_dimension}

【员工作答】
{user_response}

【评估要求】
1) 采用如下权重与评分（每项1-5分，支持小数）：
   - 分析质量（30%）：问题识别是否准确；原因分析是否深入；考虑因素是否覆盖SOP/安全/成本/供给。
   - 解决方案（40%）：行动可执行性；资源与约束匹配度（人/锅/时段/备料）；风险控制与优先级。
   - 专业性（20%）：是否体现“{user_role}”应有专业深度；是否正确运用“{skill_dimension}”方法与术语；思路清晰。
   - 改进建议（10%）：具体、可落地、可度量（含培训/记录/复盘）。
2) 红线扣分（任一触发则总分≤2.0，并在redlines中列出）：
   - 违背安全底线（如油锅用水扑救、燃气未关、带病设备继续用、高压锅隐患不停用）
   - 重大食安风险（温控/生熟不分/交叉污染/留样缺失）
   - 严重背离SOP导致出品或顾客安全风险
3) 通过线：总评≥3.5为"通过"，<3.5为"需改进"。
4) 语气专业且鼓励；总字数≤200字；每个部分2-3句。
5) **重要**：仅输出有效的JSON格式，不要添加任何前缀文字、说明或代码块标记。直接从大括号开始输出。

【JSON输出字段与示例】
{{
  "overall_evaluation": "整体结论（≤40字）",
  "analysis_feedback": "针对分析质量的点评（2-3句）",
  "solution_feedback": "针对解决方案的点评（2-3句）",
  "professionalism_feedback": "针对专业性的点评（2-3句）",
  "improvement_suggestions": "针对改进的具体建议（2-3句）",
  "scores": {{
    "analysis": 0-5,
    "solution": 0-5,
    "professionalism": 0-5,
    "improvement": 0-5,
    "weighted_total": 0-5
  }},
  "pass": true/false,
  "redlines": ["若无则空数组"],
  "assumptions": ["若无则空数组"]
}}

请严格按照以上格式输出JSON，不要添加任何解释文字或标记。
"""
        # Get the raw response from DeepSeek
        raw_response = call_deepseek_api(prompt, max_tokens=800, temperature=0.4)
        
        # Clean and extract JSON from the response
        cleaned_json = extract_and_validate_json(raw_response)
        return cleaned_json
        
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

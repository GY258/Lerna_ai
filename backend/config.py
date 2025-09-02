"""
Configuration file for Lerna AI backend
"""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# DeepSeek AI API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Get API key from environment variable or use default
def get_deepseek_api_key() -> str:
    """
    Get DeepSeek API key from environment variable or return default
    """
    api_key = os.getenv("DEEPSEEK_API_KEY", "your-deepseek-api-key-here")
    return api_key

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lerna_ai.db")

# Server configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # Allow all origins in development
]

# LLM configuration
LLM_MODEL = "deepseek-chat"
LLM_MAX_TOKENS = 1000
LLM_TEMPERATURE = 0.7

# HR evaluation configuration
HR_EVALUATION_ENABLED = True
HR_FALLBACK_MODE = False  # Set to True to use fallback responses instead of LLM calls

# Skill dimensions configuration for different roles
SKILL_DIMENSIONS = {
    "roles": {
        "store_manager": {
            "skill_dimensions": [
                {
                    "name": "运营与标准执行",
                    "preferred_mode": "problem-solving",
                    "secondary_mode": "roleplay",
                    "notes": "以流程稽核/整改方案为主；可用巡检抽查对话做补充。"
                },
                {
                    "name": "财务与成本管理",
                    "preferred_mode": "problem-solving",
                    "notes": "报表解读—>原因分析—>改善措施—>KPI跟踪。"
                },
                {
                    "name": "顾客体验与客诉闭环",
                    "preferred_mode": "roleplay",
                    "secondary_mode": "problem-solving",
                    "notes": "现场安抚与沟通需角色扮演；月度复盘用案例解决。"
                },
                {
                    "name": "团队管理与人事",
                    "preferred_mode": "roleplay",
                    "notes": "面谈、冲突化解、绩效反馈等高情境沟通。"
                },
                {
                    "name": "应急与跨部门协同",
                    "preferred_mode": "roleplay",
                    "notes": "停电/消防/食安突发需临场指挥与口令演练。"
                },
                {
                    "name": "排班与人效管理",
                    "preferred_mode": "problem-solving",
                    "secondary_mode": "roleplay",
                    "notes": "以预测与排班方案推演为主；临时换班/员工诉求用RP。"
                },
                {
                    "name": "供应链保障",
                    "preferred_mode": "problem-solving",
                    "secondary_mode": "roleplay",
                    "notes": "缺货/周转案例推演为主；供应商/总部沟通可RP。"
                }
            ]
        },
        "head_chef": {
            "skill_dimensions": [
                {
                    "name": "菜品与标准化",
                    "preferred_mode": "roleplay",
                    "secondary_mode": "problem-solving",
                    "notes": "现场口味纠偏与教练式反馈用RP；偏差追踪与改进用PS。"
                },
                {
                    "name": "食安与安全管理",
                    "preferred_mode": "roleplay",
                    "secondary_mode": "problem-solving",
                    "notes": "事故处置/演练用RP；日常检查表与整改闭环用PS。"
                },
                {
                    "name": "成本与毛利控制",
                    "preferred_mode": "problem-solving",
                    "notes": "损耗/配比/份量控制以数据与流程案例为主。"
                },
                {
                    "name": "出菜与产能",
                    "preferred_mode": "roleplay",
                    "secondary_mode": "problem-solving",
                    "notes": "高峰协调、口令与节奏控制RP；瓶颈分析与产能提升PS。"
                },
                {
                    "name": "团队与培训",
                    "preferred_mode": "roleplay",
                    "notes": "带教、纠偏、反馈对话与班后复盘对话。"
                },
                {
                    "name": "供应链协同",
                    "preferred_mode": "problem-solving",
                    "secondary_mode": "roleplay",
                    "notes": "到货延迟/替代方案/菜单调整为主；跨部门沟通可RP。"
                }
            ]
        }
    }
}


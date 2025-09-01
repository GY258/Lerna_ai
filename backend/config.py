"""
Configuration file for Lerna AI backend
"""

import os
from typing import Optional

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
                "运营与标准执行",
                "财务与成本管理",
                "顾客体验与客诉闭环",
                "团队管理与人事",
                "应急与跨部门协同",
                "排班与人效管理",
                "供应链保障"
            ]
        },
        "head_chef": {
            "skill_dimensions": [
                "菜品与标准化",
                "食安与安全管理",
                "成本与毛利控制",
                "出菜与产能",
                "团队与培训",
                "供应链协同"
            ]
        }
    }
}


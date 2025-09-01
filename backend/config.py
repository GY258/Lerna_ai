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


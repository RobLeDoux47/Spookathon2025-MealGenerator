from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Meal Generator"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/meal_generator"
    TEST_DATABASE_URL: str = "postgresql://user:password@localhost/meal_generator_test"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # External APIs
    USDA_API_KEY: Optional[str] = None
    EDAMAM_APP_ID: Optional[str] = None
    EDAMAM_APP_KEY: Optional[str] = None
    
    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000", 
        "http://localhost:8080",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

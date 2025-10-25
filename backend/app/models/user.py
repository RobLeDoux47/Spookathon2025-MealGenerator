from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User preferences
    dietary_restrictions = Column(Text)  # JSON string
    allergies = Column(Text)  # JSON string
    cuisine_preferences = Column(Text)  # JSON string
    
    # Relationships
    nutrition_goals = relationship("NutritionGoal", back_populates="user")
    user_ingredients = relationship("UserIngredient", back_populates="user")
    meals = relationship("Meal", back_populates="user")

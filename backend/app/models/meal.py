from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id"), nullable=False)
    
    # Meal details
    meal_type = Column(String)  # "breakfast", "lunch", "dinner", "snack"
    planned_date = Column(DateTime)
    consumed_date = Column(DateTime)
    servings = Column(Float, default=1.0)
    
    # Nutrition totals for this meal
    total_calories = Column(Float)
    total_protein = Column(Float)
    total_carbs = Column(Float)
    total_fat = Column(Float)
    
    # Status
    is_consumed = Column(Boolean, default=False)
    rating = Column(Float)  # user rating 1-5
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="meals")
    recipe = relationship("Recipe", back_populates="meals")


class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Daily targets
    daily_calories = Column(Float)
    daily_protein = Column(Float)
    daily_carbs = Column(Float)
    daily_fat = Column(Float)
    daily_fiber = Column(Float)
    
    # Health goals
    goal_type = Column(String)  # "weight_loss", "muscle_gain", "maintenance", "health"
    target_weight = Column(Float)
    current_weight = Column(Float)
    
    # Activity level
    activity_level = Column(String)  # "sedentary", "light", "moderate", "active", "very_active"
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="nutrition_goals")

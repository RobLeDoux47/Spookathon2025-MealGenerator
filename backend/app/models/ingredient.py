from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String)  # e.g., "vegetables", "proteins", "grains"
    description = Column(Text)
    
    # Nutrition facts per 100g
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    fiber = Column(Float)
    sugar = Column(Float)
    sodium = Column(Float)
    
    # Micronutrients
    vitamin_c = Column(Float)
    calcium = Column(Float)
    iron = Column(Float)
    
    # Additional info
    unit = Column(String, default="g")  # default unit
    shelf_life_days = Column(Integer)  # typical shelf life
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user_ingredients = relationship("UserIngredient", back_populates="ingredient")
    recipe_ingredients = relationship("RecipeIngredient", back_populates="ingredient")


class UserIngredient(Base):
    __tablename__ = "user_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    expiration_date = Column(DateTime)
    purchase_date = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_ingredients")
    ingredient = relationship("Ingredient", back_populates="user_ingredients")

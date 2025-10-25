from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None
    vitamin_c: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    unit: str = "g"
    shelf_life_days: Optional[int] = None


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None
    vitamin_c: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    unit: Optional[str] = None
    shelf_life_days: Optional[int] = None


class Ingredient(IngredientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserIngredientBase(BaseModel):
    ingredient_id: int
    quantity: float
    unit: str
    expiration_date: Optional[datetime] = None


class UserIngredientCreate(UserIngredientBase):
    pass


class UserIngredientUpdate(BaseModel):
    quantity: Optional[float] = None
    unit: Optional[str] = None
    expiration_date: Optional[datetime] = None


class UserIngredient(UserIngredientBase):
    id: int
    purchase_date: datetime
    ingredient: Ingredient

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .recipe import Recipe


class MealBase(BaseModel):
    recipe_id: int
    meal_type: str
    planned_date: Optional[datetime] = None
    servings: float = 1.0


class MealCreate(MealBase):
    pass


class MealUpdate(BaseModel):
    recipe_id: Optional[int] = None
    meal_type: Optional[str] = None
    planned_date: Optional[datetime] = None
    servings: Optional[float] = None
    is_consumed: Optional[bool] = None
    rating: Optional[float] = None


class Meal(MealBase):
    id: int
    consumed_date: Optional[datetime] = None
    total_calories: Optional[float] = None
    total_protein: Optional[float] = None
    total_carbs: Optional[float] = None
    total_fat: Optional[float] = None
    is_consumed: bool = False
    rating: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    recipe: "Recipe"

    class Config:
        from_attributes = True


class NutritionGoalBase(BaseModel):
    daily_calories: Optional[float] = None
    daily_protein: Optional[float] = None
    daily_carbs: Optional[float] = None
    daily_fat: Optional[float] = None
    daily_fiber: Optional[float] = None
    goal_type: Optional[str] = None
    target_weight: Optional[float] = None
    current_weight: Optional[float] = None
    activity_level: Optional[str] = None


class NutritionGoalCreate(NutritionGoalBase):
    pass


class NutritionGoalUpdate(BaseModel):
    daily_calories: Optional[float] = None
    daily_protein: Optional[float] = None
    daily_carbs: Optional[float] = None
    daily_fat: Optional[float] = None
    daily_fiber: Optional[float] = None
    goal_type: Optional[str] = None
    target_weight: Optional[float] = None
    current_weight: Optional[float] = None
    activity_level: Optional[str] = None
    is_active: Optional[bool] = None


class NutritionGoal(NutritionGoalBase):
    id: int
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .ingredient import Ingredient


class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity: float
    unit: str
    notes: Optional[str] = None


class RecipeIngredientCreate(RecipeIngredientBase):
    pass


class RecipeIngredient(RecipeIngredientBase):
    id: int
    ingredient: "Ingredient"

    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    name: str
    description: Optional[str] = None
    instructions: str
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: int = 1
    difficulty: Optional[str] = None
    cuisine_type: Optional[str] = None


class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredientCreate]


class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    servings: Optional[int] = None
    difficulty: Optional[str] = None
    cuisine_type: Optional[str] = None


class Recipe(RecipeBase):
    id: int
    calories_per_serving: Optional[float] = None
    protein_per_serving: Optional[float] = None
    carbs_per_serving: Optional[float] = None
    fat_per_serving: Optional[float] = None
    is_ai_generated: bool = False
    rating: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None
    ingredients: List[RecipeIngredient] = []

    class Config:
        from_attributes = True


# Frontend-compatible schemas
class RecipeMacros(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float


class FrontendRecipe(BaseModel):
    name: str
    servings: int
    macros: RecipeMacros
    ingredients: List[str]
    instructions: List[str]
    id: Optional[int] = None
    description: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    cook_time_minutes: Optional[int] = None
    difficulty: Optional[str] = None
    cuisine_type: Optional[str] = None


class UserInfo(BaseModel):
    height: str
    weight: str
    heightUnit: str  # 'metric' | 'imperial'
    weightUnit: str   # 'metric' | 'imperial'


class MealGenerationRequest(BaseModel):
    available_ingredients: List[int]  # ingredient IDs
    meal_type: str  # "breakfast", "lunch", "dinner", "snack"
    servings: int = 1
    dietary_restrictions: Optional[List[str]] = None
    cuisine_preference: Optional[str] = None
    max_prep_time: Optional[int] = None  # minutes


class MealGenerationResponse(BaseModel):
    recipe: Recipe
    confidence_score: float
    missing_ingredients: List[str] = []
    substitutions: List[dict] = []

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.recipe import Recipe, RecipeIngredient
from ..models.user import User
from ..schemas.recipe import (
    Recipe as RecipeSchema,
    RecipeCreate,
    RecipeUpdate,
    MealGenerationRequest,
    MealGenerationResponse
)
from ..api.deps import get_current_active_user
from ..services.meal_generation import MealGenerationService

router = APIRouter()


@router.get("/", response_model=List[RecipeSchema])
def get_recipes(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    cuisine_type: str = None,
    difficulty: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Recipe)
    
    if search:
        query = query.filter(Recipe.name.ilike(f"%{search}%"))
    if cuisine_type:
        query = query.filter(Recipe.cuisine_type == cuisine_type)
    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{recipe_id}", response_model=RecipeSchema)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/", response_model=RecipeSchema)
def create_recipe(
    recipe: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Create recipe
    db_recipe = Recipe(
        name=recipe.name,
        description=recipe.description,
        instructions=recipe.instructions,
        prep_time_minutes=recipe.prep_time_minutes,
        cook_time_minutes=recipe.cook_time_minutes,
        servings=recipe.servings,
        difficulty=recipe.difficulty,
        cuisine_type=recipe.cuisine_type
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    # Add ingredients
    for ingredient_data in recipe.ingredients:
        db_ingredient = RecipeIngredient(
            recipe_id=db_recipe.id,
            ingredient_id=ingredient_data.ingredient_id,
            quantity=ingredient_data.quantity,
            unit=ingredient_data.unit,
            notes=ingredient_data.notes
        )
        db.add(db_ingredient)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.put("/{recipe_id}", response_model=RecipeSchema)
def update_recipe(
    recipe_id: int,
    recipe: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    update_data = recipe.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_recipe, field, value)
    
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not db_recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe deleted successfully"}


@router.post("/generate", response_model=MealGenerationResponse)
def generate_meal(
    request: MealGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal_service = MealGenerationService(db)
    return meal_service.generate_meal(request, current_user)

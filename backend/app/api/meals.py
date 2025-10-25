from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
from ..core.database import get_db
from ..models.meal import Meal, NutritionGoal
from ..models.user import User
from ..schemas.meal import (
    Meal as MealSchema,
    MealCreate,
    MealUpdate,
    NutritionGoal as NutritionGoalSchema,
    NutritionGoalCreate,
    NutritionGoalUpdate
)
from ..api.deps import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[MealSchema])
def get_meals(
    skip: int = 0,
    limit: int = 100,
    meal_type: str = None,
    planned_date: date = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Meal).filter(Meal.user_id == current_user.id)
    
    if meal_type:
        query = query.filter(Meal.meal_type == meal_type)
    if planned_date:
        query = query.filter(Meal.planned_date == planned_date)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{meal_id}", response_model=MealSchema)
def get_meal(
    meal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal


@router.post("/", response_model=MealSchema)
def create_meal(
    meal: MealCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_meal = Meal(
        user_id=current_user.id,
        recipe_id=meal.recipe_id,
        meal_type=meal.meal_type,
        planned_date=meal.planned_date,
        servings=meal.servings
    )
    db.add(db_meal)
    db.commit()
    db.refresh(db_meal)
    return db_meal


@router.put("/{meal_id}", response_model=MealSchema)
def update_meal(
    meal_id: int,
    meal: MealUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()
    
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    update_data = meal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_meal, field, value)
    
    db.commit()
    db.refresh(db_meal)
    return db_meal


@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()
    
    if not db_meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(db_meal)
    db.commit()
    return {"message": "Meal deleted successfully"}


# Nutrition Goals endpoints
@router.get("/nutrition-goals/", response_model=List[NutritionGoalSchema])
def get_nutrition_goals(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id,
        NutritionGoal.is_active == True
    ).all()


@router.post("/nutrition-goals/", response_model=NutritionGoalSchema)
def create_nutrition_goal(
    goal: NutritionGoalCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Deactivate existing goals
    db.query(NutritionGoal).filter(
        NutritionGoal.user_id == current_user.id
    ).update({"is_active": False})
    
    db_goal = NutritionGoal(
        user_id=current_user.id,
        **goal.dict()
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.put("/nutrition-goals/{goal_id}", response_model=NutritionGoalSchema)
def update_nutrition_goal(
    goal_id: int,
    goal: NutritionGoalUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_goal = db.query(NutritionGoal).filter(
        NutritionGoal.id == goal_id,
        NutritionGoal.user_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(status_code=404, detail="Nutrition goal not found")
    
    update_data = goal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_goal, field, value)
    
    db.commit()
    db.refresh(db_goal)
    return db_goal

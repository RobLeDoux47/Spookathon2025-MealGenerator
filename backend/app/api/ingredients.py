from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models.ingredient import Ingredient, UserIngredient
from ..models.user import User
from ..schemas.ingredient import (
    Ingredient as IngredientSchema,
    IngredientCreate,
    IngredientUpdate,
    UserIngredient as UserIngredientSchema,
    UserIngredientCreate,
    UserIngredientUpdate
)
from ..api.deps import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[IngredientSchema])
def get_ingredients(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ingredient)
    
    if search:
        query = query.filter(Ingredient.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Ingredient.category == category)
    
    return query.offset(skip).limit(limit).all()


@router.get("/{ingredient_id}", response_model=IngredientSchema)
def get_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.post("/", response_model=IngredientSchema)
def create_ingredient(
    ingredient: IngredientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_ingredient = Ingredient(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@router.put("/{ingredient_id}", response_model=IngredientSchema)
def update_ingredient(
    ingredient_id: int,
    ingredient: IngredientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not db_ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    update_data = ingredient.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ingredient, field, value)
    
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


# User Ingredients endpoints
@router.get("/user/", response_model=List[UserIngredientSchema])
def get_user_ingredients(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(UserIngredient).filter(UserIngredient.user_id == current_user.id).all()


@router.post("/user/", response_model=UserIngredientSchema)
def add_user_ingredient(
    user_ingredient: UserIngredientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify ingredient exists
    ingredient = db.query(Ingredient).filter(Ingredient.id == user_ingredient.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db_user_ingredient = UserIngredient(
        user_id=current_user.id,
        **user_ingredient.dict()
    )
    db.add(db_user_ingredient)
    db.commit()
    db.refresh(db_user_ingredient)
    return db_user_ingredient


@router.put("/user/{user_ingredient_id}", response_model=UserIngredientSchema)
def update_user_ingredient(
    user_ingredient_id: int,
    user_ingredient: UserIngredientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_user_ingredient = db.query(UserIngredient).filter(
        UserIngredient.id == user_ingredient_id,
        UserIngredient.user_id == current_user.id
    ).first()
    
    if not db_user_ingredient:
        raise HTTPException(status_code=404, detail="User ingredient not found")
    
    update_data = user_ingredient.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user_ingredient, field, value)
    
    db.commit()
    db.refresh(db_user_ingredient)
    return db_user_ingredient


@router.delete("/user/{user_ingredient_id}")
def delete_user_ingredient(
    user_ingredient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_user_ingredient = db.query(UserIngredient).filter(
        UserIngredient.id == user_ingredient_id,
        UserIngredient.user_id == current_user.id
    ).first()
    
    if not db_user_ingredient:
        raise HTTPException(status_code=404, detail="User ingredient not found")
    
    db.delete(db_user_ingredient)
    db.commit()
    return {"message": "User ingredient deleted successfully"}

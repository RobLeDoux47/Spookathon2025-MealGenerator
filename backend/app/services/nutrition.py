from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from ..models.ingredient import Ingredient
from ..models.recipe import Recipe, RecipeIngredient
from ..models.meal import Meal
import pandas as pd


class NutritionService:
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_recipe_nutrition(self, recipe: Recipe, servings: float = 1.0) -> Dict[str, float]:
        """Calculate nutrition per serving for a recipe"""
        total_nutrition = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sugar": 0,
            "sodium": 0,
            "vitamin_c": 0,
            "calcium": 0,
            "iron": 0
        }
        
        for recipe_ingredient in recipe.recipe_ingredients:
            ingredient = recipe_ingredient.ingredient
            quantity = recipe_ingredient.quantity
            
            # Convert to grams if needed
            quantity_grams = self._convert_to_grams(quantity, recipe_ingredient.unit)
            
            # Calculate nutrition for this ingredient
            for nutrient in total_nutrition:
                if hasattr(ingredient, nutrient) and getattr(ingredient, nutrient):
                    # Nutrition values are per 100g, so divide by 100
                    total_nutrition[nutrient] += (getattr(ingredient, nutrient) * quantity_grams / 100)
        
        # Divide by servings to get per-serving nutrition
        for nutrient in total_nutrition:
            total_nutrition[nutrient] = round(total_nutrition[nutrient] / servings, 2)
        
        return total_nutrition
    
    def calculate_meal_nutrition(self, meal: Meal) -> Dict[str, float]:
        """Calculate total nutrition for a meal"""
        recipe_nutrition = self.calculate_recipe_nutrition(meal.recipe, meal.servings)
        return recipe_nutrition
    
    def calculate_daily_nutrition(self, user_id: int, date: str) -> Dict[str, float]:
        """Calculate total nutrition for a user on a specific date"""
        meals = self.db.query(Meal).filter(
            Meal.user_id == user_id,
            Meal.planned_date == date,
            Meal.is_consumed == True
        ).all()
        
        daily_nutrition = {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "fiber": 0,
            "sugar": 0,
            "sodium": 0,
            "vitamin_c": 0,
            "calcium": 0,
            "iron": 0
        }
        
        for meal in meals:
            meal_nutrition = self.calculate_meal_nutrition(meal)
            for nutrient in daily_nutrition:
                daily_nutrition[nutrient] += meal_nutrition.get(nutrient, 0)
        
        return daily_nutrition
    
    def analyze_nutrition_goals(self, user_id: int, date: str) -> Dict:
        """Analyze how well user is meeting their nutrition goals"""
        from ..models.meal import NutritionGoal
        
        # Get user's active nutrition goals
        goals = self.db.query(NutritionGoal).filter(
            NutritionGoal.user_id == user_id,
            NutritionGoal.is_active == True
        ).first()
        
        if not goals:
            return {"error": "No active nutrition goals found"}
        
        # Get daily nutrition
        daily_nutrition = self.calculate_daily_nutrition(user_id, date)
        
        # Calculate progress
        progress = {}
        goal_macros = {
            "calories": goals.daily_calories,
            "protein": goals.daily_protein,
            "carbs": goals.daily_carbs,
            "fat": goals.daily_fat,
            "fiber": goals.daily_fiber
        }
        
        for macro, goal_value in goal_macros.items():
            if goal_value and goal_value > 0:
                actual = daily_nutrition.get(macro, 0)
                percentage = (actual / goal_value) * 100
                progress[macro] = {
                    "goal": goal_value,
                    "actual": actual,
                    "percentage": round(percentage, 1),
                    "remaining": max(0, goal_value - actual)
                }
        
        return {
            "date": date,
            "daily_nutrition": daily_nutrition,
            "progress": progress,
            "goals": {
                "daily_calories": goals.daily_calories,
                "daily_protein": goals.daily_protein,
                "daily_carbs": goals.daily_carbs,
                "daily_fat": goals.daily_fat,
                "daily_fiber": goals.daily_fiber
            }
        }
    
    def suggest_meal_adjustments(self, user_id: int, date: str) -> List[Dict]:
        """Suggest adjustments to meet nutrition goals"""
        analysis = self.analyze_nutrition_goals(user_id, date)
        
        if "error" in analysis:
            return []
        
        suggestions = []
        progress = analysis["progress"]
        
        for macro, data in progress.items():
            if data["percentage"] < 80:  # Less than 80% of goal
                suggestions.append({
                    "type": "increase",
                    "nutrient": macro,
                    "current": data["actual"],
                    "needed": data["remaining"],
                    "suggestion": f"Consider adding foods rich in {macro} to reach your daily goal"
                })
            elif data["percentage"] > 120:  # More than 120% of goal
                suggestions.append({
                    "type": "decrease",
                    "nutrient": macro,
                    "current": data["actual"],
                    "excess": data["actual"] - data["goal"],
                    "suggestion": f"Consider reducing {macro} intake to stay within your goal"
                })
        
        return suggestions
    
    def _convert_to_grams(self, quantity: float, unit: str) -> float:
        """Convert various units to grams"""
        unit_conversions = {
            "g": 1,
            "gram": 1,
            "grams": 1,
            "kg": 1000,
            "kilogram": 1000,
            "kg": 1000,
            "lb": 453.592,
            "pound": 453.592,
            "oz": 28.3495,
            "ounce": 28.3495,
            "cup": 240,  # Approximate for most ingredients
            "tbsp": 15,
            "tablespoon": 15,
            "tsp": 5,
            "teaspoon": 5,
            "ml": 1,
            "milliliter": 1,
            "l": 1000,
            "liter": 1000,
            "fl oz": 29.5735,
            "fluid ounce": 29.5735
        }
        
        return quantity * unit_conversions.get(unit.lower(), 1)

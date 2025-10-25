from typing import List, Optional
from pydantic import BaseModel, validator
import re


class NutritionValidator:
    @staticmethod
    def validate_calories(calories: Optional[float]) -> bool:
        """Validate calorie value"""
        if calories is None:
            return True
        return 0 <= calories <= 10000  # Reasonable range
    
    @staticmethod
    def validate_macros(protein: Optional[float], carbs: Optional[float], fat: Optional[float]) -> bool:
        """Validate macro values"""
        for macro in [protein, carbs, fat]:
            if macro is not None and (macro < 0 or macro > 1000):
                return False
        return True
    
    @staticmethod
    def validate_servings(servings: int) -> bool:
        """Validate serving count"""
        return 1 <= servings <= 20
    
    @staticmethod
    def validate_cooking_time(time_minutes: Optional[int]) -> bool:
        """Validate cooking time"""
        if time_minutes is None:
            return True
        return 0 <= time_minutes <= 1440  # Max 24 hours


class IngredientValidator:
    @staticmethod
    def validate_ingredient_name(name: str) -> bool:
        """Validate ingredient name"""
        if not name or len(name.strip()) < 2:
            return False
        if len(name) > 100:
            return False
        # Check for valid characters
        return re.match(r'^[a-zA-Z0-9\s\-\.\']+$', name) is not None
    
    @staticmethod
    def validate_quantity(quantity: float) -> bool:
        """Validate ingredient quantity"""
        return 0 < quantity <= 10000  # Reasonable range
    
    @staticmethod
    def validate_unit(unit: str) -> bool:
        """Validate measurement unit"""
        valid_units = [
            'g', 'gram', 'grams', 'kg', 'kilogram', 'kg',
            'lb', 'pound', 'oz', 'ounce',
            'cup', 'cups', 'tbsp', 'tablespoon', 'tsp', 'teaspoon',
            'ml', 'milliliter', 'l', 'liter', 'fl oz', 'fluid ounce',
            'serving', 'servings', 'piece', 'pieces', 'slice', 'slices'
        ]
        return unit.lower() in valid_units


class UserValidator:
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username"""
        if not username or len(username) < 3:
            return False
        if len(username) > 50:
            return False
        # Only alphanumeric and underscores
        return re.match(r'^[a-zA-Z0-9_]+$', username) is not None
    
    @staticmethod
    def validate_password(password: str) -> bool:
        """Validate password strength"""
        if len(password) < 8:
            return False
        if len(password) > 128:
            return False
        # At least one letter and one number
        has_letter = re.search(r'[a-zA-Z]', password)
        has_number = re.search(r'\d', password)
        return has_letter and has_number
    
    @staticmethod
    def validate_dietary_restrictions(restrictions: Optional[List[str]]) -> bool:
        """Validate dietary restrictions list"""
        if restrictions is None:
            return True
        
        valid_restrictions = [
            'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
            'nut-free', 'soy-free', 'keto', 'paleo', 'low-carb',
            'low-sodium', 'diabetic-friendly', 'halal', 'kosher'
        ]
        
        return all(restriction.lower() in valid_restrictions for restriction in restrictions)
    
    @staticmethod
    def validate_allergies(allergies: Optional[List[str]]) -> bool:
        """Validate allergies list"""
        if allergies is None:
            return True
        
        valid_allergies = [
            'nuts', 'peanuts', 'tree-nuts', 'dairy', 'eggs', 'soy',
            'wheat', 'gluten', 'fish', 'shellfish', 'sesame',
            'mustard', 'celery', 'lupin', 'sulfites'
        ]
        
        return all(allergy.lower() in valid_allergies for allergy in allergies)


class MealValidator:
    @staticmethod
    def validate_meal_type(meal_type: str) -> bool:
        """Validate meal type"""
        valid_types = ['breakfast', 'lunch', 'dinner', 'snack']
        return meal_type.lower() in valid_types
    
    @staticmethod
    def validate_rating(rating: Optional[float]) -> bool:
        """Validate meal rating"""
        if rating is None:
            return True
        return 1.0 <= rating <= 5.0
    
    @staticmethod
    def validate_goal_type(goal_type: Optional[str]) -> bool:
        """Validate nutrition goal type"""
        if goal_type is None:
            return True
        
        valid_goals = ['weight_loss', 'muscle_gain', 'maintenance', 'health']
        return goal_type.lower() in valid_goals
    
    @staticmethod
    def validate_activity_level(activity_level: Optional[str]) -> bool:
        """Validate activity level"""
        if activity_level is None:
            return True
        
        valid_levels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
        return activity_level.lower() in valid_levels

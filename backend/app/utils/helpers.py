from typing import List, Dict, Any
import re
from datetime import datetime, timedelta


def clean_ingredient_name(name: str) -> str:
    """Clean and standardize ingredient names"""
    # Remove extra whitespace
    name = re.sub(r'\s+', ' ', name.strip())
    
    # Remove common prefixes/suffixes
    name = re.sub(r'^(fresh|dried|frozen|canned|organic)\s+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+(chopped|diced|sliced|grated|minced)$', '', name, flags=re.IGNORECASE)
    
    # Standardize common variations
    replacements = {
        'tomatoes': 'tomato',
        'potatoes': 'potato',
        'onions': 'onion',
        'peppers': 'pepper',
        'carrots': 'carrot'
    }
    
    for plural, singular in replacements.items():
        if name.lower().endswith(plural):
            name = name[:-len(plural)] + singular
    
    return name.title()


def parse_quantity_unit(text: str) -> tuple:
    """Parse quantity and unit from text like '2 cups' or '500g'"""
    # Remove extra whitespace
    text = text.strip()
    
    # Try to extract number and unit
    match = re.match(r'^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?', text)
    if match:
        quantity = float(match.group(1))
        unit = match.group(2) or 'serving'
        return quantity, unit
    
    # If no number found, assume 1 serving
    return 1.0, 'serving'


def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
    if gender.lower() == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:  # female
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    return bmr


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """Calculate Total Daily Energy Expenditure"""
    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    
    multiplier = activity_multipliers.get(activity_level.lower(), 1.2)
    return bmr * multiplier


def calculate_macro_targets(calories: float, goal_type: str) -> Dict[str, float]:
    """Calculate macro targets based on calories and goal type"""
    if goal_type == 'weight_loss':
        protein_ratio = 0.3
        carb_ratio = 0.4
        fat_ratio = 0.3
    elif goal_type == 'muscle_gain':
        protein_ratio = 0.35
        carb_ratio = 0.45
        fat_ratio = 0.2
    else:  # maintenance
        protein_ratio = 0.25
        carb_ratio = 0.5
        fat_ratio = 0.25
    
    return {
        'protein': round(calories * protein_ratio / 4),  # 4 cal/g
        'carbs': round(calories * carb_ratio / 4),       # 4 cal/g
        'fat': round(calories * fat_ratio / 9)           # 9 cal/g
    }


def format_nutrition_label(nutrition: Dict[str, float]) -> str:
    """Format nutrition data as a readable label"""
    label = f"Calories: {nutrition.get('calories', 0):.0f}\n"
    label += f"Protein: {nutrition.get('protein', 0):.1f}g\n"
    label += f"Carbs: {nutrition.get('carbs', 0):.1f}g\n"
    label += f"Fat: {nutrition.get('fat', 0):.1f}g\n"
    label += f"Fiber: {nutrition.get('fiber', 0):.1f}g"
    
    return label


def get_expiration_reminder(expiration_date: datetime) -> str:
    """Get reminder message for ingredient expiration"""
    days_until_expiry = (expiration_date - datetime.now()).days
    
    if days_until_expiry < 0:
        return f"Expired {abs(days_until_expiry)} days ago"
    elif days_until_expiry == 0:
        return "Expires today"
    elif days_until_expiry == 1:
        return "Expires tomorrow"
    elif days_until_expiry <= 3:
        return f"Expires in {days_until_expiry} days"
    else:
        return f"Expires in {days_until_expiry} days"


def validate_email(email: str) -> bool:
    """Simple email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def generate_meal_plan_id() -> str:
    """Generate a unique meal plan ID"""
    import uuid
    return str(uuid.uuid4())[:8]


def calculate_recipe_difficulty(prep_time: int, cook_time: int, ingredient_count: int) -> str:
    """Calculate recipe difficulty based on time and complexity"""
    total_time = prep_time + cook_time
    complexity_score = 0
    
    # Time factor
    if total_time <= 30:
        complexity_score += 1
    elif total_time <= 60:
        complexity_score += 2
    else:
        complexity_score += 3
    
    # Ingredient count factor
    if ingredient_count <= 5:
        complexity_score += 1
    elif ingredient_count <= 10:
        complexity_score += 2
    else:
        complexity_score += 3
    
    if complexity_score <= 2:
        return "easy"
    elif complexity_score <= 4:
        return "medium"
    else:
        return "hard"

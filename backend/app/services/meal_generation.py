import openai
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..models.ingredient import Ingredient, UserIngredient
from ..models.recipe import Recipe, RecipeIngredient
from ..models.user import User
from ..schemas.recipe import MealGenerationRequest, MealGenerationResponse, Recipe as RecipeSchema
from ..core.config import settings
import json
import random


class MealGenerationService:
    def __init__(self, db: Session):
        self.db = db
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def generate_meal(self, request: MealGenerationRequest, user: User) -> MealGenerationResponse:
        # Get available ingredients
        available_ingredients = self._get_available_ingredients(request.available_ingredients)
        
        # Get user preferences
        user_preferences = self._get_user_preferences(user)
        
        # Generate recipe using OpenAI
        recipe_data = self._generate_recipe_with_ai(
            available_ingredients,
            request,
            user_preferences
        )
        
        # Create recipe in database
        recipe = self._create_recipe_from_ai(recipe_data)
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(recipe, available_ingredients)
        
        # Find missing ingredients and substitutions
        missing_ingredients, substitutions = self._analyze_ingredients(recipe, available_ingredients)
        
        return MealGenerationResponse(
            recipe=recipe,
            confidence_score=confidence_score,
            missing_ingredients=missing_ingredients,
            substitutions=substitutions
        )
    
    def _get_available_ingredients(self, ingredient_ids: List[int]) -> List[Dict]:
        ingredients = self.db.query(Ingredient).filter(Ingredient.id.in_(ingredient_ids)).all()
        return [
            {
                "id": ing.id,
                "name": ing.name,
                "category": ing.category,
                "calories": ing.calories,
                "protein": ing.protein,
                "carbs": ing.carbs,
                "fat": ing.fat
            }
            for ing in ingredients
        ]
    
    def _get_user_preferences(self, user: User) -> Dict:
        return {
            "dietary_restrictions": user.dietary_restrictions or [],
            "allergies": user.allergies or [],
            "cuisine_preferences": user.cuisine_preferences or []
        }
    
    def _generate_recipe_with_ai(self, ingredients: List[Dict], request: MealGenerationRequest, preferences: Dict) -> Dict:
        prompt = self._build_recipe_prompt(ingredients, request, preferences)
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional chef and nutritionist. Create detailed, healthy recipes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            recipe_text = response.choices[0].message.content
            return self._parse_ai_recipe(recipe_text)
            
        except Exception as e:
            # Fallback to simple recipe generation
            return self._generate_fallback_recipe(ingredients, request)
    
    def _build_recipe_prompt(self, ingredients: List[Dict], request: MealGenerationRequest, preferences: Dict) -> str:
        ingredient_list = ", ".join([ing["name"] for ing in ingredients])
        
        prompt = f"""
        Create a {request.meal_type} recipe using these available ingredients: {ingredient_list}
        
        Requirements:
        - Servings: {request.servings}
        - Meal type: {request.meal_type}
        - Max prep time: {request.max_prep_time or 'No limit'} minutes
        
        User preferences:
        - Dietary restrictions: {preferences.get('dietary_restrictions', 'None')}
        - Allergies: {preferences.get('allergies', 'None')}
        - Cuisine preference: {request.cuisine_preference or 'Any'}
        
        Please provide the recipe in this JSON format:
        {{
            "name": "Recipe Name",
            "description": "Brief description",
            "instructions": "Step-by-step cooking instructions",
            "prep_time_minutes": 15,
            "cook_time_minutes": 30,
            "difficulty": "easy|medium|hard",
            "cuisine_type": "cuisine type",
            "ingredients": [
                {{"name": "ingredient name", "quantity": 1, "unit": "cup", "notes": "optional notes"}}
            ]
        }}
        """
        return prompt
    
    def _parse_ai_recipe(self, recipe_text: str) -> Dict:
        try:
            # Try to extract JSON from the response
            start = recipe_text.find('{')
            end = recipe_text.rfind('}') + 1
            json_str = recipe_text[start:end]
            return json.loads(json_str)
        except:
            # If parsing fails, create a basic structure
            return {
                "name": "AI Generated Recipe",
                "description": "A delicious recipe created by AI",
                "instructions": recipe_text,
                "prep_time_minutes": 15,
                "cook_time_minutes": 30,
                "difficulty": "medium",
                "cuisine_type": "international",
                "ingredients": []
            }
    
    def _generate_fallback_recipe(self, ingredients: List[Dict], request: MealGenerationRequest) -> Dict:
        # Simple fallback recipe generation
        main_ingredient = ingredients[0] if ingredients else {"name": "available ingredients"}
        
        return {
            "name": f"Simple {request.meal_type.title()} with {main_ingredient['name']}",
            "description": f"A simple {request.meal_type} using available ingredients",
            "instructions": f"1. Prepare {main_ingredient['name']}\n2. Cook according to your preference\n3. Season to taste\n4. Serve hot",
            "prep_time_minutes": 10,
            "cook_time_minutes": 20,
            "difficulty": "easy",
            "cuisine_type": "simple",
            "ingredients": [
                {"name": ing["name"], "quantity": 1, "unit": "serving", "notes": ""}
                for ing in ingredients[:5]  # Limit to 5 ingredients
            ]
        }
    
    def _create_recipe_from_ai(self, recipe_data: Dict) -> RecipeSchema:
        # Create recipe in database
        db_recipe = Recipe(
            name=recipe_data["name"],
            description=recipe_data.get("description", ""),
            instructions=recipe_data["instructions"],
            prep_time_minutes=recipe_data.get("prep_time_minutes", 15),
            cook_time_minutes=recipe_data.get("cook_time_minutes", 30),
            servings=1,  # Will be adjusted based on request
            difficulty=recipe_data.get("difficulty", "medium"),
            cuisine_type=recipe_data.get("cuisine_type", "international"),
            is_ai_generated=True
        )
        
        self.db.add(db_recipe)
        self.db.commit()
        self.db.refresh(db_recipe)
        
        # Add ingredients
        for ing_data in recipe_data.get("ingredients", []):
            # Find or create ingredient
            ingredient = self.db.query(Ingredient).filter(
                Ingredient.name.ilike(f"%{ing_data['name']}%")
            ).first()
            
            if not ingredient:
                # Create placeholder ingredient
                ingredient = Ingredient(
                    name=ing_data["name"],
                    category="unknown",
                    calories=0,
                    protein=0,
                    carbs=0,
                    fat=0
                )
                self.db.add(ingredient)
                self.db.commit()
                self.db.refresh(ingredient)
            
            # Add to recipe
            recipe_ingredient = RecipeIngredient(
                recipe_id=db_recipe.id,
                ingredient_id=ingredient.id,
                quantity=ing_data.get("quantity", 1),
                unit=ing_data.get("unit", "serving"),
                notes=ing_data.get("notes", "")
            )
            self.db.add(recipe_ingredient)
        
        self.db.commit()
        self.db.refresh(db_recipe)
        
        # Convert to schema
        return RecipeSchema.from_orm(db_recipe)
    
    def _calculate_confidence_score(self, recipe: RecipeSchema, available_ingredients: List[Dict]) -> float:
        # Simple confidence calculation based on ingredient availability
        available_names = [ing["name"].lower() for ing in available_ingredients]
        recipe_ingredients = [ing.ingredient.name.lower() for ing in recipe.ingredients]
        
        matches = sum(1 for ing in recipe_ingredients if any(av in ing for av in available_names))
        total = len(recipe_ingredients)
        
        if total == 0:
            return 0.0
        
        return min(matches / total, 1.0)
    
    def _analyze_ingredients(self, recipe: RecipeSchema, available_ingredients: List[Dict]) -> tuple:
        available_names = [ing["name"].lower() for ing in available_ingredients]
        missing = []
        substitutions = []
        
        for recipe_ing in recipe.ingredients:
            ing_name = recipe_ing.ingredient.name.lower()
            if not any(av in ing_name for av in available_names):
                missing.append(recipe_ing.ingredient.name)
                # Find potential substitutions
                for av_ing in available_ingredients:
                    if av_ing["category"] == recipe_ing.ingredient.category:
                        substitutions.append({
                            "original": recipe_ing.ingredient.name,
                            "substitute": av_ing["name"]
                        })
                        break
        
        return missing, substitutions

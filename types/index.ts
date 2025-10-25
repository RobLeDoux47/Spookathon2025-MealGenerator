// Type definitions for the AI Meal Generator frontend

export interface UserInfo {
  height: string;
  weight: string;
  heightUnit: 'metric' | 'imperial';
  weightUnit: 'metric' | 'imperial';
}

export interface RecipeMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id?: number;
  name: string;
  servings: number;
  macros: RecipeMacros;
  ingredients: string[];
  instructions: string[];
  description?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  difficulty?: string;
  cuisine_type?: string;
}

export interface MealGenerationRequest {
  ingredients: string[];
  userInfo: UserInfo;
  meal_type?: string;
  servings?: number;
}

export interface MealGenerationResponse {
  recipe: Recipe;
  success: boolean;
  message?: string;
}




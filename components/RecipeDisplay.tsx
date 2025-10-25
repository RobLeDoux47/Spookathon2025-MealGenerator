import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Flame, Scale, TrendingUp, Droplet, RefreshCw } from 'lucide-react';
import type { Recipe, UserInfo } from '../App';

type Props = {
  recipe: Recipe;
  userInfo: UserInfo;
  ingredients: string[];
  onReset: () => void;
};

export function RecipeDisplay({ recipe, userInfo, ingredients, onReset }: Props) {
  // Calculate BMI for context
  const calculateBMI = () => {
    let heightNum = parseFloat(userInfo.height);
    let weightNum = parseFloat(userInfo.weight);
    
    // Convert height to cm if needed
    if (userInfo.heightUnit === 'imperial') {
      heightNum = heightNum * 2.54; // inches to cm
    }
    
    // Convert weight to kg if needed
    if (userInfo.weightUnit === 'imperial') {
      weightNum = weightNum * 0.453592; // lbs to kg
    }
    
    // Calculate BMI using metric (cm and kg)
    return (weightNum / ((heightNum / 100) ** 2)).toFixed(1);
  };

  const bmi = calculateBMI();

  return (
    <div className="space-y-6">
      {/* User Summary Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Height</p>
              <p>{userInfo.height} {userInfo.heightUnit === 'metric' ? 'cm' : 'in'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Weight</p>
              <p>{userInfo.weight} {userInfo.weightUnit === 'metric' ? 'kg' : 'lbs'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">BMI</p>
              <p>{bmi}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Ingredients</p>
              <p>{ingredients.length} items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{recipe.name}</CardTitle>
          <CardDescription>Servings: {recipe.servings}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Macro Nutrients */}
          <div>
            <h3 className="mb-4">Nutritional Information (per serving)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-orange-900">Calories</p>
                </div>
                <p className="text-orange-900">{recipe.macros.calories}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-900">Protein</p>
                </div>
                <p className="text-red-900">{recipe.macros.protein}g</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-900">Carbs</p>
                </div>
                <p className="text-blue-900">{recipe.macros.carbs}g</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-900">Fat</p>
                </div>
                <p className="text-amber-900">{recipe.macros.fat}g</p>
              </div>
            </div>

            {/* Macro percentages */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Macro Distribution</p>
              <div className="flex gap-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(recipe.macros.protein * 4 / recipe.macros.calories * 100)}%` }}
                  title={`Protein: ${(recipe.macros.protein * 4 / recipe.macros.calories * 100).toFixed(1)}%`}
                />
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(recipe.macros.carbs * 4 / recipe.macros.calories * 100)}%` }}
                  title={`Carbs: ${(recipe.macros.carbs * 4 / recipe.macros.calories * 100).toFixed(1)}%`}
                />
                <div 
                  className="bg-amber-500 h-2 rounded-full" 
                  style={{ width: `${(recipe.macros.fat * 9 / recipe.macros.calories * 100)}%` }}
                  title={`Fat: ${(recipe.macros.fat * 9 / recipe.macros.calories * 100).toFixed(1)}%`}
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-600">
                <span>🔴 Protein: {((recipe.macros.protein * 4 / recipe.macros.calories) * 100).toFixed(0)}%</span>
                <span>🔵 Carbs: {((recipe.macros.carbs * 4 / recipe.macros.calories) * 100).toFixed(0)}%</span>
                <span>🟡 Fat: {((recipe.macros.fat * 9 / recipe.macros.calories) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="mb-3">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <h3 className="mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onReset} 
            variant="outline" 
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Create Another Recipe
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ChefHat, X } from 'lucide-react';

type Props = {
  onSubmit: (ingredients: string[]) => void;
  onBack: () => void;
  initialIngredients: string[];
};

export function IngredientsStep({ onSubmit, onBack, initialIngredients }: Props) {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [currentIngredient, setCurrentIngredient] = useState('');

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length > 0) {
      onSubmit(ingredients);
    }
  };

  const suggestedIngredients = [
    'Chicken breast', 'Rice', 'Broccoli', 'Eggs', 'Pasta',
    'Salmon', 'Spinach', 'Sweet potato', 'Quinoa', 'Tofu'
  ];

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ChefHat className="w-5 h-5 text-emerald-600" />
          </div>
          <CardTitle>Step 2: Your Pantry</CardTitle>
        </div>
        <CardDescription>
          Add the ingredients you have available and we'll create a recipe for you
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ingredient">Add Ingredient</Label>
            <div className="flex gap-2">
              <Input
                id="ingredient"
                type="text"
                placeholder="e.g., Chicken, Rice, Tomatoes"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button 
                type="button" 
                onClick={handleAddIngredient}
                variant="outline"
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          </div>

          {ingredients.length > 0 && (
            <div className="space-y-2">
              <Label>Your Ingredients ({ingredients.length})</Label>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2 hover:text-emerald-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedIngredients
                .filter(item => !ingredients.includes(item))
                .map((item, index) => (
                  <Badge 
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-emerald-50"
                    onClick={() => setIngredients([...ingredients, item])}
                  >
                    + {item}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={ingredients.length === 0}
          >
            Generate Recipe
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

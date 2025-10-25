import React, { useState } from 'react';
import { UserInfoStepSimple } from './components/UserInfoStepSimple';
import { IngredientsStepSimple } from './components/IngredientsStepSimple';
import { RecipeDisplaySimple } from './components/RecipeDisplaySimple';
import type { UserInfo, Recipe } from './types';

// Main App component
export default function App() {
  const [step, setStep] = useState<'user-info' | 'ingredients' | 'recipe'>('user-info');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    height: '',
    weight: '',
    heightUnit: 'metric',
    weightUnit: 'metric'
  });
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const handleUserInfoSubmit = (data: UserInfo) => {
    setUserInfo(data);
    setStep('ingredients');
  };

  const handleIngredientsSubmit = async (ingredientList: string[]) => {
    setIngredients(ingredientList);
    
    try {
      // Call the backend API
      const response = await fetch('http://localhost:8000/api/v1/recipes/generate-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredientList,
          meal_type: 'dinner',
          servings: 2
        })
      });

      if (response.ok) {
        const recipeData = await response.json();
        setRecipe(recipeData);
        setStep('recipe');
      } else {
        console.error('Failed to generate recipe');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
  };

  const handleReset = () => {
    setStep('user-info');
    setUserInfo({
      height: '',
      weight: '',
      heightUnit: 'metric',
      weightUnit: 'metric'
    });
    setIngredients([]);
    setRecipe(null);
  };

  const handleBack = () => {
    if (step === 'ingredients') {
      setStep('user-info');
    } else if (step === 'recipe') {
      setStep('ingredients');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
      padding: '20px' 
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            margin: '0 0 8px 0' 
          }}>
            AI Meal Generator
          </h1>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Generate personalized recipes from your available ingredients
          </p>
        </div>

        {step === 'user-info' && (
          <UserInfoStepSimple
            onSubmit={handleUserInfoSubmit}
            initialData={userInfo}
          />
        )}

        {step === 'ingredients' && (
          <IngredientsStepSimple
            onSubmit={handleIngredientsSubmit}
            onBack={handleBack}
            initialIngredients={ingredients}
          />
        )}

        {step === 'recipe' && recipe && (
          <RecipeDisplaySimple
            recipe={recipe}
            userInfo={userInfo}
            ingredients={ingredients}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

// Export types for components
export type { UserInfo, Recipe } from './types';

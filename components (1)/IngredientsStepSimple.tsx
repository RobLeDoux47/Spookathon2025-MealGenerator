import React, { useState } from 'react';

type Props = {
  onSubmit: (ingredients: string[]) => void;
  onBack: () => void;
  initialIngredients: string[];
};

export function IngredientsStepSimple({ onSubmit, onBack, initialIngredients }: Props) {
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
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '8px' 
        }}>
          <div style={{ 
            padding: '8px', 
            background: '#d4edda', 
            borderRadius: '8px' 
          }}>
            👨‍🍳
          </div>
          <h2 style={{ margin: '0', fontSize: '24px' }}>Step 2: Your Pantry</h2>
        </div>
        <p style={{ margin: '0', color: '#666' }}>
          Add the ingredients you have available and we'll create a recipe for you
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Add Ingredient</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g., Chicken, Rice, Tomatoes"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ 
                flex: 1, 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
            <button 
              type="button" 
              onClick={handleAddIngredient}
              style={{ 
                padding: '8px 16px', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>
        </div>

        {ingredients.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Your Ingredients ({ingredients.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ingredients.map((ingredient, index) => (
                <span 
                  key={index} 
                  style={{ 
                    background: '#d4edda', 
                    color: '#155724', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#155724',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Suggestions</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestedIngredients
              .filter(item => !ingredients.includes(item))
              .map((item, index) => (
                <span 
                  key={index}
                  style={{ 
                    background: 'white', 
                    color: '#6c757d', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIngredients([...ingredients, item])}
                >
                  + {item}
                </span>
              ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button" 
            onClick={onBack} 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
          <button 
            type="submit" 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            disabled={ingredients.length === 0}
          >
            Generate Recipe
          </button>
        </div>
      </form>
    </div>
  );
}




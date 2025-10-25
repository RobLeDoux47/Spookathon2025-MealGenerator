import React, { useState, useEffect } from 'react';
import type { UserInfo } from '../types';

type Props = {
  onSubmit: (data: UserInfo) => void;
  initialData: UserInfo;
};

export function UserInfoStepSimple({ onSubmit, initialData }: Props) {
  const [weight, setWeight] = useState(initialData.weight);
  const [heightUnit, setHeightUnit] = useState<'metric' | 'imperial'>(initialData.heightUnit);
  const [weightUnit, setWeightUnit] = useState<'metric' | 'imperial'>(initialData.weightUnit);
  
  // For imperial: store feet and inches separately
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  // For metric: store cm
  const [heightCm, setHeightCm] = useState('');

  // Initialize height values based on initial data
  useEffect(() => {
    if (initialData.height) {
      if (initialData.heightUnit === 'metric') {
        setHeightCm(initialData.height);
      } else {
        // Convert total inches to feet and inches
        const totalInches = parseFloat(initialData.height);
        const ft = Math.floor(totalInches / 12);
        const inch = totalInches % 12;
        setFeet(ft.toString());
        setInches(inch.toString());
      }
    }
  }, []);

  // When height unit changes, convert the height
  const handleHeightUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (newUnit === 'metric' && heightUnit === 'imperial') {
      // Convert feet + inches to cm
      const totalInches = (parseFloat(feet || '0') * 12) + parseFloat(inches || '0');
      const cm = Math.round(totalInches * 2.54);
      setHeightCm(cm > 0 ? cm.toString() : '');
    } else if (newUnit === 'imperial' && heightUnit === 'metric') {
      // Convert cm to feet + inches
      const totalInches = Math.round(parseFloat(heightCm || '0') / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      setFeet(ft > 0 ? ft.toString() : '');
      setInches(inch.toString());
    }
    setHeightUnit(newUnit);
  };

  // When weight unit changes, convert the weight
  const handleWeightUnitChange = (newUnit: 'metric' | 'imperial') => {
    if (weight) {
      if (newUnit === 'metric' && weightUnit === 'imperial') {
        // Convert lbs to kg
        const kg = Math.round(parseFloat(weight) * 0.453592);
        setWeight(kg > 0 ? kg.toString() : '');
      } else if (newUnit === 'imperial' && weightUnit === 'metric') {
        // Convert kg to lbs
        const lbs = Math.round(parseFloat(weight) / 0.453592);
        setWeight(lbs > 0 ? lbs.toString() : '');
      }
    }
    setWeightUnit(newUnit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let heightValue = '';
    if (heightUnit === 'metric') {
      heightValue = heightCm;
    } else {
      // Convert feet + inches to total inches
      const totalInches = (parseFloat(feet || '0') * 12) + parseFloat(inches || '0');
      heightValue = totalInches.toString();
    }
    
    if (heightValue && weight) {
      onSubmit({ height: heightValue, weight, heightUnit, weightUnit });
    }
  };

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
            👤
          </div>
          <h2 style={{ margin: '0', fontSize: '24px' }}>Step 1: Your Information</h2>
        </div>
        <p style={{ margin: '0', color: '#666' }}>
          Tell us about yourself to help us calculate your nutritional needs
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Height</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {heightUnit === 'metric' ? (
                <input
                  type="number"
                  placeholder="170"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  required
                  style={{ 
                    flex: 1, 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px' 
                  }}
                />
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="5"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    required
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="10"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    required
                    style={{ 
                      flex: 1, 
                      padding: '8px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px' 
                    }}
                    min="0"
                    max="11"
                  />
                </>
              )}
              <select 
                value={heightUnit} 
                onChange={(e) => handleHeightUnitChange(e.target.value as 'metric' | 'imperial')}
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  width: '80px'
                }}
              >
                <option value="metric">cm</option>
                <option value="imperial">ft/in</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Weight</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder={weightUnit === 'metric' ? '70' : '154'}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
              <select 
                value={weightUnit} 
                onChange={(e) => handleWeightUnitChange(e.target.value as 'metric' | 'imperial')}
                style={{ 
                  padding: '8px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  width: '80px'
                }}
              >
                <option value="metric">kg</option>
                <option value="imperial">lbs</option>
              </select>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Continue to Ingredients
        </button>
      </form>
    </div>
  );
}




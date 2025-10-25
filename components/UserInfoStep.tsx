import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from 'lucide-react';
import type { UserInfo } from '../App';
import chefBackground from 'figma:asset/5719fda1f59b5916b318e53848af5c4c572dca37.png';

type Props = {
  onSubmit: (data: UserInfo) => void;
  initialData: UserInfo;
};

export function UserInfoStep({ onSubmit, initialData }: Props) {
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
    <Card className="w-full shadow-lg relative overflow-hidden min-h-[600px] bg-gray-900 flex flex-col">
      <div className="relative z-10 flex flex-col flex-1">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-2 bg-[rgba(0,0,0,0)]">
            <div className="p-2 bg-[rgb(21,9,38)] rounded-lg">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <CardTitle className="text-[rgb(169,169,211)]">Step 1: Your Information</CardTitle>
          </div>
          <CardDescription>
            Enter your info and to help ChefBot prepare to cook
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <CardContent className="space-y-6 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-[rgba(151,69,69,0)]">
                <Label htmlFor="height">Height</Label>
              <div className="flex gap-2">
                {heightUnit === 'metric' ? (
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    required
                    className="flex-1"
                  />
                ) : (
                  <>
                    <Input
                      id="feet"
                      type="number"
                      placeholder="5"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      required
                      className="flex-1"
                      min="0"
                    />
                    <Input
                      id="inches"
                      type="number"
                      placeholder="10"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      required
                      className="flex-1"
                      min="0"
                      max="11"
                    />
                  </>
                )}
                <Select value={heightUnit} onValueChange={(value) => handleHeightUnitChange(value as 'metric' | 'imperial')}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">cm</SelectItem>
                    <SelectItem value="imperial">ft/in</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  placeholder={weightUnit === 'metric' ? '70' : '154'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="flex-1 text-[rgb(48,39,39)]"
                />
                <Select value={weightUnit} onValueChange={(value) => handleWeightUnitChange(value as 'metric' | 'imperial')}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">kg</SelectItem>
                    <SelectItem value="imperial">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          </CardContent>
          <div className="flex justify-center py-4">
            <div 
              className="w-48 h-48 bg-center bg-no-repeat bg-contain opacity-20"
              style={{ backgroundImage: `url(${chefBackground})` }}
            />
          </div>
          <CardFooter className="mt-auto">
            <Button type="submit" className="w-full bg-[rgb(153,61,0)] hover:bg-emerald-700 px-[16px] py-[20px]">
              Continue to Ingredients
            </Button>
          </CardFooter>
        </form>
      </div>
    </Card>
  );
}

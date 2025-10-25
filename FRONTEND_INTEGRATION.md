# Frontend Integration Guide

## ✅ Backend is Ready for Frontend Integration!

### **API Endpoints for Frontend:**

#### **1. Test Connection:**
```bash
GET http://localhost:8000/test-frontend
```

#### **2. Generate Recipe (Simple):**
```bash
POST http://localhost:8000/api/v1/recipes/generate-simple
Content-Type: application/json

{
  "ingredients": ["chicken", "rice", "broccoli"],
  "meal_type": "dinner", 
  "servings": 2
}
```

#### **3. Generate Recipe (Full AI):**
```bash
POST http://localhost:8000/api/v1/recipes/generate-frontend
Content-Type: application/json

{
  "ingredients": ["chicken", "rice", "broccoli"],
  "user_info": {
    "height": "170",
    "weight": "70", 
    "heightUnit": "metric",
    "weightUnit": "metric"
  },
  "meal_type": "dinner",
  "servings": 2
}
```

### **Expected Response Format:**
```json
{
  "name": "Dinner with Chicken, Rice",
  "servings": 2,
  "macros": {
    "calories": 400,
    "protein": 25,
    "carbs": 50,
    "fat": 11
  },
  "ingredients": ["chicken", "rice", "broccoli"],
  "instructions": [
    "Prepare your ingredients: chicken, rice, broccoli",
    "Cook the chicken",
    "Add the remaining ingredients", 
    "Season to taste",
    "Serve hot and enjoy!"
  ],
  "description": "A delicious dinner made with your available ingredients",
  "prep_time_minutes": 15,
  "cook_time_minutes": 20,
  "difficulty": "easy",
  "cuisine_type": "international"
}
```

### **Frontend Integration Steps:**

1. **Start the backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Test the connection:**
   ```bash
   curl http://localhost:8000/test-frontend
   ```

3. **Update your frontend API calls to use:**
   - Base URL: `http://localhost:8000`
   - Recipe endpoint: `/api/v1/recipes/generate-simple`

4. **The backend now returns data in the exact format your frontend expects!**

### **CORS Configuration:**
The backend is configured to allow requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:8080`

### **Data Format Compatibility:**
✅ **Recipe structure matches frontend expectations**
✅ **UserInfo structure matches frontend expectations** 
✅ **Macros calculation matches frontend display**
✅ **Ingredients array format matches frontend**
✅ **Instructions array format matches frontend**

## 🚀 **Ready to Test!**

Your frontend should now be able to connect to the backend and receive properly formatted recipe data!




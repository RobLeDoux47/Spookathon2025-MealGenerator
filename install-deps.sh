#!/bin/bash

echo "Installing frontend dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Setup complete!"
echo ""
echo "To start the project:"
echo "1. Backend: cd backend && uvicorn app.main:app --reload"
echo "2. Frontend: npm run dev"




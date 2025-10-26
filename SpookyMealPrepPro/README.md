# Spooky Meal Prep — Full Stack (Halloween Edition)

This project has a **frontend + backend** and uses **OpenAI's Responses API** to generate recipes with macros.

## Quick Start

### 1) Requirements
- Node.js 18+ (or 20+ recommended)
- An OpenAI API key (set `OPENAI_API_KEY` in a `.env` file)

### 2) Install
```bash
# in one terminal
cd backend
cp .env.example .env  # then edit with your OpenAI key
npm i
npm run dev

# in a second terminal
cd frontend
npm i
npm run dev
```
- Backend runs on `http://localhost:8787`
- Frontend runs on `http://localhost:5173`

### 3) Build & Deploy
- Deploy backend to Render/Fly/Heroku or any Node host.
- Deploy frontend to Netlify/Vercel/Cloudflare Pages.
- Set `VITE_API_BASE` in `frontend/.env` to your backend URL when deploying.

---

## Folders
- `backend/` — Express server with `/api/recipes` calling OpenAI Responses API.
- `frontend/` — Vite + React + Tailwind (Halloween UI).

## Notes
- All calculations are educational only.
- You can change the model in `backend/server.js` (e.g., `"gpt-4o-mini"`).
- Structured JSON output is validated server-side before sending to the client.

Happy haunting! 🎃

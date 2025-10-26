import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import { z } from 'zod'

const app = express()

/**
 * CORS: allow common dev origins and an optional env override.
 * This fixes “Failed to fetch” caused by preflight/origin mismatches.
 */
const defaultAllowed = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',      // Vite preview
  'http://127.0.0.1:4173',
]
const envOrigin = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
const allowedOrigins = [...new Set([...defaultAllowed, ...envOrigin])]

// Use a dynamic origin function so multiple origins work with credentials.
const corsOptions = {
  origin(origin, cb) {
    // allow same-origin / curl / server-to-server where origin is undefined
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS: origin not allowed: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // preflight with same options
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ ok: true }))

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Zod schema for generated meals
const Meal = z.object({
  title: z.string(),
  timeMinutes: z.number().int().min(1).max(240),
  calories: z.number().int().min(50).max(5000),
  macros: z.object({
    protein_g: z.number().min(0).max(300),
    carbs_g: z.number().min(0).max(600),
    fat_g: z.number().min(0).max(200),
  }),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string()
  })).min(2),
  steps: z.array(z.string()).min(3),
  spookyName: z.string()
})

const ResponseSchema = z.object({
  meals: z.array(Meal).min(3).max(6)
})

app.post('/api/recipes', async (req, res) => {
  try {
    const {
      unitSystem, height, weight, goal, activity,
      pantry, prefs, spice, appliances
    } = req.body || {}

    // Basic required fields
    if (!height || !weight || !goal) {
      return res.status(400).json({ error: 'Missing required fields: height, weight, goal' })
    }

    // Validate/clean pantry
    const rawPantry = Array.isArray(pantry) ? pantry : []
    const cleanedPantry = rawPantry
      .filter(x => typeof x === 'string')
      .map(s => s.trim())
      .filter(Boolean)

    if (cleanedPantry.length === 0) {
      return res.status(400).json({ error: 'Add at least one pantry item' })
    }

    const pantryForModel = [...new Set(cleanedPantry)].slice(0, 50)

    const prompt = `
You are a certified nutritionist and chef. Generate 3 Halloween-themed meal recipes using ONLY items from the pantry list whenever possible, and simple staples if absolutely needed.

Constraints:
- Respect dietary flags (vegetarian, vegan, dairyFree, glutenFree)
- Respect spice preference and available appliances
- Output JSON only (no markdown).

Rules:
- Do not invent ingredients that are not in the pantry unless they are universal staples (salt, pepper, water, oil).
- If the pantry is insufficient, keep recipes extremely simple rather than adding new ingredients.

For each meal include:
- "title": normal title
- "spookyName": a Halloween pun title
- "timeMinutes": realistic estimate
- "calories": total kcal
- "macros": { "protein_g", "carbs_g", "fat_g" }
- "ingredients": list of { "name", "amount" } (prefer pantry items)
- "steps": 5–8 numbered steps (concise, appliance-aware)

User details:
- unitSystem: ${unitSystem}
- height: ${height}
- weight: ${weight}
- goal: ${goal}
- activity: ${activity}
- pantry: ${pantryForModel.join(', ')}
- prefs: ${JSON.stringify(prefs || {})}
- spice: ${spice}
- appliances: ${Array.isArray(appliances)? appliances.join(', ') : (appliances || '')}
    `.trim()

    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'You output clean, strict JSON and follow nutrition best-practices. Theme is Halloween.',
      input: prompt,
    })

    let jsonText = response.output_text
    let data
    try {
      data = JSON.parse(jsonText)
    } catch {
      const match = jsonText && jsonText.match(/\{[\s\S]*\}/)
      if (match) data = JSON.parse(match[0])
    }

    const parsed = ResponseSchema.parse(data)
    res.json(parsed)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate recipes', detail: String(err) })
  }
})

const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  console.log(`Spooky backend haunts at http://localhost:${PORT} (Allowed origins: ${allowedOrigins.join(', ')})`)
})

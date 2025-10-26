import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { z } from 'zod';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
});

const ResponseSchema = z.object({
  meals: z.array(Meal).min(3).max(6)
});

app.post('/api/recipes', async (req, res) => {
  try {
    const {
      unitSystem, height, weight, goal, activity,
      pantry, prefs, spice, appliances
    } = req.body || {};

    // Basic input validation
    if (!height || !weight || !goal) {
      return res.status(400).json({ error: 'Missing required fields: height, weight, goal' });
    }

    // Compose prompt for the model
    const prompt = `
You are a certified nutritionist and chef. Generate 3 Halloween-themed meal recipes using ONLY items from the pantry list whenever possible, and simple staples if absolutely needed.

Constraints:
- Respect dietary flags (vegetarian, vegan, dairyFree, glutenFree)
- Respect spice preference and available appliances
- Output JSON only (no markdown).

For each meal include:
- "title": normal title
- "spookyName": a Halloween pun title (e.g., "Ghoul-ash", "Witch’s Skillet")
- "timeMinutes": realistic estimate
- "calories": total kcal
- "macros": { "protein_g", "carbs_g", "fat_g" }
- "ingredients": list of { "name", "amount" } (use pantry items first)
- "steps": 5–8 numbered steps (concise, appliance-aware)

User details:
- unitSystem: ${unitSystem}
- height: ${height}
- weight: ${weight}
- goal: ${goal}
- activity: ${activity}
- pantry: ${Array.isArray(pantry)? pantry.join(', ') : pantry}
- prefs: ${JSON.stringify(prefs)}
- spice: ${spice}
- appliances: ${Array.isArray(appliances)? appliances.join(', ') : appliances}
    `.trim();

    // Ask for JSON back. We parse response.output_text as JSON.
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'You output clean, strict JSON and follow nutrition best-practices. Theme is Halloween.',
      input: prompt,
      // If your account supports it, you can uncomment the schema enforcement below.
      // response_format: {
      //   type: 'json_schema',
      //   json_schema: {
      //     name: 'meal_plan',
      //     schema: {
      //       type: 'object',
      //       properties: {
      //         meals: {
      //           type: 'array',
      //           items: {
      //             type: 'object',
      //             properties: {
      //               title: { type: 'string' },
      //               spookyName: { type: 'string' },
      //               timeMinutes: { type: 'number' },
      //               calories: { type: 'number' },
      //               macros: {
      //                 type: 'object',
      //                 properties: {
      //                   protein_g: { type: 'number' },
      //                   carbs_g: { type: 'number' },
      //                   fat_g: { type: 'number' }
      //                 },
      //                 required: ['protein_g','carbs_g','fat_g'],
      //                 additionalProperties: false
      //               },
      //               ingredients: {
      //                 type: 'array',
      //                 items: {
      //                   type: 'object',
      //                   properties: { name: { type: 'string' }, amount: { type: 'string' } },
      //                   required: ['name','amount'],
      //                   additionalProperties: false
      //                 }
      //               },
      //               steps: { type: 'array', items: { type: 'string' }, minItems: 3 }
      //             },
      //             required: ['title','spookyName','timeMinutes','calories','macros','ingredients','steps'],
      //             additionalProperties: false
      //           },
      //           minItems: 3, maxItems: 6
      //         }
      //       },
      //       required: ['meals'],
      //       additionalProperties: false
      //     },
      //     strict: true
      //   }
      // }
    });

    let jsonText = response.output_text;
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      // Try to extract JSON if there is stray text
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
    }
    const parsed = ResponseSchema.parse(data);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate recipes', detail: String(err) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Spooky backend haunts at http://localhost:${PORT}`);
});

import React, { useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787'

function Stat({label, value}){
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wide opacity-75">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  )
}

export default function App(){
  const [unitSystem, setUnitSystem] = useState('metric')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('maintain')
  const [activity, setActivity] = useState('moderate')

  const [pantryText, setPantryText] = useState('chicken, rice, broccoli, olive oil, onion, tomato, eggs, oats, milk, beans, avocado')
  const pantry = useMemo(()=> pantryText.split(/,|\n/).map(s=>s.trim()).filter(Boolean), [pantryText])

  const [prefs, setPrefs] = useState({ vegetarian:false, vegan:false, dairyFree:false, glutenFree:false })
  const [spice, setSpice] = useState('medium')
  const [appliances, setAppliances] = useState(['stovetop'])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [meals, setMeals] = useState([])

  async function generate(){
    setLoading(true); setError('')
    try{
      const resp = await fetch(`${API_BASE}/api/recipes`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ unitSystem, height, weight, goal, activity, pantry, prefs, spice, appliances })
      })
      if(!resp.ok){
        const t = await resp.json().catch(()=>({error:resp.statusText}))
        throw new Error(t.error || 'Server error')
      }
      const data = await resp.json()
      setMeals(data.meals || [])
    }catch(e){
      setError(String(e.message||e))
    }finally{
      setLoading(false)
    }
  }

  // very lightweight BMI/TDEE (client-side preview only)
  const metric = useMemo(()=>{
    const valH = Number(height)||0, valW = Number(weight)||0
    if(unitSystem==='metric') return { cm: valH, kg: valW }
    const cm = valH * 2.54, kg = valW * 0.45359237
    return { cm, kg }
  }, [unitSystem, height, weight])

  const bmi = useMemo(()=>{
    if(!metric.cm || !metric.kg) return ''
    const m = metric.cm/100
    return (metric.kg/(m*m)).toFixed(1)
  },[metric])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-center gap-3 p-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur">
        <div className="w-10 h-10 rounded-full grid place-items-center text-2xl shadow-xl" style={{background:'var(--pumpkin)', color:'#1b1b1b'}}>🎃</div>
        <div>
          <div className="title text-2xl leading-5">Spooky Meal Prep — Pro</div>
          <div className="text-xs opacity-80">Beautiful Halloween UI + AI recipes</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 grid gap-4">
        <section className="glass rounded-2xl p-4 grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3 py-2 rounded-xl border badge" onClick={()=>setUnitSystem(unitSystem==='metric'?'imperial':'metric')}>
              Units: <b className="ml-1">{unitSystem}</b>
            </button>
            <div className="flex gap-2">
              <input className="px-3 py-2 rounded-xl bg-white/5 border border-white/20" placeholder={unitSystem==='metric'?'Height (cm)':'Height (in)'} value={height} onChange={e=>setHeight(e.target.value)} />
              <input className="px-3 py-2 rounded-xl bg-white/5 border border-white/20" placeholder={unitSystem==='metric'?'Weight (kg)':'Weight (lb)'} value={weight} onChange={e=>setWeight(e.target.value)} />
            </div>
            <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/20" value={goal} onChange={e=>setGoal(e.target.value)}>
              <option value="lose">Lose</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain</option>
            </select>
            <select className="px-3 py-2 rounded-xl bg-white/5 border border-white/20" value={activity} onChange={e=>setActivity(e.target.value)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="athlete">Athlete</option>
            </select>
            <div className="ml-auto flex gap-4">
              <Stat label="BMI" value={bmi || '—'} />
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4 grid gap-3">
            <h2 className="title text-xl">Pantry</h2>
            <textarea className="w-full h-32 p-3 rounded-xl bg-white/5 border border-white/20" value={pantryText} onChange={e=>setPantryText(e.target.value)}></textarea>
            <p className="text-sm opacity-80">Tip: separate by commas or new lines. The AI will try to prefer these items.</p>
          </div>

          <div className="glass rounded-2xl p-4 grid gap-3">
            <h2 className="title text-xl">Preferences</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(prefs).map(k=> (
                <label key={k} className="flex gap-2 items-center text-sm">
                  <input type="checkbox" checked={prefs[k]} onChange={e=>setPrefs(prev=>({...prev,[k]:e.target.checked}))}/>
                  {k}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm opacity-80">Spice</label>
                <select className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20" value={spice} onChange={e=>setSpice(e.target.value)}>
                  <option value="none">None (mild)</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot 🔥</option>
                </select>
              </div>
              <div>
                <label className="text-sm opacity-80">Appliances</label>
                <div className="flex flex-wrap gap-2">
                  {['stovetop','oven','microwave','airfryer','slowcooker'].map(a => (
                    <button key={a} onClick={()=> setAppliances(p=> p.includes(a)? p.filter(x=>x!==a): [...p,a])}
                      className={"px-3 py-2 rounded-xl border " + (appliances.includes(a) ? "bg-white/10" : "badge")}>
                      {appliances.includes(a) ? "✓ " : "+ "}{a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={generate} disabled={loading} className="px-4 py-3 rounded-2xl font-black text-black" style={{background:'var(--pumpkin)'}}>
              {loading ? 'Summoning...' : 'Summon AI Recipes 🧪'}
            </button>
            {error && <div className="text-sm text-red-300">{error}</div>}
          </div>
        </section>

        {meals.length>0 && (
          <section className="glass rounded-2xl p-4 grid gap-4">
            <h2 className="title text-xl">Today’s Spellbook</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {meals.map((m,i)=> (
                <div key={i} className="rounded-2xl p-4 border border-white/15 bg-gradient-to-b from-white/10 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge px-2 py-1 rounded-full text-xs">Meal {i+1}</span>
                    <span className="ml-auto text-xs opacity-75">{m.timeMinutes} min</span>
                  </div>
                  <div className="font-black text-lg">{m.spookyName}</div>
                  <div className="opacity-80 text-sm mb-2">{m.title}</div>
                  <div className="text-sm mb-2"><b>{m.calories}</b> kcal</div>
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className="badge px-2 py-1 rounded-full">Protein {m.macros.protein_g}g</span>
                    <span className="badge px-2 py-1 rounded-full">Carbs {m.macros.carbs_g}g</span>
                    <span className="badge px-2 py-1 rounded-full">Fat {m.macros.fat_g}g</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold mb-1">Ingredients</div>
                    <ul className="list-disc ml-5">
                      {m.ingredients.map((it,idx)=>(<li key={idx}>{it.amount} {it.name}</li>))}
                    </ul>
                  </div>
                  <div className="text-sm mt-2">
                    <div className="font-bold mb-1">Steps</div>
                    <ol className="list-decimal ml-5 space-y-1">
                      {m.steps.map((s,idx)=>(<li key={idx}>{s}</li>))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm opacity-80">
              Easter egg: click the pumpkin logo 3× (coming soon) — Cookie Monster may appear 🍪
            </div>
          </section>
        )}
      </main>
      <footer className="text-center py-6 opacity-80 text-sm">Made with 🧡 for Halloween</footer>
    </div>
  )
}

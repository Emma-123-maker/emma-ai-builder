import OpenAI from 'openai'
export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()
  if(!prompt) return new Response('Prompt required', { status: 400 })

  const safePrompt = prompt.replace(/`/g,'').slice(0,60)

  // NO KEY = demo mode (no TS types, so Publish works)
  const hasKey =!!process.env.GROQ_API_KEY ||!!process.env.OPENAI_API_KEY ||!!process.env.OPENROUTER_API_KEY
  if(!hasKey){
    const demoCode = `import React, { useState } from 'react';
export default function App(){
  const [cart,setCart]=useState(0)
  const [products]=useState([{n:'Product A',p:8500},{n:'Product B',p:15000},{n:'Product C',p:12000}])
  return (
    <div style={{padding:20, fontFamily:'system-ui', background:'#f6f6f6', minHeight:'100vh'}}>
      <h1 style={{fontWeight:900, fontSize:26}}>🚀 ${safePrompt}</h1>
      <p style={{color:'#666', fontSize:13, marginTop:6}}>Demo Mode - Add GROQ_API_KEY in Vercel for full AI</p>
      <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {products.map((pr,i)=>{return <div key={i} style={{background:'white', padding:16, borderRadius:16, border:'1px solid #eee'}}><b>{pr.n}</b><br/><small>₦{pr.p.toLocaleString()}</small><br/><button onClick={()=>setCart(c=>c+pr.p)} style={{width:'100%', background:'black', color:'white', padding:'10px', borderRadius:20, marginTop:8}}>Add</button></div>})}
      </div>
      <div style={{marginTop:20, background:'black', color:'white', padding:20, borderRadius:16}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Cart Total</b><b>₦{cart.toLocaleString()}</b></div>
        <button onClick={()=>{alert('Sold! Receipt printed for ₦'+cart); setCart(0)}} style={{width:'100%', background:'#22c55e', color:'white', padding:14, borderRadius:12, fontWeight:900, marginTop:12}}>Sell & Print Receipt</button>
      </div>
    </div>
  )
}`
    return new Response(demoCode)
  }

  const systemPrompt = `You are Emma AI Builder.
USER WANTS: ${prompt}
RULES:
1. import React, { useState, useEffect } from 'react';
2. export default function App(){...}
3. NO TYPESCRIPT TYPES EVER - use (pr,i) not (pr:any,i:number)
4. Beautiful, functional, ₦, localStorage
5. Only raw code, no markdown`

  try {
    if(process.env.GROQ_API_KEY){
      const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
      // THIS MODEL WORKS 100% ON FREE GROQ - never 404
      const stream = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        stream: true,
        messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}],
        temperature: 0.7
      })
      const encoder = new TextEncoder()
      return new Response(new ReadableStream({
        async start(c){
          for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) c.enqueue(encoder.encode(t)) }
          c.close()
        }
      }), { headers: { 'Content-Type': 'text/plain' } })
    }

    if(process.env.OPENROUTER_API_KEY){
      const or = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY, baseURL: 'https://openrouter.ai/api/v1' })
      const stream = await or.chat.completions.create({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        stream: true,
        messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
      })
      const encoder = new TextEncoder()
      return new Response(new ReadableStream({
        async start(c){
          for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) c.enqueue(encoder.encode(t)) }
          c.close()
        }
      }), { headers: { 'Content-Type': 'text/plain' } })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
    })
    const encoder = new TextEncoder()
    return new Response(new ReadableStream({
      async start(c){
        for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) c.enqueue(encoder.encode(t)) }
        c.close()
      }
    }), { headers: { 'Content-Type': 'text/plain' } })

  } catch(e:any){
    // Return JSON error, not raw "Error:" text that breaks Sandpack
    return new Response(JSON.stringify({error: e.message}), { status: 500, headers: {'Content-Type':'application/json'} })
  }
}

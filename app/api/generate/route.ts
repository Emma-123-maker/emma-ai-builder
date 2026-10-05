import OpenAI from 'openai'
export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()
  if(!prompt) return new Response('Prompt required', { status: 400 })

  const hasOpenAI =!!process.env.OPENAI_API_KEY
  const hasGroq =!!process.env.GROQ_API_KEY
  const hasOpenRouter =!!process.env.OPENROUTER_API_KEY

  if(!hasOpenAI &&!hasGroq &&!hasOpenRouter){
    const demoCode = `import React, { useState } from 'react';
export default function App(){
  const [cart,setCart]=useState(0)
  const [products]=useState([{n:'Rice 50kg',p:85000},{n:'Indomie Carton',p:15000},{n:'Groundnut Oil 5L',p:12000}])
  return (
    <div style={{padding:20, fontFamily:'system-ui', background:'#f6f6f6', minHeight:'100vh'}}>
      <h1 style={{fontWeight:900, fontSize:26}}>🚀 ${prompt.slice(0,55)}</h1>
      <p style={{color:'#666', fontSize:13, marginTop:6}}>Built by Emma AI Builder • Ibadan • Live Preview</p>
      <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {products.map((pr:any,i:number)=><div key={i} style={{background:'white', padding:16, borderRadius:16, border:'1px solid #eee'}}><b>{pr.n}</b><br/><small>₦{pr.p.toLocaleString()}</small><br/><button onClick={()=>setCart(c=>c+pr.p)} style={{width:'100%', background:'black', color:'white', padding:'10px', borderRadius:20, marginTop:8}}>Add</button></div>)}
      </div>
      <div style={{marginTop:20, background:'black', color:'white', padding:20, borderRadius:16}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Cart Total</b><b>₦{cart.toLocaleString()}</b></div>
        <button onClick={()=>{alert('Sold! Receipt printed for ₦'+cart); setCart(0)}} style={{width:'100%', background:'#22c55e', color:'white', padding:14, borderRadius:12, fontWeight:900, marginTop:12}}>Sell & Print Receipt</button>
      </div>
      <p style={{fontSize:11, color:'#999', marginTop:20, textAlign:'center'}}>DEMO MODE: Add GROQ_API_KEY (FREE) in Vercel to enable full AI</p>
    </div>
  )
}`
    return new Response(demoCode)
  }

  const systemPrompt = `You are Emma AI Builder - expert React dev like Lovable.
Task: ${prompt}
Generate ONLY complete React App.js code. No explanation.
STRICT RULES:
1. ALWAYS FIRST LINE: import React, { useState, useEffect } from 'react';
2. Then: export default function App(){...}
3. Use useState not React.useState
4. Inline styles only, mobile responsive
5. ₦ Naira, Nigerian context
6. localStorage for persistence
7. No markdown, no backticks, only raw code`

  try {
    if(hasGroq){
      const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY!, baseURL: 'https://api.groq.com/openai/v1' })
      const stream = await groq.chat.completions.create({
        model: "llama-3.1-70b-versatile",
        stream: true,
        messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
      })
      const encoder = new TextEncoder()
      return new Response(new ReadableStream({
        async start(controller){
          for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) controller.enqueue(encoder.encode(t)) }
          controller.close()
        }
      }), { headers: { 'Content-Type': 'text/plain' } })
    }

    if(hasOpenRouter){
      const or = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY!, baseURL: 'https://openrouter.ai/api/v1' })
      const stream = await or.chat.completions.create({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        stream: true,
        messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
      })
      const encoder = new TextEncoder()
      return new Response(new ReadableStream({
        async start(controller){
          for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) controller.enqueue(encoder.encode(t)) }
          controller.close()
        }
      }), { headers: { 'Content-Type': 'text/plain' } })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
    })
    const encoder = new TextEncoder()
    return new Response(new ReadableStream({
      async start(controller){
        for await (const chunk of stream){ const t=chunk.choices[0]?.delta?.content||''; if(t) controller.enqueue(encoder.encode(t)) }
        controller.close()
      }
    }), { headers: { 'Content-Type': 'text/plain' } })

  } catch(e:any){
    return new Response(`Error: ${e.message}`, { status: 500 })
  }
}

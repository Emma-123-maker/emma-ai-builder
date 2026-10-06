import OpenAI from 'openai'
export const runtime = 'edge'
export async function POST(req: Request){
  const { prompt } = await req.json()
  const system = `You are Bolt.new. Build for: ${prompt}. RULES: import React, { useState, useEffect } from 'react'; export default function App(){...} NO TS types, only raw JS, no markdown, beautiful black UI, ₦, localStorage, fully working >150 lines`
  try{
    const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      messages: [{role:'system',content:system},{role:'user',content:prompt}],
      temperature: 0.7,
      max_tokens: 8000
    })
    const enc = new TextEncoder()
    return new Response(new ReadableStream({
      async start(c){ for await (const ch of stream){ const t=ch.choices[0]?.delta?.content||''; if(t) c.enqueue(enc.encode(t.replace(/```[a-z]*\n?/gi,'').replace(/```/g,''))) } c.close() }
    }), {headers:{'Content-Type':'text/plain'}})
  }catch(e:any){
    return new Response(JSON.stringify({error:e.message}), {status:500, headers:{'Content-Type':'application/json'}})
  }
}

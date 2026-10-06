import OpenAI from 'openai'
export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()
  if(!prompt) return new Response(JSON.stringify({error:'Prompt required'}), {status:400})

  // BOLT.NEW SYSTEM PROMPT - makes it build real apps, not templates
  const BOLT_SYSTEM = `
You are Bolt.new - the world's best AI full-stack builder.

USER REQUEST: ${prompt}

You must build a COMPLETE, PRODUCTION-READY, FULLY FUNCTIONAL React app in a SINGLE FILE.

<bolt_rules>
1. SINGLE FILE: All code in one file App.js - no imports beyond React
2. FIRST LINE MUST BE: import React, { useState, useEffect, useMemo, useRef } from 'react';
3. SECOND: export default function App(){...}
4. NO TYPESCRIPT EVER - never use :any, :string, :number. Use (x,i) not (x:any,i:number)
5. NO MARKDOWN, NO BACKTICKS, NO EXPLANATION - ONLY RAW CODE
6. DESIGN: Like bolt.new - beautiful, modern, glassmorphism, gradients, dark mode black #0a0a0a, rounded-2xl, animations
7. FUNCTIONALITY: 100% working with useState, useEffect, localStorage persistence
8. ICONS: Use emojis or inline SVGs, no external icon libs
9. IMAGES: Use https://images.unsplash.com with real search terms matching prompt, not walrus
10. NIGERIA: Use ₦ currency, Bodija Ibadan, Nigerian names, Paystack mock
11. COMPLETENESS: If POS app, must have: inventory add/edit/delete, cart, search, barcode mock, receipt print, sales history, profit calc, low stock alert - ALL WORKING
12. If user says "PayVault", "Opay", "Banking" - clone with balance, send money, transactions, cards, analytics, dark premium UI
13. Never return demo/rice template - build EXACTLY what user asked
14. Code must be >150 lines, detailed, production quality
</bolt_rules>

EXAMPLE STRUCTURE FOR POS (adapt to user prompt):
import React, { useState, useEffect } from 'react';
export default function App(){
  const [products,setProducts]=useState(JSON.parse(localStorage.getItem('prods')||'[{"id":1,"name":"Rice 50kg","price":85000,"stock":20}]'))
  useEffect(()=>localStorage.setItem('prods',JSON.stringify(products)),[products])
  //... full working logic
  return <div className="...">...</div>
}

Build now: ${prompt}
`

  try{
    if(!process.env.GROQ_API_KEY){
      throw new Error('GROQ_API_KEY missing in Vercel Env Variables')
    }

    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    })

    // BOLT.NEW uses high-quality model - openai/gpt-oss-120b is the new llama replacement (Aug 2026+)
    // Falls back to 20b if 120b rate limited
    let model = "openai/gpt-oss-120b"
    let stream

    try{
      stream = await groq.chat.completions.create({
        model,
        stream: true,
        messages: [
          { role: "system", content: BOLT_SYSTEM },
          { role: "user", content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 16000,
        top_p: 0.95
      })
    }catch(e:any){
      // Fallback if 120b rate limited
      if(e.message?.includes('rate') || e.message?.includes('120b')){
        model = "openai/gpt-oss-20b"
        stream = await groq.chat.completions.create({
          model,
          stream: true,
          messages: [
            { role: "system", content: BOLT_SYSTEM },
            { role: "user", content: prompt }
          ],
          temperature: 0.75,
          max_tokens: 8000
        })
      }else{
        throw e
      }
    }

    const encoder = new TextEncoder()

    return new Response(new ReadableStream({
      async start(controller){
        let buffer = ''
        for await (const chunk of stream){
          const content = chunk.choices[0]?.delta?.content || ''
          if(content){
            buffer += content
            // Clean markdown on the fly like bolt.new does
            const cleanedChunk = content.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'')
            if(cleanedChunk) controller.enqueue(encoder.encode(cleanedChunk))
          }
        }
        controller.close()
      }
    }),{
      headers:{
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Model-Used': model
      }
    })

  }catch(error:any){
    console.error('Bolt generate error:', error)
    return new Response(JSON.stringify({
      error: error.message || 'AI generation failed',
      hint: 'Check GROQ_API_KEY in Vercel and that you used openai/gpt-oss-20b or 120b model'
    }),{
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

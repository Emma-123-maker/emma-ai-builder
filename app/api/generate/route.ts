import OpenAI from 'openai'
export const runtime = 'edge'

function clean(s:string){
  let c = s.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
  // Force newline after import
  c = c.replace(/from\s+['"]react['"]\s*;?\s*export/g, `from 'react';\n\nexport`)
  c = c.replace(/from\s+['"]react['"]\s*export/g, `from 'react';\n\nexport`)
  // Force App() with parens
  c = c.replace(/export default function App\s*\(\)\s*\{/, `export default function App(){`)
  c = c.replace(/export default function App\s*\{/, `export default function App(){`)
  c = c.replace(/export default function App\s*\n/, `export default function App(){\n`)
  c = c.replace(/export default function App$/, `export default function App(){`)
  // Ensure first line perfect
  if(!c.startsWith('import React')){
    c = `import React, { useState, useEffect } from 'react';\n\n` + c.replace(/^import.*react.*\n?/i,'').trim()
  }
  // If still stuck together, split
  c = c.replace(/';export/, `';\n\nexport`)
  return c
}

export async function POST(req: Request){
  const { prompt } = await req.json()
  const system = `You MUST output code starting EXACTLY like this, character for character, with newline:
import React, { useState, useEffect } from 'react';

export default function App(){
...rest

RULES: NO markdown. NO backticks. Keep import on line 1 alone. Line 3 MUST be export default function App(){ with (). Then build: ${prompt} - Black premium UI, ₦, localStorage, full app >200 lines`

  const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
  try{
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      messages: [{role:'system',content:system},{role:'user',content:prompt}],
      temperature: 0.6,
      max_tokens: 8000
    })
    const enc = new TextEncoder()
    let buffer = ''
    return new Response(new ReadableStream({
      async start(ctrl){
        for await (const ch of stream){
          let t = ch.choices[0]?.delta?.content||''
          if(!t) continue
          buffer += t
          let out = clean(t)
          // Don't send broken partials on first chunk
          if(buffer.length < 100) continue
          let cleanedChunk = t.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'')
          if(cleanedChunk) ctrl.enqueue(enc.encode(cleanedChunk))
        }
        ctrl.close()
      }
    }), {headers:{'Content-Type':'text/plain'}})
  }catch(e:any){
    return new Response(JSON.stringify({error:e.message}), {status:500})
  }
}

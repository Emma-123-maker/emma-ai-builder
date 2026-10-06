import OpenAI from 'openai'
export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()
  
  // SHORT prompt = under 8000 tokens
  const system = `Build React app: ${prompt}. Start with:
import React, { useState, useEffect } from 'react';

export default function App(){
// app code with useState, balance, ₦, localStorage, black UI, >150 lines
}
Rules: raw JS only, no TS, no markdown.`

  try{
    const groq = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY, 
      baseURL: 'https://api.groq.com/openai/v1' 
    })

    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {role:'system', content: system},
        {role:'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 6000
    })

    let code = res.choices[0]?.message?.content || ''
    code = code.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
    
    // Auto-fix common errors from your screenshots
    if(!code.startsWith('import')){
      code = code.replace(/^variables.*?\n/i, '')
      code = `import React, { useState, useEffect } from 'react';\n\n${code}`
    }
    code = code.replace(/export default function App\s*\{/, 'export default function App(){')
    code = code.replace(/';export/, `';\n\nexport`)
    
    // Ensure import is perfect
    if(!code.includes("from 'react'")){
      code = `import React, { useState, useEffect } from 'react';\n\n` + code
    }

    return new Response(code, { headers: { 'Content-Type': 'text/plain' } })
  }catch(e:any){
    return new Response(JSON.stringify({error: e.message}), { status: 500 })
  }
}

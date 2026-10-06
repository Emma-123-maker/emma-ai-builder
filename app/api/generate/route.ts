import OpenAI from 'openai'
export const runtime = 'edge'

function fixCode(raw: string){
  let code = raw.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
  // Fix broken import that causes your screenshot error
  code = code.replace(/import\s+React,\s*\{\s*useState,\s*useEffect\s*\n+\s*\}/g, 'import React, { useState, useEffect } from \'react\';')
  code = code.replace(/import React,\s*\{\s*useState,\s*useEffect\s*\}\s*\n+\s*\}/g, 'import React, { useState, useEffect } from \'react\';')
  // Ensure first line is correct
  if(!code.startsWith('import React')){
    code = `import React, { useState, useEffect } from 'react';\n` + code.replace(/^import.*\n?/, '')
  }
  // Ensure from 'react'
  if(!code.includes("from 'react'") &&!code.includes('from "react"')){
    code = code.replace(/import React.*/, `import React, { useState, useEffect } from 'react';`)
  }
  // Remove stray leading characters
  code = code.replace(/^\s*['"]?from\s+['"]react['"];?\s*\n?/, '')
  return code
}

export async function POST(req: Request){
  const { prompt } = await req.json()
  const system = `You are Bolt.new. Build app for: ${prompt}
CRITICAL RULES - MUST FOLLOW EXACTLY:
1) FIRST LINE MUST BE EXACTLY: import React, { useState, useEffect } from 'react';
2) ONE LINE, NO LINE BREAKS IN IMPORT EVER
3) SECOND LINE: export default function App(){
4) NO TYPESCRIPT, NO :types
5) ONLY RAW CODE, NO MARKDOWN, NO BACKTICKS
6) BLACK PREMIUM UI, ₦, localStorage, WORKING, >200 LINES
Build: ${prompt}`

  try{
    const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: 'https://api.groq.com/openai/v1' })
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      messages: [{role:'system',content:system},{role:'user',content:prompt}],
      temperature: 0.65,
      max_tokens: 8000
    })
    const enc = new TextEncoder()
    let full = ''
    return new Response(new ReadableStream({
      async start(c){
        for await (const ch of stream){
          let t = ch.choices[0]?.delta?.content||''
          if(t){
            full += t
            t = t.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'')
            if(t) c.enqueue(enc.encode(t))
          }
        }
        c.close()
      }
    }), {headers:{'Content-Type':'text/plain'}})
  }catch(e:any){
    return new Response(JSON.stringify({error:e.message}), {status:500, headers:{'Content-Type':'application/json'}})
  }
}

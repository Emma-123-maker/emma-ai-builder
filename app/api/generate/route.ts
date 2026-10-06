import OpenAI from 'openai'
export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()
  
  const system = `You are Bolt.new AI builder. Build a FULL WORKING React app for: ${prompt}

YOU MUST START WITH EXACTLY THIS - COPY PASTE:
import React, { useState, useEffect } from 'react';

export default function App(){
  const [balance, setBalance] = useState(50000);
  // ...rest of app

RULES:
- First 2 lines MUST be exactly as above
- NEVER start with "variables" or any other word
- NO markdown, NO \`\`\`, only raw code
- Black premium UI, ₦ Naira, localStorage
- >200 lines, fully functional

Build: ${prompt}`

  try{
    const groq = new OpenAI({ 
      apiKey: process.env.GROQ_API_KEY, 
      baseURL: 'https://api.groq.com/openai/v1' 
    })

    // Non-streaming = more stable, no broken imports
    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {role:'system',content: system},
        {role:'user',content: `Build: ${prompt}` }
      ],
      temperature: 0.7,
      max_tokens: 8000
    })

    let code = res.choices[0]?.message?.content || ''
    
    // CLEAN
    code = code.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
    
    // If model forgot import (like your screenshot), force it
    if(!code.trim().startsWith('import')){
      // Remove any stray first word like "variables"
      code = code.replace(/^variables[\s\S]*?const \[/, 'const [')
      code = `import React, { useState, useEffect } from 'react';\n\n` + code
    }
    
    // Ensure export App() has ()
    code = code.replace(/export default function App\s*\{/, 'export default function App(){')
    code = code.replace(/export default function App\s*\(\)\s*\{/, 'export default function App(){')
    
    // If still starts with variables, kill it
    if(code.trim().toLowerCase().startsWith('variables')){
      code = code.replace(/^.*\n/, '')
      code = `import React, { useState, useEffect } from 'react';\n\nexport default function App(){\n` + code
    }

    return new Response(code, {
      headers: { 'Content-Type': 'text/plain' }
    })

  }catch(e:any){
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {'Content-Type':'application/json'}
    })
  }
}

import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST(req: Request){
  const { prompt } = await req.json()

  // Demo mode if no API key
  if(!process.env.OPENAI_API_KEY){
    const demoCode = `export default function App(){
  const [cart,setCart]=React.useState(0)
  return (
    <div style={{padding:20, fontFamily:'system-ui', background:'#f6f6f6', minHeight:'100vh'}}>
      <h1 style={{fontWeight:900, fontSize:28}}>🚀 ${prompt.slice(0,50)}</h1>
      <p style={{color:'#666', fontSize:13, marginTop:8}}>Built by Emma AI Builder • Ibadan • Live Preview</p>
      <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <div style={{background:'white', padding:16, borderRadius:16, border:'1px solid #eee'}}><b>Product 1</b><br/><small>₦50,000</small><br/><button onClick={()=>setCart(c=>c+50000)} style={{width:'100%', background:'black', color:'white', padding:'10px', borderRadius:20, marginTop:8}}>Add to Cart</button></div>
        <div style={{background:'white', padding:16, borderRadius:16, border:'1px solid #eee'}}><b>Product 2</b><br/><small>₦15,000</small><br/><button onClick={()=>setCart(c=>c+15000)} style={{width:'100%', background:'black', color:'white', padding:'10px', borderRadius:20, marginTop:8}}>Add to Cart</button></div>
      </div>
      <div style={{marginTop:20, background:'black', color:'white', padding:20, borderRadius:16}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Cart Total</b><b>₦{cart.toLocaleString()}</b></div>
        <button onClick={()=>{alert('Sold! Receipt printed'); setCart(0)}} style={{width:'100%', background:'#22c55e', color:'white', padding:14, borderRadius:12, fontWeight:900, marginTop:12}}>Sell & Print Receipt</button>
      </div>
      <p style={{fontSize:11, color:'#999', marginTop:20}}>Demo Mode: Add OPENAI_API_KEY in Vercel ENV to enable GPT-4o real app generation like Lovable</p>
    </div>
  )
}`
    return new Response(demoCode)
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const systemPrompt = `You are Emma AI Builder - expert full-stack dev like Lovable/Bolt.
Generate ONLY a complete React App.js component. No explanation.
Requirements for ${prompt}:
- Fully working React app with useState, working buttons
- Use Tailwind-style inline styles
- ₦ currency for Nigeria, Ibadan context
- localStorage for data persistence
- Mobile responsive, production-ready
- Include real functionality: if POS, inventory+cart+receipt. If Church, members+attendance. If School, scores+grades. If Banking, balance+transactions.
- Output ONLY code: export default function App(){...}
- No markdown, no backticks, just pure JS code.`

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [{role:"system", content: systemPrompt}, {role:"user", content: prompt}]
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller){
      for await (const chunk of stream){
        const text = chunk.choices[0]?.delta?.content || ''
        if(text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    }
  })
  return new Response(readable, { headers: { 'Content-Type': 'text/plain' } })
}

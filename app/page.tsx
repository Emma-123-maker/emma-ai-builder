'use client'
import { useState } from 'react'
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react'

const EXAMPLES = [
  {t:'POS App for My Shop', p:'Build a complete POS app for a shop in Bodija Ibadan with product inventory, barcode search, cart, sales history, print receipt with logo, daily profit dashboard, ₦ currency. Use localStorage. Modern black UI.'},
  {t:'Church App', p:'Build church management app for RCCG Ibadan with member directory 300+ members, attendance marking with date, donation tracking ₦, events calendar, announcement banner. Full working app.'},
  {t:'School Result App', p:'Build school result checker app like WAEC portal with student list, enter scores for 6 subjects, auto-calculate total, average, grade A-F, position, remarks, print result sheet with school logo.'},
  {t:'VTU / Data App', p:'Build VTU app where users buy airtime, data bundles (MTN, Glo, Airtel, 9mobile), enter phone number, select bundle, pay from wallet balance ₦50,000, show transaction history, Paystack mock.'},
  {t:'PayVault Banking Clone', p:'Build banking app clone like PayVault/Opay/Kuda with dashboard showing balance ₦500,000, account number, send money to bank, transaction history list, cards section, add money via Paystack, analytics chart.'},
  {t:'E-commerce Store', p:'Build e-commerce store for Bodija market Ibadan with product grid, search, categories, cart, wishlist, checkout via WhatsApp, ₦ prices, delivery fee.'},
]

function cleanCode(raw: string){
  return raw.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
}

export default function Home(){
  const [prompt,setPrompt]=useState('')
  const [code,setCode]=useState('')
  const [loading,setLoading]=useState(false)
  const [published,setPublished]=useState(false)

  async function buildApp(q?:string){
    const finalQ = q || prompt
    if(!finalQ) return
    setLoading(true); setCode(''); setPublished(false)
    try{
      const res = await fetch('/api/generate',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt: finalQ})})
      if(!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while(true){
        const {done,value} = await reader.read()
        if(done) break
        full += decoder.decode(value)
        setCode(cleanCode(full))
      }
    }catch(e){
      setCode(`import React, { useState } from 'react';
export default function App(){
 const [cart,setCart] = useState(0);
 return <div style={{padding:20,fontFamily:'sans-serif',background:'#f8f8f8',minHeight:'100vh'}}>
 <div style={{background:'black',color:'white',padding:16,borderRadius:16,display:'flex',justifyContent:'space-between'}}><b>EMMA STORE - BODIJA</b><span>Cart: {cart}</span></div>
 <h1 style={{fontSize:28,fontWeight:900,marginTop:20}}>POS Ready</h1>
 <p>Built by Emma AI Builder - Ibadan ✓</p>
 <button onClick={()=>setCart(cart+1)} style={{background:'black',color:'white',padding:'14px 28px',borderRadius:24,marginTop:20,fontWeight:900}}>Add to Cart +</button>
 </div>
}`)
    }
    setLoading(false)
  }

  function handleDownload(){
    if(!code) return alert('Build an app first!')
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Emma App</title><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>body{margin:0}</style></head><body><div id="root"></div><script type="text/babel">${code.replace('export default function App','function App')}\nconst root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(App));<\/script></body></html>`
    const blob = new Blob([html], {type:'text/html'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`emma-app-${Date.now()}.html`; a.click()
  }

  async function handlePublish(){
    if(!code) return alert('Build an app first!')
    try{
      await navigator.clipboard.writeText(code)
    }catch{}
    const win = window.open()
    if(win){
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Published - Emma AI</title><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script></head><body style="margin:0"><div id="root"></div><div style="position:fixed;bottom:10px;right:10px;background:black;color:white;padding:6px 10px;border-radius:20px;font-size:10px;font-family:sans-serif">Published by EMMA AI BUILDER • Ibadan</div><script type="text/babel">${code.replace('export default function App','function App')}\nconst root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(App));<\/script></body></html>`)
      win.document.close()
    }
    setPublished(true)
    setTimeout(()=>alert('✅ Published!\n\nYour app opened in a NEW TAB — that tab link is shareable.\n\n1. In new tab, tap Share → Copy link\n2. Send to customers on WhatsApp\n\nCode also copied to clipboard for Vercel deployment.'), 500)
  }

  return(
    <div className="min-h-screen bg-black text-white">
      <nav className="p-4 border-b border-zinc-900 flex justify-between sticky top-0 bg-black z-20">
        <h1 className="font-black tracking-tighter">EMMA AI BUILDER <span className="text-[9px] bg-white text-black px-2 py-0.5 rounded-full ml-2">LOVABLE CLONE</span></h1>
        <a href="/admin" className="text-xs border border-zinc-800 px-3 py-1.5 rounded-full">Admin • Earnings</a>
      </nav>
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-[420px_1fr] gap-0">
        <div className="p-6 border-r border-zinc-900 h-[92vh] overflow-auto flex flex-col">
          <h2 className="text-[42px] font-black leading-[0.9] tracking-tighter">What do you want to build today?</h2>
          <p className="text-zinc-500 text-[13px] mt-3">Build POS, Church, School, VTU, Banking apps instantly.</p>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Build me a POS app..." className="w-full mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-28 text-sm outline-none focus:border-white"/>
          <button onClick={()=>buildApp()} className="w-full mt-3 bg-white text-black py-4 rounded-full font-black text-sm">{loading?'Building...':'Generate App →'}</button>
          <div className="grid grid-cols-2 gap-2 mt-6">{EXAMPLES.map(ex=><button key={ex.t} onClick={()=>buildApp(ex.p)} className="border border-zinc-800 hover:bg-zinc-900 p-3 rounded-xl text-left"><div className="font-bold text-[12px]">{ex.t}</div></button>)}</div>
          {code && (
            <div className="mt-6 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
              <p className="text-[11px] text-zinc-400">Publish steps for VTU Wallet:</p>
              <ol className="text-[11px] mt-2 list-decimal ml-4 space-y-1 text-zinc-300">
                <li>Tap Publish → new tab opens</li>
                <li>Share new tab link to customers</li>
                <li>Or Download HTML → host on Vercel</li>
              </ol>
            </div>
          )}
        </div>
        <div className="bg-white flex flex-col h-[92vh]">
          <div className="p-3 border-b bg-black text-white flex justify-between items-center">
            <span className="text-xs font-bold">⚡ Live Preview</span>
            <div className="flex gap-2 items-center">
              {code && <>
                <button onClick={handleDownload} className="text-[11px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-full font-bold">⬇ Download HTML</button>
                <button onClick={handlePublish} className="text-[11px] bg-white text-black px-4 py-1.5 rounded-full font-black">{published?'✅ Published':'🚀 Publish'}</button>
              </>}
              <span className="text-[9px] bg-green-400 text-black px-2 py-1 rounded-full ml-1">{loading?'BUILDING':'LIVE'}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {code? (
              <SandpackProvider template="react" files={{'/App.js': code}} style={{height:'100%'}}>
                <SandpackPreview style={{height:'100%'}} showNavigator={false} showOpenInCodeSandbox={false} showRefreshButton={false} />
              </SandpackProvider>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-black p-10 text-center"><div className="text-6xl">🚀</div><h3 className="font-black mt-4 text-xl">Your app appears here</h3><p className="text-zinc-500 text-sm mt-2">Build VTU Wallet then tap Publish</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useRef } from 'react'
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react'

const EXAMPLES = [
  {t:'POS App for My Shop', p:'Build a complete POS app for a shop in Bodija Ibadan with product inventory, barcode search, cart, sales history, print receipt with logo, daily profit dashboard, ₦ currency. Use localStorage. Modern black UI. 300+ lines.'},
  {t:'Church App', p:'Build church management app for RCCG Ibadan with member directory 300+ members, attendance marking with date, donation tracking ₦, events calendar, announcement banner. Full working app 300+ lines.'},
  {t:'School Result App', p:'Build school result checker app like WAEC portal with student list, enter scores for 6 subjects, auto-calculate total, average, grade A-F, position, remarks, print result sheet with school logo. 300+ lines.'},
  {t:'VTU / Data App', p:'Build VTU app where users buy airtime, data bundles (MTN, Glo, Airtel, 9mobile), enter phone number, select bundle, pay from wallet balance ₦50,000, show transaction history, Paystack mock. Working with modals.'},
  {t:'PayVault Banking Clone', p:'Build premium banking app clone like Opay with dashboard balance ₦500,000 hide/show, account 1234567890, Add Money modal adds balance, Send Money modal validates and deducts, Balance Analytics 5 bars, Recent Transactions map from localStorage, My Cards, bottom nav Home/Transactions/Cards/Profile tabs, black premium UI.'},
  {t:'E-commerce Store', p:'Build e-commerce store for Bodija market Ibadan with product grid, search, categories, cart, wishlist, checkout via WhatsApp, ₦ prices, delivery fee. 300+ lines.'},
]

function cleanCode(raw: string){
  if(raw.trim().startsWith('{') && raw.includes('error')){
    try{ const j=JSON.parse(raw); throw new Error(j.error) }catch{}
  }
  return raw.replace(/```[a-z]*\n?/gi,'').replace(/```/g,'').trim()
}

function cleanForPublish(c: string){
  return c
   .replace(/:\s*any/g,'')
   .replace(/:\s*number/g,'')
   .replace(/:\s*string/g,'')
   .replace(/:\s*boolean/g,'')
   .replace(/export default function App/,'function App')
   .replace(/import\s+React.*from.*['"]react['"];?\n?/gi,'')
   .replace(/import\s+\{[^}]+\}\s+from\s+['"]react['"];?\n?/gi,'')
}

export default function Home(){
  const [prompt,setPrompt]=useState('')
  const [code,setCode]=useState('')
  const [loading,setLoading]=useState(false)
  const [published,setPublished]=useState(false)
  const [errorMsg,setErrorMsg]=useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  async function buildApp(q?:string){
    const finalQ = q || prompt
    if(!finalQ) return
    setLoading(true); setCode(''); setPublished(false); setErrorMsg('')
    try{
      const res = await fetch('/api/generate',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt: finalQ})})
      if(!res.ok){
        const data = await res.json().catch(async ()=>({error: await res.text()}))
        throw new Error(data.error || `API failed: ${res.status}`)
      }
      if(!res.body) throw new Error('No stream')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while(true){
        const {done,value} = await reader.read()
        if(done) break
        full += decoder.decode(value)
        const cleaned = cleanCode(full)
        if(!cleaned.startsWith('Error:') && !cleaned.startsWith('{"error"')){
          setCode(cleaned)
        }
      }
      setTimeout(()=> previewRef.current?.scrollIntoView({behavior:'smooth'}), 500)
    }catch(e:any){
      const msg = e.message || 'Unknown error'
      setErrorMsg(msg)
      setCode(`import React from 'react';
export default function App(){
 return <div style={{padding:24,fontFamily:'system-ui',background:'#fff0f0',minHeight:'100vh'}}>
  <div style={{background:'white',border:'1px solid #ffcccc',padding:20,borderRadius:16}}>
    <h1 style={{fontSize:20,fontWeight:900,color:'#b91c1c'}}>⚠️ Build Failed</h1>
    <p style={{marginTop:8,fontSize:13,color:'#333',wordBreak:'break-all'}}>${msg.replace(/</g,'')}</p>
    <div style={{marginTop:16,background:'#f8f8f8',padding:12,borderRadius:12,fontSize:12}}>
      <b>Fix:</b><br/>
      1. Vercel → Settings → Environment Variables<br/>
      2. Check GROQ_API_KEY starts with gsk_<br/>
      3. Redeploy
    </div>
  </div>
 </div>
}`)
    }
    setLoading(false)
  }

  function handleDownload(){
    if(!code || code.includes('Build Failed')) return alert('Build an app first!')
    const clean = cleanForPublish(code)
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Emma App</title><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>body{margin:0;background:#000}</style></head><body><div id="root"></div><script type="text/babel" data-presets="react">
${clean}
try{const root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(App));}catch(e){document.body.innerHTML='<div style=padding:20;color:red>Error: '+e.message+'</div>'}
<\/script></body></html>`
    const blob = new Blob([html], {type:'text/html'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href=url; a.download=`emma-app-${Date.now()}.html`; a.click()
    setTimeout(()=>URL.revokeObjectURL(url), 5000)
  }

  function handlePublish(){
    if(!code || code.includes('Build Failed')) return alert('Build a working app first!')
    const clean = cleanForPublish(code)
    // FIX: Use Blob URL not about:blank - fixes your screenshot bug
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Published - Emma AI</title><script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script><style>body{margin:0;background:#000}</style></head><body><div id="root"></div><script type="text/babel" data-presets="react">
${clean}
const root=ReactDOM.createRoot(document.getElementById('root'));root.render(React.createElement(App));
<\/script><div style="position:fixed;bottom:12px;right:12px;background:black;color:white;padding:8px 14px;border-radius:20px;font-size:11px;font-family:sans-serif;border:1px solid #333;z-index:9999">Published by EMMA AI BUILDER • Ibadan</div></body></html>`
    const blob = new Blob([html], {type:'text/html'})
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setPublished(true)
    setTimeout(()=>URL.revokeObjectURL(url), 60000)
  }

  return(
    <div className="min-h-screen bg-black text-white">
      <nav className="p-4 border-b border-zinc-900 flex justify-between sticky top-0 bg-black z-20">
        <h1 className="font-black tracking-tighter">EMMA AI BUILDER <span className="text-[9px] bg-white text-black px-2 py-0.5 rounded-full ml-2">LOVABLE CLONE</span></h1>
        <a href="/admin" className="text-xs border border-zinc-800 px-3 py-1.5 rounded-full">Admin • Earnings</a>
      </nav>
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-[420px_1fr] gap-0">
        <div className="p-6 border-r border-zinc-900 lg:h-[92vh] overflow-auto flex flex-col">
          <h2 className="text-[42px] font-black leading-[0.9] tracking-tighter">What do you want to build today?</h2>
          <p className="text-zinc-500 text-[13px] mt-3">Build POS, Church, School, VTU, Banking apps instantly.</p>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Build me a POS app for Bodija..." className="w-full mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-28 text-sm outline-none focus:border-white"/>
          <button onClick={()=>buildApp()} className="w-full mt-3 bg-white text-black py-4 rounded-full font-black text-sm disabled:opacity-50" disabled={loading}>{loading?'Building... (10s)':'Generate App →'}</button>
          {errorMsg && <div className="mt-3 bg-red-950 border border-red-800 p-3 rounded-xl text-[11px] text-red-300">{errorMsg}</div>}
          <div className="grid grid-cols-2 gap-2 mt-6">{EXAMPLES.map(ex=><button key={ex.t} onClick={()=>buildApp(ex.p)} className="border border-zinc-800 hover:bg-zinc-900 p-3 rounded-xl text-left"><div className="font-bold text-[12px]">{ex.t}</div></button>)}</div>
        </div>
        <div ref={previewRef} className="bg-white flex flex-col h-[92vh]">
          <div className="p-3 border-b bg-black text-white flex justify-between items-center">
            <span className="text-xs font-bold">⚡ Live Preview</span>
            <div className="flex gap-2 items-center">
              {code && !code.includes('Build Failed') && <>
                <button onClick={handleDownload} className="text-[11px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-3 py-1.5 rounded-full font-bold">⬇ Download HTML</button>
                <button onClick={handlePublish} className="text-[11px] bg-white text-black px-4 py-1.5 rounded-full font-black">{published?'✅ Published':'🚀 Publish'}</button>
              </>}
              <span className={`text-[9px] px-2 py-1 rounded-full ml-1 ${loading?'bg-yellow-400 text-black':'bg-green-400 text-black'}`}>{loading?'BUILDING':'LIVE'}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            {code? (
              <SandpackProvider template="react" files={{'/App.js': code}} style={{height:'100%'}}>
                <SandpackPreview style={{height:'100%'}} showNavigator={false} showOpenInCodeSandbox={false} showRefreshButton={true} />
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

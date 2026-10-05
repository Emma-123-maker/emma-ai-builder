'use client'
import { useEffect, useState } from 'react'

export default function Preview({ code }: { code: string }){
  const [srcDoc, setSrcDoc] = useState('')
  useEffect(()=>{
    if(!code) return
    const html = `
      <html><body>
        <div id="root"></div>
        <script type="importmap">{"imports":{"react":"https://esm.sh/react@18","react-dom":"https://esm.sh/react-dom@18"}}</script>
        <script type="module">
          import React from 'react'; import * as ReactDOM from 'react-dom/client';
          window.React = React;
          ${code.replace('export default', 'const App =')};
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
        </script>
      </body></html>`
    setSrcDoc(html)
  },[code])
  return (
    <div className="h-full bg-white">
      <div className="p-2 bg-gray-100 text-xs font-bold border-b flex justify-between"><span>🔴 LIVE PREVIEW</span><span>Emma AI Builder</span></div>
      <iframe srcDoc={srcDoc} className="w-full h-[85vh] border-0" sandbox="allow-scripts" />
    </div>
  )
}

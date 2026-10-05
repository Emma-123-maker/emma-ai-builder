'use client'
export default function CodeViewer({ code }: { code: string }){
  return <pre className="bg-black text-green-400 p-4 text-xs overflow-auto h-[85vh]">{code}</pre>
}

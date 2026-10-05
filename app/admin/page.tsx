export default function Admin(){
  return(
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="font-black text-3xl">Admin • Emma AI Builder</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><div className="text-zinc-500 text-xs">Total Users</div><div className="text-3xl font-black mt-1">1,247</div></div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><div className="text-zinc-500 text-xs">Apps Built</div><div className="text-3xl font-black mt-1">3,892</div></div>
        <div className="bg-green-500 text-black p-6 rounded-2xl"><div className="text-xs font-bold">Earnings (₦)</div><div className="text-3xl font-black mt-1">₦284,500</div></div>
      </div>
      <div className="mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
        <h3 className="font-bold text-sm">Recent Apps</h3>
        <div className="mt-3 space-y-2 text-xs text-zinc-400">
          <div className="flex justify-between border-b border-zinc-800 py-2"><span>Tunde - POS App Bodija</span><span className="text-green-400">₦5k Paid</span></div>
          <div className="flex justify-between border-b border-zinc-800 py-2"><span>Sarah - Church App RCCG</span><span>Free</span></div>
          <div className="flex justify-between py-2"><span>Emmanuel - PayVault Clone</span><span className="text-green-400">₦5k Paid</span></div>
        </div>
      </div>
    </div>
  )
}

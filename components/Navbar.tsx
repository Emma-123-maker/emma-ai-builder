export default function Navbar(){
  return (
    <nav className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
      <h1 className="font-black text-xl">🚀 Emma AI Builder</h1>
      <div className="flex gap-3">
        <span className="text-sm bg-black text-white px-3 py-1 rounded-full">Ibadan • Nigeria</span>
        <a href="/admin" className="text-sm border px-3 py-1 rounded-full">Admin</a>
      </div>
    </nav>
  )
}

'use client';
import { useState, useEffect } from 'react';
const NAV = [['Dashboard','/admin'],['CRM','/admin/crm'],['Inventory','/admin/inventory'],['Calculator','/admin/calculator'],['Instructions','/admin/instructions'],['Peptide AI','/admin/peptide-ai'],['COAs','/admin/coa'],['Users','/admin/users']];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if(sessionStorage.getItem('admin_auth')==='true') setAuthed(true); }, []);
  const login = async () => {
    const r = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pin}) });
    const d = await r.json();
    if (d.success) { sessionStorage.setItem('admin_auth','true'); setAuthed(true); } else setError('Invalid PIN');
  };
  if (!authed) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl p-8 w-80">
        <h1 className="text-xl font-bold text-white mb-6 text-center">Admin Access</h1>
        <input type="password" placeholder="Enter PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-green-500" />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <button onClick={login} className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium">Login</button>
      </div>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 bg-slate-900 text-white flex flex-col p-4">
        <div className="mb-8"><div className="text-green-400 font-bold text-lg">BeSmart</div><div className="text-slate-400 text-xs">Health Admin</div></div>
        <nav className="space-y-1 flex-1">{NAV.map(([label,href])=>(<a key={href} href={href} className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">{label}</a>))}</nav>
        <button onClick={()=>{sessionStorage.removeItem('admin_auth');setAuthed(false);}} className="text-slate-400 hover:text-white text-xs py-2">Sign Out</button>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
type Customer = { id:string; name:string; email:string; phone:string; peptides:string; dosage:string; startDate:string; nextRefill:string; notes:string; referredBy:string; credits:string; status:string; };
const EMPTY = { name:'',email:'',phone:'',peptides:'',dosage:'',startDate:'',nextRefill:'',notes:'',referredBy:'',credits:'0',status:'active' };
export default function CRMPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const r = await fetch('/api/crm'); const d = await r.json(); setCustomers(d.customers||[]); setLoading(false); };
  const save = async () => {
    await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editId?'update':'add',item:form,rowIndex:editId})});
    await load(); setShowForm(false); setForm({...EMPTY}); setEditId(null);
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">CRM</h1>
        <button onClick={()=>{setShowForm(true);setEditId(null);setForm({...EMPTY});}} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Add Customer</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> : (
          <table className="w-full text-sm"><thead className="bg-slate-50 border-b"><tr>{['Name','Email','Phone','Peptides','Next Refill','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-slate-600 font-medium text-xs">{h}</th>)}</tr></thead>
          <tbody>{customers.length===0?<tr><td colSpan={7} className="text-center py-8 text-slate-400">No customers yet.</td></tr>:customers.map(c=>(
            <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-slate-500">{c.email}</td>
              <td className="px-4 py-3 text-slate-500">{c.phone}</td>
              <td className="px-4 py-3 text-slate-500">{c.peptides}</td>
              <td className="px-4 py-3 text-slate-500">{c.nextRefill}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">{c.status}</span></td>
              <td className="px-4 py-3"><button onClick={()=>{setForm({name:c.name,email:c.email,phone:c.phone,peptides:c.peptides,dosage:c.dosage,startDate:c.startDate,nextRefill:c.nextRefill,notes:c.notes,referredBy:c.referredBy,credits:c.credits,status:c.status});setEditId(c.id);setShowForm(true);}} className="text-blue-600 hover:text-blue-800 text-xs">Edit</button></td>
            </tr>))}
          </tbody></table>
        )}
      </div>
      {showForm&&(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{editId?'Edit':'Add'} Customer</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(form).map(([k,v])=>(<div key={k}><label className="text-xs text-slate-600 mb-1 block capitalize">{k}</label><input value={v} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" /></div>))}
            </div>
            <div className="flex gap-3"><button onClick={save} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium">Save</button><button onClick={()=>setShowForm(false)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg text-sm font-medium">Cancel</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
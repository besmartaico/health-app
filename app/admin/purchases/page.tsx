'use client';
import { useState, useEffect } from 'react';
type Purchase = { id:string;date:string;supplier:string;peptide:string;quantity:string;unitCost:string;totalCost:string;batchNo:string;notes:string; };
const PEMPTY = { date:'', supplier:'', peptide:'', quantity:'', unitCost:'', totalCost:'', batchNo:'', notes:'' };
export default function PurchasesPage() {
  const [items, setItems] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...PEMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { loadData(); }, []);
  const loadData = async () => { setLoading(true); const r = await fetch('/api/purchases'); const d = await r.json(); setItems(d.purchases||[]); setLoading(false); };
  const calcTotal = (qty:string, cost:string) => { const t = parseFloat(qty||'0')*parseFloat(cost||'0'); return isNaN(t)?'':t.toFixed(2); };
  const save = async () => {
    setSaving(true);
    await fetch('/api/purchases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editId?'update':'add',item:{...form,totalCost:calcTotal(form.quantity,form.unitCost)},rowIndex:editId})});
    await loadData(); setShowForm(false); setForm({...PEMPTY}); setEditId(null); setSaving(false);
  };
  const totalSpent = items.reduce((acc,it)=>acc+parseFloat(it.totalCost||'0'),0);
  const uniquePeptides = [...new Set(items.map(it=>it.peptide).filter(Boolean))].length;
  const fmtMoney = (n:number) => n.toFixed(2);
  return (
    <div style={{padding:'28px',maxWidth:'1100px'}}>
      <h1 style={{fontSize:'22px',fontWeight:'800',color:'#fff',margin:'0 0 4px'}}>Lab Purchases</h1>
      <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 24px'}}>Track all peptide purchases from suppliers</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'16px 20px'}}>
          <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Total Spent</div>
          <div style={{fontSize:'24px',fontWeight:'800',color:'#c0394f'}}>{'$'+fmtMoney(totalSpent)}</div>
        </div>
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'16px 20px'}}>
          <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Total Orders</div>
          <div style={{fontSize:'24px',fontWeight:'800',color:'#3b82f6'}}>{items.length}</div>
        </div>
        <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'16px 20px'}}>
          <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'6px'}}>Unique Peptides</div>
          <div style={{fontSize:'24px',fontWeight:'800',color:'#10b981'}}>{uniquePeptides}</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <span style={{color:'#9ca3af',fontSize:'13px'}}>{items.length} purchases</span>
        <button style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}} onClick={()=>{setShowForm(true);setEditId(null);setForm({...PEMPTY,date:new Date().toISOString().split('T')[0]});}}>+ Add Purchase</button>
      </div>
      <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'12px',overflow:'hidden'}}>
        {loading?<div style={{padding:'40px',textAlign:'center',color:'#6b7280'}}>Loading...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Supplier','Peptide','Qty','Unit Cost','Total','Batch',''].map(h=><th key={h} style={{textAlign:'left',padding:'10px 16px',fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',borderBottom:'1px solid #2a2a2a',background:'#191919'}}>{h}</th>)}</tr></thead>
            <tbody>{items.length===0?<tr><td colSpan={8} style={{padding:'32px',textAlign:'center',color:'#4b5563',fontSize:'13px'}}>No purchases yet.</td></tr>:items.map(row=>(
              <tr key={row.id} onMouseOver={e=>(e.currentTarget as HTMLTableRowElement).style.background='#222'} onMouseOut={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'}}>{row.date}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'}}>{row.supplier}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#fff',fontWeight:'600',borderBottom:'1px solid #1a1a1a'}}>{row.peptide}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'}}>{row.quantity}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'}}>{'$'+fmtMoney(parseFloat(row.unitCost||'0'))}</td>
                <td style={{padding:'12px 16px',fontSize:'13px',color:'#c0394f',fontWeight:'700',borderBottom:'1px solid #1a1a1a'}}>{'$'+fmtMoney(parseFloat(row.totalCost||'0'))}</td>
                <td style={{padding:'12px 16px',fontSize:'11px',color:'#6b7280',borderBottom:'1px solid #1a1a1a'}}>{row.batchNo}</td>
                <td style={{padding:'12px 16px',borderBottom:'1px solid #1a1a1a'}}><button onClick={()=>{setForm({date:row.date,supplier:row.supplier,peptide:row.peptide,quantity:row.quantity,unitCost:row.unitCost,totalCost:row.totalCost,batchNo:row.batchNo,notes:row.notes});setEditId(row.id);setShowForm(true);}} style={{background:'transparent',border:'1px solid #3a3a3a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showForm&&(
        <div style={{position:'fixed',inset:'0',background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'520px'}}>
            <h2 style={{color:'#fff',fontSize:'18px',fontWeight:'700',margin:'0 0 20px'}}>{editId?'Edit':'Add'} Lab Purchase</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
              {[['date','Date','date'],['supplier','Supplier','text'],['peptide','Peptide','text'],['batchNo','Batch #','text'],['quantity','Quantity','number'],['unitCost','Unit Cost','number']].map(([k,l,t])=>(
                <div key={k}><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.06em'}}>{l}</label>
                  <input type={t} value={(form as Record<string,string>)[k]} onChange={e=>{const u={...form,[k]:e.target.value};if(k==='quantity'||k==='unitCost')u.totalCost=calcTotal(k==='quantity'?e.target.value:form.quantity,k==='unitCost'?e.target.value:form.unitCost);setForm(u);}} style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box'}}/></div>
              ))}
            </div>
            <div style={{marginBottom:'16px'}}><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Total Cost</label><div style={{background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'9px 12px',color:'#c0394f',fontWeight:'700',fontSize:'15px'}}>{'$'+(form.totalCost||'0.00')}</div></div>
            <div style={{marginBottom:'20px'}}><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Notes</label><textarea value={form.notes} onChange={e=>setForm(prev=>({...prev,notes:e.target.value}))} style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box',resize:'none',height:'60px'}}/></div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={save} disabled={saving} style={{flex:1,background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>{saving?'Saving...':'Save'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...PEMPTY});setEditId(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #333',borderRadius:'8px',padding:'12px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
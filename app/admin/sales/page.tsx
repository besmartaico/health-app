'use client';
import { useState, useEffect } from 'react';
type Sale = { id:string; date:string; customer:string; peptide:string; quantity:string; salePrice:string; totalRevenue:string; notes:string; };
const EMPTY = { date:new Date().toISOString().split('T')[0], customer:'', peptide:'', quantity:'', salePrice:'', totalRevenue:'', notes:'' };
export default function SalesPage() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editId, setEditId] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const r = await fetch('/api/sales'); const d = await r.json(); setItems(d.sales||[]); setLoading(false); };
  const calcTotal = (qty:string, price:string) => { const t = parseFloat(qty||'0') * parseFloat(price||'0'); return isNaN(t) ? '' : t.toFixed(2); };
  const save = async () => {
    setSaving(true);
    const item = { ...form, totalRevenue: calcTotal(form.quantity, form.salePrice) };
    await fetch('/api/sales', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:editId?'update':'add', item, rowIndex:editId }) });
    await load(); setShowForm(false); setForm({...EMPTY}); setEditId(null); setSaving(false);
  };
  const totalRev = items.reduce((s,i)=>s+parseFloat(i.totalRevenue||'0'),0);
  const S = { page:{padding:'28px',maxWidth:'1100px'}, h1:{fontSize:'22px',fontWeight:'800',color:'#fff',margin:'0 0 4px'}, sub:{color:'#6b7280',fontSize:'13px',margin:'0 0 24px'}, card:{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'12px',overflow:'hidden'}, th:{textAlign:'left' as const,padding:'10px 16px',fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase' as const,letterSpacing:'0.08em',borderBottom:'1px solid #2a2a2a',background:'#191919'}, td:{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'}, stat:{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'16px 20px'} };
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Sales</h1>
      <p style={S.sub}>Track peptide sales and revenue</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[['Total Revenue','$'+totalRev.toFixed(2),'#10b981'],['Total Sales',items.length.toString(),'#3b82f6'],['Unique Customers',[...new Set(items.map(i=>i.customer).filter(Boolean))].length.toString(),'#8b5cf6']].map(([l,v,c])=>(
          <div key={String(l)} style={S.stat}><div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'6px'}}>{l}</div><div style={{fontSize:'24px',fontWeight:'800',color:String(c)}}>{v}</div></div>
        ))}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
        <span style={{color:'#9ca3af',fontSize:'13px'}}>{items.length} sales</span>
        <button style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 18px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}} onClick={()=>{setShowForm(true);setEditId(null);setForm({...EMPTY});}}>+ Record Sale</button>
      </div>
      <div style={S.card}>
        {loading?<div style={{padding:'40px',textAlign:'center',color:'#6b7280'}}>Loading...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Customer','Peptide','Qty','Sale Price','Revenue',''].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{items.length===0?<tr><td colSpan={7} style={{...S.td,textAlign:'center',padding:'32px',color:'#4b5563'}}>No sales yet.</td></tr>:items.map(s=>(
              <tr key={s.id} onMouseOver={e=>(e.currentTarget as HTMLTableRowElement).style.background='#222'} onMouseOut={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
                <td style={S.td}>{s.date}</td>
                <td style={{...S.td,color:'#fff',fontWeight:'600'}}>{s.customer}</td>
                <td style={S.td}>{s.peptide}</td>
                <td style={S.td}>{s.quantity}</td>
                <td style={S.td}>${parseFloat(s.salePrice||'0').toFixed(2)}</td>
                <td style={{...S.td,color:'#10b981',fontWeight:'700'}}>${parseFloat(s.totalRevenue||'0').toFixed(2)}</td>
                <td style={S.td}><button onClick={()=>{setForm({date:s.date,customer:s.customer,peptide:s.peptide,quantity:s.quantity,salePrice:s.salePrice,totalRevenue:s.totalRevenue,notes:s.notes});setEditId(s.id);setShowForm(true);}} style={{background:'transparent',border:'1px solid #3a3a3a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'480px',boxShadow:'0 24px 48px rgba(0,0,0,0.5)'}}>
            <h2 style={{color:'#fff',fontSize:'18px',fontWeight:'700',margin:'0 0 20px'}}>{editId?'Edit':'Record'} Sale</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
              {[['date','Date','date'],['customer','Customer','text'],['peptide','Peptide','text'],['quantity','Quantity','number'],['salePrice','Sale Price ($)','number']].map(([k,l,t])=>(
                <div key={k}><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{l}</label>
                  <input type={String(t)} value={(form as any)[k]} onChange={e=>{const upd={...form,[k]:e.target.value};if(k==='quantity'||k==='salePrice')upd.totalRevenue=calcTotal(k==='quantity'?e.target.value:form.quantity,k==='salePrice'?e.target.value:form.salePrice);setForm(upd);}} style={{width:'100%',background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box' as const}} /></div>
              ))}
            </div>
            <div style={{marginBottom:'16px'}}><label style={{display:'block',color:'#9ca3af',fontSize:'11px',fontWeight:'600',marginBottom:'5px',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>Total Revenue</label>
              <div style={{background:'#111',border:'1px solid #333',borderRadius:'8px',padding:'9px 12px',color:'#10b981',fontWeight:'700',fontSize:'15px'}}>${form.totalRevenue||'0.00'}</div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
              <button onClick={save} disabled={saving} style={{flex:1,background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>{saving?'Saving...':'Save Sale'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditId(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #333',borderRadius:'8px',padding:'12px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
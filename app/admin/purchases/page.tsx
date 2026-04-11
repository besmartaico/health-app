// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'12px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const EMPTY = { date:'', vendor:'', item:'', quantity:'', unitCost:'', discount:'', notes:'' };

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [search, setSearch] = useState('');
  const [useCustomItem, setUseCustomItem] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/purchases').then(x => x.json()); setPurchases(r.purchases || []); } catch {}
    setLoading(false);
  };

  const showT = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(() => setToast(''), 3500); };

  // Unique sorted vendor names from past purchases
  const pastVendors = [...new Set(purchases.map(p => p.vendor).filter(Boolean))].sort();

  // Unique sorted item names from past purchases
  const pastItems = [...new Set(purchases.map(p => p.item).filter(Boolean))].sort();

  const calcTotals = (f) => {
    const qty = parseFloat(f.quantity) || 0;
    const unit = parseFloat(f.unitCost) || 0;
    const disc = parseFloat(f.discount) || 0;
    const subtotal = qty * unit;
    const discAmt = subtotal * (disc / 100);
    return { subtotal, discAmt, total: subtotal - discAmt };
  };

  const save = async () => {
    if (!form.item.trim()) return;
    setSaving(true);
    const { total } = calcTotals(form);
    try {
      const payload = { ...form, totalCost: total.toFixed(2) };
      const res = await fetch('/api/purchases', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: editIdx!==null?'update':'add', purchase: payload, index: editIdx }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT(editIdx!==null?'Purchase updated!':'Purchase added!', false); setShowForm(false); setForm({...EMPTY}); setEditIdx(null); setUseCustomItem(false); await load(); }
    } catch(e) { showT('Error: '+String(e), true); }
    setSaving(false);
  };

  const del = async (idx, item) => {
    if (!confirm('Delete purchase for "'+item+'"?')) return;
    await fetch('/api/purchases', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', index:idx }) });
    await load();
  };

  const openAdd = () => {
    setForm({...EMPTY, date: new Date().toISOString().split('T')[0]});
    setEditIdx(null); setUseCustomItem(false); setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ date:p.date||'', vendor:p.vendor||'', item:p.item||'', quantity:p.quantity||'', unitCost:p.unitCost||'', discount:p.discount||'', notes:p.notes||'' });
    setEditIdx(p.id||null);
    setUseCustomItem(!pastItems.includes(p.item));
    setShowForm(true);
  };

  const filtered = purchases.filter(p => !search || p.item?.toLowerCase().includes(search.toLowerCase()) || p.vendor?.toLowerCase().includes(search.toLowerCase()));
  const totalSpend = filtered.reduce((s, p) => s + (parseFloat(p.totalCost)||0), 0);
  const { subtotal: fSub, discAmt: fDisc, total: fTotal } = calcTotals(form);

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1100px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Purchases</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{purchases.length} records · ${totalSpend.toLocaleString('en-US',{minimumFractionDigits:2})} total spend</p>
        </div>
        <button onClick={openAdd} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Add Purchase</button>
      </div>

      <div style={{marginBottom:'16px'}}>
        <input type='text' placeholder='Search by item or vendor...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'320px'}} />
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>🛒</div>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>{purchases.length===0?'No purchases yet':'No results'}</div>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
            <thead><tr>{['Date','Vendor','Item','Qty','Unit Cost','Discount','Total',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#6b7280',whiteSpace:'nowrap'}}>{p.date||'—'}</td>
                  <td style={td}>{p.vendor||'—'}</td>
                  <td style={{...td,color:'#fff',fontWeight:600}}>{p.item}</td>
                  <td style={td}>{p.quantity||'—'}</td>
                  <td style={td}>{p.unitCost?'$'+parseFloat(p.unitCost).toFixed(2):'—'}</td>
                  <td style={td}>{p.discount?<span style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'20px',padding:'2px 8px',color:'#34d399',fontSize:'11px',fontWeight:600}}>-{p.discount}%</span>:'—'}</td>
                  <td style={{...td,color:'#34d399',fontWeight:700}}>{p.totalCost?'$'+parseFloat(p.totalCost).toLocaleString('en-US',{minimumFractionDigits:2}):'—'}</td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>openEdit(p)} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(p.id||i,p.item)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'500px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 24px'}}>{editIdx!==null?'Edit Purchase':'Add Purchase'}</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
              <div><label style={lbl}>Date</label><input type='date' value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{...inp,colorScheme:'dark'}} /></div>
              <div>
                <label style={lbl}>Vendor</label>
                <input type='text' placeholder='Select or type vendor...' value={form.vendor} onChange={e=>setForm(p=>({...p,vendor:e.target.value}))} style={inp} list='vendor-list' autoComplete='off' />
                <datalist id='vendor-list'>
                  {pastVendors.map(v=><option key={v} value={v} />)}
                </datalist>
              </div>

              {/* Item field — dropdown of past items OR free-text */}
              <div style={{gridColumn:'1/-1'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                  <label style={{...lbl,margin:0}}>Item / Peptide *</label>
                  {pastItems.length>0&&(
                    <button onClick={()=>{setUseCustomItem(v=>!v);setForm(p=>({...p,item:''}));}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'11px',cursor:'pointer',textDecoration:'underline'}}>
                      {useCustomItem?'← Choose from list':'+ New item'}
                    </button>
                  )}
                </div>
                {pastItems.length>0&&!useCustomItem?(
                  <select value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} style={{...inp,color:form.item?'#fff':'#4b5563'}}>
                    <option value=''>Select a previously purchased item...</option>
                    {pastItems.map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                ):(pastItems.length===0?(
                  <input type='text' placeholder='e.g. Tirzepatide 10mg' value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} style={inp} autoFocus />
                ):(
                  <input type='text' placeholder='Enter new item name...' value={form.item} onChange={e=>setForm(p=>({...p,item:e.target.value}))} style={inp} autoFocus />
                ))}
              </div>

              <div><label style={lbl}>Quantity</label><input type='number' placeholder='e.g. 10' value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Unit Cost ($)</label><input type='number' step='0.01' placeholder='e.g. 130' value={form.unitCost} onChange={e=>setForm(p=>({...p,unitCost:e.target.value}))} style={inp} /></div>
              <div>
                <label style={lbl}>Discount (%)</label>
                <div style={{position:'relative'}}>
                  <input type='number' min='0' max='100' step='0.1' placeholder='e.g. 10' value={form.discount} onChange={e=>setForm(p=>({...p,discount:e.target.value}))} style={{...inp,paddingRight:'32px'}} />
                  <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:'#6b7280',fontSize:'14px',pointerEvents:'none'}}>%</span>
                </div>
              </div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp} /></div>
            </div>

            {(form.quantity||form.unitCost)&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'14px',marginBottom:'16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#6b7280',marginBottom:'6px'}}><span>Subtotal ({form.quantity||0} × ${form.unitCost||0})</span><span style={{color:'#9ca3af'}}>${fSub.toFixed(2)}</span></div>
                {form.discount&&parseFloat(form.discount)>0&&(
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',color:'#34d399',marginBottom:'6px'}}><span>Discount ({form.discount}%)</span><span>-${fDisc.toFixed(2)}</span></div>
                )}
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'15px',fontWeight:700,color:'#fff',borderTop:'1px solid #2a2a2a',paddingTop:'8px',marginTop:'4px'}}><span>Total</span><span style={{color:'#34d399'}}>${fTotal.toFixed(2)}</span></div>
              </div>
            )}

            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={save} disabled={saving||!form.item.trim()} style={{flex:1,background:form.item.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.item.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.item.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Add Purchase'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditIdx(null);setUseCustomItem(false);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
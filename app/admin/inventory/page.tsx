// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'12px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const TYPES = ['Peptide','Supplement','Equipment','Supplies','Other'];
const EMPTY = { itemType:'Peptide', name:'', quantity:'', unit:'vials', reorderLevel:'', notes:'' };

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/inventory').then(x => x.json()); setItems(r.items || []); } catch {}
    setLoading(false);
  };

  const syncInventory = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await fetch('/api/inventory/backfill', { method: 'POST' }).then(x => x.json());
      if (r.success) {
        setSyncMsg('✓ ' + r.message);
        await load();
      } else {
        setSyncMsg('⚠ ' + (r.error || r.message || 'Sync failed'));
      }
    } catch(e) { setSyncMsg('⚠ ' + String(e)); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 6000);
  };

  const showT = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(() => setToast(''), 3500); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: editIdx!==null?'update':'add', item: form, index: editIdx }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT(editIdx!==null?'Item updated!':'Item added!', false); setShowForm(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+String(e), true); }
    setSaving(false);
  };

  const del = async (idx, name) => {
    if (!confirm('Delete "'+name+'" from inventory?')) return;
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', index:idx }) });
    await load();
  };

  const filtered = items.filter(i => {
    const matchType = filterType === 'All' || i.itemType === filterType;
    const matchSearch = !search || i.name?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const lowStock = items.filter(i => i.reorderLevel && parseFloat(i.quantity) <= parseFloat(i.reorderLevel));

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1100px'}} className='page-pad'>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Inventory</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{items.length} items{lowStock.length>0?` · `:''}
            {lowStock.length>0&&<span style={{color:'#f87171',fontWeight:600}}>{lowStock.length} low stock</span>}
          </p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'flex-end'}}>
          <button
            onClick={syncInventory}
            disabled={syncing}
            title='Recalculates inventory: all purchases added, all sales subtracted'
            style={{background:syncing?'#111':'rgba(16,185,129,0.08)',color:syncing?'#4b5563':'#34d399',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'9px',padding:'10px 16px',fontSize:'13px',fontWeight:600,cursor:syncing?'not-allowed':'pointer',whiteSpace:'nowrap'}}
          >
            {syncing?'⟳ Syncing...':'⟳ Sync from Purchases & Sales'}
          </button>
          <button onClick={()=>{setForm({...EMPTY});setEditIdx(null);setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>+ Add Item</button>
        </div>
      </div>

      {/* Sync result message */}
      {syncMsg&&(
        <div style={{marginBottom:'16px',padding:'10px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:500,
          background:syncMsg.startsWith('✓')?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)',
          border:'1px solid '+(syncMsg.startsWith('✓')?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'),
          color:syncMsg.startsWith('✓')?'#34d399':'#f87171'
        }}>{syncMsg}</div>
      )}

      {/* Filters */}
      <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap',alignItems:'center'}}>
        <input type='text' placeholder='Search items...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'260px'}} />
        <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px'}}>
          {['All',...TYPES].map(t=>(
            <button key={t} onClick={()=>setFilterType(t)} style={{background:filterType===t?'#0f0f0f':'transparent',color:filterType===t?'#fff':'#6b7280',border:filterType===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'6px',padding:'5px 12px',fontSize:'12px',fontWeight:filterType===t?600:400,cursor:'pointer'}}>{t}</button>
          ))}
        </div>
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>📦</div>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>{items.length===0?'No inventory yet':'No results'}</div>
            <div style={{color:'#4b5563',fontSize:'13px'}}>
              {items.length===0?<>Click <strong style={{color:'#34d399'}}>⟳ Sync from Purchases & Sales</strong> to auto-populate from your records, or add items manually.</>:'Try a different search or filter.'}
            </div>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead><tr>{['Type','Name','Quantity','Unit','Reorder At','Notes',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((item, i) => {
                const isLow = item.reorderLevel && parseFloat(item.quantity) <= parseFloat(item.reorderLevel);
                return (
                  <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={td}><span style={{background:'rgba(123,28,46,0.15)',border:'1px solid rgba(123,28,46,0.3)',borderRadius:'20px',padding:'2px 8px',color:'#f9a8d4',fontSize:'11px',fontWeight:600}}>{item.itemType||'—'}</span></td>
                    <td style={{...td,color:'#fff',fontWeight:600}}>{item.name}</td>
                    <td style={td}><span style={{color:isLow?'#f87171':'#34d399',fontWeight:700,fontSize:'15px'}}>{item.quantity||'0'}</span>{isLow&&<span style={{marginLeft:'6px',fontSize:'10px',color:'#f87171',fontWeight:600}}>LOW</span>}</td>
                    <td style={{...td,color:'#6b7280'}}>{item.unit||'—'}</td>
                    <td style={{...td,color:'#6b7280'}}>{item.reorderLevel||'—'}</td>
                    <td style={{...td,color:'#6b7280',fontSize:'12px',maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.notes||'—'}</td>
                    <td style={td}>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={()=>{setForm({itemType:item.itemType||'Peptide',name:item.name||'',quantity:item.quantity||'',unit:item.unit||'vials',reorderLevel:item.reorderLevel||'',notes:item.notes||''});setEditIdx(item.id||i);setShowForm(true);}} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                        <button onClick={()=>del(item.id||i,item.name)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'480px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 24px'}}>{editIdx!==null?'Edit Item':'Add Item'}</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Item Type</label><select value={form.itemType} onChange={e=>setForm(p=>({...p,itemType:e.target.value}))} style={{...inp,color:'#fff'}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='e.g. Tirzepatide 10mg' value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} autoFocus /></div>
              <div><label style={lbl}>Quantity</label><input type='number' placeholder='0' value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Unit</label><input type='text' placeholder='vials' value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Reorder At</label><input type='number' placeholder='e.g. 5' value={form.reorderLevel} onChange={e=>setForm(p=>({...p,reorderLevel:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp} /></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Add Item'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
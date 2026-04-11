// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'10px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const TYPES = ['Peptide','Supplement','Equipment','Supplies','Other'];
const EMPTY = { itemType:'Peptide', name:'', quantity:'', unit:'vials', reorderLevel:'', notes:'' };

// Inline quantity stepper component
function QtyCell({ item, index, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.quantity||'0');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setVal(item.quantity||'0'); }, [item.quantity]);

  const save = async (newVal) => {
    const n = String(Math.max(0, parseFloat(newVal)||0));
    if (n === (item.quantity||'0')) { setEditing(false); return; }
    setSaving(true);
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'update', item:{...item, quantity:n}, index: item.id||index }) });
    setSaving(false);
    setEditing(false);
    onSaved();
  };

  const adjust = async (delta) => {
    const current = parseFloat(item.quantity)||0;
    const newQty = Math.max(0, current + delta);
    setVal(String(newQty));
    setSaving(true);
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'update', item:{...item, quantity:String(newQty)}, index: item.id||index }) });
    setSaving(false);
    onSaved();
  };

  const isLow = item.reorderLevel && parseFloat(item.quantity) <= parseFloat(item.reorderLevel);

  return (
    <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
      <button onClick={()=>adjust(-1)} disabled={saving} style={{width:'26px',height:'26px',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'6px',color:'#f87171',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:700,lineHeight:1}}>−</button>
      {editing ? (
        <input ref={inputRef} type='number' value={val} onChange={e=>setVal(e.target.value)}
          onBlur={()=>save(val)} onKeyDown={e=>{ if(e.key==='Enter') save(val); if(e.key==='Escape'){setEditing(false);setVal(item.quantity||'0');} }}
          style={{width:'52px',background:'#0f0f0f',border:'1px solid #7b1c2e',borderRadius:'6px',padding:'3px 6px',color:'#fff',fontSize:'14px',fontWeight:700,textAlign:'center',outline:'none'}}
          autoFocus
        />
      ) : (
        <span
          onClick={()=>{ setEditing(true); setTimeout(()=>inputRef.current?.select(),10); }}
          title='Tap to edit quantity'
          style={{minWidth:'36px',textAlign:'center',color:saving?'#4b5563':isLow?'#f87171':'#34d399',fontWeight:800,fontSize:'16px',cursor:'pointer',padding:'3px 4px',borderRadius:'6px',border:'1px solid transparent',transition:'border-color 0.1s'}}
          onMouseOver={e=>e.currentTarget.style.borderColor='#2a2a2a'}
          onMouseOut={e=>e.currentTarget.style.borderColor='transparent'}
        >
          {saving?'…':val}
        </span>
      )}
      <button onClick={()=>adjust(1)} disabled={saving} style={{width:'26px',height:'26px',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'6px',color:'#34d399',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:700,lineHeight:1}}>+</button>
      {isLow&&<span style={{fontSize:'10px',color:'#f87171',fontWeight:700,marginLeft:'2px'}}>LOW</span>}
    </div>
  );
}

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
    try { const r = await fetch('/api/inventory').then(x=>x.json()); setItems(r.items||[]); } catch {}
    setLoading(false);
  };

  const syncInventory = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await fetch('/api/inventory/backfill', { method:'POST' }).then(x=>x.json());
      if(r.success) { setSyncMsg('✓ '+r.message); await load(); }
      else setSyncMsg('⚠ '+(r.error||r.message||'Sync failed'));
    } catch(e) { setSyncMsg('⚠ '+String(e)); }
    setSyncing(false);
    setTimeout(()=>setSyncMsg(''), 6000);
  };

  const showT = (msg,err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };

  const save = async () => {
    if(!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:editIdx!==null?'update':'add', item:form, index:editIdx }) });
      const d = await res.json();
      if(d.error) showT('Error: '+d.error,true);
      else { showT(editIdx!==null?'Updated!':'Added!',false); setShowForm(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+e,true); }
    setSaving(false);
  };

  const del = async (idx,name) => {
    if(!confirm('Delete "'+name+'"?')) return;
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', index:idx }) });
    await load();
  };

  const filtered = items.filter(i => {
    const mT = filterType==='All'||i.itemType===filterType;
    const mS = !search||i.name?.toLowerCase().includes(search.toLowerCase());
    return mT&&mS;
  });
  const lowStock = items.filter(i=>i.reorderLevel&&parseFloat(i.quantity)<=parseFloat(i.reorderLevel));

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1100px'}}>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',gap:'10px',flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Inventory</h1>
          <p style={{color:'#6b7280',fontSize:'12px',margin:0}}>{items.length} items{lowStock.length>0?<span style={{color:'#f87171',marginLeft:'6px'}}>· {lowStock.length} low</span>:''}</p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <button onClick={syncInventory} disabled={syncing} style={{background:syncing?'#111':'rgba(16,185,129,0.08)',color:syncing?'#4b5563':'#34d399',border:'1px solid rgba(16,185,129,0.2)',borderRadius:'9px',padding:'9px 14px',fontSize:'13px',fontWeight:600,cursor:syncing?'not-allowed':'pointer',whiteSpace:'nowrap'}}>
            {syncing?'⟳ Syncing…':'⟳ Sync'}
          </button>
          <button onClick={()=>{setForm({...EMPTY});setEditIdx(null);setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'9px 16px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>+ Add Item</button>
        </div>
      </div>

      {syncMsg&&<div style={{marginBottom:'12px',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:500,background:syncMsg.startsWith('✓')?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.08)',border:'1px solid '+(syncMsg.startsWith('✓')?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'),color:syncMsg.startsWith('✓')?'#34d399':'#f87171'}}>{syncMsg}</div>}

      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap',alignItems:'center'}}>
        <input type='text' placeholder='Search...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'240px'}} />
        <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px',flexWrap:'wrap'}}>
          {['All',...TYPES].map(t=>(
            <button key={t} onClick={()=>setFilterType(t)} style={{background:filterType===t?'#0f0f0f':'transparent',color:filterType===t?'#fff':'#6b7280',border:filterType===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'6px',padding:'5px 10px',fontSize:'12px',fontWeight:filterType===t?600:400,cursor:'pointer'}}>{t}</button>
          ))}
        </div>
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading…</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>📦</div>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>{items.length===0?'No inventory yet':'No results'}</div>
            <div style={{color:'#4b5563',fontSize:'13px'}}>{items.length===0?'Click ⟳ Sync or + Add Item to get started.':'Try a different search.'}</div>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'560px'}}>
            <thead><tr>
              {['Item','Qty — tap to adjust','Unit','Reorder',''].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((item,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600,maxWidth:'180px'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                    <div style={{fontSize:'11px',color:'#4b5563',marginTop:'1px'}}>{item.itemType}</div>
                  </td>
                  <td style={td}>
                    <QtyCell item={item} index={item.id||i} onSaved={load} />
                  </td>
                  <td style={{...td,color:'#6b7280'}}>{item.unit||'—'}</td>
                  <td style={{...td,color:'#6b7280'}}>{item.reorderLevel||'—'}</td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>{setForm({itemType:item.itemType||'Peptide',name:item.name||'',quantity:item.quantity||'',unit:item.unit||'vials',reorderLevel:item.reorderLevel||'',notes:item.notes||''});setEditIdx(item.id||i);setShowForm(true);}} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(item.id||i,item.name)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 8px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';}}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm&&(
        <div className='modal-wrap' style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div className='modal-inner' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'28px',width:'100%',maxWidth:'460px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{color:'#fff',fontSize:'18px',fontWeight:800,margin:0}}>{editIdx!==null?'Edit Item':'Add Item'}</h2>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditIdx(null);}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Type</label><select value={form.itemType} onChange={e=>setForm(p=>({...p,itemType:e.target.value}))} style={{...inp,color:'#fff'}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='e.g. Tirzepatide 10mg' value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} autoFocus /></div>
              <div><label style={lbl}>Quantity</label><input type='number' placeholder='0' value={form.quantity} onChange={e=>setForm(p=>({...p,quantity:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Unit</label><input type='text' placeholder='vials' value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Reorder At</label><input type='number' placeholder='e.g. 5' value={form.reorderLevel} onChange={e=>setForm(p=>({...p,reorderLevel:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp} /></div>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving…':editIdx!==null?'Save Changes':'Add Item'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'10px 12px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.07em', background:'#161616', borderBottom:'1px solid #1f1f1f', whiteSpace:'nowrap' };
const td = { padding:'9px 12px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1a1a1a', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'7px', padding:'9px 11px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' };
const dinp = { ...{width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'7px', padding:'9px 11px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box'} };
const EMPTY = { itemType:'Peptide', name:'', vialSize:'', quantity:'0', unitCost:'', supplier:'', purchaseDate:'', notes:'', priceStandard:'', priceFnF:'', cost:'', reorderPoint:'' };
const TYPES = ['Peptide','Supplement','Equipment','Supplies','Other'];

function PriceCell({ val, color }) {
  if (!val || val === '') return <span style={{color:'#2d2d2d'}}>—</span>;
  const n = parseFloat(val);
  if (isNaN(n)) return <span style={{color:'#2d2d2d'}}>—</span>;
  return <span style={{color, fontWeight:700}}>${n.toFixed(0)}</span>;
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({...EMPTY});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/inventory').then(x=>x.json()); setItems(r.items||[]); }
    catch(e) { console.error(e); }
    setLoading(false);
  };

  const showT = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };

  const adjustQty = async (item, delta) => {
    const nq = Math.max(0, (parseInt(item.quantity)||0) + delta);
    setItems(prev => prev.map((it,i) => i===parseInt(item.id) ? {...it, quantity:String(nq)} : it));
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'update_qty', index: item.id, item: {...item, quantity:String(nq)} }) });
  };

  const openAdd = () => { setForm({...EMPTY, purchaseDate:new Date().toISOString().split('T')[0]}); setEditIdx(null); setShowModal(true); };

  const openEdit = (item) => {
    setForm({ itemType:item.itemType||'Peptide', name:item.name||'', vialSize:item.vialSize||'',
      quantity:item.quantity||'0', unitCost:item.unitCost||'', supplier:item.supplier||'',
      purchaseDate:item.purchaseDate||'', notes:item.notes||'', createdDate:item.createdDate||'',
      priceStandard:item.priceStandard||'', priceFnF:item.priceFnF||'', cost:item.cost||'',
      reorderPoint:item.reorderPoint||'' });
    setEditIdx(parseInt(item.id));
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action: editIdx!==null?'update':'add', index: editIdx, item: form }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT(editIdx!==null?'Updated!':'Added!', false); setShowModal(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+e, true); }
    setSaving(false);
  };

  const del = async (item) => {
    if (!confirm('Delete '+item.name+'?')) return;
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'delete', index: item.id }) });
    await load();
  };

  const syncing = false;
  const filtered = items.filter(it => {
    const mt = typeFilter==='All' || it.itemType===typeFilter;
    const mq = !search || it.name?.toLowerCase().includes(search.toLowerCase());
    return mt && mq;
  });
  const f = p => e => setForm(prev=>({...prev,[p]:e.target.value}));

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px'}}>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:200,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
        <div><h1 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 2px'}}>Inventory</h1><p style={{color:'#6b7280',fontSize:'12px',margin:0}}>{items.length} items</p></div>
        <button onClick={openAdd} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 18px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Add Item</button>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap',alignItems:'center'}}>
        <input type='text' placeholder='Search...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'220px'}}/>
        <div style={{display:'flex',gap:'3px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px'}}>
          {['All',...TYPES].map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} style={{background:typeFilter===t?'#0f0f0f':'transparent',color:typeFilter===t?'#fff':'#6b7280',border:typeFilter===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'5px',padding:'4px 10px',fontSize:'11px',fontWeight:typeFilter===t?600:400,cursor:'pointer'}}>{t}</button>
          ))}
        </div>
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?<div style={{padding:'60px',textAlign:'center',color:'#4b5563'}}>No items</div>
        :(
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'700px'}}>
            <thead><tr>
              {['Item','Qty','Standard $','F&F $','Cost $','Reorder At',''].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((item,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600,maxWidth:'200px'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                    <div style={{fontSize:'10px',color:'#4b5563',marginTop:'1px',display:'flex',gap:'8px'}}>
                      <span>{item.itemType}</span>
                      {item.vialSize&&<span>{item.vialSize}</span>}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <button onClick={()=>adjustQty(item,-1)} style={{width:'26px',height:'26px',background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'5px',cursor:'pointer',fontSize:'16px',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
                      <span style={{color:'#34d399',fontWeight:700,minWidth:'28px',textAlign:'center',fontSize:'15px'}}>{item.quantity||0}</span>
                      <button onClick={()=>adjustQty(item,1)} style={{width:'26px',height:'26px',background:'#14532d',color:'#34d399',border:'1px solid #166534',borderRadius:'5px',cursor:'pointer',fontSize:'16px',lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
                    </div>
                  </td>
                  <td style={td}><PriceCell val={item.priceStandard} color='#34d399'/></td>
                  <td style={td}><PriceCell val={item.priceFnF} color='#a78bfa'/></td>
                  <td style={td}><PriceCell val={item.cost} color='#fbbf24'/></td>
                  <td style={{...td,color:'#6b7280'}}>{item.reorderPoint||'—'}</td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'5px'}}>
                      <button onClick={()=>openEdit(item)} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'5px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(item)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'5px',color:'#6b7280',fontSize:'11px',padding:'4px 8px',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='#6b7280'}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal&&(
        <div className='modal-wrap' style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div className='modal-inner' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'26px',width:'100%',maxWidth:'580px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 32px 64px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
              <h2 style={{color:'#fff',fontSize:'17px',fontWeight:800,margin:0}}>{editIdx!==null?'Edit Item':'Add Item'}</h2>
              <button onClick={()=>{setShowModal(false);setForm({...EMPTY});setEditIdx(null);}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='Product name' value={form.name} onChange={f('name')} style={inp} autoFocus/></div>
              <div>
                <label style={lbl}>Type</label>
                <select value={form.itemType} onChange={f('itemType')} style={{...inp,color:'#fff'}}>
                  {TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Vial Size</label><input type='text' placeholder='e.g. 10mg' value={form.vialSize} onChange={f('vialSize')} style={inp}/></div>
              <div><label style={lbl}>Quantity</label><input type='number' min='0' value={form.quantity} onChange={f('quantity')} style={inp}/></div>
              <div><label style={lbl}>Reorder Point</label><input type='number' min='0' placeholder='e.g. 5' value={form.reorderPoint} onChange={f('reorderPoint')} style={inp}/></div>
              <div style={{gridColumn:'1/-1',borderTop:'1px solid #2a2a2a',paddingTop:'10px',marginTop:'2px'}}>
                <p style={{color:'#6b7280',fontSize:'11px',margin:'0 0 10px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>Pricing</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
                  <div><label style={lbl}>Standard ($)</label><div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.priceStandard} onChange={f('priceStandard')} style={{...inp,paddingLeft:'22px'}}/></div></div>
                  <div><label style={lbl}>F&amp;F ($)</label><div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.priceFnF} onChange={f('priceFnF')} style={{...inp,paddingLeft:'22px'}}/></div></div>
                  <div><label style={lbl}>Cost ($)</label><div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.cost} onChange={f('cost')} style={{...inp,paddingLeft:'22px'}}/></div></div>
                </div>
              </div>
              <div style={{borderTop:'1px solid #2a2a2a',paddingTop:'10px',marginTop:'2px'}}>
                <label style={lbl}>Unit Cost ($)</label>
                <div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.unitCost} onChange={f('unitCost')} style={{...inp,paddingLeft:'22px'}}/></div>
              </div>
              <div style={{borderTop:'1px solid #2a2a2a',paddingTop:'10px',marginTop:'2px'}}><label style={lbl}>Supplier</label><input type='text' placeholder='Supplier name' value={form.supplier} onChange={f('supplier')} style={inp}/></div>
              <div><label style={lbl}>Purchase Date</label><input type='date' value={form.purchaseDate} onChange={f('purchaseDate')} style={{...inp,colorScheme:'dark'}}/></div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional notes' value={form.notes} onChange={f('notes')} style={inp}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'18px'}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'9px',padding:'12px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Add Item'}</button>
              <button onClick={()=>{setShowModal(false);setForm({...EMPTY});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'12px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
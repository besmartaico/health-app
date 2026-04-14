// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'10px 14px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.07em', background:'#161616', borderBottom:'1px solid #1f1f1f', whiteSpace:'nowrap' };
const td = { padding:'10px 14px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1a1a1a', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'7px', padding:'9px 11px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.06em' };
const EMPTY = { itemType:'Peptide', name:'', vialSize:'', quantity:'0', supplier:'', purchaseDate:'', notes:'', priceStandard:'', priceFnF:'', reorderPoint:'' };
const TYPES = ['Peptide','Supplement','Equipment','Supplies','Other'];

const ADJ_TYPES = [
  { id:'received',  label:'Received / Added',    color:'#34d399', bg:'rgba(52,211,153,0.1)',  sign:+1 },
  { id:'sold',      label:'Used / Sold',          color:'#60a5fa', bg:'rgba(96,165,250,0.1)',  sign:-1 },
  { id:'loss',      label:'Written Off / Lost',   color:'#f87171', bg:'rgba(248,113,113,0.1)', sign:-1 },
  { id:'correction',label:'Manual Correction',    color:'#fbbf24', bg:'rgba(251,191,36,0.1)',  sign:0  },
];

function PriceCell({ val, color }) {
  if (!val) return <span style={{color:'#2d2d2d'}}>—</span>;
  const n = parseFloat(val);
  if (isNaN(n)) return <span style={{color:'#2d2d2d'}}>—</span>;
  return <span style={{color, fontWeight:700}}>${n.toFixed(0)}</span>;
}

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showEdit, setShowEdit] = useState(false);
  const [showAdj, setShowAdj] = useState(false);
  const [adjItem, setAdjItem] = useState(null);
  const [adjType, setAdjType] = useState('received');
  const [adjAmt, setAdjAmt] = useState('');
  const [adjNotes, setAdjNotes] = useState('');
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

  const openAdj = (item) => { setAdjItem(item); setAdjType('received'); setAdjAmt(''); setAdjNotes(''); setShowAdj(true); };

  const adjDef = ADJ_TYPES.find(a=>a.id===adjType)||ADJ_TYPES[0];
  const currentQty = adjItem ? (parseInt(adjItem.quantity)||0) : 0;
  const adjAmtNum = parseInt(adjAmt)||0;
  const newQty = adjType==='correction'
    ? adjAmtNum
    : Math.max(0, currentQty + adjDef.sign * adjAmtNum);

  const saveAdj = async () => {
    if (!adjAmt || adjAmtNum <= 0) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'adjust', index: adjItem.id, item: adjItem,
          adjustment: { type: adjDef.label, amount: adjAmtNum, newQty, notes: adjNotes } }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT('Adjustment saved!', false); setShowAdj(false); await load(); }
    } catch(e) { showT('Error: '+e, true); }
    setSaving(false);
  };

  const openAdd = () => { setForm({...EMPTY, purchaseDate:new Date().toISOString().split('T')[0]}); setEditIdx(null); setShowEdit(true); };
  const openEdit = (item) => {
    setForm({ itemType:item.itemType||'Peptide', name:item.name||'', vialSize:item.vialSize||'',
      quantity:item.quantity||'0', supplier:item.supplier||'',
      purchaseDate:item.purchaseDate||'', notes:item.notes||'', createdDate:item.createdDate||'',
      priceStandard:item.priceStandard||'', priceFnF:item.priceFnF||'',
      reorderPoint:item.reorderPoint||'' });
    setEditIdx(parseInt(item.id)); setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action: editIdx!==null?'update':'add', index: editIdx, item: form }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT(editIdx!==null?'Updated!':'Added!', false); setShowEdit(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+e, true); }
    setSaving(false);
  };

  const del = async (item) => {
    if (!confirm('Delete '+item.name+'?')) return;
    await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'delete', index: item.id }) });
    await load();
  };

  const filtered = items.filter(it => {
    const mt = typeFilter==='All'||it.itemType===typeFilter;
    const mq = !search||it.name?.toLowerCase().includes(search.toLowerCase());
    return mt&&mq;
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
              {['Item','Qty','Standard $','F&F $','Reorder At',''].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((item,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600,maxWidth:'220px'}}>
                    <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</div>
                    <div style={{fontSize:'10px',color:'#4b5563',marginTop:'1px'}}>{item.itemType}{item.vialSize?' · '+item.vialSize:''}</div>
                  </td>
                  <td style={td}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{color:'#34d399',fontWeight:700,fontSize:'16px',minWidth:'28px'}}>{parseInt(item.quantity)||0}</span>
                      <button onClick={()=>openAdj(item)} style={{background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:'6px',color:'#818cf8',fontSize:'11px',fontWeight:600,padding:'3px 9px',cursor:'pointer',whiteSpace:'nowrap'}}>Adjust</button>
                    </div>
                  </td>
                  <td style={td}><PriceCell val={item.priceStandard} color='#34d399'/></td>
                  <td style={td}><PriceCell val={item.priceFnF} color='#a78bfa'/></td>
                  <td style={{...td,color:'#6b7280'}}>
                    {item.reorderPoint && parseInt(item.quantity) <= parseInt(item.reorderPoint)
                      ? <span style={{color:'#f87171',fontWeight:700}}>⚠ {item.reorderPoint}</span>
                      : (item.reorderPoint||'—')}
                  </td>
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

      {/* ── ADJUST MODAL ── */}
      {showAdj&&adjItem&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'20px',padding:'28px',width:'100%',maxWidth:'440px',boxShadow:'0 32px 64px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <div>
                <h2 style={{color:'#fff',fontSize:'17px',fontWeight:800,margin:'0 0 2px'}}>Adjust Inventory</h2>
                <p style={{color:'#4b5563',fontSize:'12px',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'280px'}}>{adjItem.name}</p>
              </div>
              <button onClick={()=>setShowAdj(false)} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>

            {/* Current qty display */}
            <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'14px 18px',marginBottom:'16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'2px'}}>Current Qty</div>
                <div style={{color:'#34d399',fontSize:'28px',fontWeight:800,lineHeight:1}}>{currentQty}</div>
              </div>
              {adjAmt&&(
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'2px'}}>After Adjustment</div>
                  <div style={{color:newQty>currentQty?'#34d399':newQty<currentQty?'#f87171':'#fbbf24',fontSize:'28px',fontWeight:800,lineHeight:1}}>{newQty}</div>
                </div>
              )}
            </div>

            {/* Adjustment type */}
            <div style={{marginBottom:'14px'}}>
              <label style={lbl}>Adjustment Type</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px',marginTop:'4px'}}>
                {ADJ_TYPES.map(a=>(
                  <button key={a.id} onClick={()=>setAdjType(a.id)}
                    style={{background:adjType===a.id?a.bg:'rgba(255,255,255,0.02)',border:'1px solid '+(adjType===a.id?a.color:'#2a2a2a'),borderRadius:'8px',padding:'9px 10px',color:adjType===a.id?a.color:'#6b7280',fontSize:'12px',fontWeight:adjType===a.id?700:400,cursor:'pointer',textAlign:'left',transition:'all 0.15s'}}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div style={{marginBottom:'12px'}}>
              <label style={lbl}>{adjType==='correction'?'Set Quantity To':'Quantity'}</label>
              <input type='number' min='0' step='1' placeholder={adjType==='correction'?'Enter new quantity':'Number of units'} value={adjAmt} onChange={e=>setAdjAmt(e.target.value)} style={inp} autoFocus/>
            </div>

            {/* Notes */}
            <div style={{marginBottom:'20px'}}>
              <label style={lbl}>Notes / Reason</label>
              <input type='text' placeholder='e.g. Patient order, damaged vial, inventory count...' value={adjNotes} onChange={e=>setAdjNotes(e.target.value)} style={inp}/>
            </div>

            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={saveAdj} disabled={saving||!adjAmt||adjAmtNum<=0}
                style={{flex:1,background:adjAmt&&adjAmtNum>0&&!saving?adjDef.bg:'rgba(255,255,255,0.03)',color:adjAmt&&adjAmtNum>0&&!saving?adjDef.color:'#4b5563',border:'1px solid '+(adjAmt&&adjAmtNum>0?adjDef.color:'#2a2a2a'),borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:adjAmt&&adjAmtNum>0&&!saving?'pointer':'not-allowed'}}>
                {saving?'Saving...':'Save Adjustment'}
              </button>
              <button onClick={()=>setShowAdj(false)} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {showEdit&&(
        <div className='modal-wrap' style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div className='modal-inner' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'26px',width:'100%',maxWidth:'580px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 32px 64px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'18px'}}>
              <h2 style={{color:'#fff',fontSize:'17px',fontWeight:800,margin:0}}>{editIdx!==null?'Edit Item':'Add Item'}</h2>
              <button onClick={()=>{setShowEdit(false);setForm({...EMPTY});setEditIdx(null);}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer'}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'11px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='Product name' value={form.name} onChange={f('name')} style={inp} autoFocus/></div>
              <div><label style={lbl}>Type</label><select value={form.itemType} onChange={f('itemType')} style={{...inp,color:'#fff'}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>Vial Size</label><input type='text' placeholder='e.g. 10mg' value={form.vialSize} onChange={f('vialSize')} style={inp}/></div>
              <div><label style={lbl}>Quantity</label><input type='number' min='0' value={form.quantity} onChange={f('quantity')} style={inp}/></div>
              <div><label style={lbl}>Reorder Point</label><input type='number' min='0' placeholder='e.g. 5' value={form.reorderPoint} onChange={f('reorderPoint')} style={inp}/></div>
              <div><label style={lbl}>Standard Price ($)</label><div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.priceStandard} onChange={f('priceStandard')} style={{...inp,paddingLeft:'22px'}}/></div></div>
              <div><label style={lbl}>F&amp;F Price ($)</label><div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563'}}>$</span><input type='number' step='0.01' min='0' placeholder='0' value={form.priceFnF} onChange={f('priceFnF')} style={{...inp,paddingLeft:'22px'}}/></div></div>

              <div style={{borderTop:'1px solid #2a2a2a',paddingTop:'10px',marginTop:'2px'}}><label style={lbl}>Supplier</label><input type='text' placeholder='Supplier name' value={form.supplier} onChange={f('supplier')} style={inp}/></div>
              <div><label style={lbl}>Purchase Date</label><input type='date' value={form.purchaseDate} onChange={f('purchaseDate')} style={{...inp,colorScheme:'dark'}}/></div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional notes' value={form.notes} onChange={f('notes')} style={inp}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'18px'}}>
              <button onClick={saveEdit} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'9px',padding:'12px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Add Item'}</button>
              <button onClick={()=>{setShowEdit(false);setForm({...EMPTY});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'12px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
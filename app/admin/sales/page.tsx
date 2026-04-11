// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'11px 13px', color:'#fff', fontSize:'16px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const newLine = () => ({ id: Math.random().toString(36).slice(2), product:'', qty:'1', price:'' });
const EMPTY = { date:'', customer:'', notes:'', referredBy:'', lines:[newLine()] };
const CREDIT = 20;

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY, lines:[newLine()]});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [search, setSearch] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  useEffect(() => {
    load();
    fetch('/api/inventory').then(r=>r.json()).then(d=>setInventory(d.items||[]));
    fetch('/api/crm').then(r=>r.json()).then(d=>setCustomers(d.customers||[]));
  }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/sales').then(x=>x.json()); setSales(r.sales||[]); } catch {}
    setLoading(false);
  };

  const showT = (msg,err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };
  const setLine = (id,f,v) => setForm(fm=>({...fm,lines:fm.lines.map(l=>l.id===id?{...l,[f]:v}:l)}));
  const addLine = () => setForm(f=>({...f,lines:[...f.lines,newLine()]}));
  const removeLine = (id) => setForm(f=>({...f,lines:f.lines.filter(l=>l.id!==id)}));
  const lineTotal = (l) => (parseFloat(l.qty)||0)*(parseFloat(l.price)||0);
  const formTotal = form.lines.reduce((s,l)=>s+lineTotal(l),0);

  const openAdd = () => { setForm({...EMPTY,date:new Date().toISOString().split('T')[0],lines:[newLine()]}); setEditIdx(null); setShowReferral(false); setShowForm(true); };
  const openEdit = (sale) => {
    let lines; try { lines=JSON.parse(sale.lines||'[]'); } catch { lines=[]; }
    if(!lines.length) lines=[newLine()]; else lines=lines.map(l=>({...l,id:Math.random().toString(36).slice(2)}));
    setForm({date:sale.date||'',customer:sale.customer||'',notes:sale.notes||'',referredBy:sale.referredBy||'',lines});
    setShowReferral(!!sale.referredBy); setEditIdx(sale.id); setShowForm(true);
  };

  const save = async () => {
    if(!form.lines.some(l=>l.product)) return;
    setSaving(true);
    const linesClean = form.lines.filter(l=>l.product).map(l=>({product:l.product,qty:l.qty,price:l.price,total:lineTotal(l).toFixed(2)}));
    const payload = {date:form.date,customer:form.customer,lines:JSON.stringify(linesClean),total:formTotal.toFixed(2),notes:form.notes,referredBy:form.referredBy,referralCredit:form.referredBy?String(CREDIT):'0'};
    try {
      const res = await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editIdx!==null?'update':'add',sale:payload,index:editIdx})});
      const d = await res.json();
      if(d.error) showT('Error: '+d.error,true);
      else { showT(editIdx!==null?'Updated!':`Saved!${form.referredBy?' +$'+CREDIT+' → '+form.referredBy:''}`,false); setShowForm(false); setForm({...EMPTY,lines:[newLine()]}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+e,true); }
    setSaving(false);
  };

  const del = async (idx) => { if(!confirm('Delete this sale?')) return; await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',index:idx})}); await load(); };

  const filtered = sales.filter(s=>!search||s.customer?.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = filtered.reduce((s,p)=>s+(parseFloat(p.total)||0),0);
  const invOpts = inventory.map(i=>i.name).filter(Boolean);
  const custOpts = customers.map(c=>c.name).filter(Boolean).sort();

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1100px'}} className='page-pad'>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>{toastErr?'⚠ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',gap:'12px'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:800,color:'#fff',margin:'0 0 2px'}}>Sales</h1>
          <p style={{color:'#6b7280',fontSize:'12px',margin:0}}>{sales.length} sales · ${totalRevenue.toLocaleString('en-US',{minimumFractionDigits:2})}</p>
        </div>
        <button onClick={openAdd} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'11px 18px',fontSize:'14px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>+ Sale</button>
      </div>

      <input type='text' placeholder='Search...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,marginBottom:'16px',maxWidth:'320px'}} />

      {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
      :filtered.length===0?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>No sales yet</div>
      :(<>
        {/* Desktop table */}
        <div className='desktop-only tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead><tr>
              {['Date','Customer','Products','Total','Referred By',''].map(h=><th key={h} style={{textAlign:'left',padding:'11px 16px',fontSize:'11px',fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:'0.08em',background:'#161616',borderBottom:'1px solid #1f1f1f'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((s,i)=>{
                let lines=[]; try{lines=JSON.parse(s.lines||'[]');}catch{}
                return(<tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'11px 16px',fontSize:'12px',color:'#6b7280',borderBottom:'1px solid #1a1a1a',whiteSpace:'nowrap'}}>{s.date||'—'}</td>
                  <td style={{padding:'11px 16px',fontSize:'13px',color:'#fff',fontWeight:600,borderBottom:'1px solid #1a1a1a'}}>{s.customer||'—'}</td>
                  <td style={{padding:'11px 16px',fontSize:'12px',color:'#9ca3af',borderBottom:'1px solid #1a1a1a',maxWidth:'200px'}}>{lines.map(l=>l.product).filter(Boolean).join(', ')||'—'}</td>
                  <td style={{padding:'11px 16px',fontSize:'13px',color:'#34d399',fontWeight:700,borderBottom:'1px solid #1a1a1a',whiteSpace:'nowrap'}}>{s.total?'$'+parseFloat(s.total).toFixed(2):'—'}</td>
                  <td style={{padding:'11px 16px',fontSize:'12px',borderBottom:'1px solid #1a1a1a'}}>
                    {s.referredBy?<div><div style={{color:'#a78bfa',fontWeight:600}}>👤 {s.referredBy}</div><div style={{color:'#6b7280',fontSize:'11px'}}>+$20 credit</div></div>
                    :<span style={{color:'#2a2a2a',fontSize:'11px'}}>+ $20 referral</span>}
                  </td>
                  <td style={{padding:'11px 16px',borderBottom:'1px solid #1a1a1a'}}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>openEdit(s)} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'5px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(s.id||i)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'5px 10px',cursor:'pointer'}}>Del</button>
                    </div>
                  </td>
                </tr>);
              })}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className='mobile-only'>
          {filtered.map((s,i)=>{
            let lines=[]; try{lines=JSON.parse(s.lines||'[]');}catch{}
            return(
              <div key={i} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'14px',marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                  <div>
                    <div style={{color:'#fff',fontWeight:700,fontSize:'15px'}}>{s.customer||'—'}</div>
                    <div style={{color:'#6b7280',fontSize:'12px',marginTop:'2px'}}>{s.date||''}</div>
                  </div>
                  <div style={{color:'#34d399',fontWeight:800,fontSize:'17px'}}>{s.total?'$'+parseFloat(s.total).toFixed(2):'—'}</div>
                </div>
                <div style={{color:'#9ca3af',fontSize:'12px',marginBottom:'8px'}}>{lines.map(l=>l.product).filter(Boolean).join(' · ')||'—'}</div>
                {s.referredBy&&<div style={{color:'#a78bfa',fontSize:'12px',marginBottom:'8px'}}>👤 {s.referredBy} · +$20 credit</div>}
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={()=>openEdit(s)} style={{flex:1,background:'#242424',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#9ca3af',fontSize:'13px',padding:'8px',cursor:'pointer'}}>Edit</button>
                  <button onClick={()=>del(s.id||i)} style={{background:'transparent',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',color:'#6b7280',fontSize:'13px',padding:'8px 12px',cursor:'pointer'}}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      </>)}

      {showForm&&(
        <div className='modal-wrap' style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div className='modal-inner' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'24px',width:'100%',maxWidth:'620px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'92vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{color:'#fff',fontSize:'18px',fontWeight:800,margin:0}}>{editIdx!==null?'Edit Sale':'New Sale'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer',padding:'4px',lineHeight:1}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}} className='grid-2'>
              <div><label style={lbl}>Date</label><input type='date' value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}} /></div>
              <div>
                <label style={lbl}>Customer</label>
                {custOpts.length>0?(<select value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} style={{...inp,color:form.customer?'#fff':'#4b5563'}}><option value=''>Select customer...</option>{custOpts.map(n=><option key={n}>{n}</option>)}</select>)
                :(<input type='text' placeholder='Customer name' value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} style={inp} />)}
              </div>
            </div>
            {/* Line items */}
            <div style={{marginBottom:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <label style={{...lbl,margin:0}}>Items</label>
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={addLine} style={{background:'rgba(123,28,46,0.2)',border:'1px solid rgba(123,28,46,0.4)',borderRadius:'6px',color:'#f87171',fontSize:'12px',padding:'5px 10px',cursor:'pointer',fontWeight:600}}>+ Item</button>
                  {!showReferral&&<button onClick={()=>setShowReferral(true)} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'6px',color:'#a78bfa',fontSize:'12px',padding:'5px 10px',cursor:'pointer',fontWeight:600}}>+ Referral</button>}
                </div>
              </div>
              {form.lines.map((line,li)=>(
                <div key={line.id} style={{display:'grid',gridTemplateColumns:'1fr 60px 90px 30px',gap:'6px',marginBottom:'8px',alignItems:'start'}}>
                  <div>
                    {invOpts.length>0?(<select value={invOpts.includes(line.product)?line.product:'__c'} onChange={e=>e.target.value!=='__c'?setLine(line.id,'product',e.target.value):setLine(line.id,'product','')} style={{...inp,fontSize:'14px',padding:'9px 10px',color:line.product?'#fff':'#4b5563'}}><option value='__c'>Type custom...</option>{invOpts.map(n=><option key={n}>{n}</option>)}</select>):null}
                    {(!invOpts.includes(line.product)||invOpts.length===0)&&<input type='text' placeholder='Product' value={line.product} onChange={e=>setLine(line.id,'product',e.target.value)} style={{...inp,fontSize:'14px',padding:'9px 10px',marginTop:invOpts.length>0?'6px':'0'}} />}
                  </div>
                  <input type='number' min='1' value={line.qty} onChange={e=>setLine(line.id,'qty',e.target.value)} style={{...inp,textAlign:'center',padding:'9px 6px'}} placeholder='Qty' />
                  <div style={{position:'relative'}}><span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'13px'}}>$</span><input type='number' step='0.01' placeholder='0' value={line.price} onChange={e=>setLine(line.id,'price',e.target.value)} style={{...inp,paddingLeft:'22px',padding:'9px 9px 9px 22px'}} /></div>
                  {form.lines.length>1&&<button onClick={()=>removeLine(line.id)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'20px',cursor:'pointer',padding:'6px 0'}} onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='#4b5563'}>×</button>}
                </div>
              ))}
              <div style={{textAlign:'right',color:'#34d399',fontWeight:800,fontSize:'18px',marginTop:'6px'}}>${formTotal.toFixed(2)}</div>
            </div>
            {showReferral&&(
              <div style={{background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'10px',padding:'14px',marginBottom:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><label style={{...lbl,margin:0,color:'#a78bfa'}}>👤 Referred By</label><button onClick={()=>{setShowReferral(false);setForm(f=>({...f,referredBy:''}));}} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'18px',cursor:'pointer',lineHeight:1}}>×</button></div>
                <select value={form.referredBy} onChange={e=>setForm(f=>({...f,referredBy:e.target.value}))} style={{...inp,color:form.referredBy?'#fff':'#4b5563'}}><option value=''>Select referrer...</option>{custOpts.filter(n=>n!==form.customer).map(n=><option key={n}>{n}</option>)}</select>
                {form.referredBy&&<div style={{marginTop:'8px',fontSize:'12px',color:'#a78bfa'}}>✓ {form.referredBy} gets $20 credit</div>}
              </div>
            )}
            <div style={{marginBottom:'16px'}}><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={inp} /></div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={save} disabled={saving||!form.lines.some(l=>l.product)} style={{flex:1,background:form.lines.some(l=>l.product)&&!saving?'#7b1c2e':'#2d0e18',color:form.lines.some(l=>l.product)&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:700,cursor:form.lines.some(l=>l.product)&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Record Sale'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY,lines:[newLine()]});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'14px',fontSize:'15px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
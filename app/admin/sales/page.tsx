// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'12px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'9px 12px', color:'#fff', fontSize:'13px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.07em' };
const newLine = () => ({ id: Math.random().toString(36).slice(2), product:'', qty:'1', price:'' });
const EMPTY = { date:'', customer:'', notes:'', referredBy:'', lines:[newLine()] };
const CREDIT_PER_REFERRAL = 20;

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY, lines:[newLine()]});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

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

  const setLine = (id,field,val) => setForm(f=>({...f,lines:f.lines.map(l=>l.id===id?{...l,[field]:val}:l)}));
  const addLine = () => setForm(f=>({...f,lines:[...f.lines,newLine()]}));
  const removeLine = (id) => setForm(f=>({...f,lines:f.lines.filter(l=>l.id!==id)}));
  const lineTotal = (l) => (parseFloat(l.qty)||0)*(parseFloat(l.price)||0);
  const formTotal = form.lines.reduce((s,l)=>s+lineTotal(l),0);

  const openAdd = () => { setForm({...EMPTY,date:new Date().toISOString().split('T')[0],lines:[newLine()]}); setEditIdx(null); setShowReferral(false); setShowForm(true); };
  const openEdit = (sale) => {
    let lines; try { lines=JSON.parse(sale.lines||'[]'); } catch { lines=[]; }
    if(!lines.length) lines=[newLine()];
    else lines=lines.map(l=>({...l,id:Math.random().toString(36).slice(2)}));
    setForm({date:sale.date||'',customer:sale.customer||'',notes:sale.notes||'',referredBy:sale.referredBy||'',lines});
    setEditIdx(sale.id); setShowForm(true);
  };

  const save = async () => {
    if(!form.lines.some(l=>l.product)) return;
    setSaving(true);
    const linesClean = form.lines.filter(l=>l.product).map(l=>({product:l.product,qty:l.qty,price:l.price,total:lineTotal(l).toFixed(2)}));
    const payload = {date:form.date,customer:form.customer,lines:JSON.stringify(linesClean),total:formTotal.toFixed(2),notes:form.notes,referredBy:form.referredBy,referralCredit:form.referredBy?String(CREDIT_PER_REFERRAL):'0'};
    try {
      const res = await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editIdx!==null?'update':'add',sale:payload,index:editIdx})});
      const d = await res.json();
      if(d.error) showT('Error: '+d.error,true);
      else {
        showT(editIdx!==null?'Sale updated!':`Sale recorded!${form.referredBy?' +$'+CREDIT_PER_REFERRAL+' credit to '+form.referredBy:''}`,false);
        setShowForm(false); setForm({...EMPTY,lines:[newLine()]}); setEditIdx(null); await load();
      }
    } catch(e) { showT('Error: '+String(e),true); }
    setSaving(false);
  };

  const del = async (idx) => {
    if(!confirm('Delete this sale?')) return;
    await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',index:idx})});
    await load();
  };

  const filtered = sales.filter(s=>!search||s.customer?.toLowerCase().includes(search.toLowerCase())||s.lines?.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = filtered.reduce((s,p)=>s+(parseFloat(p.total)||0),0);
  const invOptions = inventory.map(i=>i.name).filter(Boolean);
  const custOptions = customers.map(c=>c.name).filter(Boolean).sort();

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'1100px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,maxWidth:'340px'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Sales</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{sales.length} sales · ${totalRevenue.toLocaleString('en-US',{minimumFractionDigits:2})} revenue</p>
        </div>
        <button onClick={openAdd} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Record Sale</button>
      </div>

      <div style={{marginBottom:'16px'}}>
        <input type='text' placeholder='Search customer or product...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'320px'}} />
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>💰</div>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>{sales.length===0?'No sales yet':'No results'}</div>
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Date','Customer','Products','Total','Referred By','Notes',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((s,i)=>{
                let lines=[]; try{lines=JSON.parse(s.lines||'[]');}catch{}
                const isExp=expanded===i;
                return(
                  <tr key={i} style={{cursor:'pointer'}} onClick={()=>setExpanded(isExp?null:i)} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{...td,color:'#6b7280',whiteSpace:'nowrap'}}>{s.date||'—'}</td>
                    <td style={{...td,color:'#fff',fontWeight:600}}>{s.customer||'—'}</td>
                    <td style={td}>
                      {lines.length>0?(
                        <div>
                          <div style={{fontSize:'13px'}}>{lines[0].product}{lines[0].qty>1?` ×${lines[0].qty}`:''}</div>
                          {lines.length>1&&<div style={{fontSize:'11px',color:'#4b5563',marginTop:'2px'}}>+{lines.length-1} more {isExp?'▲':'▼'}</div>}
                          {isExp&&lines.slice(1).map((l,j)=><div key={j} style={{fontSize:'12px',color:'#9ca3af',marginTop:'2px'}}>{l.product}{l.qty>1?` ×${l.qty}`:''} — ${parseFloat(l.total||0).toFixed(2)}</div>)}
                        </div>
                      ):<span style={{color:'#4b5563'}}>—</span>}
                    </td>
                    <td style={{...td,color:'#34d399',fontWeight:700}}>{s.total?'$'+parseFloat(s.total).toLocaleString('en-US',{minimumFractionDigits:2}):'—'}</td>
                    <td style={td}>
                      {s.referredBy?(
                        <div>
                          <div style={{color:'#a78bfa',fontSize:'12px',fontWeight:600}}>👤 {s.referredBy}</div>
                          <div style={{color:'#6b7280',fontSize:'11px'}}>+$20 credit applied</div>
                        </div>
                      ):(
                        <span style={{color:'#374151',fontSize:'12px',cursor:'default'}} title='No referral recorded for this sale'>+ $20 referral</span>
                      )}
                    </td>
                    <td style={{...td,color:'#6b7280',fontSize:'12px',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.notes||'—'}</td>
                    <td style={td} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button onClick={()=>openEdit(s)} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                        <button onClick={()=>del(s.id||i)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'28px',width:'100%',maxWidth:'620px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'92vh',overflowY:'auto'}}>
            <h2 style={{color:'#fff',fontSize:'19px',fontWeight:800,margin:'0 0 20px'}}>{editIdx!==null?'Edit Sale':'Record Sale'}</h2>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
              <div><label style={lbl}>Date</label><input type='date' value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}} /></div>
              <div>
                <label style={lbl}>Customer Name</label>
                {custOptions.length>0?(
                  <select value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} style={{...inp,color:form.customer?'#fff':'#4b5563'}}>
                    <option value=''>Select or type below...</option>
                    {custOptions.map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                ):(
                  <input type='text' placeholder='Customer name' value={form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} style={inp} autoFocus />
                )}
              </div>
              {custOptions.length>0&&<div style={{gridColumn:'1/-1'}}>
                <label style={{...lbl,color:'#374151'}}>Or type custom name</label>
                <input type='text' placeholder='Type name if not in CRM...' value={custOptions.includes(form.customer)?'':form.customer} onChange={e=>setForm(f=>({...f,customer:e.target.value}))} style={{...inp,fontSize:'12px'}} />
              </div>}
            </div>

            {/* Referral section - hidden by default, toggled by button */}
            {showReferral && (
              <div style={{background:'rgba(167,139,250,0.06)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'10px',padding:'14px',marginBottom:'16px',position:'relative'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <span style={{fontSize:'15px'}}>👤</span>
                    <label style={{...lbl,margin:0,color:'#a78bfa'}}>Referred By</label>
                  </div>
                  <button onClick={()=>{setShowReferral(false);setForm(f=>({...f,referredBy:''}));}} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'18px',cursor:'pointer',lineHeight:1,padding:'0 2px'}} onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='#4b5563'}>×</button>
                </div>
                <select value={form.referredBy} onChange={e=>setForm(f=>({...f,referredBy:e.target.value}))} style={{...inp,color:form.referredBy?'#fff':'#4b5563'}}>
                  <option value=''>Select referring customer...</option>
                  {custOptions.filter(n=>n!==form.customer).map(n=><option key={n} value={n}>{n}</option>)}
                </select>
                {form.referredBy&&(
                  <div style={{marginTop:'8px',fontSize:'12px',color:'#a78bfa',display:'flex',alignItems:'center',gap:'6px'}}>
                    <span>✓</span>
                    <span><strong>{form.referredBy}</strong> will receive <strong>$20 credit</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Line items */}
            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                <label style={{...lbl,margin:0}}>Line Items</label>
                <div style={{display:'flex',gap:'6px'}}>
                  <button onClick={addLine} style={{background:'rgba(123,28,46,0.2)',border:'1px solid rgba(123,28,46,0.4)',borderRadius:'6px',color:'#f87171',fontSize:'12px',padding:'4px 12px',cursor:'pointer',fontWeight:600}}>+ Add Item</button>
                  {!showReferral&&<button onClick={()=>setShowReferral(true)} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.3)',borderRadius:'6px',color:'#a78bfa',fontSize:'12px',padding:'4px 12px',cursor:'pointer',fontWeight:600}}>+ Add Referral</button>}
                </div>
              </div>
              <div style={{background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'10px',overflow:'hidden'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 72px 100px 30px',padding:'7px 12px',borderBottom:'1px solid #2a2a2a'}}>
                  {['Product','Qty','Price',''].map(h=><div key={h} style={{fontSize:'10px',fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:'0.07em'}}>{h}</div>)}
                </div>
                {form.lines.map((line,li)=>(
                  <div key={line.id} style={{display:'grid',gridTemplateColumns:'1fr 72px 100px 30px',borderBottom:li<form.lines.length-1?'1px solid #1a1a1a':'none',alignItems:'center'}}>
                    <div style={{padding:'6px 8px 6px 12px'}}>
                      {invOptions.length>0?(
                        <select value={invOptions.includes(line.product)?line.product:'__custom__'} onChange={e=>{if(e.target.value!=='__custom__')setLine(line.id,'product',e.target.value);else setLine(line.id,'product','');}} style={{...inp,padding:'7px 8px',fontSize:'12px',color:line.product?'#fff':'#4b5563'}}>
                          <option value='__custom__'>Type custom item...</option>
                          {invOptions.map(n=><option key={n} value={n}>{n}</option>)}
                        </select>
                      ):null}
                      {(!invOptions.includes(line.product)||invOptions.length===0)&&(
                        <input type='text' placeholder='Product name' value={line.product} onChange={e=>setLine(line.id,'product',e.target.value)} style={{...inp,marginTop:invOptions.length>0?'4px':'0',fontSize:'12px'}} />
                      )}
                    </div>
                    <div style={{padding:'6px 4px'}}><input type='number' min='1' value={line.qty} onChange={e=>setLine(line.id,'qty',e.target.value)} style={{...inp,textAlign:'center',fontSize:'13px'}} /></div>
                    <div style={{padding:'6px 4px'}}>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute',left:'9px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'12px',pointerEvents:'none'}}>$</span>
                        <input type='number' step='0.01' placeholder='0.00' value={line.price} onChange={e=>setLine(line.id,'price',e.target.value)} style={{...inp,paddingLeft:'20px',fontSize:'13px'}} />
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {form.lines.length>1&&<button onClick={()=>removeLine(line.id)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'16px',cursor:'pointer',padding:'2px'}} onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='#4b5563'}>×</button>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'8px',gap:'12px',alignItems:'center'}}>
                <span style={{color:'#9ca3af',fontSize:'13px'}}>Total:</span>
                <span style={{color:'#34d399',fontWeight:800,fontSize:'18px'}}>${formTotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{marginBottom:'20px'}}><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={inp} /></div>

            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={save} disabled={saving||!form.lines.some(l=>l.product)} style={{flex:1,background:form.lines.some(l=>l.product)&&!saving?'#7b1c2e':'#2d0e18',color:form.lines.some(l=>l.product)&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.lines.some(l=>l.product)&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Record Sale'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY,lines:[newLine()]});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
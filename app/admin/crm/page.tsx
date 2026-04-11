// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'11px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const STATUSES = ['Active','Inactive','Lead','VIP'];
const EMPTY = { name:'', email:'', phone:'', status:'Active', source:'', notes:'', tags:'', referralCredits:'0' };

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editIdx, setEditIdx] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/crm').then(x=>x.json()); setCustomers(r.customers||[]); } catch {}
    setLoading(false);
  };

  const importFromSales = async () => {
    setImporting(true); setImportMsg('');
    try {
      const r = await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'import_from_sales'})}).then(x=>x.json());
      if(r.success) { setImportMsg('✓ '+r.message); await load(); }
      else setImportMsg('⚠ '+(r.error||'Import failed'));
    } catch(e) { setImportMsg('⚠ '+String(e)); }
    setImporting(false);
    setTimeout(()=>setImportMsg(''),6000);
  };

  const showT = (msg,err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };

  const save = async () => {
    if(!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editIdx!==null?'update':'add',customer:{...form,addedDate:form.addedDate||new Date().toISOString().split('T')[0]},index:editIdx})});
      const d = await res.json();
      if(d.error) showT('Error: '+d.error,true);
      else { showT(editIdx!==null?'Customer updated!':'Customer added!',false); setShowForm(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+String(e),true); }
    setSaving(false);
  };

  const del = async (idx,name) => {
    if(!confirm('Delete "'+name+'"?')) return;
    await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',index:idx})});
    await load();
  };

  const filtered = customers.filter(c=>{
    const mSt = filterStatus==='All'||c.status===filterStatus;
    const mSr = !search||c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase());
    return mSt&&mSr;
  });

  const totalCredits = customers.reduce((s,c)=>s+(parseFloat(c.referralCredits)||0),0);

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1200px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Customers</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{customers.length} customers{totalCredits>0?` · $${totalCredits} total referral credits outstanding`:''}
          </p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={importFromSales} disabled={importing} title='Add any customer from Sales who is not yet in CRM' style={{background:importing?'#111':'rgba(167,139,250,0.08)',color:importing?'#4b5563':'#a78bfa',border:'1px solid rgba(167,139,250,0.2)',borderRadius:'9px',padding:'10px 16px',fontSize:'13px',fontWeight:600,cursor:importing?'not-allowed':'pointer',whiteSpace:'nowrap'}}>{importing?'Importing...':'⬇ Import from Sales'}</button>
          <button onClick={()=>{setForm({...EMPTY});setEditIdx(null);setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>+ Add Customer</button>
        </div>
      </div>

      {importMsg&&<div style={{marginBottom:'16px',padding:'10px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:500,background:importMsg.startsWith('✓')?'rgba(167,139,250,0.08)':'rgba(239,68,68,0.08)',border:'1px solid '+(importMsg.startsWith('✓')?'rgba(167,139,250,0.2)':'rgba(239,68,68,0.2)'),color:importMsg.startsWith('✓')?'#a78bfa':'#f87171'}}>{importMsg}</div>}

      <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap',alignItems:'center'}}>
        <input type='text' placeholder='Search name or email...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'260px'}} />
        <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px'}}>
          {['All',...STATUSES].map(s=>(<button key={s} onClick={()=>setFilterStatus(s)} style={{background:filterStatus===s?'#0f0f0f':'transparent',color:filterStatus===s?'#fff':'#6b7280',border:filterStatus===s?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'6px',padding:'5px 12px',fontSize:'12px',fontWeight:filterStatus===s?600:400,cursor:'pointer'}}>{s}</button>))}
        </div>
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>👥</div>
            <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>{customers.length===0?'No customers yet':'No results'}</div>
            <div style={{color:'#4b5563',fontSize:'13px'}}>{customers.length===0?<>Click <strong style={{color:'#a78bfa'}}>⬇ Import from Sales</strong> to pull in customers from your sales records.</>:'Try a different search.'}</div>
          </div>
        ):(
          <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'800px'}}>
            <thead><tr>{['Name','Email','Phone','Status','Source','Referral Credits','Tags',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600}}>{c.name}</td>
                  <td style={{...td,color:'#9ca3af'}}>{c.email||'—'}</td>
                  <td style={{...td,color:'#9ca3af'}}>{c.phone||'—'}</td>
                  <td style={td}>
                    <span style={{background:c.status==='VIP'?'rgba(251,191,36,0.1)':c.status==='Active'?'rgba(16,185,129,0.1)':c.status==='Lead'?'rgba(59,130,246,0.1)':'rgba(107,114,128,0.1)',color:c.status==='VIP'?'#fbbf24':c.status==='Active'?'#34d399':c.status==='Lead'?'#60a5fa':'#9ca3af',border:`1px solid ${c.status==='VIP'?'rgba(251,191,36,0.25)':c.status==='Active'?'rgba(16,185,129,0.25)':c.status==='Lead'?'rgba(59,130,246,0.25)':'rgba(107,114,128,0.25)'}`,borderRadius:'20px',padding:'2px 8px',fontSize:'11px',fontWeight:600}}>{c.status||'—'}</span>
                  </td>
                  <td style={{...td,color:'#6b7280',fontSize:'12px'}}>{c.source||'—'}</td>
                  <td style={td}>
                    {parseFloat(c.referralCredits||0)>0?(
                      <span style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'8px',padding:'3px 10px',color:'#a78bfa',fontSize:'13px',fontWeight:700}}>
                        ${parseFloat(c.referralCredits).toFixed(0)}
                      </span>
                    ):<span style={{color:'#374151'}}>—</span>}
                  </td>
                  <td style={{...td,color:'#6b7280',fontSize:'11px'}}>{c.tags||'—'}</td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>{setForm({name:c.name||'',email:c.email||'',phone:c.phone||'',status:c.status||'Active',source:c.source||'',notes:c.notes||'',tags:c.tags||'',referralCredits:c.referralCredits||'0',addedDate:c.addedDate||''});setEditIdx(c.id||i);setShowForm(true);}} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(c.id||i,c.name)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'520px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 24px'}}>{editIdx!==null?'Edit Customer':'Add Customer'}</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='Full name' value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} autoFocus /></div>
              <div><label style={lbl}>Email</label><input type='email' placeholder='email@example.com' value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Phone</label><input type='tel' placeholder='(555) 000-0000' value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Status</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{...inp,color:'#fff'}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={lbl}>Source</label><input type='text' placeholder='e.g. Referral, Social' value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} style={inp} /></div>
              <div>
                <label style={lbl}>Referral Credits ($)</label>
                <div style={{position:'relative'}}>
                  <span style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',color:'#a78bfa',fontSize:'14px',pointerEvents:'none'}}>$</span>
                  <input type='number' step='1' min='0' placeholder='0' value={form.referralCredits} onChange={e=>setForm(p=>({...p,referralCredits:e.target.value}))} style={{...inp,paddingLeft:'26px'}} />
                </div>
              </div>
              <div><label style={lbl}>Tags</label><input type='text' placeholder='e.g. VIP, Referring' value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} style={inp} /></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Notes</label><input type='text' placeholder='Optional notes' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp} /></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editIdx!==null?'Save Changes':'Add Customer'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditIdx(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
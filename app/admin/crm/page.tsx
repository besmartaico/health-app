// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 14px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'10px 14px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 12px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const EMPTY = { name:'', email:'', phone:'', status:'Active', source:'', notes:'', tags:'', referralCredits:'0', followUpDate:'' };

function daysUntil(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.round((d.getTime()-today.getTime())/(1000*60*60*24));
  if (days < 0) return Math.abs(days) + 'd overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return 'in ' + days + 'd';
}

function isFollowUpSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((d.getTime()-today.getTime())/(1000*60*60*24)) <= 7;
}

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({...EMPTY});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/crm').then(x=>x.json()); setCustomers(r.customers||[]); } catch {}
    setLoading(false);
  };

  const showT = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''), 3500); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/crm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action: editId!==null?'update':'add', customer: form, id: editId }) });
      const d = await res.json();
      if (d.error) showT('Error: '+d.error, true);
      else { showT(editId!==null?'Updated!':'Added!', false); setShowForm(false); setForm({...EMPTY}); setEditId(null); await load(); }
    } catch(e) { showT('Error: '+e, true); }
    setSaving(false);
  };

  const del = async (id, name) => {
    if (!confirm('Delete ' + name + '?')) return;
    await fetch('/api/crm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'delete', id }) });
    await load();
  };

  const importFromSales = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/crm', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'import_from_sales' }) });
      const d = await res.json();
      showT(d.added>0 ? 'Imported '+d.added+' new customers' : 'No new customers to import', d.error);
      await load();
    } catch(e) { showT('Error: '+e, true); }
    setImporting(false);
  };

  const openEdit = (c) => {
    setForm({ name:c.name||'', email:c.email||'', phone:c.phone||'', status:c.status||'Active', source:c.source||'', notes:c.notes||'', tags:c.tags||'', referralCredits:c.referralCredits||'0', addedDate:c.addedDate||'', followUpDate:c.followUpDate||'' });
    setEditId(c.id||c.name);
    setShowForm(true);
  };

  const filtered = customers.filter(c => {
    const ms = statusFilter==='All'||c.status===statusFilter;
    const mq = !search||c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search);
    return ms&&mq;
  });
  const totalCredits = customers.reduce((s,c)=>s+(parseFloat(c.referralCredits)||0),0);
  const followUpCount = customers.filter(c=>c.followUpDate&&isFollowUpSoon(c.followUpDate)).length;

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1200px'}}>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px',gap:'12px',flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Customers</h1>
          <p style={{color:'#6b7280',fontSize:'12px',margin:0}}>
            <span>{customers.length} customers</span>
            {totalCredits>0&&<span style={{color:'#a78bfa',marginLeft:'8px'}}>· ${totalCredits.toFixed(0)} referral credits</span>}
            {followUpCount>0&&<span style={{color:'#fbbf24',marginLeft:'8px',fontWeight:600}}>· {followUpCount} follow-up{followUpCount!==1?'s':''} this week</span>}
          </p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <button onClick={importFromSales} disabled={importing} style={{background:'transparent',color:'#6b7280',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'8px 14px',fontSize:'13px',cursor:importing?'not-allowed':'pointer'}}>
            {importing?'Importing...':'↓ Import from Sales'}
          </button>
          <button onClick={()=>{setForm({...EMPTY,addedDate:new Date().toISOString().split('T')[0]});setEditId(null);setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 16px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
            + Add Customer
          </button>
        </div>
      </div>

      <div style={{display:'flex',gap:'8px',marginBottom:'14px',flexWrap:'wrap',alignItems:'center'}}>
        <input type='text' placeholder='Search name, email, phone...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'280px'}}/>
        <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px'}}>
          {['All','Active','Inactive','Lead'].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} style={{background:statusFilter===s?'#0f0f0f':'transparent',color:statusFilter===s?'#fff':'#6b7280',border:statusFilter===s?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'6px',padding:'5px 10px',fontSize:'12px',fontWeight:statusFilter===s?600:400,cursor:'pointer'}}>{s}</button>
          ))}
        </div>
      </div>

      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?<div style={{padding:'60px',textAlign:'center',color:'#4b5563'}}>{customers.length===0?'No customers yet':'No results'}</div>
        :(
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
            <thead><tr>
              {['Name','Email','Phone','Status','Follow-Up','Referral $',''].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map((c,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600}}>
                    <div>{c.name}</div>
                    {c.tags&&<div style={{fontSize:'10px',color:'#4b5563',marginTop:'1px'}}>{c.tags}</div>}
                  </td>
                  <td style={{...td,color:'#9ca3af'}}>{c.email||'—'}</td>
                  <td style={{...td,color:'#9ca3af'}}>{c.phone||'—'}</td>
                  <td style={td}>
                    <span style={{background:c.status==='Active'?'rgba(16,185,129,0.12)':c.status==='Lead'?'rgba(99,102,241,0.12)':'rgba(107,114,128,0.12)',color:c.status==='Active'?'#34d399':c.status==='Lead'?'#818cf8':'#9ca3af',borderRadius:'4px',padding:'2px 8px',fontSize:'11px',fontWeight:600}}>{c.status||'Active'}</span>
                  </td>
                  <td style={td}>
                    {c.followUpDate?(
                      <div>
                        <div style={{color:isFollowUpSoon(c.followUpDate)?'#fbbf24':'#9ca3af',fontSize:'12px',fontWeight:isFollowUpSoon(c.followUpDate)?700:400}}>{c.followUpDate}</div>
                        <div style={{color:isFollowUpSoon(c.followUpDate)?'#f59e0b':'#4b5563',fontSize:'10px'}}>{daysUntil(c.followUpDate)}</div>
                      </div>
                    ):<span style={{color:'#2a2a2a',fontSize:'11px'}}>—</span>}
                  </td>
                  <td style={td}>
                    {parseFloat(c.referralCredits)>0
                      ?<span style={{color:'#a78bfa',fontWeight:700}}>${parseFloat(c.referralCredits||'0').toFixed(0)}</span>
                      :<span style={{color:'#2a2a2a',fontSize:'11px'}}>—</span>}
                  </td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>openEdit(c)} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={()=>del(c.id||String(i),c.name)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 8px',cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.color='#f87171'} onMouseOut={e=>e.currentTarget.style.color='#6b7280'}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm&&(
        <div className='modal-wrap' style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,padding:'16px'}}>
          <div className='modal-inner' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'28px',width:'100%',maxWidth:'540px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{color:'#fff',fontSize:'18px',fontWeight:800,margin:0}}>{editId!==null?'Edit Customer':'Add Customer'}</h2>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditId(null);}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer',lineHeight:1}}>×</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Name *</label><input type='text' placeholder='Full name' value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} autoFocus/></div>
              <div><label style={lbl}>Email</label><input type='email' placeholder='email@example.com' value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Phone</label><input type='tel' placeholder='(555) 000-0000' value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Status</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{...inp,color:'#fff'}}>{['Active','Inactive','Lead'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={lbl}>Source</label><input type='text' placeholder='e.g. Referral' value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Follow-Up Date</label><input type='date' value={form.followUpDate} onChange={e=>setForm(p=>({...p,followUpDate:e.target.value}))} style={{...inp,colorScheme:'dark'}}/></div>
              <div><label style={lbl}>Referral Credits ($)</label><input type='number' min='0' step='20' value={form.referralCredits} onChange={e=>setForm(p=>({...p,referralCredits:e.target.value}))} style={inp}/></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Notes</label><input type='text' placeholder='Optional notes' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp}/></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Tags</label><input type='text' placeholder='e.g. VIP, Weight Loss' value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} style={inp}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              <button onClick={save} disabled={saving||!form.name.trim()} style={{flex:1,background:form.name.trim()&&!saving?'#7b1c2e':'#2d0e18',color:form.name.trim()&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.name.trim()&&!saving?'pointer':'not-allowed'}}>{saving?'Saving...':editId!==null?'Save Changes':'Add Customer'}</button>
              <button onClick={()=>{setShowForm(false);setForm({...EMPTY});setEditId(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
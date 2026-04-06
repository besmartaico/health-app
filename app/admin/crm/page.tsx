// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign:'left', padding:'11px 18px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const td = { padding:'13px 18px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const EMPTY = { name:'', email:'', phone:'', status:'Active', notes:'' };
const STATUS_COLORS = { Active:{bg:'rgba(16,185,129,0.12)',color:'#34d399',border:'rgba(16,185,129,0.25)'}, Inactive:{bg:'rgba(75,85,99,0.2)',color:'#9ca3af',border:'rgba(75,85,99,0.3)'}, Lead:{bg:'rgba(59,130,246,0.12)',color:'#60a5fa',border:'rgba(59,130,246,0.25)'}, VIP:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24',border:'rgba(245,158,11,0.25)'} };

export default function CRMPage() {
  const [customers,setCustomers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({...EMPTY});
  const [editIdx,setEditIdx]=useState(null);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState('');
  const [toastErr,setToastErr]=useState(false);
  const [search,setSearch]=useState('');
  const [filterStatus,setFilterStatus]=useState('All');
  const [expandedRow,setExpandedRow]=useState(null);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true);
    try { const r=await fetch('/api/crm').then(x=>x.json()); setCustomers(r.customers||[]); } catch {}
    setLoading(false);
  };

  const showT = (msg,err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };

  const save = async () => {
    if(!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:editIdx!==null?'update':'add',customer:form,index:editIdx})});
      const d = await res.json();
      if(d.error) showT('Error: '+d.error,true);
      else { showT(editIdx!==null?'Customer updated!':'Customer added!',false); setShowForm(false); setForm({...EMPTY}); setEditIdx(null); await load(); }
    } catch(e) { showT('Error: '+String(e),true); }
    setSaving(false);
  };

  const del = async (idx,name) => {
    if(!confirm('Delete customer "'+name+'"?')) return;
    await fetch('/api/crm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',index:idx})});
    await load();
  };

  const filtered = customers.filter(c => {
    const ms = filterStatus==='All'||c.status===filterStatus;
    const mq = !search||c.name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase())||c.phone?.includes(search);
    return ms&&mq;
  });

  const counts = customers.reduce((a,c)=>{ a[c.status]=(a[c.status]||0)+1; return a; },{});

  const initials = (name) => name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'1100px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Customers</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{customers.length} total customers</p>
        </div>
        <button onClick={()=>{setForm({...EMPTY});setEditIdx(null);setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Add Customer</button>
      </div>

      {/* Status filter pills */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}}>
        {['All',...Object.keys(STATUS_COLORS)].map(s=>{
          const c=STATUS_COLORS[s];
          const active=filterStatus===s;
          const cnt=s==='All'?customers.length:(counts[s]||0);
          return <button key={s} onClick={()=>setFilterStatus(s)} style={{background:active?(c?c.bg:'rgba(123,28,46,0.2)'):'#1a1a1a',color:active?(c?c.color:'#f87171'):'#6b7280',border:'1px solid '+(active?(c?c.border:'rgba(123,28,46,0.35)'):'#2a2a2a'),borderRadius:'20px',padding:'5px 14px',fontSize:'12px',fontWeight:active?600:400,cursor:'pointer',display:'flex',alignItems:'center',gap:'5px'}}>
            {s}{cnt>0&&<span style={{background:'rgba(0,0,0,0.2)',borderRadius:'10px',padding:'0 6px',fontSize:'11px'}}>{cnt}</span>}
          </button>;
        })}
      </div>

      <div style={{marginBottom:'16px'}}>
        <input type='text' placeholder='Search by name, email, phone...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,maxWidth:'340px'}} />
      </div>

      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
        {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        :filtered.length===0?(
          <div style={{padding:'60px',textAlign:'center'}}>
            <div style={{fontSize:'40px',marginBottom:'14px'}}>👥</div>
            <div style={{color:'#fff',fontWeight:700,fontSize:'17px',marginBottom:'6px'}}>{customers.length===0?'No customers yet':'No results'}</div>
            <div style={{color:'#4b5563',fontSize:'13px',marginBottom:'20px'}}>{customers.length===0?'Add your first customer to get started.':'Try a different search or filter.'}</div>
            {customers.length===0&&<button onClick={()=>{setForm({...EMPTY});setShowForm(true);}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'11px 22px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>+ Add First Customer</button>}
          </div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Customer','Email','Phone','Status',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c,i)=>{
                const sc=STATUS_COLORS[c.status]||STATUS_COLORS.Active;
                const expanded=expandedRow===i;
                return [
                  <tr key={'r'+i} onClick={()=>setExpandedRow(expanded?null:i)} style={{cursor:'pointer'}} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={td}><div style={{display:'flex',alignItems:'center',gap:'11px'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'rgba(123,28,46,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:700,color:'#f87171',flexShrink:0}}>{initials(c.name)}</div>
                      <div><div style={{color:'#fff',fontWeight:600,fontSize:'14px'}}>{c.name}</div>{c.notes&&<div style={{color:'#4b5563',fontSize:'11px',marginTop:'1px'}}>{c.notes.slice(0,40)}{c.notes.length>40?'...':''}</div>}</div>
                    </div></td>
                    <td style={{...td,color:'#9ca3af'}}>{c.email||'—'}</td>
                    <td style={{...td,color:'#9ca3af'}}>{c.phone||'—'}</td>
                    <td style={td}><span style={{background:sc.bg,color:sc.color,border:'1px solid '+sc.border,borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:600}}>{c.status||'Active'}</span></td>
                    <td style={td}><div style={{display:'flex',gap:'6px'}}>
                      <button onClick={e=>{e.stopPropagation();setForm({name:c.name,email:c.email||'',phone:c.phone||'',status:c.status||'Active',notes:c.notes||''});setEditIdx(c.id||i);setShowForm(true);}} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#9ca3af',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}}>Edit</button>
                      <button onClick={e=>{e.stopPropagation();del(c.id||i,c.name);}} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'4px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Delete</button>
                    </div></td>
                  </tr>,
                  expanded&&<tr key={'e'+i}><td colSpan={5} style={{padding:'0',background:'#151515',borderBottom:'1px solid #1f1f1f'}}>
                    <div style={{padding:'16px 20px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
                      {[['Email',c.email||'—'],['Phone',c.phone||'—'],['Status',c.status||'Active'],['Notes',c.notes||'—']].map(([label,val])=>(
                        <div key={label}><div style={{color:'#4b5563',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'4px'}}>{label}</div><div style={{color:'#d1d5db',fontSize:'13px'}}>{val}</div></div>
                      ))}
                    </div>
                  </td></tr>
                ];
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'480px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 24px'}}>{editIdx!==null?'Edit Customer':'Add Customer'}</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Full Name *</label><input type='text' placeholder='Jane Smith' value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} autoFocus /></div>
              <div><label style={lbl}>Email</label><input type='email' placeholder='jane@example.com' value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Phone</label><input type='tel' placeholder='+1 555 000 0000' value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Status</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{...inp,color:'#fff'}}>{['Active','Lead','VIP','Inactive'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional notes' value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={inp} /></div>
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
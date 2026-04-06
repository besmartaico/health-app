'use client';
import { useState, useEffect } from 'react';
const LOGO='https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';
const NAV=[{label:'Dashboard',href:'/admin',icon:'⬛'},{label:'CRM',href:'/admin/crm',icon:'👥'},{label:'Inventory',href:'/admin/inventory',icon:'📦'},{label:'Purchases',href:'/admin/purchases',icon:'🛒'},{label:'Sales',href:'/admin/sales',icon:'💰'},{label:'Profitability',href:'/admin/profitability',icon:'📊'},{label:'Calculator',href:'/admin/calculator',icon:'🧮'},{label:'Instructions',href:'/admin/instructions',icon:'📋'},{label:'Peptide AI',href:'/admin/peptide-ai',icon:'🤖'},{label:'COAs',href:'/admin/coa',icon:'📄'},{label:'Teams',href:'/admin/teams',icon:'🏢'},{label:'Users',href:'/admin/users',icon:'🔑'}];
export default function AdminLayout({ children }) {
  const [authed,setAuthed]=useState(false); const [pin,setPin]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); const [path,setPath]=useState('');
  useEffect(()=>{ if(sessionStorage.getItem('admin_auth')==='true')setAuthed(true); setPath(window.location.pathname); },[]);
  const login=async()=>{ if(!pin)return; setLoading(true); setError(''); try{ const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})}); const d=await r.json(); if(d.success){sessionStorage.setItem('admin_auth','true');setAuthed(true);}else setError('Invalid PIN. Please try again.'); }catch{setError('Connection error.');} setLoading(false); };
  if(!authed)return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0a 0%,#1a0a10 50%,#0a0a0a 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,system-ui,sans-serif',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'36px'}}>
          <div style={{display:'inline-block',background:'#fff',borderRadius:'14px',padding:'10px 22px',marginBottom:'24px',boxShadow:'0 8px 32px rgba(255,255,255,0.12)'}}>
            <img src={LOGO} alt="BeSmart Health" style={{height:'38px',display:'block'}} />
          </div>
          <h1 style={{color:'#fff',fontSize:'24px',fontWeight:'800',margin:'0 0 8px',letterSpacing:'-0.5px'}}>Admin Portal</h1>
          <p style={{color:'#6b7280',fontSize:'14px',margin:0}}>Enter your PIN to continue</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'36px'}}>
          <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:'600',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>Access PIN</label>
          <input type="password" placeholder="••••••" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',padding:'14px 16px',color:'#fff',fontSize:'18px',outline:'none',boxSizing:'border-box',letterSpacing:'0.4em',fontFamily:'monospace',textAlign:'center'}} />
          {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'11px 14px',color:'#fca5a5',fontSize:'13px',marginTop:'12px'}}>⚠️ {error}</div>}
          <button onClick={login} disabled={loading||!pin} style={{width:'100%',background:pin&&!loading?'#7b1c2e':'#2d0e18',color:pin&&!loading?'#fff':'#6b2d3e',border:'none',borderRadius:'10px',padding:'15px',fontSize:'16px',fontWeight:'700',cursor:pin&&!loading?'pointer':'not-allowed',marginTop:'16px',transition:'all 0.2s'}} onMouseOver={e=>{if(pin&&!loading)e.currentTarget.style.background='#9b2438';}} onMouseOut={e=>{if(pin&&!loading)e.currentTarget.style.background='#7b1c2e';}}>{loading?'Verifying...':'Access Dashboard →'}</button>
          <p style={{color:'#374151',fontSize:'11px',textAlign:'center',marginTop:'20px',marginBottom:0}}>Unauthorized access is logged.</p>
        </div>
      </div>
    </div>
  );
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'#131313',fontFamily:'Inter,system-ui,sans-serif'}}>
      <aside style={{width:'220px',background:'#0f0f0f',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto',borderRight:'1px solid #1f1f1f'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid #1f1f1f'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'6px 12px',display:'inline-block',marginBottom:'10px'}}>
            <img src={LOGO} alt="BeSmart Health" style={{height:'26px',display:'block'}} />
          </div>
          <div style={{color:'#4b5563',fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.12em'}}>Admin Portal</div>
        </div>
        <nav style={{padding:'10px 8px',flex:1}}>
          {NAV.map(({label,href,icon})=>{ const active=path===href||(href!=='/admin'&&path.startsWith(href)); return(
            <a key={href} href={href} onClick={()=>setPath(href)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'8px',textDecoration:'none',marginBottom:'1px',fontSize:'13px',fontWeight:active?'600':'400',background:active?'rgba(123,28,46,0.25)':'transparent',color:active?'#f87171':'#9ca3af',borderLeft:active?'2px solid #7b1c2e':'2px solid transparent',transition:'all 0.15s'}} onMouseOver={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#e5e7eb';}}} onMouseOut={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9ca3af';}}}>
              <span style={{fontSize:'13px',width:'18px',textAlign:'center'}}>{icon}</span>{label}
            </a>);
          })}
        </nav>
        <div style={{padding:'14px 12px',borderTop:'1px solid #1a1a1a'}}>
          <button onClick={()=>{sessionStorage.removeItem('admin_auth');setAuthed(false);setPin('');}} style={{width:'100%',background:'transparent',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#6b7280',fontSize:'12px',padding:'8px',cursor:'pointer',transition:'all 0.2s'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#fca5a5';e.currentTarget.style.borderColor='rgba(239,68,68,0.2)';}} onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>← Sign Out</button>
        </div>
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'auto'}}>
        <div style={{background:'#0f0f0f',borderBottom:'1px solid #1f1f1f',padding:'0 28px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10,flexShrink:0}}>
          <div style={{color:'#6b7280',fontSize:'13px'}}>Welcome back, <span style={{color:'#c0394f',fontWeight:'700'}}>Admin</span></div>
          <div style={{width:'32px',height:'32px',background:'#7b1c2e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px',fontWeight:'800'}}>A</div>
        </div>
        <div style={{flex:1,overflow:'auto',background:'#131313'}}>{children}</div>
      </div>
    </div>
  );
}
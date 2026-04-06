'use client';
import { useState, useEffect } from 'react';
const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';
const NAV=[{label:'Dashboard',href:'/admin',icon:'⬛'},{label:'CRM',href:'/admin/crm',icon:'👥'},{label:'Inventory',href:'/admin/inventory',icon:'📦'},{label:'Purchases',href:'/admin/purchases',icon:'🛒'},{label:'Sales',href:'/admin/sales',icon:'💰'},{label:'Profitability',href:'/admin/profitability',icon:'📊'},{label:'Calculator',href:'/admin/calculator',icon:'🧮'},{label:'Instructions',href:'/admin/instructions',icon:'📋'},{label:'Peptide AI',href:'/admin/peptide-ai',icon:'🤖'},{label:'COAs',href:'/admin/coa',icon:'📄'},{label:'Teams',href:'/admin/teams',icon:'🏢'},{label:'Users',href:'/admin/users',icon:'🔑'}];
const inpStyle = { width:'100%', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'13px 16px', color:'#fff', fontSize:'15px', outline:'none', boxSizing:'border-box' };
export default function AdminLayout({ children }) {
  const [authed,setAuthed]=useState(false);
  const [mode,setMode]=useState('choose');
  const [pin,setPin]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [confirm,setConfirm]=useState('');
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [loading,setLoading]=useState(false);
  const [path,setPath]=useState('');
  const [userName,setUserName]=useState('Admin');
  useEffect(()=>{ if(sessionStorage.getItem('admin_auth')==='true'){setUserName(sessionStorage.getItem('admin_name')||'Admin');setAuthed(true);} setPath(window.location.pathname); },[]);
  const loginPin = async () => {
    if(!pin)return; setLoading(true); setError('');
    try{ const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})}); const d=await r.json(); if(d.success){sessionStorage.setItem('admin_auth','true');sessionStorage.setItem('admin_name','Owner');setUserName('Owner');setAuthed(true);}else setError('Invalid PIN.'); }catch{setError('Connection error.');}
    setLoading(false);
  };
  const loginEmail = async () => {
    if(!email||!password)return; setLoading(true); setError('');
    try{ const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); const d=await r.json(); if(d.success){sessionStorage.setItem('admin_auth','true');sessionStorage.setItem('admin_name',d.user.name||d.user.email);setUserName(d.user.name||d.user.email);setAuthed(true);}else setError(d.error||'Invalid email or password.'); }catch{setError('Connection error.');}
    setLoading(false);
  };
  const createAccount = async () => {
    if(!email||!password||!name){setError('All fields are required.');return;}
    if(password.length<8){setError('Password must be at least 8 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setLoading(true); setError('');
    try{
      const r=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,name})});
      const d=await r.json();
      if(d.success){setSuccess('Account created! You can now sign in.');setMode('email');setPassword('');setConfirm('');}
      else setError(d.error||'Could not create account.');
    }catch{setError('Connection error.');}
    setLoading(false);
  };
  const signOut=()=>{sessionStorage.removeItem('admin_auth');sessionStorage.removeItem('admin_name');setAuthed(false);setPin('');setEmail('');setPassword('');setName('');setConfirm('');setMode('choose');setError('');setSuccess('');};
  if(!authed) return(
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0a 0%,#1a0a10 50%,#0a0a0a 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,system-ui,sans-serif',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'440px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{display:'inline-block',background:'#fff',borderRadius:'14px',padding:'10px 22px',marginBottom:'20px',boxShadow:'0 8px 32px rgba(255,255,255,0.12)'}}><img src={LOGO} alt='BeSmart Health' style={{height:'38px',display:'block'}} /></div>
          <h1 style={{color:'#fff',fontSize:'24px',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px'}}>Admin Portal</h1>
        </div>
        {mode==='choose' && (
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <button onClick={()=>{setMode('email');setError('');setSuccess('');}} style={{width:'100%',background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'12px',padding:'16px',fontSize:'15px',fontWeight:700,cursor:'pointer'}}>Sign In</button>
            <button onClick={()=>{setMode('register');setError('');setSuccess('');}} style={{width:'100%',background:'rgba(255,255,255,0.08)',color:'#d1d5db',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',padding:'14px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>Create Account</button>
            <button onClick={()=>{setMode('pin');setError('');}} style={{width:'100%',background:'transparent',color:'#6b7280',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'12px',fontSize:'13px',cursor:'pointer'}}>Owner PIN access</button>
          </div>
        )}
        {(mode==='email'||mode==='register'||mode==='pin') && (
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'20px',padding:'32px'}}>
            <h2 style={{color:'#fff',fontSize:'18px',fontWeight:700,margin:'0 0 20px'}}>{mode==='email'?'Sign In':mode==='register'?'Create Account':'Owner Access'}</h2>
            {success && <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'8px',padding:'11px 14px',color:'#34d399',fontSize:'13px',marginBottom:'14px'}}>✓ {success}</div>}
            {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'11px 14px',color:'#fca5a5',fontSize:'13px',marginBottom:'14px'}}>⚠️ {error}</div>}
            {mode==='register' && <input type='text' placeholder='Your full name' value={name} onChange={e=>setName(e.target.value)} style={{...inpStyle,marginBottom:'10px'}} />}
            {mode!=='pin' && <input type='email' placeholder='Email address' value={email} onChange={e=>setEmail(e.target.value)} style={{...inpStyle,marginBottom:'10px'}} />}
            {mode==='pin' && <input type='password' placeholder='••••••' value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&loginPin()} style={{...inpStyle,letterSpacing:'0.4em',fontFamily:'monospace',textAlign:'center',marginBottom:'10px'}} />}
            {mode!=='pin' && <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(mode==='email'?loginEmail():null)} style={{...inpStyle,marginBottom:'10px'}} />}
            {mode==='register' && <input type='password' placeholder='Confirm password' value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createAccount()} style={{...inpStyle,marginBottom:'10px'}} />}
            <button onClick={mode==='email'?loginEmail:mode==='register'?createAccount:loginPin} disabled={loading} style={{width:'100%',background:loading?'#2d0e18':'#7b1c2e',color:loading?'#6b2d3e':'#fff',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:700,cursor:loading?'not-allowed':'pointer',marginBottom:'12px',marginTop:'4px'}}>
              {loading?'Please wait...':(mode==='email'?'Sign In →':mode==='register'?'Create Account →':'Access Dashboard →')}
            </button>
            <button onClick={()=>{setMode('choose');setError('');setSuccess('');}} style={{width:'100%',background:'transparent',color:'#6b7280',border:'none',fontSize:'13px',cursor:'pointer'}}>← Back</button>
          </div>
        )}
      </div>
    </div>
  );
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'#131313',fontFamily:'Inter,system-ui,sans-serif'}}>
      <aside style={{width:'220px',background:'#0f0f0f',display:'flex',flexDirection:'column',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto',borderRight:'1px solid #1f1f1f'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid #1f1f1f'}}><div style={{background:'#fff',borderRadius:'8px',padding:'6px 12px',display:'inline-block',marginBottom:'10px'}}><img src={LOGO} alt='BeSmart Health' style={{height:'26px',display:'block'}} /></div><div style={{color:'#4b5563',fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em'}}>Admin Portal</div></div>
        <nav style={{padding:'10px 8px',flex:1}}>{NAV.map(({label,href,icon})=>{ const active=path===href||(href!=='/admin'&&path.startsWith(href)); return(<a key={href} href={href} onClick={()=>setPath(href)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'8px',textDecoration:'none',marginBottom:'1px',fontSize:'13px',fontWeight:active?600:400,background:active?'rgba(123,28,46,0.25)':'transparent',color:active?'#f87171':'#9ca3af',borderLeft:active?'2px solid #7b1c2e':'2px solid transparent'}} onMouseOver={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#e5e7eb';}}} onMouseOut={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9ca3af';}}}><span style={{fontSize:'13px',width:'18px',textAlign:'center'}}>{icon}</span>{label}</a>);
          })}</nav>
        <div style={{padding:'14px 12px',borderTop:'1px solid #1a1a1a'}}><button onClick={signOut} style={{width:'100%',background:'transparent',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#6b7280',fontSize:'12px',padding:'8px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)';e.currentTarget.style.color='#fca5a5';e.currentTarget.style.borderColor='rgba(239,68,68,0.2)';}} onMouseOut={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>← Sign Out</button></div>
      </aside>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'auto'}}>
        <div style={{background:'#0f0f0f',borderBottom:'1px solid #1f1f1f',padding:'0 28px',height:'56px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10,flexShrink:0}}>
          <div style={{color:'#6b7280',fontSize:'13px'}}>Welcome back, <span style={{color:'#c0394f',fontWeight:700}}>{userName}</span></div>
          <div style={{width:'32px',height:'32px',background:'#7b1c2e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px',fontWeight:800}}>{userName.charAt(0).toUpperCase()}</div>
        </div>
        <div style={{flex:1,overflow:'auto',background:'#131313'}}>{children}</div>
      </div>
    </div>
  );
}
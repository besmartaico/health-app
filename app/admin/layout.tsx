// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

const NAV = [
  { href:'/admin', label:'Dashboard', icon:'📊' },
  { href:'/admin/crm', label:'Customers', icon:'👥' },
  { href:'/admin/inventory', label:'Inventory', icon:'📦' },
  { href:'/admin/purchases', label:'Purchases', icon:'🛒' },
  { href:'/admin/sales', label:'Sales', icon:'💰' },
  { href:'/admin/profitability', label:'Profitability', icon:'📈' },
  { href:'/admin/calculator', label:'Calculator', icon:'🧮' },
  { href:'/admin/instructions', label:'Instructions', icon:'📋' },
  { href:'/admin/peptide-ai', label:'Peptide AI', icon:'🤖' },
  { href:'/admin/coa', label:'COAs', icon:'🔬' },
  { href:'/admin/teams', label:'Teams', icon:'🏢' },
  { href:'/admin/users', label:'Users', icon:'👤' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [auth, setAuth] = useState(false);
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<'pin'|'login'|'register'>('pin');
  const [regName, setRegName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    const a = sessionStorage.getItem('admin_auth');
    if (a === 'true' || a === 'user') setAuth(true);
  }, []);

  const syncAll = useCallback(async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await fetch('/api/sync', { method: 'POST' }).then(x => x.json());
      setSyncMsg(r.success ? '✓ Synced!' : ('⚠ ' + (r.error||'Error')));
    } catch(e) { setSyncMsg('⚠ Error'); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 5000);
  }, []);

  const handlePin = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pin }) });
    const d = await res.json();
    if (d.success) { sessionStorage.setItem('admin_auth','true'); setAuth(true); }
    else setError('Incorrect PIN');
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const d = await res.json();
    if (d.success) { sessionStorage.setItem('admin_auth','user'); setAuth(true); }
    else setError(d.error || 'Invalid credentials');
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password, name: regName }) });
    const d = await res.json();
    if (d.success) { sessionStorage.setItem('admin_auth','user'); setAuth(true); }
    else setError(d.error || 'Registration failed');
    setLoading(false);
  };

  const signOut = () => { sessionStorage.removeItem('admin_auth'); setAuth(false); setPin(''); setEmail(''); setPassword(''); };

  const inp = { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'12px 14px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };

  if (!auth) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'400px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{background:'#fff',borderRadius:'10px',padding:'8px 16px',display:'inline-block',marginBottom:'16px'}}>
            <img src={LOGO} alt='BeSmart' style={{height:'28px',display:'block'}} />
          </div>
          <h1 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:0}}>Admin Portal</h1>
        </div>
        <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'3px',marginBottom:'24px'}}>
          {[['pin','Owner PIN'],['login','Sign In'],['register','Create Account']].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m as any);setError('');}} style={{flex:1,background:mode===m?'#0f0f0f':'transparent',color:mode===m?'#fff':'#6b7280',border:mode===m?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'6px',padding:'7px 4px',fontSize:'12px',fontWeight:mode===m?600:400,cursor:'pointer'}}>{label}</button>
          ))}
        </div>
        {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'10px',color:'#fca5a5',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
        {mode==='pin'&&(
          <><div style={{marginBottom:'16px'}}><input type='password' placeholder='Enter owner PIN' value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePin()} style={inp} autoFocus /></div>
          <button onClick={handlePin} disabled={loading||!pin} style={{width:'100%',background:pin&&!loading?'#7b1c2e':'#2d0e18',color:pin&&!loading?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:pin&&!loading?'pointer':'not-allowed'}}>{loading?'Verifying...':'Access Admin'}</button></>
        )}
        {mode==='login'&&(
          <><div style={{marginBottom:'12px'}}><input type='email' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={inp} autoFocus /></div>
          <div style={{marginBottom:'16px',position:'relative'}}><input type={showPw?'text':'password'} placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} style={{...inp,paddingRight:'44px'}} /><button onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'16px'}}>{showPw?'🙈':'👁'}</button></div>
          <button onClick={handleLogin} disabled={loading||!email||!password} style={{width:'100%',background:email&&password&&!loading?'#7b1c2e':'#2d0e18',color:email&&password&&!loading?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:email&&password&&!loading?'pointer':'not-allowed'}}>{loading?'Signing in...':'Sign In'}</button></>
        )}
        {mode==='register'&&(
          <><div style={{marginBottom:'12px'}}><input type='text' placeholder='Your Name' value={regName} onChange={e=>setRegName(e.target.value)} style={inp} autoFocus /></div>
          <div style={{marginBottom:'12px'}}><input type='email' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} style={inp} /></div>
          <div style={{marginBottom:'16px',position:'relative'}}><input type={showPw?'text':'password'} placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} style={{...inp,paddingRight:'44px'}} /><button onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'16px'}}>{showPw?'🙈':'👁'}</button></div>
          <button onClick={handleRegister} disabled={loading||!email||!password||!regName} style={{width:'100%',background:email&&password&&regName&&!loading?'#7b1c2e':'#2d0e18',color:email&&password&&regName&&!loading?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:email&&password&&regName&&!loading?'pointer':'not-allowed'}}>{loading?'Creating...':'Create Account'}</button></>
        )}
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {/* Sidebar */}
      <div style={{width:'220px',flexShrink:0,background:'#0f0f0f',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        {/* Logo */}
        <div style={{padding:'20px 16px 12px',borderBottom:'1px solid #1a1a1a'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'5px 12px',display:'inline-block'}}>
            <img src={LOGO} alt='BeSmart' style={{height:'22px',display:'block'}} />
          </div>
        </div>

        {/* ⟳ Global Sync Button */}
        <div style={{padding:'10px 12px 4px'}}>
          <button
            onClick={syncAll}
            disabled={syncing}
            title='Sync All: import customers from Sales, rebuild Inventory from Purchases & Sales'
            style={{width:'100%',background:syncing?'#111':syncMsg.startsWith('✓')?'rgba(16,185,129,0.1)':syncMsg.startsWith('⚠')?'rgba(239,68,68,0.08)':'rgba(16,185,129,0.07)',color:syncing?'#374151':syncMsg.startsWith('⚠')?'#f87171':'#34d399',border:'1px solid '+(syncMsg.startsWith('⚠')?'rgba(239,68,68,0.2)':'rgba(16,185,129,0.18)'),borderRadius:'8px',padding:'8px 10px',fontSize:'12px',fontWeight:600,cursor:syncing?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',transition:'all 0.15s'}}
          >
            <span style={{fontSize:'13px'}}>{syncing?'⟳':syncMsg.startsWith('✓')?'✓':syncMsg.startsWith('⚠')?'⚠':'⟳'}</span>
            {syncing?'Syncing...':syncMsg||'Sync All Data'}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{flex:1,padding:'8px 0'}}>
          {NAV.map(({href,label,icon})=>{
            const active = pathname===href || (href!=='/admin'&&pathname?.startsWith(href));
            return (
              <a key={href} href={href} style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 16px',color:active?'#fff':'#6b7280',background:active?'rgba(123,28,46,0.2)':'transparent',borderLeft:active?'2px solid #7b1c2e':'2px solid transparent',textDecoration:'none',fontSize:'13px',fontWeight:active?600:400,transition:'all 0.1s'}}
              onMouseOver={e=>{if(!active)e.currentTarget.style.color='#9ca3af';}} onMouseOut={e=>{if(!active)e.currentTarget.style.color='#6b7280';}}
              >
                <span style={{fontSize:'15px'}}>{icon}</span>{label}
              </a>
            );
          })}
          {/* Documents SSO */}
          <a href='/api/sso' style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 16px',color:'#6b7280',textDecoration:'none',fontSize:'13px',fontWeight:400}}
          onMouseOver={e=>e.currentTarget.style.color='#9ca3af'} onMouseOut={e=>e.currentTarget.style.color='#6b7280'}
          >
            <span style={{fontSize:'15px'}}>📝</span>Documents
          </a>
        </nav>

        {/* Sign Out */}
        <div style={{padding:'12px 16px',borderTop:'1px solid #1a1a1a'}}>
          <button onClick={signOut} style={{width:'100%',background:'transparent',color:'#4b5563',border:'1px solid #1f1f1f',borderRadius:'8px',padding:'8px',fontSize:'12px',cursor:'pointer',fontWeight:500}}
          onMouseOver={e=>{e.currentTarget.style.color='#9ca3af';e.currentTarget.style.borderColor='#2a2a2a';}} onMouseOut={e=>{e.currentTarget.style.color='#4b5563';e.currentTarget.style.borderColor='#1f1f1f';}}
          >Sign Out</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,minWidth:0,overflowX:'auto'}}>
        {children}
      </div>
    </div>
  );
}
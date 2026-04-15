// @ts-nocheck
'use client';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';
const NAV = [
  { href:'/admin', label:'Dashboard', icon:'📊' },
  { href:'/admin/crm', label:'Customers', icon:'👥' },
  { href:'/admin/sales', label:'Sales', icon:'💰' },
  { href:'/admin/purchases', label:'Purchases', icon:'🛒' },
  { href:'/admin/inventory', label:'Inventory', icon:'📦' },
  { href:'/admin/profitability', label:'Profit', icon:'📈' },
  { href:'/admin/calculator', label:'Calculator', icon:'🧮' },
  { href:'/admin/instructions', label:'Instructions', icon:'📋' },
  { href:'/admin/peptide-ai', label:'Peptide AI', icon:'🤖' },
  { href:'/admin/coa', label:'COAs', icon:'🔬' },
  { href:'/admin/teams', label:'Teams', icon:'🏢' },
  { href:'/admin/users', label:'Users', icon:'👤' },
  { href:'/api/sso', label:'Documents', icon:'📝' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    const a = sessionStorage.getItem('admin_auth');
    if (a === 'true' || a === 'user') setAuth(true);
  }, []);

  // Close drawer on nav
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  const syncAll = useCallback(async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await fetch('/api/sync', { method: 'POST' }).then(x => x.json());
      setSyncMsg(r.success ? '✓ Synced!' : '⚠ ' + (r.error||'Error'));
    } catch { setSyncMsg('⚠ Error'); }
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 5000);
  }, []);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    if (!email.trim()) {
      const r = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pin: password }) });
      const d = await r.json();
      if (d.success) { sessionStorage.setItem('admin_auth','true'); setAuth(true); }
      else setError('Incorrect PIN or credentials');
    } else {
      const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (d.success) { sessionStorage.setItem('admin_auth','user'); setAuth(true); }
      else setError(d.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  const signOut = () => { sessionStorage.removeItem('admin_auth'); setAuth(false); setEmail(''); setPassword(''); };

  const inp = { width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'10px', padding:'14px', color:'#fff', fontSize:'16px', outline:'none', boxSizing:'border-box' };

  if (!auth) return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'#111',border:'1px solid #1f1f1f',borderRadius:'20px',padding:'36px 28px',width:'100%',maxWidth:'380px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{background:'#fff',borderRadius:'10px',padding:'8px 16px',display:'inline-block',marginBottom:'16px'}}>
            <img src={LOGO} alt='BeSmart' style={{height:'28px',display:'block'}} />
          </div>
          <h1 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:0}}>Admin Portal</h1>
          <p style={{color:'#4b5563',fontSize:'12px',margin:'6px 0 0'}}>Leave email blank to sign in with your PIN</p>
        </div>
        {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'10px 14px',color:'#fca5a5',fontSize:'13px',marginBottom:'16px'}}>{error}</div>}
        <div style={{marginBottom:'12px'}}>
          <input type='email' placeholder='Email (optional)' value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} style={inp} autoCapitalize='none' autoComplete='email' />
        </div>
        <div style={{marginBottom:'20px',position:'relative'}}>
          <input type={showPw?'text':'password'} placeholder={email?'Password':'PIN'} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()} style={{...inp,paddingRight:'50px'}} autoComplete='current-password' />
          <button onClick={()=>setShowPw(v=>!v)} style={{position:'absolute',right:'14px',top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'18px',padding:'4px'}}>{showPw?'🙈':'👁'}</button>
        </div>
        <button onClick={handleSubmit} disabled={loading||!password} style={{width:'100%',background:password&&!loading?'#1a4fa8':'#0d2d6b',color:password&&!loading?'#fff':'#1a3a7a',border:'none',borderRadius:'10px',padding:'15px',fontSize:'16px',fontWeight:700,cursor:password&&!loading?'pointer':'not-allowed',marginBottom:'16px'}}>{loading?'Signing in...':'Sign In'}</button>
        <div style={{textAlign:'center'}}><a href='/signup' style={{color:'#4b5563',fontSize:'13px',textDecoration:'none'}}>Create account with invite link →</a></div>
      </div>
    </div>
  );

  const navLink = (item) => {
    const active = pathname===item.href || (item.href!=='/admin'&&item.href!=='/api/sso'&&pathname?.startsWith(item.href));
    return (
      <a key={item.href} href={item.href}
        style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 20px',color:active?'#fff':'#9ca3af',background:active?'rgba(26,79,168,0.2)':'transparent',borderLeft:active?'3px solid #1a4fa8':'3px solid transparent',textDecoration:'none',fontSize:'14px',fontWeight:active?600:400,transition:'all 0.1s'}}
        onMouseOver={e=>{if(!active){e.currentTarget.style.color='#d1d5db';e.currentTarget.style.background='rgba(255,255,255,0.04)';}}}
        onMouseOut={e=>{if(!active){e.currentTarget.style.color='#9ca3af';e.currentTarget.style.background='transparent';}}}
      >
        <span style={{fontSize:'18px',width:'22px',textAlign:'center',flexShrink:0}}>{item.icon}</span>
        <span>{item.label}</span>
      </a>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={{padding:'20px 20px 12px',borderBottom:'1px solid #1a1a1a'}}>
        <div style={{background:'#fff',borderRadius:'8px',padding:'6px 12px',display:'inline-block'}}>
          <img src={LOGO} alt='BeSmart' style={{height:'22px',display:'block'}} />
        </div>
      </div>
      {/* Sync button */}
      <div style={{padding:'10px 12px 4px'}}>
        <button onClick={syncAll} disabled={syncing} title='Sync customers from Sales + rebuild Inventory' style={{width:'100%',background:syncing?'#111':'rgba(16,185,129,0.07)',color:syncing?'#374151':syncMsg.startsWith('⚠')?'#f87171':'#34d399',border:'1px solid rgba(16,185,129,0.18)',borderRadius:'8px',padding:'9px 12px',fontSize:'13px',fontWeight:600,cursor:syncing?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
          <span>{syncing?'⟳':syncMsg.startsWith('⚠')?'⚠':'⟳'}</span>
          {syncing?'Syncing...':syncMsg||'Sync All Data'}
        </button>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:'8px 0',overflowY:'auto'}}>
        {NAV.map(navLink)}
      </nav>
      {/* Sign out */}
      <div style={{padding:'12px',borderTop:'1px solid #1a1a1a'}}>
        <button onClick={signOut} style={{width:'100%',background:'transparent',color:'#4b5563',border:'1px solid #1f1f1f',borderRadius:'8px',padding:'10px',fontSize:'13px',cursor:'pointer',fontWeight:500}} onMouseOver={e=>{e.currentTarget.style.color='#9ca3af';}} onMouseOut={e=>{e.currentTarget.style.color='#4b5563';}}>Sign Out</button>
      </div>
    </>
  );

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {/* ── DESKTOP SIDEBAR ── */}
      <div className='desktop-only' style={{width:'220px',flexShrink:0,background:'#0f0f0f',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        {sidebarContent}
      </div>

      {/* ── MOBILE: drawer overlay ── */}
      {drawerOpen&&(
        <div className='mobile-only' style={{position:'fixed',inset:0,zIndex:200}}>
          {/* Backdrop */}
          <div onClick={()=>setDrawerOpen(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)'}} />
          {/* Drawer */}
          <div style={{position:'absolute',left:0,top:0,bottom:0,width:'280px',background:'#0f0f0f',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column',boxShadow:'4px 0 24px rgba(0,0,0,0.5)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #1a1a1a'}}>
              <div style={{background:'#fff',borderRadius:'8px',padding:'5px 12px'}}>
                <img src={LOGO} alt='BeSmart' style={{height:'20px',display:'block'}} />
              </div>
              <button onClick={()=>setDrawerOpen(false)} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'24px',cursor:'pointer',padding:'4px',lineHeight:1}}>×</button>
            </div>
            <div style={{padding:'10px 12px 4px'}}>
              <button onClick={()=>{syncAll();setDrawerOpen(false);}} disabled={syncing} style={{width:'100%',background:'rgba(16,185,129,0.07)',color:'#34d399',border:'1px solid rgba(16,185,129,0.18)',borderRadius:'8px',padding:'10px 12px',fontSize:'13px',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
                ⟳ {syncing?'Syncing...':syncMsg||'Sync All Data'}
              </button>
            </div>
            <nav style={{flex:1,overflowY:'auto',padding:'8px 0'}}>{NAV.map(navLink)}</nav>
            <div style={{padding:'12px',borderTop:'1px solid #1a1a1a'}}>
              <button onClick={signOut} style={{width:'100%',background:'transparent',color:'#4b5563',border:'1px solid #1f1f1f',borderRadius:'8px',padding:'10px',fontSize:'14px',cursor:'pointer'}}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
        {/* Mobile top header */}
        <div className='mobile-only' style={{background:'#0f0f0f',borderBottom:'1px solid #1a1a1a',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
          <button onClick={()=>setDrawerOpen(true)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#9ca3af',padding:'8px 12px',cursor:'pointer',fontSize:'18px',lineHeight:1}}>☰</button>
          <div style={{background:'#fff',borderRadius:'7px',padding:'4px 10px'}}>
            <img src={LOGO} alt='BeSmart' style={{height:'18px',display:'block'}} />
          </div>
          <button onClick={syncAll} disabled={syncing} style={{background:'transparent',border:'1px solid rgba(16,185,129,0.25)',borderRadius:'8px',color:'#34d399',padding:'8px 10px',cursor:syncing?'not-allowed':'pointer',fontSize:'13px',fontWeight:600,whiteSpace:'nowrap'}}>
            {syncing?'...':'⟳'}
          </button>
        </div>
        <div style={{flex:1,overflowX:'hidden'}}>
          {children}
        </div>
      </div>
    </div>
  );
}
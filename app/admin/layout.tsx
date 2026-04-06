'use client';
import { useState, useEffect } from 'react';

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: '⬛' },
  { label: 'CRM', href: '/admin/crm', icon: '👥' },
  { label: 'Inventory', href: '/admin/inventory', icon: '📦' },
  { label: 'Calculator', href: '/admin/calculator', icon: '🧮' },
  { label: 'Instructions', href: '/admin/instructions', icon: '📋' },
  { label: 'Peptide AI', href: '/admin/peptide-ai', icon: '🤖' },
  { label: 'COAs', href: '/admin/coa', icon: '📄' },
  { label: 'Users', href: '/admin/users', icon: '🔑' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') setAuthed(true);
    setCurrentPath(window.location.pathname);
  }, []);

  const login = async () => {
    if (!pin) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      const d = await r.json();
      if (d.success) { sessionStorage.setItem('admin_auth', 'true'); setAuthed(true); }
      else setError('Invalid PIN. Please try again.');
    } catch { setError('Connection error. Please retry.'); }
    setLoading(false);
  };

  if (!authed) return (
    <div style={{minHeight:'100vh',background:'#0f0f0f',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,system-ui,sans-serif',padding:'24px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'40px'}}>
          <div style={{display:'inline-block',background:'#fff',borderRadius:'12px',padding:'10px 20px',marginBottom:'20px',boxShadow:'0 4px 24px rgba(255,255,255,0.1)'}}>
            <img src={LOGO_URL} alt="BeSmart Health" style={{height:'40px',display:'block'}} />
          </div>
          <h1 style={{color:'#fff',fontSize:'26px',fontWeight:'800',margin:'0 0 6px',letterSpacing:'-0.5px'}}>Admin Portal</h1>
          <p style={{color:'#6b7280',fontSize:'14px',margin:0}}>Enter your PIN to access the dashboard</p>
        </div>

        {/* Login Card */}
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'20px',padding:'40px',boxShadow:'0 24px 48px rgba(0,0,0,0.4)'}}>
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block',color:'#9ca3af',fontSize:'13px',fontWeight:'600',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Access PIN</label>
            <input
              type="password"
              placeholder="Enter your PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{width:'100%',background:'#0f0f0f',border:'1px solid #333',borderRadius:'10px',padding:'14px 16px',color:'#fff',fontSize:'16px',outline:'none',boxSizing:'border-box',letterSpacing:'0.3em',fontFamily:'monospace'}}
            />
          </div>
          {error && (
            <div style={{background:'rgba(220,38,38,0.1)',border:'1px solid rgba(220,38,38,0.3)',borderRadius:'8px',padding:'12px',color:'#f87171',fontSize:'13px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'8px'}}>
              <span>⚠️</span> {error}
            </div>
          )}
          <button
            onClick={login}
            disabled={loading || !pin}
            style={{width:'100%',background:loading||!pin?'#4a1020':'#7b1c2e',color:'#fff',border:'none',borderRadius:'10px',padding:'15px',fontSize:'16px',fontWeight:'700',cursor:loading||!pin?'not-allowed':'pointer',transition:'background 0.2s',letterSpacing:'0.02em'}}
            onMouseOver={e => { if (!loading && pin) (e.target as HTMLButtonElement).style.background='#9b2438'; }}
            onMouseOut={e => { if (!loading && pin) (e.target as HTMLButtonElement).style.background='#7b1c2e'; }}
          >
            {loading ? 'Verifying...' : 'Access Dashboard →'}
          </button>
          <p style={{color:'#374151',fontSize:'12px',textAlign:'center',marginTop:'20px',marginBottom:0,lineHeight:'1.6'}}>
            Protected access only. Unauthorized access attempts are logged.
          </p>
        </div>

        <p style={{color:'#1f2937',fontSize:'12px',textAlign:'center',marginTop:'24px'}}>
          © 2025 BeSmart Health
        </p>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#f8fafc',fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Sidebar */}
      <aside style={{width:'240px',background:'#0f0f0f',display:'flex',flexDirection:'column',borderRight:'1px solid #1a1a1a',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        {/* Brand */}
        <div style={{padding:'24px 20px',borderBottom:'1px solid #1f1f1f'}}>
          <div style={{background:'#fff',borderRadius:'8px',padding:'7px 12px',display:'inline-block',marginBottom:'12px'}}>
            <img src={LOGO_URL} alt="BeSmart Health" style={{height:'28px',display:'block'}} />
          </div>
          <div style={{color:'#6b7280',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em'}}>Admin Portal</div>
        </div>

        {/* Nav */}
        <nav style={{padding:'12px 12px',flex:1}}>
          {NAV.map(({ label, href, icon }) => {
            const active = currentPath === href || (href !== '/admin' && currentPath.startsWith(href));
            return (
              <a
                key={href}
                href={href}
                onClick={() => setCurrentPath(href)}
                style={{
                  display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'8px',
                  textDecoration:'none',marginBottom:'2px',fontSize:'14px',fontWeight: active ? '600' : '400',
                  background: active ? 'rgba(123,28,46,0.25)' : 'transparent',
                  color: active ? '#e05070' : '#9ca3af',
                  borderLeft: active ? '2px solid #7b1c2e' : '2px solid transparent',
                  transition:'all 0.15s',
                }}
                onMouseOver={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color='#fff'; } }}
                onMouseOut={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background='transparent'; (e.currentTarget as HTMLAnchorElement).style.color='#9ca3af'; } }}
              >
                <span style={{fontSize:'15px'}}>{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{padding:'16px 20px',borderTop:'1px solid #1f1f1f'}}>
          <button
            onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); setPin(''); }}
            style={{width:'100%',background:'transparent',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#6b7280',fontSize:'13px',padding:'9px',cursor:'pointer',transition:'all 0.2s'}}
            onMouseOver={e => { (e.target as HTMLButtonElement).style.background='rgba(220,38,38,0.1)'; (e.target as HTMLButtonElement).style.color='#f87171'; (e.target as HTMLButtonElement).style.borderColor='rgba(220,38,38,0.3)'; }}
            onMouseOut={e => { (e.target as HTMLButtonElement).style.background='transparent'; (e.target as HTMLButtonElement).style.color='#6b7280'; (e.target as HTMLButtonElement).style.borderColor='#2a2a2a'; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflow:'auto',minHeight:'100vh'}}>
        {/* Top bar */}
        <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 32px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
          <div style={{color:'#374151',fontSize:'14px'}}>
            Welcome back, <span style={{color:'#7b1c2e',fontWeight:'700'}}>Admin</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',background:'#7b1c2e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'13px',fontWeight:'700'}}>A</div>
          </div>
        </div>
        {/* Page content */}
        <div style={{padding:'0'}}>
          {children}
        </div>
      </main>
    </div>
  );
}
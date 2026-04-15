// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';
const inp = { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };

const EyeIcon = ({ show }) => show ? (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24'/>
    <line x1='1' y1='1' x2='23' y2='23'/>
  </svg>
) : (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/>
  </svg>
);

export default function SignupPage() {
  const [token, setToken] = useState('');
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') || '';
    setToken(t);
    if (!t) { setError('Invalid or missing invite link.'); setLoading(false); return; }
    fetch('/api/signup?token=' + t).then(r => r.json()).then(d => {
      if (d.valid) { setInvite(d); setName(d.name || ''); }
      else setError(d.error || 'Invalid invite link.');
      setLoading(false);
    }).catch(() => { setError('Failed to validate invite.'); setLoading(false); });
  }, []);

  const submit = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/signup', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ token, password, name }) });
    const d = await res.json();
    if (d.success) setDone(true);
    else { setError(d.error || 'Something went wrong.'); setSaving(false); }
  };

  const pwField = (value, setter, show, setShow, placeholder) => (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => setter(e.target.value)}
        style={{ ...inp, paddingRight: '48px' }}
      />
      <button
        type='button'
        onClick={() => setShow(!show)}
        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
      >
        <EyeIcon show={show} />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a10 50%,#0a0a0a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,system-ui,sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-block', background: '#fff', borderRadius: '14px', padding: '10px 22px', marginBottom: '24px' }}>
            <img src={LOGO} alt='BeSmart Health' style={{ height: '38px', display: 'block' }} />
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>Validating invite...</div>
        ) : done ? (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, margin: '0 0 8px' }}>Account created!</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>Your password has been set. You can now log in.</p>
            <a href='/admin' style={{ display: 'inline-block', background: '#1a4fa8', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}>Go to Login →</a>
          </div>
        ) : error && !invite ? (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>Invalid invite</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px' }}>
            <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, margin: '0 0 6px' }}>Create your account</h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 28px' }}>
              Joining as <strong style={{ color: '#c0394f' }}>{invite?.role}</strong> · {invite?.email}
            </p>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '11px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>⚠️ {error}</div>}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Name</label>
              <input type='text' placeholder='Jane Smith' value={name} onChange={e => setName(e.target.value)} style={inp} autoFocus />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
              {pwField(password, setPassword, showPw, setShowPw, 'At least 8 characters')}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Confirm Password</label>
              {pwField(confirm, setConfirm, showConfirm, setShowConfirm, 'Repeat password')}
            </div>
            <button onClick={submit} disabled={saving} style={{ width: '100%', background: saving ? '#0d2d6b' : '#1a4fa8', color: saving ? '#6b2d3e' : '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontSize: '16px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Creating account...' : 'Create Account →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
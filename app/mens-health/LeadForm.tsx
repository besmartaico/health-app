'use client';
import { useState } from 'react';

const GOALS = [
  'Lose weight',
  'Build lean muscle',
  'More energy & focus',
  'Overall health & longevity',
];

const inp: any = { width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '13px 14px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const lbl: any = { display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 600, marginBottom: '6px' };

// Fires a Google Ads conversion when the lead is captured.
// `sendTo` looks like "AW-XXXXXXXXX/AbC-D_efGh" — passed in from the page.
function trackConversion(sendTo: string) {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (typeof w.gtag === 'function' && sendTo && !sendTo.includes('CONVERSION')) {
    w.gtag('event', 'conversion', { send_to: sendTo });
  }
}

export default function LeadForm({ conversionSendTo = '' }: { conversionSendTo?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', goal: GOALS[0] });
  const [status, setStatus] = useState('');
  const f = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }));

  async function submit(e: any) {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          goals: form.goal,
          questions: '',
          source: 'mens-health-ppc',
        }),
      });
      trackConversion(conversionSendTo);
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', goal: GOALS[0] });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ background: '#111', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800 }}>You&apos;re in.</h3>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '15px', lineHeight: 1.6 }}>
          We&apos;ll reach out within 24 hours to map out your plan. Check your email and phone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div><label style={lbl}>Name *</label><input required value={form.name} onChange={f('name')} placeholder='Your name' style={inp} /></div>
        <div><label style={lbl}>Phone *</label><input required value={form.phone} onChange={f('phone')} placeholder='(555) 000-0000' style={inp} /></div>
      </div>
      <div><label style={lbl}>Email *</label><input required type='email' value={form.email} onChange={f('email')} placeholder='you@email.com' style={inp} /></div>
      <div>
        <label style={lbl}>Primary goal</label>
        <select value={form.goal} onChange={f('goal')} style={inp}>
          {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      <button type='submit' disabled={status === 'sending'} style={{ background: 'linear-gradient(135deg,#c0394f,#1a4fa8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '15px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', opacity: status === 'sending' ? 0.7 : 1 }}>
        {status === 'sending' ? 'Sending…' : 'Get My Free Plan Consultation'}
      </button>
      <p style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', margin: 0 }}>
        No cost, no obligation. We respond within 24 hours.
      </p>
      {status === 'error' && <p style={{ color: '#f87171', textAlign: 'center', margin: 0 }}>Something went wrong. Please try again or call us.</p>}
    </form>
  );
}

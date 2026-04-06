'use client';
import { useState, useEffect } from 'react';

const cards = [
  { title: 'CRM', href: '/admin/crm', desc: 'Manage customers & protocols', icon: '👥', color: '#3b82f6' },
  { title: 'Inventory', href: '/admin/inventory', desc: 'Track peptide stock levels', icon: '📦', color: '#8b5cf6' },
  { title: 'Calculator', href: '/admin/calculator', desc: 'Peptide dose calculator', icon: '🧮', color: '#10b981' },
  { title: 'Instructions', href: '/admin/instructions', desc: 'Reconstitution guides', icon: '📋', color: '#f59e0b' },
  { title: 'Peptide AI', href: '/admin/peptide-ai', desc: 'AI assistant for peptides', icon: '🤖', color: '#ec4899' },
  { title: 'COAs', href: '/admin/coa', desc: 'Lab certificates of analysis', icon: '📄', color: '#14b8a6' },
  { title: 'Users', href: '/admin/users', desc: 'Manage admin access', icon: '🔑', color: '#7b1c2e' },
];

export default function AdminDashboard() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Welcome to BeSmart Health Admin Portal</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Customers', val: '—', icon: '👥', bg: '#eff6ff', color: '#3b82f6' },
          { label: 'Inventory Items', val: '—', icon: '📦', bg: '#f5f3ff', color: '#8b5cf6' },
          { label: 'Pending COAs', val: '—', icon: '📄', bg: '#f0fdf4', color: '#10b981' },
          { label: 'Admin Users', val: '—', icon: '🔑', bg: '#fff1f2', color: '#7b1c2e' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Cards */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '12px' }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {cards.map(c => (
            <a key={c.href} href={c.href} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px 20px', textDecoration: 'none', display: 'block', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = c.color; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{c.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
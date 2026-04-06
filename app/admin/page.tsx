'use client';
import { useState, useEffect } from 'react';

const cards = [
  { title: 'CRM', href: '/admin/crm', desc: 'Manage customers & protocols', icon: '👥', accent: '#3b82f6' },
  { title: 'Inventory', href: '/admin/inventory', desc: 'Track peptide stock levels', icon: '📦', accent: '#8b5cf6' },
  { title: 'Calculator', href: '/admin/calculator', desc: 'Peptide dose calculator', icon: '🧮', accent: '#10b981' },
  { title: 'Instructions', href: '/admin/instructions', desc: 'Reconstitution guides', icon: '📋', accent: '#f59e0b' },
  { title: 'Peptide AI', href: '/admin/peptide-ai', desc: 'AI assistant for peptides', icon: '🤖', accent: '#ec4899' },
  { title: 'COAs', href: '/admin/coa', desc: 'Lab certificates', icon: '📄', accent: '#14b8a6' },
  { title: 'Users', href: '/admin/users', desc: 'Manage admin access', icon: '🔑', accent: '#c0394f' },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Welcome to BeSmart Health Admin Portal</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {[
          { label: 'Total Customers', icon: '👥', accent: '#3b82f6' },
          { label: 'Inventory Items', icon: '📦', accent: '#8b5cf6' },
          { label: 'Pending COAs', icon: '📄', accent: '#10b981' },
          { label: 'Admin Users', icon: '🔑', accent: '#c0394f' },
        ].map(s => (
          <div key={s.label} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', background: s.accent + '22', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, border: '1px solid ' + s.accent + '44' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>—</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ color: '#4b5563', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Quick Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {cards.map(c => (
            <a key={c.href} href={c.href}
              style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '22px 18px', textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
              onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = c.accent; (e.currentTarget as HTMLAnchorElement).style.background = '#242424'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLAnchorElement).style.background = '#1e1e1e'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}>
              <div style={{ fontSize: '26px', marginBottom: '10px' }}>{c.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>{c.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
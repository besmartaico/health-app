'use client';
import React, { useState, useEffect, CSSProperties } from 'react';

const card: CSSProperties = { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' };
const th: CSSProperties = { textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a2a', background: '#191919' };
const td: CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#d1d5db', borderBottom: '1px solid #1a1a1a' };
const inp: CSSProperties = { width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const lbl: CSSProperties = { display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' };

type Sale = { id: string; date: string; customer: string; peptide: string; quantity: string; salePrice: string; totalRevenue: string; notes: string; };
const EMPTY = { date: new Date().toISOString().split('T')[0], customer: '', peptide: '', quantity: '', salePrice: '', totalRevenue: '', notes: '' };

export default function SalesPage() {
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => { setLoading(true); const r = await fetch('/api/sales'); const d = await r.json(); setItems(d.sales || []); setLoading(false); };
  const calc = (qty: string, price: string) => { const t = parseFloat(qty || '0') * parseFloat(price || '0'); return isNaN(t) ? '0.00' : t.toFixed(2); };
  const save = async () => {
    setSaving(true);
    const item = { ...form, totalRevenue: calc(form.quantity, form.salePrice) };
    await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: editId ? 'update' : 'add', item, rowIndex: editId }) });
    await load(); setShowForm(false); setForm({ ...EMPTY }); setEditId(null); setSaving(false);
  };
  const totalRev = items.reduce((s, i) => s + parseFloat(i.totalRevenue || '0'), 0);

  return (
    <div style={{ background: '#131313', color: '#fff', minHeight: '100vh', padding: '28px', maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Sales</h1>
      <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px' }}>Track peptide sales and revenue</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {([['Total Revenue', '$' + totalRev.toFixed(2), '#10b981'], ['Total Sales', String(items.length), '#3b82f6'], ['Unique Customers', String([...new Set(items.map(i => i.customer).filter(Boolean))].length), '#8b5cf6']] as [string,string,string][]).map(([l, v, c]) => (
          <div key={l} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{l}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>{items.length} sales</span>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY }); }} style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Record Sale</button>
      </div>

      <div style={card}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Date', 'Customer', 'Peptide', 'Qty', 'Sale Price', 'Revenue', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: '32px', color: '#4b5563' }}>No sales yet.</td></tr>
              : items.map(s => (
                <tr key={s.id} onMouseOver={e => (e.currentTarget as HTMLTableRowElement).style.background = '#222'} onMouseOut={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                  <td style={td}>{s.date}</td>
                  <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{s.customer}</td>
                  <td style={td}>{s.peptide}</td>
                  <td style={td}>{s.quantity}</td>
                  <td style={td}>${parseFloat(s.salePrice || '0').toFixed(2)}</td>
                  <td style={{ ...td, color: '#10b981', fontWeight: 700 }}>${parseFloat(s.totalRevenue || '0').toFixed(2)}</td>
                  <td style={td}><button onClick={() => { setForm({ date: s.date, customer: s.customer, peptide: s.peptide, quantity: s.quantity, salePrice: s.salePrice, totalRevenue: s.totalRevenue, notes: s.notes }); setEditId(s.id); setShowForm(true); }} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: '6px', color: '#9ca3af', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>{editId ? 'Edit' : 'Record'} Sale</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {(['date', 'customer', 'peptide', 'quantity', 'salePrice'] as const).map(k => (
                <div key={k}>
                  <label style={lbl}>{k === 'salePrice' ? 'Sale Price ($)' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input type={k === 'date' ? 'date' : k === 'quantity' || k === 'salePrice' ? 'number' : 'text'} value={form[k]} style={inp}
                    onChange={e => { const upd = { ...form, [k]: e.target.value }; if (k === 'quantity' || k === 'salePrice') upd.totalRevenue = calc(k === 'quantity' ? e.target.value : form.quantity, k === 'salePrice' ? e.target.value : form.salePrice); setForm(upd); }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={lbl}>Total Revenue (auto)</label>
              <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '9px 12px', color: '#10b981', fontWeight: 700, fontSize: '15px' }}>${form.totalRevenue || '0.00'}</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Sale'}</button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setEditId(null); }} style={{ flex: 1, background: '#242424', color: '#9ca3af', border: '1px solid #333', borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// @ts-nocheck
'use client';
import React, { useState, useEffect, CSSProperties } from 'react';

const dark = { background: '#131313', color: '#fff', minHeight: '100vh', padding: '28px', maxWidth: '1100px' };
const card = { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' };
const th = { textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #2a2a2a', background: '#191919' };
const td = { padding: '12px 16px', fontSize: '13px', color: '#d1d5db', borderBottom: '1px solid #1a1a1a' };
const inp = { width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const label = { display: 'block', color: '#9ca3af', fontSize: '11px', fontWeight: 700, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' };

type Purchase = { id: string; date: string; supplier: string; peptide: string; quantity: string; unitCost: string; totalCost: string; batchNo: string; notes: string; };
const EMPTY = { date: new Date().toISOString().split('T')[0], supplier: '', peptide: '', quantity: '', unitCost: '', totalCost: '', batchNo: '', notes: '' };

export default function PurchasesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/purchases');
    const d = await r.json();
    setItems(d.purchases || []);
    setLoading(false);
  };
  const calc = (qty: string, cost: string) => {
    const t = parseFloat(qty || '0') * parseFloat(cost || '0');
    return isNaN(t) ? '0.00' : t.toFixed(2);
  };
  const save = async () => {
    setSaving(true);
    const item = { ...form, totalCost: calc(form.quantity, form.unitCost) };
    await fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: editId ? 'update' : 'add', item, rowIndex: editId }) });
    await load(); setShowForm(false); setForm({ ...EMPTY }); setEditId(null); setSaving(false);
  };
  const totalSpent = items.reduce((s, i) => s + parseFloat(i.totalCost || '0'), 0);

  return (
    <div style={dark}>
      <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Lab Purchases</h1>
      <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px' }}>Track all peptide purchases from suppliers</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {([['Total Spent', '$' + totalSpent.toFixed(2), '#c0394f'], ['Total Orders', String(items.length), '#3b82f6'], ['Unique Peptides', String([...new Set(items.map(i => i.peptide).filter(Boolean))].length), '#10b981']]).map(([l, v, c]) => (
          <div key={l} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{l}</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ color: '#9ca3af', fontSize: '13px' }}>{items.length} purchases</span>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY }); }} style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>+ Add Purchase</button>
      </div>

      <div style={card}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Date', 'Supplier', 'Peptide', 'Qty', 'Unit Cost', 'Total', 'Batch', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} style={{ ...td, textAlign: 'center', padding: '32px', color: '#4b5563' }}>No purchases yet. Add your first lab purchase.</td></tr>
              ) : items.map(p => (
                <tr key={p.id} onMouseOver={e => e.currentTarget.style.background = '#222'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>{p.date}</td>
                  <td style={td}>{p.supplier}</td>
                  <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{p.peptide}</td>
                  <td style={td}>{p.quantity}</td>
                  <td style={td}>${parseFloat(p.unitCost || '0').toFixed(2)}</td>
                  <td style={{ ...td, color: '#c0394f', fontWeight: 700 }}>${parseFloat(p.totalCost || '0').toFixed(2)}</td>
                  <td style={{ ...td, color: '#6b7280', fontSize: '11px' }}>{p.batchNo}</td>
                  <td style={td}>
                    <button onClick={() => { setForm({ date: p.date, supplier: p.supplier, peptide: p.peptide, quantity: p.quantity, unitCost: p.unitCost, totalCost: p.totalCost, batchNo: p.batchNo, notes: p.notes }); setEditId(p.id); setShowForm(true); }} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: '6px', color: '#9ca3af', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>{editId ? 'Edit' : 'Add'} Lab Purchase</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {(['date', 'supplier', 'peptide', 'batchNo', 'quantity', 'unitCost']).map(k => (
                <div key={k}>
                  <label style={label}>{k === 'unitCost' ? 'Unit Cost ($)' : k === 'batchNo' ? 'Batch #' : k.charAt(0).toUpperCase() + k.slice(1)}</label>
                  <input type={k === 'date' ? 'date' : k === 'quantity' || k === 'unitCost' ? 'number' : 'text'} value={form[k]} style={inp}
                    onChange={e => {
                      const upd = { ...form, [k]: e.target.value };
                      if (k === 'quantity' || k === 'unitCost') upd.totalCost = calc(k === 'quantity' ? e.target.value : form.quantity, k === 'unitCost' ? e.target.value : form.unitCost);
                      setForm(upd);
                    }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Total Cost (auto)</label>
              <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '9px 12px', color: '#c0394f', fontWeight: 700, fontSize: '15px' }}>${form.totalCost || '0.00'}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ ...inp, resize: 'none', height: '60px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={save} disabled={saving} style={{ flex: 1, background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Purchase'}</button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setEditId(null); }} style={{ flex: 1, background: '#242424', color: '#9ca3af', border: '1px solid #333', borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const th = { textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#161616', borderBottom: '1px solid #1f1f1f' };
const td = { padding: '12px 16px', fontSize: '13px', color: '#d1d5db', borderBottom: '1px solid #1f1f1f' };
const inp = { width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const lbl = { display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: 600, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' };

const ITEM_TYPES = ['Peptide', 'Needle', 'Syringe', 'Bag', 'Sterile Wipe', 'Vial', 'Supply', 'Equipment', 'Other'];

const TYPE_COLORS = {
  'Peptide':      { bg: 'rgba(123,28,46,0.15)',  color: '#f87171',  border: 'rgba(123,28,46,0.3)' },
  'Needle':       { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa',  border: 'rgba(59,130,246,0.25)' },
  'Syringe':      { bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc',  border: 'rgba(99,102,241,0.25)' },
  'Bag':          { bg: 'rgba(20,184,166,0.12)', color: '#5eead4',  border: 'rgba(20,184,166,0.25)' },
  'Sterile Wipe': { bg: 'rgba(16,185,129,0.12)', color: '#34d399',  border: 'rgba(16,185,129,0.25)' },
  'Vial':         { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24',  border: 'rgba(245,158,11,0.25)' },
  'Supply':       { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd',  border: 'rgba(139,92,246,0.25)' },
  'Equipment':    { bg: 'rgba(236,72,153,0.12)', color: '#f9a8d4',  border: 'rgba(236,72,153,0.25)' },
  'Other':        { bg: 'rgba(75,85,99,0.2)',    color: '#9ca3af',  border: 'rgba(75,85,99,0.3)' },
};

const TypeBadge = ({ type }) => {
  const c = TYPE_COLORS[type] || TYPE_COLORS['Other'];
  return <span style={{ background: c.bg, color: c.color, border: '1px solid ' + c.border, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>{type || '—'}</span>;
};

const EMPTY = { itemType: 'Peptide', name: '', quantity: '', unit: '', reorderLevel: '', notes: '' };

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editIndex, setEditIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/inventory').then(res => res.json());
      setItems(r.items || []);
    } catch {}
    setLoading(false);
  };

  const showToast = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(() => setToast(''), 3500); };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editIndex !== null ? 'update' : 'add', item: form, index: editIndex }),
      });
      const d = await res.json();
      if (d.error) { showToast('Error: ' + d.error, true); }
      else { showToast(editIndex !== null ? 'Item updated!' : 'Item added!', false); setShowForm(false); setForm({ ...EMPTY }); setEditIndex(null); await load(); }
    } catch (e) { showToast('Error: ' + String(e), true); }
    setSaving(false);
  };

  const del = async (index, name) => {
    if (!confirm('Delete "' + name + '"?')) return;
    await fetch('/api/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', index }) });
    await load();
  };

  const filtered = items.filter(item => {
    const matchType = filterType === 'All' || item.itemType === filterType;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.itemType.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const lowStock = items.filter(i => i.reorderLevel && Number(i.quantity) <= Number(i.reorderLevel));
  const typeCounts = items.reduce((acc, i) => { acc[i.itemType] = (acc[i.itemType]||0)+1; return acc; }, {});

  return (
    <div style={{ background: '#131313', minHeight: '100vh', padding: '28px', maxWidth: '1100px' }}>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: toastErr ? '#3a1a1a' : '#1a3a2a', border: '1px solid ' + (toastErr ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'), borderRadius: '10px', padding: '12px 20px', color: toastErr ? '#fca5a5' : '#34d399', fontSize: '13px', fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxWidth: '380px' }}>
          {toastErr ? '⚠️ ' : '✓ '}{toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Inventory</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{items.length} items{lowStock.length > 0 ? ` · ` : ''}{lowStock.length > 0 && <span style={{ color: '#f59e0b', fontWeight: 600 }}>{lowStock.length} low stock</span>}</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY }); setEditIndex(null); setShowForm(true); }} style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + Add Item
        </button>
      </div>

      {/* Type filter tabs */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {['All', ...ITEM_TYPES].map(type => {
          const count = type === 'All' ? items.length : (typeCounts[type] || 0);
          const active = filterType === type;
          const c = TYPE_COLORS[type];
          return (
            <button key={type} onClick={() => setFilterType(type)}
              style={{ background: active ? (c ? c.bg : 'rgba(123,28,46,0.2)') : '#1a1a1a', color: active ? (c ? c.color : '#f87171') : '#6b7280', border: '1px solid ' + (active ? (c ? c.border : 'rgba(123,28,46,0.35)') : '#2a2a2a'), borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: active ? 600 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {type}
              {count > 0 && <span style={{ background: active ? 'rgba(0,0,0,0.2)' : '#242424', borderRadius: '10px', padding: '0 6px', fontSize: '11px' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input type='text' placeholder='Search items...' value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inp, maxWidth: '320px' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '6px' }}>{items.length === 0 ? 'No inventory yet' : 'No items match'}</div>
            <div style={{ color: '#4b5563', fontSize: '13px' }}>{items.length === 0 ? 'Add your first item to get started.' : 'Try a different filter or search.'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Type', 'Name', 'Quantity', 'Unit', 'Reorder At', 'Notes', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const low = item.reorderLevel && Number(item.quantity) <= Number(item.reorderLevel);
                return (
                  <tr key={item.id} onMouseOver={e => e.currentTarget.style.background = '#1f1f1f'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}><TypeBadge type={item.itemType} /></td>
                    <td style={{ ...td, color: '#fff', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ ...td, color: low ? '#f59e0b' : '#d1d5db', fontWeight: low ? 700 : 400 }}>
                      {item.quantity} {low && <span style={{ fontSize: '11px', color: '#f59e0b' }}>⚠ Low</span>}
                    </td>
                    <td style={{ ...td, color: '#6b7280' }}>{item.unit}</td>
                    <td style={{ ...td, color: '#6b7280' }}>{item.reorderLevel || '—'}</td>
                    <td style={{ ...td, color: '#4b5563', fontSize: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notes || '—'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setForm({ itemType: item.itemType, name: item.name, quantity: item.quantity, unit: item.unit, reorderLevel: item.reorderLevel, notes: item.notes }); setEditIndex(item.id); setShowForm(true); }} style={{ background: '#242424', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#9ca3af', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => del(item.id, item.name)} style={{ background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#6b7280', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }} onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2a2a2a'; }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '18px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 32px 64px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 24px' }}>{editIndex !== null ? 'Edit Item' : 'Add Item'}</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Item Type</label>
              <select value={form.itemType} onChange={e => setForm(p => ({ ...p, itemType: e.target.value }))}
                style={{ ...inp, color: '#fff' }}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Name *</label>
              <input type='text' placeholder='e.g. BPC-157, 27g Needle' value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={lbl}>Quantity</label>
                <input type='number' placeholder='0' value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Unit</label>
                <input type='text' placeholder='vials, boxes, units' value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} style={inp} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Reorder Level <span style={{ color: '#374151', textTransform: 'none', letterSpacing: 0 }}>(alert when qty ≤ this)</span></label>
              <input type='number' placeholder='e.g. 10' value={form.reorderLevel} onChange={e => setForm(p => ({ ...p, reorderLevel: e.target.value }))} style={inp} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={lbl}>Notes</label>
              <input type='text' placeholder='Optional notes' value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} onKeyDown={e => e.key === 'Enter' && save()} style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={save} disabled={saving || !form.name.trim()} style={{ flex: 1, background: form.name.trim() && !saving ? '#7b1c2e' : '#2d0e18', color: form.name.trim() && !saving ? '#fff' : '#5a2030', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: form.name.trim() && !saving ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Saving...' : editIndex !== null ? 'Save Changes' : 'Add Item'}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setEditIndex(null); }} style={{ flex: 1, background: '#242424', color: '#9ca3af', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '13px', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const COLORS = ['#7b1c2e','#3b82f6','#10b981','#8b5cf6','#f59e0b','#ec4899','#14b8a6'];
const EMPTY = { name: '', description: '' };
const th = { textAlign: 'left', padding: '10px 18px', fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', background: '#161616', borderBottom: '1px solid #1f1f1f' };
const td = { padding: '13px 18px', fontSize: '13px', color: '#d1d5db', borderBottom: '1px solid #1f1f1f' };
const inp = { width: '100%', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const lbl = { display: 'block', color: '#6b7280', fontSize: '11px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' };

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [tr, ur] = await Promise.all([
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/admin-users').then(r => r.json()),
      ]);
      setTeams(tr.teams || []);
      setUsers(ur.users || []);
    } catch {}
    setLoading(false);
  };

  const saveTeam = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: editId ? 'update' : 'create', team: form, teamId: editId }),
    });
    setToast(editId ? 'Team updated!' : 'Team created!');
    setForm({ ...EMPTY }); setEditId(null); setShowForm(false);
    await load(); setSaving(false);
    setTimeout(() => setToast(''), 3000);
  };

  const deleteTeam = async (teamId, name) => {
    if (!confirm('Delete team "' + name + '"?')) return;
    await fetch('/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', teamId }) });
    await load();
  };

  const assignUser = async (email, teamId) => {
    await fetch('/api/admin-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign_team', email, teamId }) });
    await load();
  };

  const membersOf = (teamId) => users.filter(u => u.teamId === teamId);
  const unassigned = users.filter(u => !u.teamId && u.role !== 'owner');
  const getColor = (idx) => COLORS[idx % COLORS.length];

  return (
    <div style={{ background: '#131313', minHeight: '100vh', padding: '28px', maxWidth: '1000px' }}>

      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', background: '#1a3a2a', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 20px', color: '#34d399', fontSize: '13px', fontWeight: 600, zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Teams</h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Group users — each team sees only their own CRM, inventory, purchases and sales data</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY }); }}
          style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          + New Team
        </button>
      </div>

      <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>ℹ️</span>
        <div style={{ color: '#4b5563', fontSize: '13px', lineHeight: 1.6 }}>
          <strong style={{ color: '#93c5fd' }}>How it works:</strong> Admin and Viewer users only see data for their assigned team.
          The <strong style={{ color: '#9ca3af' }}>Owner</strong> (master PIN) sees all teams.
          Assign users below or from the <a href="/admin/users" style={{ color: '#c0394f', textDecoration: 'none' }}>Users page</a>.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[['Total Teams', String(teams.length), '#7b1c2e'], ['Assigned Users', String(users.filter(u => u.teamId).length), '#10b981'], ['Unassigned', String(unassigned.length), unassigned.length > 0 ? '#f59e0b' : '#4b5563']].map(([l, v, c]) => (
          <div key={l} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px 18px' }}>
            <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{l}</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#4b5563' }}>Loading...</div>
      ) : teams.length === 0 ? (
        <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>🏢</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>No teams yet</div>
          <div style={{ color: '#4b5563', fontSize: '13px', marginBottom: '22px' }}>Create your first team to scope data per user group.</div>
          <button onClick={() => { setShowForm(true); setForm({ ...EMPTY }); }} style={{ background: '#7b1c2e', color: '#fff', border: 'none', borderRadius: '9px', padding: '11px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            + Create First Team
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {teams.map((team, idx) => {
            const members = membersOf(team.teamId);
            const c = getColor(idx);
            const isOpen = expanded === team.teamId;
            return (
              <div key={team.teamId} style={{ background: '#1a1a1a', border: '1px solid ' + (isOpen ? c + '55' : '#2a2a2a'), borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: c + '20', border: '1px solid ' + c + '40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 800, color: c, flexShrink: 0 }}>
                    {team.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{team.name}</div>
                    {team.description && <div style={{ color: '#4b5563', fontSize: '12px', marginTop: '2px' }}>{team.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ background: c + '18', color: c, border: '1px solid ' + c + '30', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => setExpanded(isOpen ? null : team.teamId)} style={{ background: '#242424', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }}>
                      {isOpen ? '↑ Collapse' : '↓ Members'}
                    </button>
                    <button onClick={() => { setForm({ name: team.name, description: team.description || '' }); setEditId(team.teamId); setShowForm(true); }} style={{ background: '#242424', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => deleteTeam(team.teamId, team.name)} style={{ background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#6b7280', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }} onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2a2a2a'; }}>
                      Delete
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: '1px solid #1f1f1f', background: '#0f0f0f' }}>
                    {members.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>{['Member', 'Role', 'Email', 'Remove'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {members.map(u => (
                            <tr key={u.email} onMouseOver={e => e.currentTarget.style.background = '#1a1a1a'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={td}><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(123,28,46,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#f87171' }}>{(u.name || u.email).charAt(0).toUpperCase()}</div><span style={{ color: '#fff', fontWeight: 600 }}>{u.name || '—'}</span></div></td>
                              <td style={td}><span style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '2px 9px', fontSize: '11px', fontWeight: 600 }}>{u.role}</span></td>
                              <td style={{ ...td, color: '#4b5563', fontSize: '12px' }}>{u.email}</td>
                              <td style={td}><button onClick={() => assignUser(u.email, '')} style={{ background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#6b7280', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }} onMouseOut={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2a2a2a'; }}>Remove</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '20px', color: '#374151', fontSize: '13px' }}>No members yet.</div>
                    )}
                    {unassigned.length > 0 && (
                      <div style={{ padding: '12px 20px', borderTop: members.length > 0 ? '1px solid #1a1a1a' : 'none', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#4b5563', fontSize: '12px', fontWeight: 600 }}>Add user:</span>
                        {unassigned.map(u => (
                          <button key={u.email} onClick={() => assignUser(u.email, team.teamId)} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '7px', color: '#9ca3af', fontSize: '12px', padding: '5px 12px', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.borderColor = c + '55'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = c + '15'; }} onMouseOut={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = '#1e1e1e'; }}>
                            + {u.name || u.email}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '18px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, margin: '0 0 6px' }}>{editId ? 'Edit Team' : 'Create New Team'}</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 24px' }}>
              {editId ? "Update this team's details." : "Teams isolate data — users only see their team's records."}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={lbl}>Team Name *</label>
              <input type="text" placeholder="e.g. Sales Team" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && saveTeam()} style={inp} autoFocus />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={lbl}>Description (optional)</label>
              <input type="text" placeholder="What does this team handle?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={inp} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveTeam} disabled={saving || !form.name.trim()} style={{ flex: 1, background: form.name.trim() && !saving ? '#7b1c2e' : '#2d0e18', color: form.name.trim() && !saving ? '#fff' : '#5a2030', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: form.name.trim() && !saving ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Team'}
              </button>
              <button onClick={() => { setShowForm(false); setForm({ ...EMPTY }); setEditId(null); }} style={{ flex: 1, background: '#242424', color: '#9ca3af', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '13px', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
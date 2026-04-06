'use client';
import { useState, useEffect } from 'react';

type AdminUser = { email: string; name: string; role: string; addedDate: string; addedBy: string; };
type Invite = { email: string; role: string; sentDate: string; status: string; };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin-users');
      const d = await r.json();
      setUsers(d.users || []);
      setInvites(d.invites || []);
    } catch {}
    setLoading(false);
  };

  const sendInvite = async () => {
    if (!inviteForm.email) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', ...inviteForm })
      });
      const d = await r.json();
      if (d.success) {
        setToast('Invite sent to ' + inviteForm.email);
        setInviteForm({ email: '', name: '', role: 'admin' });
        setShowInvite(false);
        await load();
        setTimeout(() => setToast(''), 3000);
      }
    } catch {}
    setSaving(false);
  };

  const removeUser = async (email: string) => {
    if (!confirm('Remove ' + email + ' from admin?')) return;
    await fetch('/api/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove', email })
    });
    await load();
  };

  const revokeInvite = async (email: string) => {
    await fetch('/api/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke', email })
    });
    await load();
  };

  const roleBadge = (role: string) => {
    const colors: Record<string,string> = { owner: 'bg-purple-100 text-purple-700', admin: 'bg-green-100 text-green-700', viewer: 'bg-blue-100 text-blue-700' };
    return colors[role] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-8">
      {toast && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span>✓</span> {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
          <p className="text-slate-500 text-sm mt-1">Manage who has access to the admin portal</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          + Invite User
        </button>
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Active Users</h2>
          <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{users.length} users</span>
        </div>
        {loading ? <div className="py-12 text-center text-slate-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['Name','Email','Role','Added',''].map(h => <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No users yet. Invite your first admin above.</td></tr>
              ) : users.map(u => (
                <tr key={u.email} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{u.addedDate}</td>
                  <td className="px-6 py-4">
                    {u.role !== 'owner' && (
                      <button onClick={() => removeUser(u.email)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Pending Invites</h2>
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{invites.length} pending</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{['Email','Role','Sent','Status',''].map(h => <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invites.map(inv => (
                <tr key={inv.email} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">{inv.email}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(inv.role)}`}>{inv.role}</span></td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{inv.sentDate}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Pending</span></td>
                  <td className="px-6 py-4"><button onClick={() => revokeInvite(inv.email)} className="text-red-500 hover:text-red-700 text-xs font-medium">Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            { role: 'owner', color: 'text-purple-700 bg-purple-50', desc: 'Full access. Can manage all users, settings, and data.' },
            { role: 'admin', color: 'text-green-700 bg-green-50', desc: 'Can access CRM, inventory, calculator, and AI tools.' },
            { role: 'viewer', color: 'text-blue-700 bg-blue-50', desc: 'Read-only access to CRM and inventory data.' },
          ].map(r => (
            <div key={r.role} className="bg-white rounded-lg border border-slate-200 p-4">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${r.color}`}>{r.role}</span>
              <p className="text-slate-500 text-xs leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Invite Admin User</h2>
            <p className="text-slate-400 text-sm mb-6">They'll receive an email with login instructions.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Email Address *</label>
                <input type="email" placeholder="name@example.com" value={inviteForm.email}
                  onChange={e => setInviteForm(p => ({...p, email: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Full Name</label>
                <input type="text" placeholder="Jane Smith" value={inviteForm.name}
                  onChange={e => setInviteForm(p => ({...p, name: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1.5">Role</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(p => ({...p, role: e.target.value}))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                  <option value="admin">Admin — Full portal access</option>
                  <option value="viewer">Viewer — Read-only access</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={sendInvite} disabled={saving || !inviteForm.email}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold">
                {saving ? 'Sending...' : 'Send Invite'}
              </button>
              <button onClick={() => { setShowInvite(false); setInviteForm({ email: '', name: '', role: 'admin' }); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
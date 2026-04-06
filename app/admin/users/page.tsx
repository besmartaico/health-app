// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
const td = { padding:'14px 18px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f' };
const th = { textAlign:'left', padding:'10px 18px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 12px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.07em' };
const ROLES = { owner:{label:'Owner',bg:'rgba(139,92,246,0.15)',color:'#a78bfa',border:'rgba(139,92,246,0.3)'}, admin:{label:'Admin',bg:'rgba(16,185,129,0.12)',color:'#34d399',border:'rgba(16,185,129,0.25)'}, viewer:{label:'Viewer',bg:'rgba(59,130,246,0.12)',color:'#60a5fa',border:'rgba(59,130,246,0.25)'} };
const RoleBadge = ({ role }) => { const r=ROLES[role]||ROLES.viewer; return <span style={{background:r.bg,color:r.color,border:'1px solid '+r.border,borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:600}}>{r.label}</span>; }
export default function UsersPage() {
  const [users,setUsers]=useState([]); const [invites,setInvites]=useState([]); const [teams,setTeams]=useState([]);
  const [loading,setLoading]=useState(true); const [showInvite,setShowInvite]=useState(false);
  const [form,setForm]=useState({email:'',name:'',role:'admin',teamId:''}); const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(''); const [activeTab,setActiveTab]=useState('users');
  useEffect(()=>{ load(); },[]);
  const load = async () => {
    setLoading(true);
    try {
      const [ur,tr] = await Promise.all([fetch('/api/admin-users').then(r=>r.json()), fetch('/api/teams').then(r=>r.json())]);
      setUsers(ur.users||[]); setInvites((ur.invites||[]).filter(i=>i.status!=='revoked')); setTeams(tr.teams||[]);
    } catch {}
    setLoading(false);
  };
  const sendInvite = async () => {
    if (!form.email) return; setSaving(true);
    try {
      await fetch('/api/admin-users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'invite',...form})});
      setToast('Invite sent to '+form.email); setForm({email:'',name:'',role:'admin',teamId:''}); setShowInvite(false); await load(); setTimeout(()=>setToast(''),3000);
    } catch {}
    setSaving(false);
  };
  const removeUser = async (email) => { if (!confirm('Remove '+email+'?')) return; await fetch('/api/admin-users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'remove',email})}); await load(); };
  const revokeInvite = async (email) => { await fetch('/api/admin-users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'revoke',email})}); await load(); };
  const updateTeam = async (email, teamId) => { await fetch('/api/admin-users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'assign_team',email,teamId})}); await load(); };
  const teamName = (id) => teams.find(t=>t.teamId===id)?.name||null;
  const countByRole = (role) => users.filter(u=>u.role===role).length;
  return (
    <div style={{ background:'#131313', minHeight:'100vh', padding:'28px', maxWidth:'1000px' }}>
      {toast && <div style={{position:'fixed',top:'24px',right:'24px',background:'#1a3a2a',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'12px 20px',color:'#34d399',fontSize:'13px',fontWeight:600,zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>✓ {toast}</div>}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'28px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Admin Users</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Manage access and team assignments — users only see their team's data</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <a href="/admin/teams" style={{background:'#1e1e1e',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'10px 16px',fontSize:'13px',fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center',gap:'6px'}}>🏢 Manage Teams</a>
          <button onClick={()=>setShowInvite(true)} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Invite User</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'28px'}}>
        {[['owner','Owner','Sees all teams'],['admin','Admin','Team-scoped access'],['viewer','Viewer','Read-only, team-scoped']].map(([role,label,desc])=>(
          <div key={role} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px 18px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}><RoleBadge role={role} /><span style={{color:'#4b5563',fontSize:'12px'}}>{countByRole(role)}</span></div>
            <p style={{color:'#374151',fontSize:'12px',margin:0}}>{desc}</p>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'4px',marginBottom:'20px',width:'fit-content'}}>
        {[['users','Active Users',users.length],['invites','Pending Invites',invites.length]].map(([tab,label,count])=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{background:activeTab===tab?'#0f0f0f':'transparent',color:activeTab===tab?'#fff':'#6b7280',border:activeTab===tab?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'7px',padding:'7px 16px',fontSize:'13px',fontWeight:activeTab===tab?600:400,cursor:'pointer',display:'flex',alignItems:'center',gap:'7px'}}>
            {label}<span style={{background:activeTab===tab?'#7b1c2e':'#222',color:activeTab===tab?'#fff':'#4b5563',borderRadius:'20px',padding:'1px 7px',fontSize:'11px',fontWeight:700}}>{count}</span>
          </button>
        ))}
      </div>
      {activeTab==='users' && (
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
          {loading ? <div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
          : users.length===0 ? (
            <div style={{padding:'48px',textAlign:'center'}}>
              <div style={{fontSize:'32px',marginBottom:'12px'}}>👥</div>
              <div style={{color:'#fff',fontWeight:600,marginBottom:'6px'}}>No users yet</div>
              <div style={{color:'#4b5563',fontSize:'13px'}}>Invite your first admin user to get started.</div>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['User','Role','Team','Added',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.email} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={td}><div style={{display:'flex',alignItems:'center',gap:'12px'}}><div style={{width:'36px',height:'36px',borderRadius:'50%',background:u.role==='owner'?'rgba(139,92,246,0.2)':'rgba(123,28,46,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:700,color:u.role==='owner'?'#a78bfa':'#f87171',flexShrink:0}}>{(u.name||u.email).charAt(0).toUpperCase()}</div><div><div style={{color:'#fff',fontWeight:600,fontSize:'14px'}}>{u.name||'—'}</div><div style={{color:'#4b5563',fontSize:'12px'}}>{u.email}</div></div></div></td>
                    <td style={td}><RoleBadge role={u.role} /></td>
                    <td style={td}>
                      {u.role==='owner' ? <span style={{color:'#374151',fontSize:'12px',fontStyle:'italic'}}>All teams</span>
                      : teams.length===0 ? <a href="/admin/teams" style={{color:'#c0394f',fontSize:'12px',textDecoration:'none'}}>Create teams →</a>
                      : <select value={u.teamId||''} onChange={e=>updateTeam(u.email,e.target.value)} style={{background:u.teamId?'#1e1e1e':'#0f0f0f',border:'1px solid '+(u.teamId?'#3a3a3a':'#2a2a2a'),borderRadius:'7px',color:u.teamId?'#fff':'#6b7280',fontSize:'12px',padding:'5px 10px',cursor:'pointer',outline:'none',minWidth:'130px'}}>
                          <option value="">— No team —</option>
                          {teams.map(t=><option key={t.teamId} value={t.teamId}>{t.name}</option>)}
                        </select>}
                    </td>
                    <td style={{...td,color:'#4b5563',fontSize:'12px'}}>{u.addedDate||'—'}</td>
                    <td style={td}>{u.role!=='owner'&&<button onClick={()=>removeUser(u.email)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'7px',color:'#6b7280',fontSize:'12px',padding:'5px 12px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,0.4)';e.currentTarget.style.color='#f87171';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#2a2a2a';e.currentTarget.style.color='#6b7280';}}>Remove</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab==='invites' && (
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
          {invites.length===0 ? <div style={{padding:'48px',textAlign:'center'}}><div style={{fontSize:'32px',marginBottom:'12px'}}>📬</div><div style={{color:'#fff',fontWeight:600}}>No pending invites</div></div>
          : <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Email','Role','Team','Sent','Status',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {invites.map(inv=>(
                  <tr key={inv.email} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{...td,color:'#fff'}}>{inv.email}</td>
                    <td style={td}><RoleBadge role={inv.role} /></td>
                    <td style={{...td,color:'#6b7280',fontSize:'12px'}}>{teamName(inv.teamId)||'—'}</td>
                    <td style={{...td,color:'#4b5563',fontSize:'12px'}}>{inv.sentDate}</td>
                    <td style={td}><span style={{background:'rgba(245,158,11,0.12)',color:'#fbbf24',border:'1px solid rgba(245,158,11,0.25)',borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:600}}>Pending</span></td>
                    <td style={td}><button onClick={()=>revokeInvite(inv.email)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'7px',color:'#6b7280',fontSize:'12px',padding:'5px 12px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(239,68,68,0.4)';e.currentTarget.style.color='#f87171';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#2a2a2a';e.currentTarget.style.color='#6b7280';}}>Revoke</button></td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      )}
      {showInvite && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'440px',boxShadow:'0 32px 64px rgba(0,0,0,0.6)'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 6px'}}>Invite User</h2>
            <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 24px'}}>Add someone to the admin portal with team-scoped access.</p>
            <div style={{marginBottom:'16px'}}>
              <label style={lbl}>Email Address *</label>
              <input type="email" placeholder="name@example.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inp} autoFocus />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={lbl}>Full Name</label>
              <input type="text" placeholder="Jane Smith" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} />
            </div>
            <div style={{marginBottom:'16px'}}>
              <label style={lbl}>Role</label>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {[['admin','Admin','Full portal access — CRM, inventory, purchases, sales'],['viewer','Viewer','Read-only access to their team's data']].map(([val,label,desc])=>(
                  <label key={val} style={{display:'flex',alignItems:'center',gap:'12px',background:form.role===val?'rgba(123,28,46,0.15)':'#0f0f0f',border:'1px solid '+(form.role===val?'rgba(123,28,46,0.4)':'#2a2a2a'),borderRadius:'10px',padding:'10px 14px',cursor:'pointer'}}>
                    <input type="radio" name="role" value={val} checked={form.role===val} onChange={()=>setForm(p=>({...p,role:val}))} style={{accentColor:'#7b1c2e'}} />
                    <div><div style={{color:'#fff',fontSize:'13px',fontWeight:600}}>{label}</div><div style={{color:'#4b5563',fontSize:'12px'}}>{desc}</div></div>
                  </label>
                ))}
              </div>
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={lbl}>Assign to Team</label>
              {teams.length===0 ? (
                <div style={{background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 12px',color:'#4b5563',fontSize:'13px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span>No teams yet</span>
                  <a href="/admin/teams" onClick={()=>setShowInvite(false)} style={{color:'#c0394f',fontSize:'12px',textDecoration:'none',fontWeight:600}}>Create a team →</a>
                </div>
              ) : (
                <select value={form.teamId} onChange={e=>setForm(p=>({...p,teamId:e.target.value}))} style={{...inp,color:form.teamId?'#fff':'#6b7280'}}>
                  <option value="">No team (assign later)</option>
                  {teams.map(t=><option key={t.teamId} value={t.teamId}>{t.name}</option>)}
                </select>
              )}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={sendInvite} disabled={saving||!form.email} style={{flex:1,background:form.email&&!saving?'#7b1c2e':'#2d0e18',color:form.email&&!saving?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:form.email&&!saving?'pointer':'not-allowed'}}>{saving?'Sending...':'Send Invite'}</button>
              <button onClick={()=>{ setShowInvite(false); setForm({email:'',name:'',role:'admin',teamId:''}); }} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [linkModal, setLinkModal] = useState(null); // { email, url }
  const [copyLabel, setCopyLabel] = useState('Copy Link');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin-users').then(x=>x.json()); setUsers(r.users||[]); setInvites(r.invites||[]); } catch {}
    setLoading(false);
  };

  const showT = (msg, err) => { setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),4000); };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const r = await fetch('/api/admin-users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'invite', email:inviteEmail, name:inviteName, role:inviteRole }) }).then(x=>x.json());
      if (r.error) showT('Error: '+r.error, true);
      else {
        showT('Invite sent to '+inviteEmail, false);
        setShowInvite(false); setInviteEmail(''); setInviteName('');
        // Show the link immediately in case email fails
        setLinkModal({ email: inviteEmail, url: r.signupUrl });
        await load();
      }
    } catch(e) { showT('Error: '+String(e), true); }
    setInviting(false);
  };

  const getSignupLink = async (email) => {
    try {
      const r = await fetch('/api/admin-users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'get_signup_link', email }) }).then(x=>x.json());
      if (r.signupUrl) setLinkModal({ email, url: r.signupUrl });
      else showT('Could not get link: '+(r.error||'Unknown error'), true);
    } catch(e) { showT(String(e), true); }
  };

  const copyLink = async (url) => {
    try { await navigator.clipboard.writeText(url); setCopyLabel('Copied!'); setTimeout(()=>setCopyLabel('Copy Link'),2500); }
    catch { setCopyLabel('Copy failed'); }
  };

  const removeInvite = async (rowIndex, email) => {
    if (!confirm('Remove pending invite for '+email+'?')) return;
    await fetch('/api/admin-users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'remove_invite', rowIndex }) });
    await load();
  };

  const th = { textAlign:'left', padding:'11px 16px', fontSize:'11px', fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', background:'#161616', borderBottom:'1px solid #1f1f1f' };
  const td = { padding:'11px 16px', fontSize:'13px', color:'#d1d5db', borderBottom:'1px solid #1f1f1f', verticalAlign:'middle' };

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'900px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* Signup link modal */}
      {linkModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'520px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
            <h2 style={{color:'#fff',fontSize:'18px',fontWeight:800,margin:'0 0 8px'}}>Signup Link</h2>
            <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 20px'}}>Share this link with <strong style={{color:'#9ca3af'}}>{linkModal.email}</strong> to bypass email and sign up directly.</p>
            <div style={{background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'12px 14px',fontSize:'13px',color:'#a78bfa',wordBreak:'break-all',marginBottom:'16px',fontFamily:'monospace'}}>
              {linkModal.url}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>copyLink(linkModal.url)} style={{flex:1,background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>{copyLabel}</button>
              <button onClick={()=>{setLinkModal(null);setCopyLabel('Copy Link');}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'12px',fontSize:'14px',cursor:'pointer'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Users</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>{users.length} active · {invites.filter(i=>i.status==='pending').length} pending</p>
        </div>
        <button onClick={()=>setShowInvite(true)} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Invite User</button>
      </div>

      {/* Active users */}
      {users.length>0&&(
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden',marginBottom:'20px'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #1f1f1f'}}><h3 style={{color:'#9ca3af',fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Active Users</h3></div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Name','Email','Role','Added'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {users.map((u,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600}}>{u.name||'—'}</td>
                  <td style={{...td,color:'#9ca3af'}}>{u.email}</td>
                  <td style={td}><span style={{background:'rgba(26,79,168,0.15)',border:'1px solid rgba(26,79,168,0.3)',borderRadius:'20px',padding:'2px 8px',color:'#f9a8d4',fontSize:'11px',fontWeight:600}}>{u.role||'user'}</span></td>
                  <td style={{...td,color:'#6b7280'}}>{u.addedDate||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending invites */}
      {invites.length>0&&(
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #1f1f1f'}}><h3 style={{color:'#9ca3af',fontSize:'12px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Pending Invitations</h3></div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Name','Email','Sent','Status',''].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {invites.map((inv,i)=>(
                <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...td,color:'#fff',fontWeight:600}}>{inv.name||'—'}</td>
                  <td style={{...td,color:'#9ca3af'}}>{inv.email}</td>
                  <td style={{...td,color:'#6b7280'}}>{inv.sentDate||'—'}</td>
                  <td style={td}>
                    <span style={{background:inv.status==='pending'?'rgba(251,191,36,0.1)':'rgba(16,185,129,0.1)',border:'1px solid '+(inv.status==='pending'?'rgba(251,191,36,0.25)':'rgba(16,185,129,0.25)'),borderRadius:'20px',padding:'2px 8px',color:inv.status==='pending'?'#fbbf24':'#34d399',fontSize:'11px',fontWeight:600}}>{inv.status}</span>
                  </td>
                  <td style={td}>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button onClick={()=>getSignupLink(inv.email)} style={{background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:'6px',color:'#a78bfa',fontSize:'11px',padding:'5px 10px',cursor:'pointer',fontWeight:600}} title='Get direct signup link — bypass email'>🔗 Get Link</button>
                      <button onClick={()=>removeInvite(inv.rowIndex,inv.email)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'6px',color:'#6b7280',fontSize:'11px',padding:'5px 10px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading&&<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>}
      {!loading&&users.length===0&&invites.length===0&&(
        <div style={{padding:'60px',textAlign:'center',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
          <div style={{fontSize:'40px',marginBottom:'14px'}}>👤</div>
          <div style={{color:'#fff',fontWeight:700,marginBottom:'6px'}}>No users yet</div>
          <div style={{color:'#4b5563',fontSize:'13px'}}>Invite someone to get started</div>
        </div>
      )}

      {/* Invite modal */}
      {showInvite&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'440px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 20px'}}>Invite User</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'20px'}}>
              <div><label style={lbl}>Name</label><input type='text' placeholder='Their name' value={inviteName} onChange={e=>setInviteName(e.target.value)} style={inp} autoFocus /></div>
              <div><label style={lbl}>Email *</label><input type='email' placeholder='their@email.com' value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Role</label><select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} style={{...inp,color:'#fff'}}><option value='user'>User</option><option value='admin'>Admin</option></select></div>
            </div>
            <p style={{color:'#4b5563',fontSize:'12px',margin:'0 0 16px',lineHeight:1.5}}>An invite email will be sent. You'll also see the direct signup link immediately after, in case the email doesn't arrive.</p>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={sendInvite} disabled={inviting||!inviteEmail} style={{flex:1,background:inviteEmail&&!inviting?'#1a4fa8':'#0d2d6b',color:inviteEmail&&!inviting?'#fff':'#1a3a7a',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:inviteEmail&&!inviting?'pointer':'not-allowed'}}>{inviting?'Sending...':'Send Invite'}</button>
              <button onClick={()=>{setShowInvite(false);setInviteEmail('');setInviteName('');}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
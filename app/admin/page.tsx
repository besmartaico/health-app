// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href:'/admin/crm', label:'Customers', icon:'👥', color:'rgba(59,130,246,0.15)', border:'rgba(59,130,246,0.25)' },
  { href:'/admin/sales', label:'Sales', icon:'💰', color:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.25)' },
  { href:'/admin/inventory', label:'Inventory', icon:'📦', color:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.25)' },
  { href:'/admin/purchases', label:'Purchases', icon:'🛒', color:'rgba(139,92,246,0.15)', border:'rgba(139,92,246,0.25)' },
  { href:'/admin/profitability', label:'Profit', icon:'📈', color:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.25)' },
  { href:'/admin/calculator', label:'Calculator', icon:'🧮', color:'rgba(236,72,153,0.15)', border:'rgba(236,72,153,0.25)' },
  { href:'/admin/instructions', label:'Instructions', icon:'📋', color:'rgba(20,184,166,0.15)', border:'rgba(20,184,166,0.25)' },
  { href:'/admin/peptide-ai', label:'Peptide AI', icon:'🤖', color:'rgba(99,102,241,0.15)', border:'rgba(99,102,241,0.25)' },
  { href:'/admin/coa', label:'COAs', icon:'🔬', color:'rgba(16,185,129,0.15)', border:'rgba(16,185,129,0.25)' },
  { href:'/admin/teams', label:'Teams', icon:'🏢', color:'rgba(245,158,11,0.15)', border:'rgba(245,158,11,0.25)' },
  { href:'/admin/users', label:'Users', icon:'👤', color:'rgba(239,68,68,0.15)', border:'rgba(239,68,68,0.25)' },
  { href:'/api/sso', label:'Documents', icon:'📝', color:'rgba(107,114,128,0.15)', border:'rgba(107,114,128,0.25)' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ customers:0, sales:0, revenue:0, inventory:0 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/crm').then(r=>r.json()).catch(()=>({customers:[]})),
      fetch('/api/sales').then(r=>r.json()).catch(()=>({sales:[]})),
      fetch('/api/inventory').then(r=>r.json()).catch(()=>({items:[]})),
      fetch('/api/alerts').then(r=>r.json()).catch(()=>({alerts:[]})),
    ]).then(([c,s,inv,al]) => {
      const revenue = (s.sales||[]).reduce((sum,sale)=>sum+(parseFloat(sale.total)||0),0);
      setStats({ customers:(c.customers||[]).length, sales:(s.sales||[]).length, revenue, inventory:(inv.items||[]).length });
      setAlerts(al.alerts||[]);
    });
  }, []);

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'20px'}} className='page-pad'>
      <div style={{marginBottom:'20px'}}>
        <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 2px'}}>Dashboard</h1>
        <p style={{color:'#4b5563',fontSize:'13px',margin:0}}>BeSmart Health Admin</p>
      </div>

      {/* Alerts panel — only shown when there are upcoming refills or follow-ups */}
      {alerts.length>0&&(
        <div style={{background:'rgba(251,191,36,0.06)',border:'1px solid rgba(251,191,36,0.25)',borderRadius:'14px',padding:'16px',marginBottom:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
            <span style={{fontSize:'18px'}}>🔔</span>
            <h3 style={{color:'#fbbf24',fontSize:'14px',fontWeight:700,margin:0}}>This Week — {alerts.length} action{alerts.length!==1?'s':''} needed</h3>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
            {alerts.map((a,i)=>(
              <div key={i} style={{background:'rgba(0,0,0,0.2)',borderRadius:'8px',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{fontSize:'16px'}}>{a.type==='refill'?'💉':'📞'}</span>
                  <div>
                    <div style={{color:'#fff',fontWeight:600,fontSize:'13px'}}>{a.customer}</div>
                    <div style={{color:'#9ca3af',fontSize:'11px'}}>{a.type==='refill'?'Refill due':'Follow-up scheduled'}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:a.urgent?'#f87171':'#fbbf24',fontWeight:700,fontSize:'13px'}}>{a.type==='refill'?a.nextRefillDate:a.followUpDate}</div>
                  <div style={{color:a.urgent?'#f87171':'#6b7280',fontSize:'11px'}}>{a.daysUntil===0?'Today':a.daysUntil===1?'Tomorrow':a.daysUntil<0?`${Math.abs(a.daysUntil)}d overdue`:`in ${a.daysUntil}d`}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'10px',marginBottom:'24px'}}>
        {[
          {label:'Customers',value:stats.customers,icon:'👥',color:'#60a5fa'},
          {label:'Sales',value:stats.sales,icon:'💰',color:'#34d399'},
          {label:'Revenue',value:'$'+stats.revenue.toLocaleString('en-US',{minimumFractionDigits:0}),icon:'📈',color:'#34d399'},
          {label:'Products',value:stats.inventory,icon:'📦',color:'#fbbf24'},
        ].map(s=>(
          <div key={s.label} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px 14px'}}>
            <div style={{fontSize:'22px',marginBottom:'6px'}}>{s.icon}</div>
            <div style={{color:s.color,fontSize:'22px',fontWeight:800,letterSpacing:'-0.5px'}}>{s.value}</div>
            <div style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginTop:'2px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Nav grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'10px'}}>
        {NAV_ITEMS.map(item=>(
          <a key={item.href} href={item.href} style={{background:item.color,border:'1px solid '+item.border,borderRadius:'14px',padding:'18px 12px',textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',textAlign:'center',minHeight:'90px'}}>
            <span style={{fontSize:'26px'}}>{item.icon}</span>
            <span style={{color:'#e5e7eb',fontSize:'13px',fontWeight:600,lineHeight:1.2}}>{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
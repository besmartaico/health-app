'use client';
import { useState, useEffect } from 'react';
export default function ProfitPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([fetch('/api/purchases').then(r=>r.json()), fetch('/api/sales').then(r=>r.json())])
      .then(([p,s]) => { setPurchases(p.purchases||[]); setSales(s.sales||[]); setLoading(false); });
  }, []);
  const totalCost = purchases.reduce((s,i)=>s+parseFloat(i.totalCost||'0'),0);
  const totalRev = sales.reduce((s,i)=>s+parseFloat(i.totalRevenue||'0'),0);
  const profit = totalRev - totalCost;
  const margin = totalRev > 0 ? ((profit/totalRev)*100) : 0;
  const inBlack = profit >= 0;
  const peptides = [...new Set([...purchases.map(p=>p.peptide), ...sales.map(s=>s.peptide)].filter(Boolean))];
  const byPeptide = peptides.map(name => {
    const cost = purchases.filter(p=>p.peptide===name).reduce((s,p)=>s+parseFloat(p.totalCost||'0'),0);
    const rev = sales.filter(s=>s.peptide===name).reduce((s,p)=>s+parseFloat(p.totalRevenue||'0'),0);
    return { name, cost, rev, profit: rev-cost };
  }).sort((a,b)=>b.profit-a.profit);
  const S = { page:{padding:'28px',maxWidth:'1100px'}, h1:{fontSize:'22px',fontWeight:'800',color:'#fff',margin:'0 0 4px'}, sub:{color:'#6b7280',fontSize:'13px',margin:'0 0 24px'}, card:{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'12px',overflow:'hidden'}, th:{textAlign:'left' as const,padding:'10px 16px',fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase' as const,letterSpacing:'0.08em',borderBottom:'1px solid #2a2a2a',background:'#191919'}, td:{padding:'12px 16px',fontSize:'13px',color:'#d1d5db',borderBottom:'1px solid #1a1a1a'} };
  if (loading) return <div style={{padding:'40px',color:'#6b7280'}}>Loading...</div>;
  return (
    <div style={S.page}>
      <h1 style={S.h1}>Profitability</h1>
      <p style={S.sub}>Track your costs, revenue, and overall profit/loss</p>

      {/* Big P&L banner */}
      <div style={{background: inBlack ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: '1px solid ' + (inBlack ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'), borderRadius:'16px', padding:'28px', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:'13px', color: inBlack ? '#6ee7b7' : '#fca5a5', fontWeight:'600', textTransform:'uppercase' as const, letterSpacing:'0.1em', marginBottom:'8px'}}>
            {inBlack ? '✅ IN THE BLACK' : '🔴 IN THE RED'}
          </div>
          <div style={{fontSize:'48px', fontWeight:'900', color: inBlack ? '#10b981' : '#ef4444', letterSpacing:'-2px'}}>
            {inBlack ? '+' : ''}${profit.toFixed(2)}
          </div>
          <div style={{fontSize:'13px', color:'#6b7280', marginTop:'6px'}}>Net Profit / Loss</div>
        </div>
        <div style={{textAlign:'right' as const}}>
          <div style={{fontSize:'13px', color:'#6b7280', marginBottom:'4px'}}>Profit Margin</div>
          <div style={{fontSize:'32px', fontWeight:'800', color: inBlack ? '#10b981' : '#ef4444'}}>{margin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px'}}>
        {[['Total Spent (Purchases)', '$'+totalCost.toFixed(2), '#c0394f'], ['Total Revenue (Sales)', '$'+totalRev.toFixed(2), '#10b981'], ['Net Profit', (inBlack?'+':'')+'$'+profit.toFixed(2), inBlack?'#10b981':'#ef4444']].map(([l,v,c])=>(
          <div key={String(l)} style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'18px'}}>
            <div style={{fontSize:'11px',color:'#6b7280',textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:'6px'}}>{l}</div>
            <div style={{fontSize:'26px',fontWeight:'800',color:String(c)}}>{v}</div>
          </div>
        ))}
      </div>

      {/* Per-peptide breakdown */}
      <h2 style={{fontSize:'15px',fontWeight:'700',color:'#9ca3af',textTransform:'uppercase' as const,letterSpacing:'0.08em',margin:'0 0 12px'}}>By Peptide</h2>
      <div style={S.card}>
        {byPeptide.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:'#4b5563'}}>No data yet. Add purchases and sales to see profitability by peptide.</div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Peptide','Total Cost','Total Revenue','Profit / Loss','Margin','Status'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>{byPeptide.map(p => {
              const pb = p.profit >= 0;
              const pm = p.rev > 0 ? ((p.profit/p.rev)*100) : 0;
              const barW = Math.min(100, Math.abs(pm));
              return (
                <tr key={p.name} onMouseOver={e=>(e.currentTarget as HTMLTableRowElement).style.background='#222'} onMouseOut={e=>(e.currentTarget as HTMLTableRowElement).style.background='transparent'}>
                  <td style={{...S.td,color:'#fff',fontWeight:'600'}}>{p.name}</td>
                  <td style={{...S.td,color:'#c0394f'}}>${p.cost.toFixed(2)}</td>
                  <td style={{...S.td,color:'#10b981'}}>${p.rev.toFixed(2)}</td>
                  <td style={{...S.td,color:pb?'#10b981':'#ef4444',fontWeight:'700'}}>{pb?'+':''}${p.profit.toFixed(2)}</td>
                  <td style={S.td}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'60px',height:'6px',background:'#2a2a2a',borderRadius:'3px',overflow:'hidden'}}>
                        <div style={{width:barW+'%',height:'100%',background:pb?'#10b981':'#ef4444',borderRadius:'3px'}}></div>
                      </div>
                      <span style={{fontSize:'12px',color:'#9ca3af'}}>{pm.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td style={S.td}><span style={{background:pb?'rgba(16,185,129,0.1)':'rgba(239,68,68,0.1)',color:pb?'#6ee7b7':'#fca5a5',border:'1px solid '+(pb?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'),borderRadius:'20px',padding:'3px 10px',fontSize:'11px',fontWeight:'600'}}>{pb?'✓ Profitable':'✗ At a loss'}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
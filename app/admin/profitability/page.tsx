// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits:2 });
const pct = (a, b) => b === 0 ? '0%' : (a/b*100).toFixed(1)+'%';

export default function ProfitabilityPage() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/sales').then(r=>r.json()),
      fetch('/api/purchases').then(r=>r.json()),
    ]).then(([s, p]) => {
      setSales(s.sales || []);
      setPurchases(p.purchases || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Revenue: sum s.total for every sale
  const totalRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);

  // Cost: sum p.totalCost for every purchase
  const totalCost = purchases.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);

  const grossProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100).toFixed(1) : '0.0';
  const profitable = grossProfit >= 0;

  const stat = (label, value, color, sub) => (
    <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'20px 24px'}}>
      <div style={{color:'#6b7280',fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'8px'}}>{label}</div>
      <div style={{color:color||'#fff',fontSize:'28px',fontWeight:800,letterSpacing:'-0.5px'}}>{value}</div>
      {sub&&<div style={{color:'#4b5563',fontSize:'12px',marginTop:'4px'}}>{sub}</div>}
    </div>
  );

  // Monthly breakdown
  const monthlyMap = {};
  for (const s of sales) {
    const mo = (s.date||'').substring(0,7);
    if (!mo) continue;
    if (!monthlyMap[mo]) monthlyMap[mo] = { revenue:0, sales:0 };
    monthlyMap[mo].revenue += parseFloat(s.total)||0;
    monthlyMap[mo].sales++;
  }
  for (const p of purchases) {
    const mo = (p.date||'').substring(0,7);
    if (!mo) continue;
    if (!monthlyMap[mo]) monthlyMap[mo] = { revenue:0, sales:0 };
    monthlyMap[mo].cost = (monthlyMap[mo].cost||0) + (parseFloat(p.totalCost)||0);
  }
  const months = Object.keys(monthlyMap).sort().reverse();

  // Per-product revenue
  const productMap = {};
  for (const s of sales) {
    try {
      const lines = JSON.parse(s.lines||'[]');
      for (const l of lines) {
        if (!l.product || !parseFloat(l.total)) continue;
        if (!productMap[l.product]) productMap[l.product] = 0;
        productMap[l.product] += parseFloat(l.total)||0;
      }
    } catch {}
  }
  const topProducts = Object.entries(productMap).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return (
    <div className='page-pad' style={{background:'#131313',minHeight:'100vh',padding:'20px',maxWidth:'1000px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Profitability</h1>
        <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Track costs, revenue, and profit/loss</p>
      </div>

      {loading ? <div style={{color:'#4b5563',padding:'60px',textAlign:'center'}}>Loading...</div> : (<>

      {/* Summary banner */}
      <div style={{background:profitable?'rgba(16,185,129,0.06)':'rgba(239,68,68,0.06)',border:'1px solid '+(profitable?'rgba(16,185,129,0.2)':'rgba(239,68,68,0.2)'),borderRadius:'16px',padding:'24px 28px',marginBottom:'24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <div style={{color:'#6b7280',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'6px'}}>Overall P&amp;L</div>
          <div style={{color:profitable?'#34d399':'#f87171',fontSize:'36px',fontWeight:800,letterSpacing:'-1px'}}>{fmt(grossProfit)}</div>
          <div style={{color:'#6b7280',fontSize:'13px',marginTop:'4px'}}>{profitable?'▲ Profitable':'▼ At a loss'} &nbsp;·&nbsp; {margin}% margin</div>
        </div>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',marginBottom:'4px'}}>Revenue</div>
            <div style={{color:'#34d399',fontSize:'22px',fontWeight:700}}>{fmt(totalRevenue)}</div>
            <div style={{color:'#4b5563',fontSize:'11px'}}>{sales.length} sales</div>
          </div>
          <div style={{width:'1px',background:'#2a2a2a'}}/>
          <div style={{textAlign:'center'}}>
            <div style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',marginBottom:'4px'}}>Cost</div>
            <div style={{color:'#f87171',fontSize:'22px',fontWeight:700}}>{fmt(totalCost)}</div>
            <div style={{color:'#4b5563',fontSize:'11px'}}>{purchases.length} purchases</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'12px',marginBottom:'28px'}}>
        {stat('Total Revenue', fmt(totalRevenue), '#34d399', sales.length+' sales')}
        {stat('Total Costs', fmt(totalCost), '#f87171', purchases.length+' purchases')}
        {stat('Gross Profit', fmt(grossProfit), profitable?'#34d399':'#f87171')}
        {stat('Margin', margin+'%', profitable?'#34d399':'#f87171', 'gross margin')}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'28px'}}>

        {/* Monthly breakdown */}
        <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #1f1f1f'}}>
            <h3 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:0}}>Monthly Breakdown</h3>
          </div>
          {months.length===0?<div style={{padding:'32px',textAlign:'center',color:'#4b5563',fontSize:'13px'}}>No data yet</div>:
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
            <thead><tr>
              {['Month','Revenue','Cost','Profit'].map(h=><th key={h} style={{textAlign:h==='Month'?'left':'right',padding:'10px 16px',fontSize:'11px',fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:'0.07em',background:'#161616',borderBottom:'1px solid #1f1f1f'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {months.map(mo => {
                const d = monthlyMap[mo];
                const rev = d.revenue||0, cost = d.cost||0, profit = rev-cost;
                return (<tr key={mo} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'10px 16px',color:'#9ca3af',fontSize:'13px',borderBottom:'1px solid #1a1a1a'}}>{mo}</td>
                  <td style={{padding:'10px 16px',color:'#34d399',fontSize:'13px',fontWeight:600,textAlign:'right',borderBottom:'1px solid #1a1a1a'}}>{fmt(rev)}</td>
                  <td style={{padding:'10px 16px',color:'#f87171',fontSize:'13px',textAlign:'right',borderBottom:'1px solid #1a1a1a'}}>{fmt(cost)}</td>
                  <td style={{padding:'10px 16px',color:profit>=0?'#34d399':'#f87171',fontSize:'13px',fontWeight:700,textAlign:'right',borderBottom:'1px solid #1a1a1a'}}>{fmt(profit)}</td>
                </tr>);
              })}
            </tbody>
          </table>}
        </div>

        {/* Top products by revenue */}
        <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
          <div style={{padding:'16px 20px',borderBottom:'1px solid #1f1f1f'}}>
            <h3 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:0}}>Revenue by Product</h3>
          </div>
          {topProducts.length===0?<div style={{padding:'32px',textAlign:'center',color:'#4b5563',fontSize:'13px'}}>No sales data yet</div>:
          <div style={{padding:'12px 0'}}>
            {topProducts.map(([name,rev])=>(
              <div key={name} style={{padding:'10px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{color:'#d1d5db',fontSize:'13px',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:'12px'}}>{name}</div>
                <div style={{color:'#34d399',fontSize:'13px',fontWeight:700,whiteSpace:'nowrap'}}>{fmt(rev)}</div>
              </div>
            ))}
          </div>}
        </div>
      </div>

      {/* Recent sales */}
      <div className='tbl-wrap' style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #1f1f1f'}}>
          <h3 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:0}}>Recent Sales</h3>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:'500px'}}>
          <thead><tr>
            {['Date','Customer','Total'].map(h=><th key={h} style={{textAlign:h==='Total'?'right':'left',padding:'10px 16px',fontSize:'11px',fontWeight:700,color:'#4b5563',textTransform:'uppercase',letterSpacing:'0.07em',background:'#161616',borderBottom:'1px solid #1f1f1f'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {sales.slice().reverse().slice(0,10).map((s,i)=>(
              <tr key={i} onMouseOver={e=>e.currentTarget.style.background='#1f1f1f'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 16px',color:'#6b7280',fontSize:'13px',borderBottom:'1px solid #1a1a1a'}}>{s.date||'—'}</td>
                <td style={{padding:'10px 16px',color:'#d1d5db',fontSize:'13px',fontWeight:500,borderBottom:'1px solid #1a1a1a'}}>{s.customer||'—'}</td>
                <td style={{padding:'10px 16px',color:'#34d399',fontSize:'13px',fontWeight:700,textAlign:'right',borderBottom:'1px solid #1a1a1a'}}>{s.total?fmt(parseFloat(s.total)):'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </>)}
    </div>
  );
}
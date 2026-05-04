'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

const COLS = ['date','customer','total','products','referredBy'];
const LABELS:any = {date:'Date',customer:'Customer',total:'Total ($)',products:'Products',referredBy:'Referred By'};

function getDateRange(preset:string) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  switch(preset) {
    case 'thisMonth': return [new Date(y,m,1), new Date(y,m+1,0)];
    case 'lastMonth': return [new Date(y,m-1,1), new Date(y,m,0)];
    case 'thisQuarter': { const q=Math.floor(m/3); return [new Date(y,q*3,1), new Date(y,q*3+3,0)]; }
    case 'lastQuarter': { const q=Math.floor(m/3)-1; const aq=((q%4)+4)%4; const ay=q<0?y-1:y; return [new Date(ay,aq*3,1), new Date(ay,aq*3+3,0)]; }
    case 'thisYear': return [new Date(y,0,1), new Date(y,11,31)];
    case 'lastYear': return [new Date(y-1,0,1), new Date(y-1,11,31)];
    case 'last30': return [new Date(now.getTime()-30*86400000), now];
    case 'last90': return [new Date(now.getTime()-90*86400000), now];
    default: return [null,null];
  }
}

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(['date','customer','total','products','referredBy']);
  const [sortDir, setSortDir] = useState<any>({date:'desc',customer:'asc',total:'desc',products:'asc',referredBy:'asc'});
  const [activeSort, setActiveSort] = useState('date');
  const [datePreset, setDatePreset] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [showNewSale, setShowNewSale] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const dragCol = useRef<any>(null);
  const dragOver = useRef<any>(null);

  useEffect(()=>{ load(); },[]);
  async function load() {
    setLoading(true);
    const d = await fetch('/api/sales').then(r=>r.json());
    setSales(d.sales||[]);
    setLoading(false);
  }

  // Drag to reorder sort tiles
  function onDragStart(col:string) { dragCol.current = col; }
  function onDragEnter(col:string) { dragOver.current = col; }
  function onDragEnd() {
    if (!dragCol.current || !dragOver.current || dragCol.current===dragOver.current) return;
    const newOrder = [...sortOrder];
    const from = newOrder.indexOf(dragCol.current);
    const to = newOrder.indexOf(dragOver.current);
    newOrder.splice(from,1); newOrder.splice(to,0,dragCol.current);
    setSortOrder(newOrder);
    dragCol.current=null; dragOver.current=null;
  }
  function toggleDir(col:string) {
    setSortDir((p:any)=>({...p,[col]:p[col]==='asc'?'desc':'asc'}));
  }

  // Filtering
  const [dateFrom, dateTo] = datePreset==='custom'
    ? [customFrom?new Date(customFrom):null, customTo?new Date(customTo):null]
    : getDateRange(datePreset);

  const filtered = sales.filter((s:any)=>{
    if (customerFilter && !(s.customer||'').toLowerCase().includes(customerFilter.toLowerCase())) return false;
    if (dateFrom||dateTo) {
      const d = new Date(s.date);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
    }
    return true;
  });

  // Multi-column sort based on tile order
  const sorted = [...filtered].sort((a:any,b:any)=>{
    for (const col of sortOrder) {
      let av = a[col]||'', bv = b[col]||'';
      if (col==='total') { av=parseFloat(av)||0; bv=parseFloat(bv)||0; }
      else if (col==='date') { av=new Date(av).getTime()||0; bv=new Date(bv).getTime()||0; }
      else { av=String(av).toLowerCase(); bv=String(bv).toLowerCase(); }
      const dir = sortDir[col]==='asc'?1:-1;
      if (av<bv) return -1*dir;
      if (av>bv) return 1*dir;
    }
    return 0;
  });

  // Unique customers for filter dropdown
  const customers = Array.from(new Set(sales.map((s:any)=>s.customer||'').filter(Boolean))).sort();

  // Total of filtered results
  const totalAmt = filtered.reduce((sum:number,s:any)=>sum+(parseFloat(s.total)||0),0);

  const presets = [
    {key:'thisMonth',label:'This Month'},{key:'lastMonth',label:'Last Month'},
    {key:'thisQuarter',label:'This Quarter'},{key:'lastQuarter',label:'Last Quarter'},
    {key:'thisYear',label:'This Year'},{key:'lastYear',label:'Last Year'},
    {key:'last30',label:'Last 30 Days'},{key:'last90',label:'Last 90 Days'},
    {key:'all',label:'All Time'},{key:'custom',label:'Custom Range'},
  ];

  const td:any = {padding:'10px 14px',borderBottom:'1px solid #1f1f1f',fontSize:'13px',verticalAlign:'middle'};
  const btn:any = (active:boolean)=>({background:active?'#1a4fa8':'#1a1a1a',color:active?'#fff':'#9ca3af',border:'1px solid',borderColor:active?'#1a4fa8':'#2a2a2a',borderRadius:'7px',padding:'5px 12px',fontSize:'12px',cursor:'pointer',fontWeight:active?600:400,transition:'all 0.15s'});

  return (
    <div style={{padding:'24px',maxWidth:'1200px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:0}}>Sales</h1>
          <p style={{color:'#4b5563',fontSize:'13px',margin:'4px 0 0'}}>{filtered.length} records · Total: ${totalAmt.toFixed(2)}</p>
        </div>
        <button onClick={()=>setShowNewSale(true)} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 16px',fontWeight:600,fontSize:'13px',cursor:'pointer'}}>+ New Sale</button>
      </div>

      {/* Sort tiles - draggable */}
      <div style={{background:'#111',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'14px 16px',marginBottom:'14px',position:'sticky',top:0,zIndex:20}}>
        <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 10px'}}>Sort Order — drag to reorder, click arrow to toggle direction</p>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {sortOrder.map((col,i)=>(
            <div key={col} draggable
              onDragStart={()=>onDragStart(col)}
              onDragEnter={()=>onDragEnter(col)}
              onDragEnd={onDragEnd}
              onClick={()=>setActiveSort(col)}
              style={{display:'flex',alignItems:'center',gap:'6px',background:activeSort===col?'#1a4fa8':'#1a1a1a',border:'1px solid',borderColor:activeSort===col?'#1a4fa8':'#2a2a2a',borderRadius:'8px',padding:'6px 12px',cursor:'grab',userSelect:'none',fontSize:'12px',fontWeight:600,color:activeSort===col?'#fff':'#9ca3af',transition:'all 0.15s'}}>
              <span style={{color:'#4b5563',fontSize:'10px'}}>#{i+1}</span>
              <span>{LABELS[col]}</span>
              <button onClick={(e)=>{e.stopPropagation();toggleDir(col);}} style={{background:'none',border:'none',color:'inherit',cursor:'pointer',padding:'0',fontSize:'12px',lineHeight:1}}>
                {sortDir[col]==='asc'?'↑':'↓'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{background:'#111',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'14px 16px',marginBottom:'14px',display:'flex',flexWrap:'wrap',gap:'12px',alignItems:'flex-end'}}>
        {/* Date presets */}
        <div style={{flex:'1',minWidth:'300px'}}>
          <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}>Date Range</p>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {presets.map(p=>(
              <button key={p.key} onClick={()=>{setDatePreset(p.key);setShowCustomDate(p.key==='custom');}} style={btn(datePreset===p.key)}>{p.label}</button>
            ))}
          </div>
          {datePreset==='custom'&&(
            <div style={{display:'flex',gap:'8px',marginTop:'8px',alignItems:'center'}}>
              <input type='date' value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'5px 10px',color:'#fff',fontSize:'12px'}}/>
              <span style={{color:'#4b5563'}}>to</span>
              <input type='date' value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'5px 10px',color:'#fff',fontSize:'12px'}}/>
            </div>
          )}
        </div>
        {/* Customer filter */}
        <div style={{minWidth:'200px'}}>
          <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 8px'}}>Customer</p>
          <select value={customerFilter} onChange={e=>setCustomerFilter(e.target.value)} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'6px 10px',color:customerFilter?'#fff':'#6b7280',fontSize:'13px',width:'100%'}}>
            <option value=''>All Customers</option>
            {customers.map((c:any)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Clear filters */}
        {(customerFilter||datePreset!=='thisMonth')&&(
          <button onClick={()=>{setCustomerFilter('');setDatePreset('thisMonth');setCustomFrom('');setCustomTo('');}} style={{background:'transparent',border:'1px solid #3a3a3a',color:'#6b7280',borderRadius:'7px',padding:'6px 12px',fontSize:'12px',cursor:'pointer'}}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
        {loading?(
          <div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        ):sorted.length===0?(
          <div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>No sales match your filters.</div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid #2a2a2a'}}>
                {sortOrder.map(col=>(
                  <th key={col} style={{padding:'10px 14px',textAlign:'left',fontSize:'11px',fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                    {LABELS[col]} {activeSort===col?(sortDir[col]==='asc'?'↑':'↓'):''}
                  </th>
                ))}
                <th style={{padding:'10px 14px'}}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s:any,i:number)=>(
                <tr key={i} onMouseOver={e=>(e.currentTarget.style.background='#1f1f1f')} onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                  {sortOrder.map(col=>(
                    <td key={col} style={td}>
                      {col==='total'?<span style={{color:'#34d399',fontWeight:600}}>${parseFloat(s[col]||0).toFixed(2)}</span>
                      :col==='date'?<span style={{color:'#9ca3af'}}>{s[col]?new Date(s[col]).toLocaleDateString():'-'}</span>
                      :col==='customer'?<span style={{color:'#fff',fontWeight:600}}>{s[col]||'-'}</span>
                      :col==='products'?<span style={{color:'#d1d5db',fontSize:'12px'}}>{s[col]||'-'}</span>
                      :<span style={{color:'#6b7280'}}>{s[col]||'-'}</span>}
                    </td>
                  ))}
                  <td style={td}><span style={{color:'#4b5563',fontSize:'11px'}}>{s.notes||''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';

const COL_LABELS:any = {date:'Date',customer:'Customer',total:'Total ($)',lines:'Products',referredBy:'Referred By'};
const ALL_COLS = ['date','customer','total','lines','referredBy'];

function getDateRange(preset:string) {
  const now = new Date(); const y=now.getFullYear(),m=now.getMonth();
  switch(preset) {
    case 'thisMonth':    return [new Date(y,m,1),      new Date(y,m+1,0)];
    case 'lastMonth':    return [new Date(y,m-1,1),    new Date(y,m,0)];
    case 'thisQuarter':  { const q=Math.floor(m/3); return [new Date(y,q*3,1), new Date(y,q*3+3,0)]; }
    case 'lastQuarter':  { const q=Math.floor(m/3)-1; const aq=((q%4)+4)%4; const ay=q<0?y-1:y; return [new Date(ay,aq*3,1), new Date(ay,aq*3+3,0)]; }
    case 'thisYear':     return [new Date(y,0,1),      new Date(y,11,31)];
    case 'lastYear':     return [new Date(y-1,0,1),    new Date(y-1,11,31)];
    case 'last30':       return [new Date(now.getTime()-30*86400000), now];
    case 'last90':       return [new Date(now.getTime()-90*86400000), now];
    default:             return [null,null];
  }
}

function parseLines(raw:string) {
  try { const arr = JSON.parse(raw||'[]'); return Array.isArray(arr)?arr:[]; } catch { return []; }
}

export default function SalesPage() {
  const [sales, setSales]             = useState([]);
  const [loading, setLoading]         = useState(true);
  // Sort: activeSorts = ordered array of {col, dir} only for cols user has clicked
  const [activeSorts, setActiveSorts] = useState<any[]>(()=>{ try{ const v=localStorage.getItem('sales_activeSorts'); return v?JSON.parse(v):[]; }catch{return[];} });
  const [datePreset, setDatePreset]   = useState(()=>{ try{ return localStorage.getItem('sales_datePreset')||'thisMonth'; }catch{return'thisMonth';} });
  const [customFrom, setCustomFrom]   = useState(()=>{ try{ return localStorage.getItem('sales_customFrom')||''; }catch{return'';} });
  const [customTo, setCustomTo]       = useState(()=>{ try{ return localStorage.getItem('sales_customTo')||''; }catch{return'';} });
  const [customerFilter, setCustomerFilter] = useState(()=>{ try{ return localStorage.getItem('sales_customerFilter')||''; }catch{return'';} });
  const [productFilter, setProductFilter]   = useState(()=>{ try{ return localStorage.getItem('sales_productFilter')||''; }catch{return'';} });
  const [showNewSale, setShowNewSale]   = useState(false);
  const [inventory, setInventory]       = useState<any[]>([]);
  const EMPTY_SALE = {customer:'',date:new Date().toISOString().split('T')[0],referredBy:'',notes:'',weeksReorder:'',lineItems:[{product:'',price:'',qty:'1'}]};
  const [newSaleForm, setNewSaleForm]   = useState<any>(EMPTY_SALE);
  const dragIdx = useRef<any>(null);
  const dragOverIdx = useRef<any>(null);

  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ if(showNewSale) fetch('/api/inventory').then(r=>r.json()).then(d=>setInventory(d.items||[])); },[showNewSale]);
  function addLine() { setNewSaleForm((p:any)=>({...p,lineItems:[...p.lineItems,{product:'',price:'',qty:'1'}]})); }
  function removeLine(i:number) { setNewSaleForm((p:any)=>({...p,lineItems:p.lineItems.filter((_:any,j:number)=>j!==i)})); }
  function setLine(i:number,field:string,val:string) {
    setNewSaleForm((p:any)=>{
      const li=[...p.lineItems]; li[i]={...li[i],[field]:val};
      // Auto-fill price from inventory when product selected
      if(field==='product'){
        const inv=inventory.find((it:any)=>it.name===val);
        if(inv&&inv.priceStandard) li[i].price=inv.priceStandard;
      }
      return {...p,lineItems:li};
    });
  }
  const saleTotal = newSaleForm.lineItems.reduce((s:number,l:any)=>s+(parseFloat(l.price||0)*parseFloat(l.qty||1)),0);
  async function saveNewSale() {
    if(!newSaleForm.customer||newSaleForm.lineItems.every((l:any)=>!l.product)) return;
    const lines = JSON.stringify(newSaleForm.lineItems.filter((l:any)=>l.product).map((l:any)=>({product:l.product,price:parseFloat(l.price||0),qty:parseFloat(l.qty||1)})));
    const nextRefillDate = newSaleForm.weeksReorder ? new Date(Date.now()+parseInt(newSaleForm.weeksReorder)*7*86400000).toISOString().split('T')[0] : '';
    await fetch('/api/sales',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'add',sale:{...newSaleForm,lines,total:saleTotal.toFixed(2),nextRefillDate}})});
    setShowNewSale(false); setNewSaleForm(EMPTY_SALE); await load();
  }
  useEffect(()=>{ try{ localStorage.setItem('sales_activeSorts', JSON.stringify(activeSorts)); }catch{} },[activeSorts]);
  useEffect(()=>{ try{ localStorage.setItem('sales_datePreset', datePreset); }catch{} },[datePreset]);
  useEffect(()=>{ try{ localStorage.setItem('sales_customFrom', customFrom); }catch{} },[customFrom]);
  useEffect(()=>{ try{ localStorage.setItem('sales_customTo', customTo); }catch{} },[customTo]);
  useEffect(()=>{ try{ localStorage.setItem('sales_customerFilter', customerFilter); }catch{} },[customerFilter]);
  useEffect(()=>{ try{ localStorage.setItem('sales_productFilter', productFilter); }catch{} },[productFilter]);
  async function load() {
    setLoading(true);
    const d = await fetch('/api/sales').then(r=>r.json());
    setSales(d.sales||[]);
    setLoading(false);
  }

  // Click column header to add/toggle sort
  function handleColClick(col:string) {
    setActiveSorts(prev => {
      const existing = prev.findIndex(s=>s.col===col);
      if (existing === -1) {
        // Add as new lowest-priority sort, default desc for date/total, asc for others
        const dir = (col==='date'||col==='total') ? 'desc' : 'asc';
        return [...prev, {col, dir}];
      } else {
        // Toggle direction
        const updated = [...prev];
        updated[existing] = {...updated[existing], dir: updated[existing].dir==='asc'?'desc':'asc'};
        return updated;
      }
    });
  }

  // Remove a sort tile
  function removeSort(col:string) {
    setActiveSorts(prev=>prev.filter(s=>s.col!==col));
  }

  // Drag tiles to reorder
  function onDragStart(i:number) { dragIdx.current=i; }
  function onDragEnter(i:number) { dragOverIdx.current=i; }
  function onDragEnd() {
    const from=dragIdx.current, to=dragOverIdx.current;
    if (from===null||to===null||from===to) return;
    setActiveSorts(prev=>{ const a=[...prev]; const [item]=a.splice(from,1); a.splice(to,0,item); return a; });
    dragIdx.current=null; dragOverIdx.current=null;
  }

  // Date filtering
  const [dateFrom,dateTo] = datePreset==='custom'
    ? [customFrom?new Date(customFrom):null, customTo?new Date(customTo):null]
    : getDateRange(datePreset);

  const filtered = sales.filter((s:any)=>{
    if (customerFilter && s.customer!==customerFilter) return false;
    if (productFilter) {
      const ls = parseLines(s.lines);
      if (!ls.some((l:any)=>(l.product||l.name||'').toLowerCase().includes(productFilter.toLowerCase()))) return false;
    }
    if (dateFrom||dateTo) {
      const d=new Date(s.date);
      if (isNaN(d.getTime())) return true;
      if (dateFrom && d<dateFrom) return false;
      if (dateTo && d>dateTo) return false;
    }
    return true;
  });

  // Multi-column sort based on tile order (first tile = primary sort)
  const sorted = [...filtered].sort((a:any,b:any)=>{
    for (const {col,dir} of activeSorts) {
      let av=a[col]||'', bv=b[col]||'';
      if (col==='total') { av=parseFloat(av)||0; bv=parseFloat(bv)||0; }
      else if (col==='date') { av=new Date(av).getTime()||0; bv=new Date(bv).getTime()||0; }
      else { av=String(av).toLowerCase(); bv=String(bv).toLowerCase(); }
      const d=dir==='asc'?1:-1;
      if (av<bv) return -1*d;
      if (av>bv) return 1*d;
    }
    return 0;
  });

  const customers = Array.from(new Set(sales.map((s:any)=>s.customer||'').filter(Boolean))).sort();
  const products = Array.from(new Set(
    sales.flatMap((s:any)=>parseLines(s.lines).map((l:any)=>l.product||l.name||'').filter(Boolean))
  )).sort();
  const totalAmt = filtered.reduce((sum:number,s:any)=>sum+(parseFloat(s.total)||0),0);

  const PRESETS = [
    {key:'thisMonth',label:'This Month'},{key:'lastMonth',label:'Last Month'},
    {key:'thisQuarter',label:'This Quarter'},{key:'lastQuarter',label:'Last Quarter'},
    {key:'thisYear',label:'This Year'},{key:'lastYear',label:'Last Year'},
    {key:'last30',label:'Last 30 Days'},{key:'last90',label:'Last 90 Days'},
    {key:'all',label:'All Time'},{key:'custom',label:'Custom Range'},
  ];

  const td:any = {padding:'10px 14px',borderBottom:'1px solid #1a1a1a',fontSize:'13px',verticalAlign:'top'};
  const thStyle:any = (col:string) => ({
    padding:'10px 14px',textAlign:'left',fontSize:'11px',fontWeight:700,
    color: activeSorts.find(s=>s.col===col) ? '#6b9ee8' : '#6b7280',
    textTransform:'uppercase',letterSpacing:'0.06em',cursor:'pointer',
    background:'#161616',borderBottom:'1px solid #1f1f1f',userSelect:'none',
    whiteSpace:'nowrap',
  });
  const selStyle:any = {background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'7px 10px',color:'#fff',fontSize:'13px',cursor:'pointer'};

  return (
    <div style={{padding:'24px',maxWidth:'1200px'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px'}}>
        <div>
          <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:0}}>Sales</h1>
          <p style={{color:'#4b5563',fontSize:'13px',margin:'4px 0 0'}}>{filtered.length} records · Total: ${totalAmt.toFixed(2)}</p>
        </div>
        <button onClick={()=>setShowNewSale(true)} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'8px',padding:'9px 18px',fontWeight:700,fontSize:'13px',cursor:'pointer'}}>+ New Sale</button>
      </div>

      {/* Filters row */}
      <div style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap',marginBottom:'14px'}}>
        {/* Date dropdown */}
        <div>
          <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Date</p>
          <select value={datePreset} onChange={e=>setDatePreset(e.target.value)} style={selStyle}>
            {PRESETS.map(p=><option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        {datePreset==='custom'&&(
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            <input type='date' value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{...selStyle,colorScheme:'dark'}}/>
            <span style={{color:'#4b5563'}}>to</span>
            <input type='date' value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{...selStyle,colorScheme:'dark'}}/>
          </div>
        )}
        {/* Customer dropdown */}
        <div>
          <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Customer</p>
          <select value={customerFilter} onChange={e=>setCustomerFilter(e.target.value)} style={selStyle}>
            <option value=''>All Customers</option>
            {customers.map((c:any)=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Product dropdown */}
        <div>
          <p style={{color:'#6b7280',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 6px'}}>Product</p>
          <select value={productFilter} onChange={e=>setProductFilter(e.target.value)} style={selStyle}>
            <option value=''>All Products</option>
            {products.map((p:any)=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {(customerFilter||productFilter||datePreset!=='thisMonth')&&(
          <button onClick={()=>{setCustomerFilter('');setProductFilter('');setDatePreset('thisMonth');setCustomFrom('');setCustomTo('');}} style={{background:'transparent',border:'1px solid #3a3a3a',color:'#6b7280',borderRadius:'7px',padding:'7px 12px',fontSize:'12px',cursor:'pointer',alignSelf:'flex-end'}}>✕ Clear</button>
        )}
      </div>

      {/* Active sort tiles */}
      {activeSorts.length>0&&(
        <div style={{background:'#111',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'10px 14px',marginBottom:'14px',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          <span style={{color:'#4b5563',fontSize:'11px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>Sort:</span>
          {activeSorts.map((s,i)=>(
            <div key={s.col} draggable
              onDragStart={()=>onDragStart(i)}
              onDragEnter={()=>onDragEnter(i)}
              onDragEnd={onDragEnd}
              style={{display:'flex',alignItems:'center',gap:'5px',background:'rgba(26,79,168,0.15)',border:'1px solid rgba(26,79,168,0.4)',borderRadius:'6px',padding:'4px 10px',cursor:'grab',userSelect:'none',fontSize:'12px',fontWeight:600,color:'#6b9ee8'}}>
              <span style={{color:'#4b5563',fontSize:'10px'}}>#{i+1}</span>
              <span>{COL_LABELS[s.col]}</span>
              <span style={{color:'#6b9ee8'}}>{s.dir==='asc'?'↑':'↓'}</span>
              <button onClick={()=>removeSort(s.col)} style={{background:'none',border:'none',color:'#4b5563',cursor:'pointer',padding:'0 0 0 2px',fontSize:'12px',lineHeight:1}}>×</button>
            </div>
          ))}
          <button onClick={()=>setActiveSorts([])} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'11px',cursor:'pointer',marginLeft:'4px'}}>Clear all</button>
        </div>
      )}

      {/* Table */}
      <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',overflow:'hidden'}}>
        {loading?(
          <div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
        ):sorted.length===0?(
          <div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>No sales match your filters.</div>
        ):(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {ALL_COLS.map(col=>(
                  <th key={col} style={thStyle(col)} onClick={()=>handleColClick(col)}>
                    {COL_LABELS[col]}
                    {activeSorts.find(s=>s.col===col) ? (activeSorts.find(s=>s.col===col)!.dir==='asc'?'  ↑':'  ↓') : '  ↕'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s:any,i:number)=>{
                const lineItems = parseLines(s.lines);
                return (
                  <tr key={i} onMouseOver={e=>(e.currentTarget.style.background='#1f1f1f')} onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{...td,color:'#9ca3af',whiteSpace:'nowrap'}}>{s.date?new Date(s.date).toLocaleDateString():'-'}</td>
                    <td style={{...td,color:'#fff',fontWeight:600}}>{s.customer||'-'}</td>
                    <td style={{...td,color:'#34d399',fontWeight:700}}>{s.total?'$'+parseFloat(s.total).toFixed(2):'-'}</td>
                    <td style={td}>
                      {lineItems.length>0?(
                        <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                          {lineItems.map((l:any,j:number)=>(
                            <span key={j} style={{fontSize:'12px',color:'#d1d5db'}}>
                              {l.product||l.name||'?'}{l.qty&&l.qty>1?` × ${l.qty}`:''}
                            </span>
                          ))}
                        </div>
                      ):<span style={{color:'#4b5563'}}>-</span>}
                    </td>
                    <td style={{...td,color:'#6b7280'}}>{s.referredBy||'-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {showNewSale&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'28px',maxWidth:'560px',width:'100%',maxHeight:'92vh',overflowY:'auto'}}>
            <h2 style={{color:'#fff',fontWeight:800,fontSize:'18px',margin:'0 0 20px'}}>New Sale</h2>
            {/* Customer dropdown */}
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>Customer <span style={{color:'#f87171'}}>*</span></label>
              <select value={newSaleForm.customer} onChange={e=>setNewSaleForm((p:any)=>({...p,customer:e.target.value}))} style={{width:'100%',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'9px 12px',color:newSaleForm.customer?'#fff':'#6b7280',fontSize:'14px'}}>
                <option value=''>Select customer...</option>
                {customers.map((c:any)=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Date */}
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>Date</label>
              <input type='date' value={newSaleForm.date} onChange={e=>setNewSaleForm((p:any)=>({...p,date:e.target.value}))} style={{width:'100%',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'14px',colorScheme:'dark'}}/>
            </div>
            {/* Line items */}
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'}}>Products <span style={{color:'#f87171'}}>*</span></label>
              {newSaleForm.lineItems.map((line:any,i:number)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 70px 32px',gap:'6px',marginBottom:'8px',alignItems:'center'}}>
                  <select value={line.product} onChange={e=>setLine(i,'product',e.target.value)} style={{background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'8px 10px',color:line.product?'#fff':'#6b7280',fontSize:'13px'}}>
                    <option value=''>Select product...</option>
                    {inventory.map((it:any)=><option key={it.id} value={it.name}>{it.name}</option>)}
                  </select>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'13px'}}>$</span>
                    <input type='number' placeholder='0.00' value={line.price} onChange={e=>setLine(i,'price',e.target.value)} style={{width:'100%',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'8px 8px 8px 20px',color:'#fff',fontSize:'13px'}}/>
                  </div>
                  <input type='number' placeholder='Qty' min='1' value={line.qty} onChange={e=>setLine(i,'qty',e.target.value)} style={{background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'8px',color:'#fff',fontSize:'13px',textAlign:'center'}}/>
                  {newSaleForm.lineItems.length>1
                    ?<button onClick={()=>removeLine(i)} style={{background:'transparent',border:'1px solid #3a3a3a',color:'#f87171',borderRadius:'6px',padding:'4px 8px',cursor:'pointer',fontSize:'16px',lineHeight:1}}>×</button>
                    :<div/>}
                </div>
              ))}
              <button onClick={addLine} style={{background:'transparent',border:'1px dashed #2a2a2a',color:'#6b7280',borderRadius:'8px',padding:'7px 14px',cursor:'pointer',fontSize:'13px',width:'100%',marginTop:'4px'}}>+ Add Product</button>
            </div>
            {/* Total */}
            <div style={{background:'#111',borderRadius:'8px',padding:'12px 16px',marginBottom:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#9ca3af',fontSize:'13px',fontWeight:600}}>Total</span>
              <span style={{color:'#34d399',fontSize:'20px',fontWeight:800}}>${saleTotal.toFixed(2)}</span>
            </div>
            {/* Weeks to reorder */}
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>Weeks Until Reorder</label>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {['4','8','10','12','16'].map(w=>(
                  <button key={w} onClick={()=>setNewSaleForm((p:any)=>({...p,weeksReorder:p.weeksReorder===w?'':w}))} style={{background:newSaleForm.weeksReorder===w?'rgba(26,79,168,0.25)':'#111',border:'1px solid',borderColor:newSaleForm.weeksReorder===w?'#1a4fa8':'#2a2a2a',color:newSaleForm.weeksReorder===w?'#6b9ee8':'#9ca3af',borderRadius:'8px',padding:'6px 14px',cursor:'pointer',fontSize:'13px',fontWeight:newSaleForm.weeksReorder===w?700:400}}>{w} wks</button>
                ))}
                <input type='number' placeholder='Custom' value={['4','8','10','12','16'].includes(newSaleForm.weeksReorder)?'':newSaleForm.weeksReorder} onChange={e=>setNewSaleForm((p:any)=>({...p,weeksReorder:e.target.value}))} style={{width:'80px',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'6px 10px',color:'#fff',fontSize:'13px'}}/>
              </div>
              {newSaleForm.weeksReorder&&<p style={{color:'#4b5563',fontSize:'11px',margin:'6px 0 0'}}>Next refill: {new Date(Date.now()+parseInt(newSaleForm.weeksReorder)*7*86400000).toLocaleDateString()}</p>}
            </div>
            {/* Referred by */}
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>Referred By</label>
              <input value={newSaleForm.referredBy} onChange={e=>setNewSaleForm((p:any)=>({...p,referredBy:e.target.value}))} placeholder='Name of referrer (optional)' style={{width:'100%',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'14px'}}/>
            </div>
            {/* Notes */}
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:'12px',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'6px'}}>Notes</label>
              <textarea value={newSaleForm.notes} onChange={e=>setNewSaleForm((p:any)=>({...p,notes:e.target.value}))} rows={2} style={{width:'100%',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'9px 12px',color:'#fff',fontSize:'14px',resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
              <button onClick={()=>{setShowNewSale(false);setNewSaleForm(EMPTY_SALE);}} style={{background:'transparent',border:'1px solid #3a3a3a',color:'#9ca3af',borderRadius:'8px',padding:'8px 18px',cursor:'pointer',fontSize:'14px'}}>Cancel</button>
              <button onClick={saveNewSale} disabled={!newSaleForm.customer} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'8px',padding:'8px 20px',cursor:'pointer',fontSize:'14px',fontWeight:700,opacity:newSaleForm.customer?1:0.5}}>Save Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
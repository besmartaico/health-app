// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

export default function PostersPage() {
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/posters').then(r => r.json()).then(d => {
      setPosters(d.posters || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = posters.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily:'Inter,system-ui,sans-serif',background:'#0a0a0a',minHeight:'100vh',color:'#fff' }}>

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.94)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ position:'relative',maxWidth:'800px',width:'100%',maxHeight:'92vh',background:'#111',borderRadius:'16px',overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.8)',display:'flex',flexDirection:'column' }}>
            <div style={{ padding:'14px 20px',background:'#1a1a1a',borderBottom:'1px solid #2a2a2a',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
              <h3 style={{ margin:0,fontSize:'16px',fontWeight:700 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background:'#2a2a2a',border:'none',borderRadius:'6px',width:'32px',height:'32px',color:'#9ca3af',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
            </div>
            <div style={{ overflowY:'auto',display:'flex',alignItems:'center',justifyContent:'center',background:'#000',minHeight:'400px' }}>
              <img src={selected.imageUrl} alt={selected.name} style={{ maxWidth:'100%',maxHeight:'80vh',objectFit:'contain',display:'block' }} />
            </div>
          </div>
        </div>
      )}

      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(10,10,10,0.96)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 24px',height:'60px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <a href='/' style={{ textDecoration:'none' }}>
          <div style={{ background:'#fff',borderRadius:'7px',padding:'4px 12px' }}>
            <img src={LOGO} alt='BeSmart Health' style={{ height:'26px',display:'block' }} />
          </div>
        </a>
        <a href='/' style={{ color:'#9ca3af',textDecoration:'none',fontSize:'13px' }}>← Back to Home</a>
      </nav>

      <div style={{ maxWidth:'1100px',margin:'0 auto',padding:'48px 24px' }}>
        <div style={{ marginBottom:'36px' }}>
          <h1 style={{ fontSize:'clamp(28px,5vw,48px)',fontWeight:900,margin:'0 0 10px',letterSpacing:'-1px' }}>Peptide Posters</h1>
          <p style={{ color:'#6b7280',fontSize:'15px',margin:'0 0 24px' }}>Detailed information sheets for each of our compounded peptides.</p>
          <input type='text' placeholder='Search peptides...' value={search} onChange={e=>setSearch(e.target.value)}
            style={{ background:'#111',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'10px 16px',color:'#fff',fontSize:'14px',outline:'none',width:'100%',maxWidth:'320px',boxSizing:'border-box' }} />
        </div>

        {loading ? (
          <div style={{ textAlign:'center',padding:'80px',color:'#4b5563' }}><div style={{ fontSize:'40px',marginBottom:'16px' }}>🔬</div>Loading posters...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'80px',color:'#4b5563' }}><div style={{ fontSize:'40px',marginBottom:'16px' }}>📋</div>No posters found.</div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'16px' }}>
            {filtered.map(poster => (
              <div key={poster.id} onClick={() => setSelected(poster)}
                style={{ background:'#111',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden',cursor:'pointer',transition:'all 0.15s' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(192,57,79,0.5)';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.4)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}
              >
                <div style={{ height:'200px',overflow:'hidden',background:'#1a1a1a',position:'relative' }}>
                  <img src={poster.imageUrl} alt={poster.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} loading='lazy' />
                  <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 60%,rgba(0,0,0,0.4))' }} />
                </div>
                <div style={{ padding:'14px 16px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div style={{ fontWeight:700,fontSize:'15px',color:'#fff' }}>{poster.name}</div>
                  <span style={{ color:'#c0394f',fontSize:'12px',fontWeight:600 }}>View →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop:'48px',background:'rgba(192,57,79,0.06)',border:'1px solid rgba(192,57,79,0.15)',borderRadius:'14px',padding:'24px',textAlign:'center' }}>
          <p style={{ color:'#9ca3af',fontSize:'13px',margin:0,lineHeight:1.6 }}>
            All peptides are compounded and 3rd party tested at 98%+ purity.<br />
            <span style={{ color:'#6b7280' }}>For educational purposes only. Consult a healthcare professional before use.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

const PEPTIDE_DESCRIPTIONS = {
  '5 Amino 1MQ':  'Metabolic boost & fat loss support',
  'BPC157TB500':  'Tissue repair, recovery & healing',
  'Glow':         'Skin rejuvenation & anti-aging',
  'ImmunoGlow':   'Immune support & radiant health',
  'IPAM':         'Clean GH release & anti-aging',
  'Mots-c':       'Metabolic health & longevity',
  'NAD+':         'Cellular energy & vitality',
  'Retatrutide':  'Advanced weight management',
  'Tirzepatide':  'Weight management & metabolic health',
};

const ICONS = {
  '5 Amino 1MQ': '🔥', 'BPC157TB500': '🩹', 'Glow': '✨',
  'ImmunoGlow': '🛡️', 'IPAM': '⚡', 'Mots-c': '🔬',
  'NAD+': '⚗️', 'Retatrutide': '⚖️', 'Tirzepatide': '💊',
};

export default function HomePage() {
  const [posters, setPosters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posters').then(r => r.json()).then(d => {
      setPosters(d.posters || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

      {/* Poster Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '800px', width: '100%', maxHeight: '92vh', background: '#111', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: '#2a2a2a', border: 'none', borderRadius: '6px', width: '32px', height: '32px', color: '#9ca3af', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', minHeight: '400px' }}>
              <img src={selected.imageUrl} alt={selected.name} style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav - Login button (not Admin Portal) */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '5px 14px' }}>
          <img src={LOGO} alt='BeSmart Health' style={{ height: '28px', display: 'block' }} />
        </div>
        <a href='/admin' style={{ background: '#1a4fa8', color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '9px 20px', borderRadius: '8px', fontWeight: 600 }}>Login</a>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1.5px' }}>
          Precision Wellness<br />
          <span style={{ color: '#1a4fa8' }}>Peptides</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, margin: '0 auto 36px', maxWidth: '580px' }}>
          Personalized peptide therapies, independently tested and batch-documented for your confidence.
        </p>
        <a href='#peptides' style={{ display: 'inline-block', background: '#1a4fa8', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}>View Our Peptides</a>
      </section>

      {/* Trust badges - replaces stats bar */}
      <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
          {[['🔬','3rd Party Tested','Every batch independently tested at 98%+ purity'],['✅','Lab Verified Quality','Rigorous quality control on every formulation'],['⚗️','Peptides','Custom-formulated to your specific protocol'],['🩺','Expert Guidance','Personalized dosing protocols & ongoing support']].map(([icon,title,desc])=>(
            <div key={title} style={{ background:'#111',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',padding:'24px',display:'flex',gap:'16px',alignItems:'flex-start' }}>
              <span style={{ fontSize:'28px',flexShrink:0 }}>{icon}</span>
              <div><div style={{ fontWeight:700,fontSize:'15px',marginBottom:'4px' }}>{title}</div><div style={{ color:'#6b7280',fontSize:'13px',lineHeight:1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Peptides */}
      <section id='peptides' style={{ padding: '48px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Our Peptides</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Click any peptide to view its information poster</p>
        </div>
        {loading ? (
          <div style={{ textAlign:'center',color:'#4b5563',padding:'40px' }}>Loading peptides...</div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'14px' }}>
            {posters.map(item => (
              <div key={item.id} onClick={() => setSelected(item)}
                style={{ background:'#111',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'14px',overflow:'hidden',cursor:'pointer',transition:'all 0.15s',position:'relative' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(192,57,79,0.5)';e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.transform='none';}}
              >
                <div style={{ height:'140px',overflow:'hidden',position:'relative',background:'#1a1a1a' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top' }} loading='lazy' />
                  <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 60%,rgba(0,0,0,0.5))' }} />
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ fontWeight:700,fontSize:'14px',marginBottom:'3px',color:'#fff' }}>{item.name}</div>
                  <div style={{ color:'#6b7280',fontSize:'11px',lineHeight:1.4 }}>{PEPTIDE_DESCRIPTIONS[item.name]||'Therapeutic peptide'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign:'center',marginTop:'32px' }}>
          <a href='/posters' style={{ display:'inline-block',background:'rgba(255,255,255,0.04)',color:'#9ca3af',textDecoration:'none',padding:'12px 28px',borderRadius:'10px',border:'1px solid rgba(255,255,255,0.08)',fontSize:'14px',fontWeight:600 }}>View All Peptide Posters →</a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)',padding:'32px 24px',textAlign:'center' }}>
        <div style={{ background:'#fff',borderRadius:'8px',padding:'5px 14px',display:'inline-block',marginBottom:'16px' }}>
          <img src={LOGO} alt='BeSmart Health' style={{ height:'24px',display:'block' }} />
        </div>
        <p style={{ color:'#4b5563',fontSize:'13px',margin:'0 0 8px' }}>Peptides · 3rd Party Tested · Lab Verified Quality</p>
        <p style={{ color:'#374151',fontSize:'12px',margin:0 }}>For educational purposes only. Consult a healthcare professional before use.</p>
      </footer>
    </div>
  );
}
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
      setPosters(d.posters || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = posters.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

      {/* Poster Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '750px', width: '100%', maxHeight: '92vh', background: '#111', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{selected.name}</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {selected.viewUrl && <a href={selected.viewUrl} target='_blank' rel='noreferrer' style={{ color: '#c0394f', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Open Full ↗</a>}
                <button onClick={() => setSelected(null)} style={{ background: '#2a2a2a', border: 'none', borderRadius: '6px', width: '28px', height: '28px', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>
            <iframe src={selected.embedUrl} style={{ width: '100%', flex: 1, minHeight: '500px', border: 'none', display: 'block' }} allow='autoplay' />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href='/' style={{ textDecoration: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '7px', padding: '4px 12px' }}>
            <img src={LOGO} alt='BeSmart Health' style={{ height: '26px', display: 'block' }} />
          </div>
        </a>
        <a href='/' style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>← Back to Home</a>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(192,57,79,0.1)', border: '1px solid rgba(192,57,79,0.3)', borderRadius: '20px', padding: '5px 16px', fontSize: '12px', color: '#c0394f', fontWeight: 600, marginBottom: '16px', letterSpacing: '0.04em' }}>PEPTIDE INFORMATION</div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-1px' }}>Peptide Posters</h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: '0 0 24px' }}>Detailed information sheets for each of our compounded peptides. Click any poster to view full details.</p>
          <input
            type='text'
            placeholder='Search peptides...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '9px', padding: '10px 16px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '320px', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#4b5563' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔬</div>
            <div>Loading posters...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#4b5563' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}>No posters found</div>
            <div style={{ fontSize: '13px' }}>Try a different search or check back later.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {filtered.map(poster => (
              <div
                key={poster.id}
                onClick={() => setSelected(poster)}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(192,57,79,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Thumbnail or gradient placeholder */}
                <div style={{ height: '160px', background: poster.thumbnailUrl ? `url(${poster.thumbnailUrl}) center/cover` : 'linear-gradient(135deg, #1a0a10, #2d0e18)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  {!poster.thumbnailUrl && <div style={{ fontSize: '48px', opacity: 0.4 }}>📋</div>}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6))' }} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: '#fff' }}>{poster.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#c0394f', fontSize: '12px', fontWeight: 600 }}>View Poster →</span>
                    {poster.viewUrl && <a href={poster.viewUrl} target='_blank' rel='noreferrer' onClick={e => e.stopPropagation()} style={{ color: '#4b5563', fontSize: '11px', textDecoration: 'none' }}>↗ Drive</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '48px', background: 'rgba(192,57,79,0.06)', border: '1px solid rgba(192,57,79,0.15)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
            All peptides are compounded and 3rd party tested at 98%+ purity. Certificates of Analysis (COAs) are available for every batch.<br />
            <span style={{ color: '#6b7280' }}>For educational purposes only. Consult a healthcare professional before use.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
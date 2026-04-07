// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const LOGO = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

// Peptides that have posters - name must match file name in Drive (minus extension)
// These will be dynamically loaded from Drive, but we define the display order here
const PEPTIDE_NAMES = [
  'BPC-157', 'TB-500', 'CJC-1295 + Ipamorelin', 'Semaglutide',
  'Tirzepatide', 'NAD+', 'Sermorelin', 'GHK-Cu',
  'PT-141', 'Oxytocin', 'MK-677', 'Ipamorelin',
];

const PEPTIDE_DESCRIPTIONS = {
  'BPC-157': 'Tissue repair & healing',
  'TB-500': 'Muscle recovery & flexibility',
  'CJC-1295 + Ipamorelin': 'Growth hormone & muscle growth',
  'Semaglutide': 'Weight management & metabolic health',
  'Tirzepatide': 'Advanced weight management',
  'NAD+': 'Cellular energy & longevity',
  'Sermorelin': 'Growth hormone stimulation',
  'GHK-Cu': 'Skin rejuvenation & collagen',
  'PT-141': 'Sexual health & wellness',
  'Oxytocin': 'Mood & social connection',
  'MK-677': 'Lean muscle & sleep quality',
  'Ipamorelin': 'Clean GH release & anti-aging',
};

export default function HomePage() {
  const [posters, setPosters] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [postersLoading, setPostersLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posters').then(r => r.json()).then(d => {
      setPosters(d.posters || []);
      setPostersLoading(false);
    }).catch(() => setPostersLoading(false));
  }, []);

  // Match a peptide name to a poster from Drive
  const findPoster = (peptideName) => {
    const lower = peptideName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return posters.find(p => {
      const pn = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return pn.includes(lower) || lower.includes(pn) || pn === lower;
    });
  };

  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

      {/* Poster Modal */}
      {selectedPoster && (
        <div onClick={() => setSelectedPoster(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '700px', width: '100%', maxHeight: '90vh', background: '#111', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>
            <button onClick={() => setSelectedPoster(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '20px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            <div style={{ padding: '16px 20px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{selectedPoster.displayName}</h3>
              {selectedPoster.viewUrl && <a href={selectedPoster.viewUrl} target='_blank' rel='noreferrer' style={{ color: '#c0394f', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>Open Full ↗</a>}
            </div>
            <iframe
              src={selectedPoster.embedUrl}
              style={{ width: '100%', height: '600px', border: 'none', display: 'block' }}
              allow='autoplay'
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '5px 14px' }}>
          <img src={LOGO} alt='BeSmart Health' style={{ height: '28px', display: 'block' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href='/posters' style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }} onMouseOver={e => e.currentTarget.style.color='#fff'} onMouseOut={e => e.currentTarget.style.color='#9ca3af'}>View All Posters</a>
          <a href='/admin' style={{ background: '#7b1c2e', color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '8px 18px', borderRadius: '8px', fontWeight: 600 }}>Admin Portal</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(192,57,79,0.1)', border: '1px solid rgba(192,57,79,0.3)', borderRadius: '20px', padding: '6px 18px', fontSize: '13px', color: '#c0394f', fontWeight: 600, marginBottom: '24px', letterSpacing: '0.04em' }}>
          COMPOUNDED PEPTIDES
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', letterSpacing: '-1.5px' }}>
          Precision Wellness<br />
          <span style={{ background: 'linear-gradient(135deg,#c0394f,#7b1c2e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Compounded Peptides</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, margin: '0 0 36px', maxWidth: '580px', margin: '0 auto 36px' }}>
          Personalized compounded peptide therapies backed by 3rd party testing and Certificates of Analysis for every batch.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href='#peptides' style={{ background: '#7b1c2e', color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '15px' }}>View Our Peptides</a>
          <a href='/posters' style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: 600, fontSize: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>View All Posters</a>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '32px', textAlign: 'center' }}>
          {[
            [String(PEPTIDE_NAMES.length) + '+', 'Compounded Peptides'],
            ['98%+', '3rd Party Testing'],
            ['✓', 'Certificates of Analysis'],
            ['COA', 'On Every Batch'],
          ].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#c0394f', marginBottom: '4px' }}>{num}</div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '16px' }}>
          {[
            ['🔬', '3rd Party Testing', 'Every batch independently verified at 98%+ purity'],
            ['📋', 'Certificates of Analysis', 'COA documentation available for every product'],
            ['⚗️', 'Compounded Peptides', 'Custom-formulated to your specific needs'],
            ['🩺', 'Expert Guidance', 'Personalized dosing protocols & support'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{title}</div>
                <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Peptides section */}
      <section id='peptides' style={{ padding: '48px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Our Peptides</h2>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Click any peptide to view its information poster</p>
        </div>
        {postersLoading ? (
          <div style={{ textAlign: 'center', color: '#4b5563', padding: '40px' }}>Loading peptides...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '14px' }}>
            {(posters.length > 0 ? posters : PEPTIDE_NAMES.map(n => ({ name: n, id: null }))).map((item) => {
              const name = item.name || item;
              const desc = PEPTIDE_DESCRIPTIONS[name] || 'Therapeutic peptide';
              const hasPoster = item.id;
              return (
                <div
                  key={name}
                  onClick={hasPoster ? () => setSelectedPoster({ displayName: name, embedUrl: item.embedUrl, viewUrl: item.viewUrl }) : undefined}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', cursor: hasPoster ? 'pointer' : 'default', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}
                  onMouseOver={e => { if(hasPoster) { e.currentTarget.style.borderColor='rgba(192,57,79,0.5)'; e.currentTarget.style.background='rgba(123,28,46,0.12)'; }}}
                  onMouseOut={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='#111'; }}
                >
                  {hasPoster && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(192,57,79,0.15)', border: '1px solid rgba(192,57,79,0.3)', borderRadius: '4px', fontSize: '9px', color: '#c0394f', padding: '2px 5px', fontWeight: 700 }}>POSTER</div>}
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>💉</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '5px' }}>{name}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: 1.4 }}>{desc}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href='/posters' style={{ display: 'inline-block', background: 'rgba(255,255,255,0.04)', color: '#9ca3af', textDecoration: 'none', padding: '12px 28px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', fontWeight: 600 }}>
            View All Peptide Posters →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '5px 14px', display: 'inline-block', marginBottom: '16px' }}>
          <img src={LOGO} alt='BeSmart Health' style={{ height: '24px', display: 'block' }} />
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 8px' }}>Compounded Peptides · 3rd Party Tested · Certificates of Analysis Available</p>
        <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>For educational purposes only. Consult a healthcare professional before use.</p>
      </footer>
    </div>
  );
}
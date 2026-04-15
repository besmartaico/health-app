// @ts-nocheck
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'14px', padding:'24px' };
const MAX_FILES = 5;

// Price list from distributor sheet
const PRICE_LIST = [
  { name:'Glow',         mg:70,   price:1400 },
  { name:'Klow',         mg:80,   price:1900 },
  { name:'5 Amino 1MQ',  mg:50,   price:1500 },
  { name:'Mots-C',       mg:40,   price:2800 },
  { name:'BPC157',       mg:10,   price:1200 },
  { name:'NAD+',         mg:500,  price:1400 },
  { name:'NAD+',         mg:1000, price:1800 },
  { name:'TB500',        mg:10,   price:1200 },
  { name:'BPC157/TB500', mg:10,   price:1400 },
  { name:'CJC1295/IPAM', mg:10,   price:1200 },
  { name:'Tesamorelin/IPAM', mg:10, price:1200 },
  { name:'Immunoglow',   mg:200,  price:1200 },
  { name:'Cagrilintide', mg:5,    price:1200 },
  { name:'Tesamorelin',  mg:20,   price:1500 },
  { name:'Retatrutide',  mg:10,   price:1800 },
  { name:'Retatrutide',  mg:12,   price:2000 },
  { name:'Retatrutide',  mg:16,   price:2400 },
  { name:'Retatrutide',  mg:30,   price:3800 },
  { name:'Semaglutide',  mg:5,    price:1200 },
  { name:'Semaglutide',  mg:10,   price:1400 },
  { name:'Tirzepatide',  mg:10,   price:1300 },
  { name:'Tirzepatide',  mg:15,   price:1800 },
  { name:'Tirzepatide',  mg:20,   price:2300 },
  { name:'Tirzepatide',  mg:30,   price:2800 },
  { name:'Tirzepatide',  mg:40,   price:3300 },
  { name:'Tirzepatide',  mg:60,   price:3800 },
];

// Get unique peptide names for dropdown
const PEPTIDE_NAMES = [...new Set(PRICE_LIST.map(p => p.name))];

export default function CalculatorPage() {
  const [mode, setMode] = useState('manual');
  // Manual calc
  const [selectedPeptide, setSelectedPeptide] = useState('');
  const [vialMg, setVialMg] = useState('');
  const [reconMl, setReconMl] = useState('2');
  const [doseMcg, setDoseMcg] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [result, setResult] = useState(null);
  // Inventory
  const [inventory, setInventory] = useState([]);
  // Photo
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetch('/api/inventory').then(r => r.json()).then(d => setInventory(d.items || []));
  }, []);

  // When peptide selected, auto-fill mg from price list
  const handlePeptideSelect = (name) => {
    setSelectedPeptide(name);
    const options = PRICE_LIST.filter(p => p.name === name);
    if (options.length === 1) setVialMg(String(options[0].mg));
    else setVialMg(''); // multiple sizes - let user pick
    setResult(null);
  };

  const calculate = () => {
    const mg = parseFloat(vialMg), ml = parseFloat(reconMl), mcg = parseFloat(doseMcg);
    if (!mg || !ml || !mcg) { setResult(null); return; }
    const mcgPerMl = (mg * 1000) / ml;
    const drawMl = mcg / mcgPerMl;
    const drawUnits = drawMl * 100;
    const dosesPerVial = Math.floor((mg * 1000) / mcg);
    // Frequency to days per week
    const freqMap = { daily:7, 'twice-daily':14, 'every-other-day':3.5, 'weekly':1, '3x-week':3 };
    const dosesPerWeek = freqMap[frequency] || 7;
    const weeksPerVial = dosesPerVial / dosesPerWeek;
    // Match to price list
    const priceOptions = PRICE_LIST.filter(p => p.name === selectedPeptide);
    const matchedPrice = priceOptions.find(p => p.mg === mg) || priceOptions[0];
    // Check inventory
    const invItem = inventory.find(i => i.name?.toLowerCase().includes(selectedPeptide?.toLowerCase()) || selectedPeptide?.toLowerCase().includes(i.name?.toLowerCase()));
    setResult({ mcgPerMl: mcgPerMl.toFixed(1), drawMl: drawMl.toFixed(3), drawUnits: drawUnits.toFixed(1), dosesPerVial, weeksPerVial: weeksPerVial.toFixed(1), pricePerVial: matchedPrice?.price, inStock: invItem ? Number(invItem.quantity) : null, invUnit: invItem?.unit || 'vials' });
  };

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => {
      const rem = MAX_FILES - prev.length;
      return [...prev, ...valid.slice(0, rem).map(f => ({ file: f, preview: URL.createObjectURL(f), id: Math.random().toString(36).slice(2) }))];
    });
    setAiResult(null); setAiError('');
  }, []);

  const removeImage = (id) => setImages(prev => { const i = prev.find(x => x.id===id); if(i) URL.revokeObjectURL(i.preview); return prev.filter(x => x.id!==id); });
  const onDrop = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); addFiles(e.dataTransfer.files); }, [addFiles]);
  const onDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);

  const analyzePhotos = async () => {
    if (!images.length) return;
    setAiLoading(true); setAiError(''); setAiResult(null);
    try {
      const imageData = await Promise.all(images.map(img => new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res({ base64: e.target.result.split(',')[1], type: img.file.type }); r.onerror = rej; r.readAsDataURL(img.file); })));
      const d = await (await fetch('/api/calculator-ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ images: imageData }) })).json();
      if (d.error) setAiError(d.error); else setAiResult(d.analysis);
    } catch(e) { setAiError(String(e)); }
    setAiLoading(false);
  };

  const sizeOptions = PRICE_LIST.filter(p => p.name === selectedPeptide);

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'960px'}}>
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Peptide Calculator</h1>
        <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Calculate dosages for your peptide inventory</p>
      </div>

      <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'4px',marginBottom:'24px',width:'fit-content'}}>
        {[['manual','🧮 Dosage Calculator'],['photo','📷 AI Photo Analysis']].map(([m,label])=>(
          <button key={m} onClick={()=>setMode(m)} style={{background:mode===m?'#0f0f0f':'transparent',color:mode===m?'#fff':'#6b7280',border:mode===m?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'7px',padding:'8px 18px',fontSize:'13px',fontWeight:mode===m?600:400,cursor:'pointer'}}>{label}</button>
        ))}
      </div>

      {mode==='manual' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 20px'}}>Setup</h3>

            <div style={{marginBottom:'14px'}}>
              <label style={lbl}>Peptide</label>
              <select value={selectedPeptide} onChange={e=>handlePeptideSelect(e.target.value)} style={{...inp,color:selectedPeptide?'#fff':'#4b5563'}}>
                <option value=''>Select peptide...</option>
                {PEPTIDE_NAMES.map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* If peptide has multiple sizes, show selector */}
            {sizeOptions.length > 1 && (
              <div style={{marginBottom:'14px'}}>
                <label style={lbl}>Vial Size</label>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {sizeOptions.map(opt=>(
                    <button key={opt.mg} onClick={()=>setVialMg(String(opt.mg))} style={{background:vialMg===String(opt.mg)?'rgba(26,79,168,0.3)':'#0f0f0f',border:`1px solid ${vialMg===String(opt.mg)?'#1a4fa8':'#2a2a2a'}`,borderRadius:'7px',padding:'7px 14px',color:vialMg===String(opt.mg)?'#f87171':'#9ca3af',fontSize:'13px',cursor:'pointer',fontWeight:vialMg===String(opt.mg)?700:400}}>
                      {opt.mg}mg — ${opt.price.toLocaleString()}/10
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'14px'}}>
              <div><label style={lbl}>Vial Amount (mg)</label><input type='number' placeholder='e.g. 10' value={vialMg} onChange={e=>setVialMg(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' placeholder='e.g. 2' value={reconMl} onChange={e=>setReconMl(e.target.value)} style={inp} /></div>
            </div>

            <div style={{marginBottom:'14px'}}>
              <label style={lbl}>Desired Dose (mcg)</label>
              <input type='number' placeholder='e.g. 250' value={doseMcg} onChange={e=>setDoseMcg(e.target.value)} style={inp} />
            </div>

            <div style={{marginBottom:'20px'}}>
              <label style={lbl}>Dosing Frequency</label>
              <select value={frequency} onChange={e=>setFrequency(e.target.value)} style={{...inp,color:'#fff'}}>
                <option value='daily'>Daily (7x/week)</option>
                <option value='twice-daily'>Twice Daily (14x/week)</option>
                <option value='every-other-day'>Every Other Day (3.5x/week)</option>
                <option value='3x-week'>3x per Week</option>
                <option value='weekly'>Once Weekly</option>
              </select>
            </div>

            <button onClick={calculate} disabled={!vialMg||!doseMcg} style={{width:'100%',background:vialMg&&doseMcg?'#1a4fa8':'#1a1a1a',color:vialMg&&doseMcg?'#fff':'#4b5563',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:vialMg&&doseMcg?'pointer':'not-allowed'}}>Calculate</button>
          </div>

          <div>
            {result ? (
              <div style={card}>
                <h3 style={{color:'#fff',fontSize:'15px',fontWeight:700,margin:'0 0 16px'}}>{selectedPeptide||'Result'} — {vialMg}mg vial</h3>
                <div style={{display:'flex',flexDirection:'column',gap:'0'}}>
                  {[
                    ['Concentration', result.mcgPerMl+' mcg/mL', '#60a5fa'],
                    ['Draw Volume', result.drawMl+' mL', '#34d399'],
                    ['Insulin Units', result.drawUnits+' IU', '#fbbf24'],
                    ['Doses Per Vial', result.dosesPerVial+' doses', '#a78bfa'],
                    ['Vial Lasts', result.weeksPerVial+' weeks', '#f9a8d4'],
                  ].map(([label,val,color])=>(
                    <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #222'}}>
                      <span style={{color:'#9ca3af',fontSize:'13px'}}>{label}</span>
                      <span style={{color,fontWeight:700,fontSize:'17px'}}>{val}</span>
                    </div>
                  ))}
                  {result.pricePerVial && (
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #222'}}>
                      <span style={{color:'#9ca3af',fontSize:'13px'}}>Distributor Price (pack/10)</span>
                      <span style={{color:'#34d399',fontWeight:700,fontSize:'17px'}}>${result.pricePerVial.toLocaleString()}</span>
                    </div>
                  )}
                  {result.inStock !== null && (
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}>
                      <span style={{color:'#9ca3af',fontSize:'13px'}}>In Stock</span>
                      <span style={{color:result.inStock>0?'#34d399':'#f87171',fontWeight:700,fontSize:'17px'}}>{result.inStock} {result.invUnit}</span>
                    </div>
                  )}
                </div>
                <div style={{marginTop:'14px',background:'rgba(26,79,168,0.1)',border:'1px solid rgba(26,79,168,0.2)',borderRadius:'10px',padding:'12px'}}>
                  <p style={{color:'#f9a8d4',fontSize:'12px',margin:0,lineHeight:1.6}}>
                    💉 Draw <strong>{result.drawUnits} IU</strong> ({result.drawMl} mL) for each {doseMcg} mcg dose.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{...card,minHeight:'300px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'14px'}}>💉</div>
                <p style={{color:'#4b5563',fontSize:'13px',margin:'0 0 8px'}}>Select a peptide and enter dosage</p>
                <p style={{color:'#374151',fontSize:'12px',margin:0}}>Results will show draw volume, inventory<br/>status, and pricing from your price list</p>
              </div>
            )}

            <div style={{...card,marginTop:'14px',background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
              <h4 style={{color:'#93c5fd',fontSize:'12px',fontWeight:600,margin:'0 0 8px'}}>📋 Quick Reference</h4>
              <div style={{color:'#4b5563',fontSize:'12px',lineHeight:1.8}}>
                <p style={{margin:'2px 0'}}>• 1 mL = 100 IU on insulin syringe</p>
                <p style={{margin:'2px 0'}}>• 1 mg = 1,000 mcg</p>
                <p style={{margin:'2px 0'}}>• BAC water: typically 1–3 mL per vial</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode==='photo' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 8px'}}>Upload Photos</h3>
            <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 16px',lineHeight:1.6}}>Upload up to {MAX_FILES} photos of peptide vials, labels, or dosing charts.</p>
            <div onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragOver} onDragLeave={onDragLeave} onClick={()=>images.length<MAX_FILES&&fileRef.current?.click()} style={{border:`2px dashed ${isDragging?'#1a4fa8':'#2a2a2a'}`,borderRadius:'12px',padding:'24px',textAlign:'center',cursor:images.length<MAX_FILES?'pointer':'default',marginBottom:'14px',background:isDragging?'rgba(26,79,168,0.08)':'rgba(255,255,255,0.01)',transition:'all 0.15s'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>📷</div>
              <p style={{color:isDragging?'#f87171':'#6b7280',fontSize:'13px',margin:'0 0 4px',fontWeight:isDragging?600:400}}>{isDragging?'Drop here':'Drag & drop or click to browse'}</p>
              <p style={{color:'#374151',fontSize:'11px',margin:0}}>{images.length}/{MAX_FILES} images</p>
            </div>
            <input ref={fileRef} type='file' accept='image/*' multiple onChange={e=>addFiles(e.target.files)} style={{display:'none'}} />
            {images.length>0&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(72px,1fr))',gap:'8px',marginBottom:'14px'}}>
                {images.map(img=>(
                  <div key={img.id} style={{position:'relative',borderRadius:'8px',overflow:'hidden',aspectRatio:'1',background:'#0f0f0f'}}>
                    <img src={img.preview} alt='' style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    <button onClick={e=>{e.stopPropagation();removeImage(img.id);}} style={{position:'absolute',top:'3px',right:'3px',background:'rgba(0,0,0,0.7)',border:'none',borderRadius:'50%',width:'20px',height:'20px',color:'#fff',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                  </div>
                ))}
                {images.length<MAX_FILES&&<div onClick={()=>fileRef.current?.click()} style={{borderRadius:'8px',border:'2px dashed #2a2a2a',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#4b5563',fontSize:'24px'}} onMouseOver={e=>e.currentTarget.style.borderColor='#1a4fa8'} onMouseOut={e=>e.currentTarget.style.borderColor='#2a2a2a'}>+</div>}
              </div>
            )}
            <button onClick={analyzePhotos} disabled={aiLoading||images.length===0} style={{width:'100%',background:!aiLoading&&images.length?'#1a4fa8':'#0d2d6b',color:!aiLoading&&images.length?'#fff':'#6b2d3e',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:!aiLoading&&images.length?'pointer':'not-allowed'}}>
              {aiLoading?'🤖 Analyzing...':images.length===0?'Upload images first':`🤖 Analyze ${images.length} Image${images.length>1?'s':''}`}
            </button>
          </div>
          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 16px'}}>AI Analysis</h3>
            {aiLoading&&<div style={{textAlign:'center',padding:'40px 0'}}><div style={{fontSize:'32px',marginBottom:'12px'}}>🤖</div><p style={{color:'#6b7280',fontSize:'13px'}}>Analyzing...</p></div>}
            {aiError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'12px',color:'#fca5a5',fontSize:'13px'}}>⚠️ {aiError}</div>}
            {aiResult&&<div style={{color:'#d1d5db',fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap',maxHeight:'500px',overflowY:'auto'}}>{aiResult}</div>}
            {!aiLoading&&!aiResult&&!aiError&&<div style={{textAlign:'center',padding:'40px 0',color:'#374151'}}><div style={{fontSize:'40px',marginBottom:'12px'}}>🔬</div><p style={{fontSize:'13px',margin:0}}>Upload images and analyze</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
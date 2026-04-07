// @ts-nocheck
'use client';
import { useState, useRef, useCallback } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'14px', padding:'24px' };
const PEPTIDES = ['BPC-157','TB-500','CJC-1295','Ipamorelin','Semaglutide','Tirzepatide','NAD+','Sermorelin','GHK-Cu','PT-141','Oxytocin','Custom'];
const MAX_FILES = 5;

export default function CalculatorPage() {
  const [mode,setMode]=useState('manual');
  const [peptide,setPeptide]=useState('BPC-157');
  const [customPeptide,setCustomPeptide]=useState('');
  const [vialMg,setVialMg]=useState('5');
  const [reconMl,setReconMl]=useState('2');
  const [doseMcg,setDoseMcg]=useState('250');
  const [result,setResult]=useState(null);
  // Multi-image state
  const [images,setImages]=useState([]); // [{file, preview}]
  const [isDragging,setIsDragging]=useState(false);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [aiError,setAiError]=useState('');
  const fileRef=useRef(null);

  const calculate = () => {
    const mg=parseFloat(vialMg), ml=parseFloat(reconMl), mcg=parseFloat(doseMcg);
    if(!mg||!ml||!mcg){setResult(null);return;}
    const mcgPerMl=(mg*1000)/ml;
    const drawMl=mcg/mcgPerMl;
    const drawUnits=drawMl*100;
    const doses=Math.floor((mg*1000)/mcg);
    setResult({mcgPerMl:mcgPerMl.toFixed(1),drawMl:drawMl.toFixed(3),drawUnits:drawUnits.toFixed(1),doses,peptideName:peptide==='Custom'?customPeptide:peptide});
  };

  const addFiles = useCallback((files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => {
      const remaining = MAX_FILES - prev.length;
      const toAdd = valid.slice(0, remaining).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).slice(2),
      }));
      return [...prev, ...toAdd];
    });
    setAiResult(null); setAiError('');
  }, []);

  const removeImage = (id) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if(img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onDragOver = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onFileChange = (e) => addFiles(e.target.files);

  const analyzePhotos = async () => {
    if(images.length===0) return;
    setAiLoading(true); setAiError(''); setAiResult(null);
    try {
      // Convert all images to base64
      const imageData = await Promise.all(images.map(img => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve({ base64: e.target.result.split(',')[1], type: img.file.type, name: img.file.name });
        reader.onerror = reject;
        reader.readAsDataURL(img.file);
      })));
      const res = await fetch('/api/calculator-ai', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ images: imageData }),
      });
      const d = await res.json();
      if(d.error) setAiError(d.error);
      else setAiResult(d.analysis);
    } catch(e) { setAiError(String(e)); }
    setAiLoading(false);
  };

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'900px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Peptide Calculator</h1>
        <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Accurately calculate peptide dosages and injection volumes</p>
      </div>

      {/* Mode tabs */}
      <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'4px',marginBottom:'24px',width:'fit-content'}}>
        {[['manual','🧮 Manual Calculator'],['photo','📷 AI Photo Analysis']].map(([m,label])=>(
          <button key={m} onClick={()=>setMode(m)} style={{background:mode===m?'#0f0f0f':'transparent',color:mode===m?'#fff':'#6b7280',border:mode===m?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'7px',padding:'8px 18px',fontSize:'13px',fontWeight:mode===m?600:400,cursor:'pointer'}}>{label}</button>
        ))}
      </div>

      {mode==='manual'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 20px'}}>Reconstitution Setup</h3>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Peptide</label>
              <select value={peptide} onChange={e=>setPeptide(e.target.value)} style={{...inp,color:'#fff'}}>{PEPTIDES.map(p=><option key={p} value={p}>{p}</option>)}</select>
            </div>
            {peptide==='Custom'&&<div style={{marginBottom:'14px'}}><label style={lbl}>Custom Name</label><input type='text' value={customPeptide} onChange={e=>setCustomPeptide(e.target.value)} style={inp} /></div>}
            <div style={{marginBottom:'14px'}}><label style={lbl}>Vial Amount (mg)</label><input type='number' value={vialMg} onChange={e=>setVialMg(e.target.value)} style={inp} /></div>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Bacteriostatic Water (mL)</label><input type='number' step='0.1' value={reconMl} onChange={e=>setReconMl(e.target.value)} style={inp} /></div>
            <div style={{marginBottom:'20px'}}><label style={lbl}>Desired Dose (mcg)</label><input type='number' value={doseMcg} onChange={e=>setDoseMcg(e.target.value)} style={inp} /></div>
            <button onClick={calculate} style={{width:'100%',background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>Calculate Dosage</button>
          </div>
          <div>
            {result?(
              <div style={card}>
                <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 6px'}}>{result.peptideName}</h3>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 20px'}}>Dosage calculation results</p>
                {[['Concentration',result.mcgPerMl+' mcg/mL','#60a5fa'],['Draw Volume',result.drawMl+' mL','#34d399'],['Insulin Syringe Units',result.drawUnits+' units (IU)','#fbbf24'],['Doses Per Vial',result.doses+' doses','#a78bfa']].map(([label,val,color])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #222'}}>
                    <span style={{color:'#9ca3af',fontSize:'13px'}}>{label}</span>
                    <span style={{color,fontWeight:700,fontSize:'18px'}}>{val}</span>
                  </div>
                ))}
                <div style={{marginTop:'16px',background:'rgba(123,28,46,0.1)',border:'1px solid rgba(123,28,46,0.25)',borderRadius:'10px',padding:'14px'}}>
                  <p style={{color:'#f9a8d4',fontSize:'12px',margin:0,lineHeight:1.6}}>💉 Draw <strong>{result.drawUnits} units</strong> on an insulin syringe for a <strong>{doseMcg} mcg</strong> dose of {result.peptideName}.</p>
                </div>
              </div>
            ):(
              <div style={{...card,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'300px',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div>
                <p style={{color:'#4b5563',fontSize:'13px',margin:0}}>Fill in the fields and click<br/>Calculate Dosage to see results</p>
              </div>
            )}
            <div style={{...card,marginTop:'16px',background:'rgba(59,130,246,0.05)',border:'1px solid rgba(59,130,246,0.15)'}}>
              <h4 style={{color:'#93c5fd',fontSize:'13px',fontWeight:600,margin:'0 0 10px'}}>📋 Quick Reference</h4>
              <div style={{color:'#4b5563',fontSize:'12px',lineHeight:1.8}}>
                <p style={{margin:'2px 0'}}>• <strong style={{color:'#6b7280'}}>1 mL</strong> = 100 units on insulin syringe</p>
                <p style={{margin:'2px 0'}}>• <strong style={{color:'#6b7280'}}>1 mg</strong> = 1000 mcg</p>
                <p style={{margin:'2px 0'}}>• Standard vial sizes: 2mg, 5mg, 10mg</p>
                <p style={{margin:'2px 0'}}>• Typical BAC water: 1–3 mL per vial</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode==='photo'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 8px'}}>Upload Peptide Photos</h3>
            <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 16px',lineHeight:1.6}}>Upload up to {MAX_FILES} photos of peptide vials, labels, or dosing charts. AI will analyze all images together.</p>

            {/* Drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onClick={()=>images.length<MAX_FILES&&fileRef.current?.click()}
              style={{
                border:`2px dashed ${isDragging?'#7b1c2e':'#2a2a2a'}`,
                borderRadius:'12px',
                padding:'24px',
                textAlign:'center',
                cursor:images.length<MAX_FILES?'pointer':'default',
                marginBottom:'14px',
                background:isDragging?'rgba(123,28,46,0.08)':'rgba(255,255,255,0.01)',
                transition:'all 0.15s',
              }}
            >
              <div style={{fontSize:'32px',marginBottom:'8px'}}>📷</div>
              <p style={{color:isDragging?'#f87171':'#6b7280',fontSize:'13px',margin:'0 0 4px',fontWeight:isDragging?600:400}}>
                {isDragging?'Drop images here':'Drag & drop images here, or click to browse'}
              </p>
              <p style={{color:'#374151',fontSize:'11px',margin:0}}>
                JPG, PNG, WEBP · {images.length}/{MAX_FILES} images
              </p>
            </div>
            <input ref={fileRef} type='file' accept='image/*' multiple onChange={onFileChange} style={{display:'none'}} />

            {/* Image previews */}
            {images.length>0&&(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:'8px',marginBottom:'14px'}}>
                {images.map(img=>(
                  <div key={img.id} style={{position:'relative',borderRadius:'8px',overflow:'hidden',aspectRatio:'1',background:'#0f0f0f'}}>
                    <img src={img.preview} alt='' style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    <button
                      onClick={(e)=>{e.stopPropagation();removeImage(img.id);}}
                      style={{position:'absolute',top:'3px',right:'3px',background:'rgba(0,0,0,0.7)',border:'none',borderRadius:'50%',width:'20px',height:'20px',color:'#fff',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}
                    >×</button>
                  </div>
                ))}
                {images.length<MAX_FILES&&(
                  <div
                    onClick={()=>fileRef.current?.click()}
                    style={{borderRadius:'8px',border:'2px dashed #2a2a2a',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#4b5563',fontSize:'24px'}}
                    onMouseOver={e=>e.currentTarget.style.borderColor='#7b1c2e'}
                    onMouseOut={e=>e.currentTarget.style.borderColor='#2a2a2a'}
                  >+</div>
                )}
              </div>
            )}

            <button
              onClick={analyzePhotos}
              disabled={aiLoading||images.length===0}
              style={{width:'100%',background:aiLoading||images.length===0?'#2d0e18':'#7b1c2e',color:aiLoading||images.length===0?'#6b2d3e':'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:aiLoading||images.length===0?'not-allowed':'pointer'}}
            >
              {aiLoading?'🤖 Analyzing...':images.length===0?'Upload images first':`🤖 Analyze ${images.length} Image${images.length>1?'s':''} with AI`}
            </button>
          </div>

          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 16px'}}>AI Analysis</h3>
            {aiLoading&&(
              <div style={{textAlign:'center',padding:'40px 0'}}>
                <div style={{fontSize:'32px',marginBottom:'14px'}}>🤖</div>
                <p style={{color:'#6b7280',fontSize:'13px'}}>Analyzing {images.length} image{images.length>1?'s':''} and calculating dosages...</p>
              </div>
            )}
            {aiError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'12px',color:'#fca5a5',fontSize:'13px',marginBottom:'12px'}}>⚠️ {aiError}</div>}
            {aiResult&&(
              <div style={{color:'#d1d5db',fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap',maxHeight:'500px',overflowY:'auto'}}>{aiResult}</div>
            )}
            {!aiLoading&&!aiResult&&!aiError&&(
              <div style={{textAlign:'center',padding:'40px 0',color:'#374151'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>🔬</div>
                <p style={{fontSize:'13px',margin:0}}>Upload images and click Analyze<br/>to get AI dosage recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
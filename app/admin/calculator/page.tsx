// @ts-nocheck
'use client';
import { useState, useRef } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'14px', padding:'24px' };

const PEPTIDES = ['BPC-157','TB-500','CJC-1295','Ipamorelin','Semaglutide','Tirzepatide','NAD+','Sermorelin','GHK-Cu','PT-141','Oxytocin','Custom'];

export default function CalculatorPage() {
  const [mode,setMode]=useState('manual');
  const [peptide,setPeptide]=useState('BPC-157');
  const [customPeptide,setCustomPeptide]=useState('');
  const [vialMg,setVialMg]=useState('5');
  const [reconMl,setReconMl]=useState('2');
  const [doseMcg,setDoseMcg]=useState('250');
  const [result,setResult]=useState(null);
  const [photo,setPhoto]=useState(null);
  const [photoPreview,setPhotoPreview]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResult,setAiResult]=useState(null);
  const [aiError,setAiError]=useState('');
  const fileRef=useRef(null);

  const calculate = () => {
    const mg=parseFloat(vialMg);
    const ml=parseFloat(reconMl);
    const mcg=parseFloat(doseMcg);
    if(!mg||!ml||!mcg){setResult(null);return;}
    const mcgPerMl=(mg*1000)/ml;
    const drawMl=mcg/mcgPerMl;
    const drawUnits=drawMl*100;
    const doses=Math.floor((mg*1000)/mcg);
    setResult({mcgPerMl:mcgPerMl.toFixed(1),drawMl:drawMl.toFixed(3),drawUnits:drawUnits.toFixed(1),doses,peptideName:peptide==='Custom'?customPeptide:peptide});
  };

  const handlePhoto = (e) => {
    const file=e.target.files[0];
    if(!file)return;
    setPhoto(file);
    const reader=new FileReader();
    reader.onload=ev=>setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setAiResult(null); setAiError('');
  };

  const analyzePhoto = async () => {
    if(!photo)return;
    setAiLoading(true); setAiError(''); setAiResult(null);
    try {
      const reader=new FileReader();
      reader.readAsDataURL(photo);
      reader.onload=async()=>{
        const b64=reader.result.split(',')[1];
        const res=await fetch('/api/calculator-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:b64,imageType:photo.type})});
        const d=await res.json();
        if(d.error) setAiError(d.error);
        else setAiResult(d.analysis);
        setAiLoading(false);
      };
    } catch(e){setAiError(String(e));setAiLoading(false);}
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
            {peptide==='Custom'&&<div style={{marginBottom:'14px'}}><label style={lbl}>Custom Name</label><input type='text' placeholder='e.g. GHRP-6' value={customPeptide} onChange={e=>setCustomPeptide(e.target.value)} style={inp} /></div>}
            <div style={{marginBottom:'14px'}}><label style={lbl}>Vial Amount (mg)</label>
              <input type='number' placeholder='e.g. 5' value={vialMg} onChange={e=>setVialMg(e.target.value)} style={inp} />
            </div>
            <div style={{marginBottom:'14px'}}><label style={lbl}>Bacteriostatic Water Added (mL)</label>
              <input type='number' step='0.1' placeholder='e.g. 2' value={reconMl} onChange={e=>setReconMl(e.target.value)} style={inp} />
            </div>
            <div style={{marginBottom:'20px'}}><label style={lbl}>Desired Dose (mcg)</label>
              <input type='number' placeholder='e.g. 250' value={doseMcg} onChange={e=>setDoseMcg(e.target.value)} style={inp} />
            </div>
            <button onClick={calculate} style={{width:'100%',background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>Calculate Dosage</button>
          </div>

          <div>
            {result?(
              <div style={card}>
                <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 6px'}}>{result.peptideName}</h3>
                <p style={{color:'#6b7280',fontSize:'12px',margin:'0 0 20px'}}>Dosage calculation results</p>
                {[
                  ['Concentration',result.mcgPerMl+' mcg/mL','#60a5fa'],
                  ['Draw Volume',result.drawMl+' mL','#34d399'],
                  ['Insulin Syringe Units',result.drawUnits+' units (IU)','#fbbf24'],
                  ['Doses Per Vial',result.doses+' doses','#a78bfa'],
                ].map(([label,val,color])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #222'}}>
                    <span style={{color:'#9ca3af',fontSize:'13px'}}>{label}</span>
                    <span style={{color,fontWeight:700,fontSize:'18px'}}>{val}</span>
                  </div>
                ))}
                <div style={{marginTop:'16px',background:'rgba(123,28,46,0.1)',border:'1px solid rgba(123,28,46,0.25)',borderRadius:'10px',padding:'14px'}}>
                  <p style={{color:'#f9a8d4',fontSize:'12px',margin:0,lineHeight:1.6}}>
                    💉 Draw <strong>{result.drawUnits} units</strong> on an insulin syringe for a <strong>{doseMcg} mcg</strong> dose of {result.peptideName}.
                  </p>
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
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 8px'}}>Upload Peptide Photo</h3>
            <p style={{color:'#6b7280',fontSize:'13px',margin:'0 0 20px',lineHeight:1.6}}>Upload a photo of a peptide vial label, prescription, or dosing chart. AI will analyze and suggest dosages.</p>
            <div onClick={()=>fileRef.current?.click()} style={{border:'2px dashed #2a2a2a',borderRadius:'12px',padding:'32px',textAlign:'center',cursor:'pointer',marginBottom:'16px',background:photoPreview?'transparent':'rgba(255,255,255,0.02)'}} onMouseOver={e=>e.currentTarget.style.borderColor='#7b1c2e'} onMouseOut={e=>e.currentTarget.style.borderColor='#2a2a2a'}>
              {photoPreview?(
                <img src={photoPreview} alt='Uploaded' style={{maxWidth:'100%',maxHeight:'200px',borderRadius:'8px',objectFit:'contain'}} />
              ):(
                <><div style={{fontSize:'40px',marginBottom:'12px'}}>📷</div><p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Click to upload or drag & drop<br/><span style={{color:'#374151',fontSize:'12px'}}>JPG, PNG, WEBP</span></p></>
              )}
            </div>
            <input ref={fileRef} type='file' accept='image/*' onChange={handlePhoto} style={{display:'none'}} />
            {photoPreview&&(
              <button onClick={analyzePhoto} disabled={aiLoading} style={{width:'100%',background:aiLoading?'#2d0e18':'#7b1c2e',color:aiLoading?'#6b2d3e':'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:aiLoading?'not-allowed':'pointer'}}>
                {aiLoading?'🤖 Analyzing...':'🤖 Analyze with AI'}
              </button>
            )}
          </div>

          <div style={card}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 16px'}}>AI Analysis</h3>
            {aiLoading&&(
              <div style={{textAlign:'center',padding:'40px 0'}}>
                <div style={{fontSize:'32px',marginBottom:'14px'}}>🤖</div>
                <p style={{color:'#6b7280',fontSize:'13px'}}>Analyzing image and calculating dosages...</p>
              </div>
            )}
            {aiError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'12px',color:'#fca5a5',fontSize:'13px'}}>⚠️ {aiError}</div>}
            {aiResult&&(
              <div style={{color:'#d1d5db',fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{aiResult}</div>
            )}
            {!aiLoading&&!aiResult&&!aiError&&(
              <div style={{textAlign:'center',padding:'40px 0',color:'#374151'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>🔬</div>
                <p style={{fontSize:'13px',margin:0}}>Upload a photo and click Analyze<br/>to get AI dosage recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
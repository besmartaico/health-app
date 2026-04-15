// @ts-nocheck
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' };

function RichTextArea({ value, onChange, placeholder, minHeight, id }) {
  const ref = useRef(null);
  const insert = useCallback((before, after, sample) => {
    const el = ref.current; if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = el.value.substring(s,e)||(sample||'');
    const nv = el.value.substring(0,s)+before+sel+(after||'')+el.value.substring(e);
    onChange(nv);
    setTimeout(()=>{ el.focus(); const p=s+before.length+sel.length+(after||'').length; el.setSelectionRange(p,p); },0);
  },[onChange]);
  const insertLine = useCallback((prefix)=>{
    const el = ref.current; if (!el) return;
    const s = el.selectionStart;
    const ls = el.value.substring(0,s).lastIndexOf('\n')+1;
    onChange(el.value.substring(0,ls)+prefix+el.value.substring(ls));
    setTimeout(()=>{ el.focus(); el.setSelectionRange(s+prefix.length,s+prefix.length); },0);
  },[onChange]);
  const btn = c => ({ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'6px', color:c||'#6b7280', fontSize:'12px', fontWeight:700, padding:'4px 8px', cursor:'pointer', lineHeight:1.2, whiteSpace:'nowrap' });
  return (
    <div>
      <div style={{display:'flex',gap:'4px',flexWrap:'wrap',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px 8px 0 0',padding:'6px 8px',borderBottom:'1px solid #1a1a1a'}}>
        <button type='button' style={btn('#93c5fd')} onClick={()=>insert('**','**','bold')}>B</button>
        <button type='button' style={{...btn('#d1d5db'),fontStyle:'italic'}} onClick={()=>insert('*','*','italic')}>I</button>
        <button type='button' style={btn('#d1d5db')} onClick={()=>insert('__','__','underline')}>U̲</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}}/>
        <button type='button' style={btn('#34d399')} onClick={()=>insertLine('• ')}>• Bullet</button>
        <button type='button' style={btn('#fbbf24')} onClick={()=>insertLine('1. ')}>1. List</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}}/>
        <button type='button' style={btn('#a78bfa')} onClick={()=>insertLine('## ')}>## Heading</button>
        <button type='button' style={btn()} onClick={()=>insert('\n---\n')}>― Divider</button>
      </div>
      <textarea ref={ref} id={id} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{...inp,minHeight:minHeight||'160px',resize:'vertical',fontFamily:'monospace',fontSize:'13px',lineHeight:1.7,borderRadius:'0 0 8px 8px',borderTop:'none'}}/>
      <div style={{fontSize:'10px',color:'#374151',marginTop:'3px',display:'flex',gap:'12px',flexWrap:'wrap'}}><span>**bold**</span><span>*italic*</span><span>• bullet</span><span>## heading</span></div>
    </div>
  );
}

function SearchableDropdown({ options, value, onChange, placeholder, instrMap }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  useEffect(()=>{ const h=e=>{ if(ref.current&&!ref.current.contains(e.target))setOpen(false); }; document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h); },[]);
  const filtered = options.filter(o=>o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div ref={ref} style={{position:'relative'}}>
      <div onClick={()=>setOpen(v=>!v)} style={{...inp,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{color:value?'#fff':'#4b5563',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{value||placeholder||'Select...'}</span>
        <span style={{color:'#4b5563',fontSize:'11px',marginLeft:'8px',flexShrink:0}}>{open?'▲':'▼'}</span>
      </div>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',zIndex:100,boxShadow:'0 8px 24px rgba(0,0,0,0.6)',overflow:'hidden'}}>
          <div style={{padding:'8px'}}><input autoFocus type='text' placeholder='Search...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,fontSize:'13px',padding:'8px 12px'}} onClick={e=>e.stopPropagation()}/></div>
          <div style={{maxHeight:'220px',overflowY:'auto'}}>
            {filtered.length===0?<div style={{padding:'12px 16px',color:'#4b5563',fontSize:'13px'}}>No matches</div>
            :filtered.map(o=>(
              <div key={o} onClick={()=>{onChange(o);setOpen(false);setSearch('');}}
                style={{padding:'10px 16px',fontSize:'13px',color:o===value?'#fff':'#9ca3af',background:o===value?'rgba(26,79,168,0.25)':'transparent',cursor:'pointer',borderLeft:o===value?'2px solid #1a4fa8':'2px solid transparent',display:'flex',alignItems:'center',justifyContent:'space-between'}}
                onMouseOver={e=>{if(o!==value)e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
                onMouseOut={e=>{if(o!==value)e.currentTarget.style.background='transparent';}}
              >
                <span>{o}</span>
                {instrMap&&instrMap[o]?.text&&<span style={{fontSize:'10px',color:'#34d399',marginLeft:'6px'}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstructionsPage() {
  const [peptides, setPeptides] = useState([]);
  const [hiddenPeptides, setHiddenPeptides] = useState(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [selected, setSelected] = useState('');
  const [instructions, setInstructions] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [unsaved, setUnsaved] = useState(new Set());
  const [loadingData, setLoadingData] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planPatient, setPlanPatient] = useState('');
  const [planEmail, setPlanEmail] = useState('');
  const [planVialMg, setPlanVialMg] = useState('');
  const [planReconMl, setPlanReconMl] = useState('2');
  const [planDoseUnits, setPlanDoseUnits] = useState('');
  const [planFreq, setPlanFreq] = useState('');
  const [planText, setPlanText] = useState('');
  const [planSideEffects, setPlanSideEffects] = useState('');
  const [planStorage, setPlanStorage] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  const loadInstructions = async () => {
    setLoadingData(true);
    try {
      const [purchRes, instrRes] = await Promise.all([
        fetch('/api/purchases').then(r=>r.json()),
        fetch('/api/instructions').then(r=>r.json()),
      ]);
      const names = [...new Set((purchRes.purchases||[]).map(p=>p.item).filter(Boolean))].sort();
      setPeptides(names);
      const raw = instrRes.instructions || {};
      const map = {};
      Object.entries(raw).forEach(([peptide, val]) => {
        if (typeof val === 'object' && val !== null) {
          map[peptide] = { peptide, ...val };
        } else if (typeof val === 'string') {
          map[peptide] = { peptide, text: val };
        }
      });
      setInstructions(map);
      setUnsaved(new Set()); // clear unsaved markers after fresh load
    } catch(e) { console.error('load failed:', e); }
    setLoadingData(false);
  };

  useEffect(() => {
    loadInstructions();
    if (peptides.length === 0) {} // will be set above
    try {
      const h = JSON.parse(localStorage.getItem('hiddenPeptides')||'[]');
      setHiddenPeptides(new Set(h));
    } catch {}
  }, []);

  const toggleHide = name => {
    setHiddenPeptides(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      localStorage.setItem('hiddenPeptides', JSON.stringify([...next]));
      return next;
    });
  };

  const currentInstr = instructions[selected] || {};

  const setField = (field, val) => {
    setInstructions(prev => ({
      ...prev,
      [selected]: { ...(prev[selected]||{peptide:selected}), [field]: val }
    }));
    setUnsaved(prev => new Set([...prev, selected]));
  };

  const saveInstructions = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', peptide: selected, data: instructions[selected] || {} })
      });
      const d = await res.json();
      if (d.error) { setToast('Error: '+d.error); setToastErr(true); }
      else {
        setToast('Saved to sheet!'); setToastErr(false);
        setUnsaved(prev => { const n = new Set(prev); n.delete(selected); return n; });
      }
    } catch(e) { setToast('Error: '+e); setToastErr(true); }
    setSaving(false);
    setTimeout(() => setToast(''), 3000);
  };

  const calcMcg = (units, vialMg, reconMl) => {
    const mg = parseFloat(vialMg), ml = parseFloat(reconMl), u = parseFloat(units);
    if (!mg||!ml||!u) return null;
    return ((u/100)*(mg*1000/ml)).toFixed(0);
  };

  const openPlanModal = () => {
    const instr = instructions[selected] || {};
    setPlanVialMg(instr.vialMg || '');
    setPlanReconMl(instr.reconMl || '2');
    setPlanDoseUnits(instr.defaultDose || '');
    setPlanFreq(instr.defaultFreq || '');
    setPlanText(instr.text || '');
    setPlanSideEffects(instr.sideEffects || '');
    setPlanStorage(instr.storage || '');
    setPlanNotes('');
    setPlanPatient('');
    setPlanEmail('');
    setSendResult('');
    setShowPlanModal(true);
  };

  const sendPlan = async () => {
    if (!planPatient || !planEmail) return;
    setSending(true); setSendResult('');
    const mcg = calcMcg(planDoseUnits, planVialMg, planReconMl);
    try {
      const res = await fetch('/api/send-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: planPatient, email: planEmail, peptide: selected,
          frequency: planFreq,
          dose: planDoseUnits ? planDoseUnits+' units'+(mcg?' ('+mcg+' mcg)':'') : '',
          vialMg: planVialMg, reconMl: planReconMl,
          units: planDoseUnits, mcg: mcg||'',
          notes: planNotes,
          instructions: planText,
          sideEffects: planSideEffects,
          storage: planStorage,
        })
      });
      const d = await res.json();
      setSendResult(d.success ? 'sent' : 'error:'+(d.error||'Error'));
    } catch(e) { setSendResult('error:'+e); }
    setSending(false);
  };

  const visiblePeptides = peptides.filter(n => !hiddenPeptides.has(n));
  const planMcg = calcMcg(planDoseUnits, planVialMg, planReconMl);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:200,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* Sidebar */}
      <div style={{width:'240px',flexShrink:0,background:'#111',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #1a1a1a'}}>
          <h2 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:'0 0 12px'}}>Peptide Instructions</h2>
          <SearchableDropdown options={visiblePeptides} value={selected} onChange={setSelected} placeholder='Select peptide...' instrMap={instructions}/>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {peptides.length===0&&<p style={{color:'#374151',fontSize:'12px',padding:'12px 16px'}}>No purchases yet.</p>}
          {visiblePeptides.map(name=>(
            <div key={name} style={{display:'flex',alignItems:'center',borderLeft:name===selected?'2px solid #1a4fa8':'2px solid transparent'}}>
              <button onClick={()=>setSelected(name)}
                style={{flex:1,textAlign:'left',padding:'10px 14px',background:name===selected?'rgba(26,79,168,0.18)':'transparent',color:name===selected?'#fff':'#9ca3af',border:'none',fontSize:'13px',fontWeight:name===selected?600:400,cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'6px'}}
                onMouseOver={e=>{if(name!==selected){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#d1d5db';}}}
                onMouseOut={e=>{if(name!==selected){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9ca3af';}}}
              >
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{name}</span>
                {instructions[name]?.text&&<span style={{fontSize:'10px',color:'#34d399',flexShrink:0}}>✓</span>}
              </button>
              <button onClick={()=>toggleHide(name)} title='Hide' style={{background:'transparent',border:'none',color:'#1f1f1f',cursor:'pointer',fontSize:'13px',padding:'10px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='#6b7280'} onMouseOut={e=>e.currentTarget.style.color='#1f1f1f'}>👁</button>
            </div>
          ))}
          {hiddenPeptides.size>0&&(
            <div style={{padding:'8px 16px',borderTop:'1px solid #1a1a1a',marginTop:'4px'}}>
              <button onClick={()=>setShowHidden(v=>!v)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'11px',cursor:'pointer',textDecoration:'underline',padding:0}}>{showHidden?'Hide':'Show'} {hiddenPeptides.size} hidden</button>
              {showHidden&&[...hiddenPeptides].map(name=>(
                <div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0'}}>
                  <button onClick={()=>setSelected(name)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'12px',cursor:'pointer',flex:1,textAlign:'left'}}>{name}</button>
                  <button onClick={()=>toggleHide(name)} style={{background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'11px',padding:'0 0 0 6px'}}>↩</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,padding:'24px',overflowY:'auto',minWidth:0}}>
        {!selected?(
          <div style={{textAlign:'center',padding:'80px',color:'#4b5563'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div><p>Select a peptide from the list</p></div>
        ):(
          <div style={{maxWidth:'800px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>{selected}</h1>
                <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>All fields save to Google Sheets</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                {unsaved.has(selected)&&<span style={{fontSize:'10px',color:'#fbbf24',fontWeight:700,background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'4px',padding:'2px 6px'}}>UNSAVED</span>}
                <button onClick={loadInstructions} disabled={loadingData} title='Reload data from Google Sheet' style={{background:'rgba(255,255,255,0.04)',color:loadingData?'#374151':'#6b7280',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'10px 14px',fontSize:'13px',cursor:loadingData?'not-allowed':'pointer'}}>{loadingData?'⟳':'⟳'}</button>
                <button onClick={openPlanModal} style={{background:'rgba(16,185,129,0.1)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'9px',padding:'10px 18px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>📧 Generate Plan</button>
                <button onClick={saveInstructions} disabled={saving} style={{background:saving?'#0d2d6b':'#1a4fa8',color:saving?'#1a3a7a':'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>{saving?'Saving...':'Save'}</button>
              </div>
            </div>

            {/* Reconstitution */}
            <div style={{...card,marginBottom:'14px',background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
              <h3 style={{color:'#93c5fd',fontSize:'13px',fontWeight:700,margin:'0 0 12px'}}>⚗️ Reconstitution</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Vial Amount (mg)</label><input type='number' placeholder='e.g. 10' value={currentInstr.vialMg||''} onChange={e=>setField('vialMg',e.target.value)} style={inp}/></div>
                <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' placeholder='e.g. 2' value={currentInstr.reconMl||''} onChange={e=>setField('reconMl',e.target.value)} style={inp}/></div>
              </div>
              {currentInstr.vialMg&&currentInstr.reconMl&&(
                <div style={{marginTop:'10px',fontSize:'12px',color:'#60a5fa'}}>
                  {((parseFloat(currentInstr.vialMg)*1000)/parseFloat(currentInstr.reconMl)).toFixed(0)} mcg/mL
                  {' · '}1 unit = {((parseFloat(currentInstr.vialMg)*1000)/(parseFloat(currentInstr.reconMl)*100)).toFixed(1)} mcg
                </div>
              )}
            </div>

            {/* Default Dosing - frequency is now a free text input */}
            <div style={{...card,marginBottom:'14px',background:'rgba(99,102,241,0.04)',border:'1px solid rgba(99,102,241,0.15)'}}>
              <h3 style={{color:'#818cf8',fontSize:'13px',fontWeight:700,margin:'0 0 4px'}}>📅 Default Dosing</h3>
              <p style={{color:'#4b5563',fontSize:'12px',margin:'0 0 12px'}}>Pre-fills the Generate Plan modal automatically.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={lbl}>Default Frequency</label>
                  <input type='text' placeholder='e.g. Weekly, Twice Daily, Mon/Wed/Fri...' value={currentInstr.defaultFreq||''} onChange={e=>setField('defaultFreq',e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>Default Dose (units)</label>
                  <div style={{position:'relative'}}>
                    <input type='number' step='0.5' placeholder='e.g. 10' value={currentInstr.defaultDose||''} onChange={e=>setField('defaultDose',e.target.value)} style={{...inp,paddingRight:'50px'}}/>
                    <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'11px',pointerEvents:'none'}}>units</span>
                  </div>
                  {currentInstr.defaultDose&&currentInstr.vialMg&&currentInstr.reconMl&&(
                    <div style={{marginTop:'4px',fontSize:'11px',color:'#818cf8'}}>
                      = {((parseFloat(currentInstr.defaultDose)/100)*(parseFloat(currentInstr.vialMg)*1000/parseFloat(currentInstr.reconMl))).toFixed(0)} mcg
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Instructions */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Patient Instructions</label>
              <RichTextArea id='instr-text' value={currentInstr.text||''} onChange={val=>setField('text',val)} placeholder={'Instructions for '+selected+'...'} minHeight='180px'/>
            </div>

            {/* Side Effects */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Side Effects &amp; Notes</label>
              <RichTextArea id='instr-side' value={currentInstr.sideEffects||''} onChange={val=>setField('sideEffects',val)} placeholder='• Common side effect 1' minHeight='120px'/>
            </div>

            {/* Storage */}
            <div style={card}>
              <label style={lbl}>Storage</label>
              <input type='text' value={currentInstr.storage||''} onChange={e=>setField('storage',e.target.value)} placeholder='e.g. Refrigerate after reconstitution. Use within 28 days.' style={inp}/>
            </div>
          </div>
        )}
      </div>

      {/* Generate Plan Modal */}
      {showPlanModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'20px',width:'100%',maxWidth:'640px',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'22px 28px 16px',borderBottom:'1px solid #2a2a2a',position:'sticky',top:0,background:'#1a1a1a',borderRadius:'20px 20px 0 0',zIndex:1}}>
              <div>
                <h2 style={{color:'#fff',fontSize:'18px',fontWeight:800,margin:'0 0 2px'}}>Generate Patient Plan</h2>
                <p style={{color:'#4b5563',fontSize:'12px',margin:0}}>{selected} · Edit any field before sending</p>
              </div>
              <button onClick={()=>{setShowPlanModal(false);setSendResult('');}} style={{background:'transparent',border:'none',color:'#6b7280',fontSize:'28px',cursor:'pointer',lineHeight:1,padding:'4px'}}>×</button>
            </div>
            <div style={{padding:'24px 28px'}}>
              {/* Patient */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <h3 style={{color:'#9ca3af',fontSize:'12px',fontWeight:700,margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Patient Details</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div><label style={lbl}>Name *</label><input type='text' placeholder='Patient name' value={planPatient} onChange={e=>setPlanPatient(e.target.value)} style={inp} autoFocus/></div>
                  <div><label style={lbl}>Email *</label><input type='email' placeholder='patient@email.com' value={planEmail} onChange={e=>setPlanEmail(e.target.value)} style={inp}/></div>
                </div>
              </div>
              {/* Dosing */}
              <div style={{background:'rgba(99,102,241,0.04)',border:'1px solid rgba(99,102,241,0.15)',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <h3 style={{color:'#818cf8',fontSize:'12px',fontWeight:700,margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Dosing</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                  <div><label style={lbl}>Frequency</label><input type='text' placeholder='e.g. Weekly' value={planFreq} onChange={e=>setPlanFreq(e.target.value)} style={inp}/></div>
                  <div>
                    <label style={lbl}>Dose (units)</label>
                    <div style={{position:'relative'}}>
                      <input type='number' step='0.5' placeholder='e.g. 10' value={planDoseUnits} onChange={e=>setPlanDoseUnits(e.target.value)} style={{...inp,paddingRight:'46px'}}/>
                      <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'11px',pointerEvents:'none'}}>units</span>
                    </div>
                    {planMcg&&<div style={{marginTop:'3px',fontSize:'11px',color:'#818cf8'}}>{planMcg} mcg</div>}
                  </div>
                  <div><label style={lbl}>Vial Size (mg)</label><input type='number' placeholder='e.g. 10' value={planVialMg} onChange={e=>setPlanVialMg(e.target.value)} style={inp}/></div>
                  <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' value={planReconMl} onChange={e=>setPlanReconMl(e.target.value)} style={inp}/></div>
                </div>
              </div>
              {/* Instructions */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <label style={{...lbl,marginBottom:'8px',fontSize:'12px'}}>Patient Instructions</label>
                <textarea value={planText} onChange={e=>setPlanText(e.target.value)} placeholder='Patient instructions...' style={{...inp,minHeight:'100px',resize:'vertical',fontFamily:'monospace',fontSize:'12px',lineHeight:1.6}}/>
              </div>
              {/* Side Effects */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <label style={{...lbl,marginBottom:'8px',fontSize:'12px'}}>Side Effects &amp; Notes</label>
                <textarea value={planSideEffects} onChange={e=>setPlanSideEffects(e.target.value)} placeholder='Side effects...' style={{...inp,minHeight:'80px',resize:'vertical',fontFamily:'monospace',fontSize:'12px',lineHeight:1.6}}/>
              </div>
              {/* Storage + Notes */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                <div><label style={lbl}>Storage</label><input type='text' value={planStorage} onChange={e=>setPlanStorage(e.target.value)} placeholder='Storage instructions...' style={inp}/></div>
                <div><label style={lbl}>Extra Notes for Patient</label><input type='text' value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder='Specific to this patient...' style={inp}/></div>
              </div>
              {sendResult===''&&(
                <button onClick={sendPlan} disabled={sending||!planPatient||!planEmail}
                  style={{width:'100%',background:planPatient&&planEmail&&!sending?'#1a4fa8':'#0d2d6b',color:planPatient&&planEmail&&!sending?'#fff':'#1a3a7a',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:700,cursor:planPatient&&planEmail&&!sending?'pointer':'not-allowed'}}>
                  {sending?'Sending...':'📧 Send Plan to Patient'}
                </button>
              )}
              {sendResult==='sent'&&(
                <div style={{textAlign:'center',padding:'24px'}}>
                  <div style={{fontSize:'40px',marginBottom:'10px'}}>✅</div>
                  <div style={{color:'#34d399',fontWeight:700,fontSize:'16px',marginBottom:'6px'}}>Plan sent!</div>
                  <div style={{color:'#6b7280',fontSize:'13px',marginBottom:'20px'}}>{planEmail}</div>
                  <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
                    <button onClick={()=>{setPlanPatient('');setPlanEmail('');setSendResult('');}} style={{background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 20px',fontSize:'13px',cursor:'pointer'}}>Send Another</button>
                    <button onClick={()=>{setShowPlanModal(false);setSendResult('');}} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>Done</button>
                  </div>
                </div>
              )}
              {sendResult.startsWith('error')&&(
                <div>
                  <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'12px',marginBottom:'12px',color:'#f87171',fontSize:'13px'}}>⚠ {sendResult.replace('error:','')}</div>
                  <button onClick={sendPlan} disabled={sending} style={{width:'100%',background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>Retry</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
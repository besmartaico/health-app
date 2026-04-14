// @ts-nocheck
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' };
const FREQS = ['Daily','Twice Daily','Every Other Day','3x Per Week','Weekly','As Needed'];

// ── Rich Text Toolbar ──
function RichTextArea({ value, onChange, placeholder, minHeight = '160px', id }) {
  const ref = useRef(null);
  const insert = useCallback((before, after = '', sample = '') => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const selected = el.value.substring(start, end) || sample;
    const newVal = el.value.substring(0, start) + before + selected + after + el.value.substring(end);
    onChange(newVal);
    setTimeout(() => { el.focus(); const p = start + before.length + selected.length + after.length; el.setSelectionRange(p,p); }, 0);
  }, [onChange]);
  const insertLine = useCallback((prefix) => {
    const el = ref.current; if (!el) return;
    const start = el.selectionStart;
    const lineStart = el.value.substring(0, start).lastIndexOf('\n') + 1;
    onChange(el.value.substring(0, lineStart) + prefix + el.value.substring(lineStart));
    setTimeout(() => { el.focus(); el.setSelectionRange(start + prefix.length, start + prefix.length); }, 0);
  }, [onChange]);
  const btn = (color='#6b7280') => ({ background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'6px', color, fontSize:'12px', fontWeight:700, padding:'4px 8px', cursor:'pointer', lineHeight:1.2, whiteSpace:'nowrap' });
  return (
    <div>
      <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'0',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px 8px 0 0',padding:'6px 8px',borderBottom:'1px solid #1a1a1a'}}>
        <button type='button' style={btn('#93c5fd')} onClick={()=>insert('**','**','bold')}>B</button>
        <button type='button' style={{...btn('#d1d5db'),fontStyle:'italic'}} onClick={()=>insert('*','*','italic')}>I</button>
        <button type='button' style={btn('#d1d5db')} onClick={()=>insert('__','__','underline')}>U̲</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}}/>
        <button type='button' style={btn('#34d399')} onClick={()=>insertLine('• ')}>• Bullet</button>
        <button type='button' style={btn('#fbbf24')} onClick={()=>insertLine('1. ')}>1. List</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}}/>
        <button type='button' style={btn('#a78bfa')} onClick={()=>insertLine('## ')}>## Heading</button>
        <button type='button' style={btn('#6b7280')} onClick={()=>insert('\n---\n')}>― Divider</button>
      </div>
      <textarea ref={ref} id={id} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{...inp,minHeight,resize:'vertical',fontFamily:'monospace',fontSize:'13px',lineHeight:1.7,borderRadius:'0 0 8px 8px',borderTop:'none'}}/>
      <div style={{fontSize:'10px',color:'#374151',marginTop:'3px',display:'flex',gap:'12px',flexWrap:'wrap'}}>
        <span>**bold**</span><span>*italic*</span><span>• bullet</span><span>## heading</span>
      </div>
      {/* ── GENERATE PLAN MODAL ── */}
      {showPlanModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'20px',width:'100%',maxWidth:'640px',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,0.6)'}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 28px 16px',borderBottom:'1px solid #2a2a2a',position:'sticky',top:0,background:'#1a1a1a',borderRadius:'20px 20px 0 0',zIndex:1}}>
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
                  <div>
                    <label style={lbl}>Frequency</label>
                    <select value={planFreq} onChange={e=>setPlanFreq(e.target.value)} style={{...inp,color:planFreq?'#fff':'#4b5563'}}>
                      <option value=''>Select...</option>
                      {FREQS.map(f=><option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Dose (units)</label>
                    <div style={{position:'relative'}}>
                      <input type='number' step='0.5' placeholder='e.g. 10' value={planDoseUnits} onChange={e=>setPlanDoseUnits(e.target.value)} style={{...inp,paddingRight:'46px'}}/>
                      <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'11px',pointerEvents:'none'}}>units</span>
                    </div>
                    {calcMcg(planDoseUnits,planVialMg,planReconMl)&&<div style={{marginTop:'3px',fontSize:'11px',color:'#818cf8'}}>{calcMcg(planDoseUnits,planVialMg,planReconMl)} mcg</div>}
                  </div>
                  <div><label style={lbl}>Vial Size (mg)</label><input type='number' placeholder='e.g. 10' value={planVialMg} onChange={e=>setPlanVialMg(e.target.value)} style={inp}/></div>
                  <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' value={planReconMl} onChange={e=>setPlanReconMl(e.target.value)} style={inp}/></div>
                </div>
              </div>

              {/* Patient Instructions */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <label style={{...lbl,marginBottom:'8px',fontSize:'12px'}}>Patient Instructions</label>
                <textarea value={planText} onChange={e=>setPlanText(e.target.value)} placeholder='Patient instructions...' style={{...inp,minHeight:'100px',resize:'vertical',fontFamily:'monospace',fontSize:'12px',lineHeight:1.6}}/>
              </div>

              {/* Side Effects */}
              <div style={{background:'rgba(255,255,255,0.02)',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'16px',marginBottom:'14px'}}>
                <label style={{...lbl,marginBottom:'8px',fontSize:'12px'}}>Side Effects &amp; Notes</label>
                <textarea value={planSideEffects} onChange={e=>setPlanSideEffects(e.target.value)} placeholder='Side effects and notes...' style={{...inp,minHeight:'80px',resize:'vertical',fontFamily:'monospace',fontSize:'12px',lineHeight:1.6}}/>
              </div>

              {/* Storage & Extra Notes */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'20px'}}>
                <div><label style={lbl}>Storage</label><input type='text' value={planStorage} onChange={e=>setPlanStorage(e.target.value)} placeholder='Storage instructions...' style={inp}/></div>
                <div><label style={lbl}>Extra Notes for Patient</label><input type='text' value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder='Specific to this patient...' style={inp}/></div>
              </div>

              {/* Send button */}
              {sendResult===''&&(
                <button onClick={sendPlan} disabled={sending||!planPatient||!planEmail}
                  style={{width:'100%',background:planPatient&&planEmail&&!sending?'#7b1c2e':'#2d0e18',color:planPatient&&planEmail&&!sending?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'14px',fontSize:'15px',fontWeight:700,cursor:planPatient&&planEmail&&!sending?'pointer':'not-allowed'}}>
                  {sending?'Sending...':'📧 Send Plan to Patient'}
                </button>
              )}
              {sendResult.startsWith('sent')&&(
                <div style={{textAlign:'center',padding:'24px'}}>
                  <div style={{fontSize:'40px',marginBottom:'10px'}}>✅</div>
                  <div style={{color:'#34d399',fontWeight:700,fontSize:'16px',marginBottom:'6px'}}>Plan sent successfully!</div>
                  <div style={{color:'#6b7280',fontSize:'13px',marginBottom:'20px'}}>{planEmail}</div>
                  <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
                    <button onClick={()=>{setPlanPatient('');setPlanEmail('');setSendResult('');}} style={{background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 20px',fontSize:'13px',cursor:'pointer'}}>Send Another</button>
                    <button onClick={()=>{setShowPlanModal(false);setSendResult('');}} style={{background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'8px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>Done</button>
                  </div>
                </div>
              )}
              {sendResult.startsWith('error')&&(
                <div>
                  <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:'8px',padding:'12px',marginBottom:'12px',color:'#f87171',fontSize:'13px'}}>{sendResult.replace('error:','⚠ ')}</div>
                  <button onClick={sendPlan} disabled={sending} style={{width:'100%',background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer'}}>Retry</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Searchable Dropdown ──
function SearchableDropdown({ options, value, onChange, placeholder, instrMap }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
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
                style={{padding:'10px 16px',fontSize:'13px',color:o===value?'#fff':'#9ca3af',background:o===value?'rgba(123,28,46,0.25)':'transparent',cursor:'pointer',borderLeft:o===value?'2px solid #7b1c2e':'2px solid transparent',display:'flex',alignItems:'center',justifyContent:'space-between'}}
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

// ── Main Page ──
export default function InstructionsPage() {
  const [tab, setTab] = useState('instructions');
  const [peptides, setPeptides] = useState([]);
  const [hiddenPeptides, setHiddenPeptides] = useState(new Set());
  const [selected, setSelected] = useState('');
  const [instructions, setInstructions] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [unsaved, setUnsaved] = useState(new Set());
  const [showPlanModal, setShowPlanModal] = useState(false);
  // Plan modal fields — pre-filled from peptide defaults, all editable
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
  // Patient plan fields
  const [planPatient, setPlanPatient] = useState('');
  const [planEmail, setPlanEmail] = useState('');
  const [planPeptide, setPlanPeptide] = useState('');
  const [planVialMg, setPlanVialMg] = useState('');
  const [planReconMl, setPlanReconMl] = useState('2');
  const [planDoseUnits, setPlanDoseUnits] = useState('');
  const [planFreq, setPlanFreq] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [planResult, setPlanResult] = useState('');

  useEffect(() => {
    fetch('/api/purchases').then(r=>r.json()).then(d => {
      const names = [...new Set((d.purchases||[]).map(p=>p.item).filter(Boolean))].sort();
      setPeptides(names);
      if (names.length > 0) setSelected(names[0]);
    });
    fetch('/api/instructions').then(r=>r.json()).then(d => {
      const raw = d.instructions || {};
      const map = {};
      if (Array.isArray(raw)) {
        raw.forEach(i => { map[i.peptide] = i; });
      } else {
        Object.entries(raw).forEach(([peptide, val]) => {
          if (typeof val === 'string') {
            try { map[peptide] = { peptide, ...JSON.parse(val) }; }
            catch { map[peptide] = { peptide, text: val }; }
          } else if (typeof val === 'object' && val) {
            map[peptide] = { peptide, ...val };
          }
        });
      }
      // Merge localStorage drafts
      try {
        const drafts = JSON.parse(localStorage.getItem('instr_drafts') || '{}');
        Object.entries(drafts).forEach(([peptide, data]) => {
          map[peptide] = { ...(map[peptide]||{peptide}), ...data, _isDraft: true };
        });
      } catch {}
      setInstructions(map);
    });
    try {
      const stored = JSON.parse(localStorage.getItem('hiddenPeptides')||'[]');
      setHiddenPeptides(new Set(stored));
    } catch {}
  }, []);

  // When planPeptide changes, auto-fill defaults from instructions
  useEffect(() => {
    if (!planPeptide) return;
    const instr = instructions[planPeptide] || {};
    if (instr.vialMg)   setPlanVialMg(instr.vialMg);
    if (instr.reconMl)  setPlanReconMl(instr.reconMl);
    if (instr.defaultDose)  setPlanDoseUnits(instr.defaultDose);
    if (instr.defaultFreq)  setPlanFreq(instr.defaultFreq);
  }, [planPeptide, instructions]);

  const toggleHide = (name) => {
    setHiddenPeptides(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      localStorage.setItem('hiddenPeptides', JSON.stringify([...next]));
      return next;
    });
  };

  const selectPeptide = (name) => setSelected(name);

  const currentInstr = instructions[selected] || {};

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
  const setField = (field, val) => {
    setInstructions(prev => {
      const updated = { ...(prev[selected]||{peptide:selected}), [field]: val };
      const next = { ...prev, [selected]: updated };
      try {
        const drafts = JSON.parse(localStorage.getItem('instr_drafts') || '{}');
        drafts[selected] = { ...drafts[selected], [field]: val };
        localStorage.setItem('instr_drafts', JSON.stringify(drafts));
      } catch {}
      return next;
    });
    setUnsaved(prev => new Set([...prev, selected]));
  };

  const saveInstructions = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/instructions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save', peptide: selected, data: instructions[selected]||{} }) });
      const d = await res.json();
      if (d.error) { setToast('Error: '+d.error); setToastErr(true); }
      else {
        setToast('Saved!'); setToastErr(false);
        setUnsaved(prev => { const n = new Set(prev); n.delete(selected); return n; });
        try {
          const drafts = JSON.parse(localStorage.getItem('instr_drafts') || '{}');
          delete drafts[selected];
          localStorage.setItem('instr_drafts', JSON.stringify(drafts));
        } catch {}
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

  // Build the plan text from instruction fields
  const buildPlanText = () => {
    const instr = instructions[planPeptide] || {};
    const mcg = calcMcg(planDoseUnits, planVialMg, planReconMl);
    let parts = [];
    if (planFreq) parts.push(`Frequency: ${planFreq}`);
    if (planDoseUnits) parts.push(`Dose: ${planDoseUnits} units${mcg ? ` (${mcg} mcg)` : ''}`);
    if (planVialMg && planReconMl) parts.push(`Reconstitution: ${planVialMg}mg in ${planReconMl}mL BAC water`);
    if (instr.text) parts.push(`\nPatient Instructions:\n${instr.text}`);
    if (instr.sideEffects) parts.push(`\nSide Effects & Notes:\n${instr.sideEffects}`);
    if (instr.storage) parts.push(`\nStorage: ${instr.storage}`);
    if (planNotes) parts.push(`\nAdditional Notes: ${planNotes}`);
    return parts.join('\n');
  };

  const sendPlan = async () => {
    if (!planPatient||!planEmail||!planPeptide) return;
    setSending(true); setPlanResult('');
    const instr = instructions[planPeptide] || {};
    const mcg = calcMcg(planDoseUnits, planVialMg, planReconMl);
    try {
      const res = await fetch('/api/send-plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        patient: planPatient, email: planEmail, peptide: planPeptide,
        frequency: planFreq,
        dose: planDoseUnits ? `${planDoseUnits} units${mcg ? ` (${mcg} mcg)` : ''}` : '',
        vialMg: planVialMg, reconMl: planReconMl,
        units: planDoseUnits, mcg: mcg||'',
        notes: planNotes,
        instructions: instr.text || '',
        sideEffects: instr.sideEffects || '',
        storage: instr.storage || '',
      })});
      const d = await res.json();
      setPlanResult(d.success ? '✓ Plan sent to '+planEmail : '⚠ '+(d.error||'Error'));
    } catch(e) { setPlanResult('⚠ '+e); }
    setSending(false);
  };

  const calcMcg = (units, vialMg, reconMl) => {
    const mg = parseFloat(vialMg), ml = parseFloat(reconMl), u = parseFloat(units);
    if (!mg||!ml||!u) return null;
    return ((u/100)*(mg*1000/ml)).toFixed(0);
  };

  const sendPlan = async () => {
    if (!planPatient||!planEmail) return;
    setSending(true); setSendResult('');
    try {
      const res = await fetch('/api/send-plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        patient: planPatient, email: planEmail, peptide: selected,
        frequency: planFreq,
        dose: planDoseUnits ? planDoseUnits+' units'+(calcMcg(planDoseUnits,planVialMg,planReconMl)?' ('+calcMcg(planDoseUnits,planVialMg,planReconMl)+' mcg)':'') : '',
        vialMg: planVialMg, reconMl: planReconMl,
        units: planDoseUnits, mcg: calcMcg(planDoseUnits,planVialMg,planReconMl)||'',
        notes: planNotes,
        instructions: planText,
        sideEffects: planSideEffects,
        storage: planStorage,
      })});
      const d = await res.json();
      setSendResult(d.success ? 'sent' : 'error:' + (d.error||'Error'));
    } catch(e) { setSendResult('error:'+e); }
    setSending(false);
  };

  const visiblePeptides = peptides.filter(n => !hiddenPeptides.has(n));
  const planInstr = instructions[planPeptide] || {};
  const planMcg = calcMcg(planDoseUnits, planVialMg, planReconMl);
  const canSend = planPatient && planEmail && planPeptide;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:200,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* ── SIDEBAR ── */}
      <div style={{width:'240px',flexShrink:0,background:'#111',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #1a1a1a'}}>
          <h2 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:'0 0 12px'}}>Peptide Instructions</h2>
          <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'3px',marginBottom:'12px'}}>
            {['instructions','plan'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?'#0f0f0f':'transparent',color:tab===t?'#fff':'#6b7280',border:tab===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'5px',padding:'5px 4px',fontSize:'11px',fontWeight:tab===t?600:400,cursor:'pointer'}}>
                {t==='plan'?'Patient Plan':'Instructions'}
              </button>
            ))}
          </div>
          <SearchableDropdown options={visiblePeptides} value={selected} onChange={selectPeptide} placeholder='Select peptide...' instrMap={instructions}/>
        </div>

        {/* Clickable list */}
        <div style={{flex:1,overflowY:'auto'}}>
          {peptides.length===0&&<p style={{color:'#374151',fontSize:'12px',padding:'12px 16px'}}>No purchases yet.</p>}
          {visiblePeptides.map(name=>(
            <div key={name} style={{display:'flex',alignItems:'center',borderLeft:name===selected?'2px solid #7b1c2e':'2px solid transparent'}}>
              <button onClick={()=>selectPeptide(name)}
                style={{flex:1,textAlign:'left',padding:'10px 14px',background:name===selected?'rgba(123,28,46,0.18)':'transparent',color:name===selected?'#fff':'#9ca3af',border:'none',fontSize:'13px',fontWeight:name===selected?600:400,cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'6px'}}
                onMouseOver={e=>{if(name!==selected){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#d1d5db';}}}
                onMouseOut={e=>{if(name!==selected){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9ca3af';}}}
              >
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{name}</span>
                {instructions[name]?.text&&<span style={{fontSize:'10px',color:'#34d399',flexShrink:0}}>✓</span>}
              </button>
              <button onClick={()=>toggleHide(name)} title='Hide' style={{background:'transparent',border:'none',color:'#1f1f1f',cursor:'pointer',fontSize:'13px',padding:'10px 10px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='#6b7280'} onMouseOut={e=>e.currentTarget.style.color='#1f1f1f'}>👁</button>
            </div>
          ))}
          {hiddenPeptides.size>0&&(
            <div style={{padding:'8px 16px',borderTop:'1px solid #1a1a1a',marginTop:'4px'}}>
              <button onClick={()=>setShowHidden(v=>!v)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'11px',cursor:'pointer',textDecoration:'underline',padding:0}}>{showHidden?'Hide':'Show'} {hiddenPeptides.size} hidden</button>
              {showHidden&&[...hiddenPeptides].map(name=>(
                <div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0'}}>
                  <button onClick={()=>selectPeptide(name)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'12px',cursor:'pointer',flex:1,textAlign:'left'}}>{name}</button>
                  <button onClick={()=>toggleHide(name)} style={{background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'11px',padding:'0 0 0 6px'}}>↩</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,padding:'24px',overflowY:'auto',minWidth:0}}>
        {!selected?(
          <div style={{textAlign:'center',padding:'80px',color:'#4b5563'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div><p>Select a peptide from the list</p></div>
        ):tab==='instructions'?(

          /* ── INSTRUCTIONS TAB ── */
          <div style={{maxWidth:'800px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
              <div>
                <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>{selected}</h1>
                <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Default dosing &amp; patient instructions</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
                {unsaved.has(selected)&&<span style={{fontSize:'10px',color:'#fbbf24',fontWeight:700,background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'4px',padding:'2px 6px'}}>UNSAVED</span>}
                <button onClick={openPlanModal} style={{background:'rgba(16,185,129,0.1)',color:'#34d399',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'9px',padding:'10px 18px',fontSize:'13px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>📧 Generate Plan</button>
                <button onClick={saveInstructions} disabled={saving} style={{background:saving?'#2d0e18':'#7b1c2e',color:saving?'#5a2030':'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>{saving?'Saving...':'Save'}</button>
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
                <div style={{marginTop:'10px',fontSize:'12px',color:'#60a5fa'}}>→ {((parseFloat(currentInstr.vialMg)*1000)/parseFloat(currentInstr.reconMl)).toFixed(0)} mcg/mL · 1 unit = {((parseFloat(currentInstr.vialMg)*1000)/(parseFloat(currentInstr.reconMl)*100)).toFixed(1)} mcg</div>
              )}
            </div>

            {/* Default Dosing — NEW: frequency + dose stored here */}
            <div style={{...card,marginBottom:'14px',background:'rgba(99,102,241,0.04)',border:'1px solid rgba(99,102,241,0.15)'}}>
              <h3 style={{color:'#818cf8',fontSize:'13px',fontWeight:700,margin:'0 0 12px'}}>📅 Default Dosing</h3>
              <p style={{color:'#4b5563',fontSize:'12px',margin:'0 0 12px'}}>These defaults pre-fill the Patient Plan tab automatically.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={lbl}>Default Frequency</label>
                  <select value={currentInstr.defaultFreq||''} onChange={e=>setField('defaultFreq',e.target.value)} style={{...inp,color:currentInstr.defaultFreq?'#fff':'#4b5563'}}>
                    <option value=''>Select frequency...</option>
                    {FREQS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Default Dose (units)</label>
                  <div style={{position:'relative'}}>
                    <input type='number' step='0.5' placeholder='e.g. 10' value={currentInstr.defaultDose||''} onChange={e=>setField('defaultDose',e.target.value)} style={{...inp,paddingRight:'50px'}}/>
                    <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'11px',pointerEvents:'none'}}>units</span>
                  </div>
                  {currentInstr.defaultDose&&currentInstr.vialMg&&currentInstr.reconMl&&(
                    <div style={{marginTop:'4px',fontSize:'11px',color:'#818cf8'}}>= {((parseFloat(currentInstr.defaultDose)/100)*(parseFloat(currentInstr.vialMg)*1000/parseFloat(currentInstr.reconMl))).toFixed(0)} mcg</div>
                  )}
                </div>
              </div>
            </div>

            {/* Patient Instructions */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Patient Instructions</label>
              <RichTextArea id='instr-text' value={currentInstr.text||''} onChange={val=>setField('text',val)} placeholder={'Instructions for '+selected+'...\n\nTip: use the toolbar to add bullets, bold, headings, etc.'} minHeight='180px'/>
            </div>

            {/* Side Effects */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Side Effects &amp; Notes</label>
              <RichTextArea id='instr-side' value={currentInstr.sideEffects||''} onChange={val=>setField('sideEffects',val)} placeholder={'• Common side effect 1\n• Common side effect 2'} minHeight='120px'/>
            </div>

            {/* Storage */}
            <div style={card}>
              <label style={lbl}>Storage</label>
              <input type='text' value={currentInstr.storage||''} onChange={e=>setField('storage',e.target.value)} placeholder='e.g. Refrigerate after reconstitution. Use within 28 days.' style={inp}/>
            </div>
          </div>

        ):(

          /* ── PATIENT PLAN TAB ── */
          <div style={{maxWidth:'680px'}}>
            <div style={{marginBottom:'24px'}}>
              <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>Patient Plan</h1>
              <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Generate a personalised dosage plan to send to your patient</p>
            </div>

            {/* Patient */}
            <div style={{...card,marginBottom:'14px'}}>
              <h3 style={{color:'#9ca3af',fontSize:'13px',fontWeight:700,margin:'0 0 14px'}}>👤 Patient Details</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Patient Name</label><input type='text' placeholder='e.g. John Smith' value={planPatient} onChange={e=>setPlanPatient(e.target.value)} style={inp}/></div>
                <div><label style={lbl}>Patient Email</label><input type='email' placeholder='patient@email.com' value={planEmail} onChange={e=>setPlanEmail(e.target.value)} style={inp}/></div>
              </div>
            </div>

            {/* Peptide — auto-fills from instructions */}
            <div style={{...card,marginBottom:'14px'}}>
              <h3 style={{color:'#9ca3af',fontSize:'13px',fontWeight:700,margin:'0 0 6px'}}>💉 Peptide &amp; Dosing</h3>
              <p style={{color:'#4b5563',fontSize:'12px',margin:'0 0 14px'}}>Defaults populate from the Instructions tab — override if needed for this patient.</p>
              <div style={{marginBottom:'12px'}}>
                <label style={lbl}>Peptide</label>
                <SearchableDropdown options={visiblePeptides} value={planPeptide} onChange={setPlanPeptide} placeholder='Search peptide...' instrMap={instructions}/>
              </div>
              {planPeptide&&!planInstr.defaultFreq&&!planInstr.defaultDose&&(
                <div style={{background:'rgba(251,191,36,0.07)',border:'1px solid rgba(251,191,36,0.2)',borderRadius:'8px',padding:'10px 14px',marginBottom:'12px',fontSize:'12px',color:'#fbbf24'}}>
                  ⚠ No defaults saved for {planPeptide} yet. <button onClick={()=>{setSelected(planPeptide);setTab('instructions');}} style={{background:'transparent',border:'none',color:'#fbbf24',cursor:'pointer',textDecoration:'underline',fontSize:'12px',padding:'0 4px'}}>Add defaults →</button>
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                <div>
                  <label style={lbl}>Frequency</label>
                  <select value={planFreq} onChange={e=>setPlanFreq(e.target.value)} style={{...inp,color:planFreq?'#fff':'#4b5563'}}>
                    <option value=''>Select frequency...</option>
                    {FREQS.map(f=><option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Dose (units)</label>
                  <div style={{position:'relative'}}>
                    <input type='number' step='0.5' placeholder='e.g. 10' value={planDoseUnits} onChange={e=>setPlanDoseUnits(e.target.value)} style={{...inp,paddingRight:'50px'}}/>
                    <span style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'#4b5563',fontSize:'11px',pointerEvents:'none'}}>units</span>
                  </div>
                  {planMcg&&<div style={{marginTop:'4px',fontSize:'11px',color:'#a78bfa'}}>{planDoseUnits} units = {planMcg} mcg</div>}
                </div>
                <div>
                  <label style={lbl}>Vial Size (mg)</label>
                  <input type='number' placeholder='e.g. 10' value={planVialMg} onChange={e=>setPlanVialMg(e.target.value)} style={inp}/>
                </div>
                <div>
                  <label style={lbl}>BAC Water (mL)</label>
                  <input type='number' step='0.1' value={planReconMl} onChange={e=>setPlanReconMl(e.target.value)} style={inp}/>
                </div>
              </div>
            </div>

            {/* What will be included */}
            {planPeptide&&(
              <div style={{...card,marginBottom:'14px',background:'rgba(16,185,129,0.03)',border:'1px solid rgba(16,185,129,0.12)'}}>
                <h3 style={{color:'#34d399',fontSize:'13px',fontWeight:700,margin:'0 0 12px'}}>📋 Plan Contents</h3>
                <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                  {[
                    {label:'Frequency', val:planFreq, icon:'📅'},
                    {label:'Dose', val:planDoseUnits?planDoseUnits+' units'+(planMcg?' ('+planMcg+' mcg)':''):'', icon:'💉'},
                    {label:'Reconstitution', val:planVialMg&&planReconMl?planVialMg+'mg in '+planReconMl+'mL BAC water':'', icon:'⚗️'},
                    {label:'Patient Instructions', val:planInstr.text?'✓ Included ('+(planInstr.text.length)+' chars)':'Not set', icon:'📄', warn:!planInstr.text},
                    {label:'Side Effects & Notes', val:planInstr.sideEffects?'✓ Included':'Not set', icon:'⚠️', warn:!planInstr.sideEffects},
                    {label:'Storage', val:planInstr.storage||'Not set', icon:'🧊', warn:!planInstr.storage},
                  ].map(({label,val,icon,warn})=>(
                    <div key={label} style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'12px'}}>
                      <span style={{flexShrink:0}}>{icon}</span>
                      <span style={{color:'#6b7280',minWidth:'140px',flexShrink:0}}>{label}:</span>
                      <span style={{color:warn?'#4b5563':val?'#d1d5db':'#4b5563',fontStyle:warn?'italic':'normal'}}>{val||'Not set'}</span>
                      {warn&&val==='Not set'&&<button onClick={()=>{setSelected(planPeptide);setTab('instructions');}} style={{background:'transparent',border:'none',color:'#4b5563',cursor:'pointer',fontSize:'11px',padding:'0',textDecoration:'underline'}}>Add →</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional notes */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={lbl}>Additional Notes for This Patient</label>
              <textarea value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder='Any specific instructions just for this patient...' style={{...inp,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}}/>
            </div>

            <button onClick={sendPlan} disabled={sending||!canSend}
              style={{background:canSend&&!sending?'#7b1c2e':'#2d0e18',color:canSend&&!sending?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px 24px',fontSize:'14px',fontWeight:700,cursor:canSend&&!sending?'pointer':'not-allowed',width:'100%'}}>
              {sending?'Sending...':'📧 Generate & Send Patient Plan'}
            </button>
            {planResult&&<div style={{marginTop:'10px',fontSize:'13px',color:planResult.startsWith('✓')?'#34d399':'#f87171',fontWeight:600,textAlign:'center'}}>{planResult}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
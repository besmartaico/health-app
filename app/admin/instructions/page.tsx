// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' };

function SearchableDropdown({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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
          <div style={{padding:'8px'}}>
            <input autoFocus type='text' placeholder='Search peptides...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,fontSize:'13px',padding:'8px 12px'}} onClick={e=>e.stopPropagation()} />
          </div>
          <div style={{maxHeight:'220px',overflowY:'auto'}}>
            {filtered.length===0
              ? <div style={{padding:'12px 16px',color:'#4b5563',fontSize:'13px'}}>No matches</div>
              : filtered.map(o=>(
                <div key={o} onClick={()=>{onChange(o);setOpen(false);setSearch('');}}
                  style={{padding:'10px 16px',fontSize:'13px',color:o===value?'#fff':'#9ca3af',background:o===value?'rgba(123,28,46,0.25)':'transparent',cursor:'pointer',borderLeft:o===value?'2px solid #7b1c2e':'2px solid transparent'}}
                  onMouseOver={e=>{if(o!==value)e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
                  onMouseOut={e=>{if(o!==value)e.currentTarget.style.background='transparent';}}
                >
                  {o}{instructions_global[o]?.text&&<span style={{marginLeft:'6px',fontSize:'10px',color:'#34d399'}}>✓</span>}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// Module-level ref so SearchableDropdown can access instructions for ✓ badges
let instructions_global = {};

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

  const [planPatient, setPlanPatient] = useState('');
  const [planEmail, setPlanEmail] = useState('');
  const [planPeptide, setPlanPeptide] = useState('');
  const [planVialMg, setPlanVialMg] = useState('');
  const [planReconMl, setPlanReconMl] = useState('2');
  const [planDoseUnits, setPlanDoseUnits] = useState('');
  const [planFreq, setPlanFreq] = useState('daily');
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
      const map = {};
      (d.instructions||[]).forEach(i => { map[i.peptide] = i; });
      setInstructions(map);
      instructions_global = map;
    });
    try {
      const stored = JSON.parse(localStorage.getItem('hiddenPeptides')||'[]');
      setHiddenPeptides(new Set(stored));
    } catch {}
  }, []);

  // Keep module ref in sync
  useEffect(() => { instructions_global = instructions; }, [instructions]);

  useEffect(() => {
    if (planPeptide && instructions[planPeptide]) {
      const instr = instructions[planPeptide];
      if (instr.vialMg) setPlanVialMg(instr.vialMg);
      if (instr.reconMl) setPlanReconMl(instr.reconMl);
    }
  }, [planPeptide, instructions]);

  const toggleHide = (name) => {
    setHiddenPeptides(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      localStorage.setItem('hiddenPeptides', JSON.stringify([...next]));
      return next;
    });
  };

  const currentInstr = instructions[selected] || {};
  const setField = (field, val) => setInstructions(prev => ({ ...prev, [selected]: { ...(prev[selected]||{peptide:selected}), [field]: val } }));

  const calcMcgFromUnits = (units, vialMg, reconMl) => {
    const mg = parseFloat(vialMg), ml = parseFloat(reconMl), u = parseFloat(units);
    if (!mg || !ml || !u) return null;
    return ((u/100)*(mg*1000/ml)).toFixed(0);
  };
  const planMcg = calcMcgFromUnits(planDoseUnits, planVialMg, planReconMl);

  const saveInstructions = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/instructions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save', peptide: selected, data: instructions[selected]||{} }) });
      const d = await res.json();
      setToast(d.error ? 'Error: '+d.error : 'Saved!');
      setToastErr(!!d.error);
    } catch(e) { setToast('Error: '+e); setToastErr(true); }
    setSaving(false);
    setTimeout(() => setToast(''), 3000);
  };

  const sendPlan = async () => {
    if (!planPatient||!planEmail||!planPeptide||!planDoseUnits) return;
    setSending(true); setPlanResult('');
    try {
      const res = await fetch('/api/send-plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ patient:planPatient, email:planEmail, peptide:planPeptide, dose:planDoseUnits+' units ('+(planMcg||'?')+' mcg)', vialMg:planVialMg, reconMl:planReconMl, units:planDoseUnits, mcg:planMcg||'?', frequency:planFreq, notes:planNotes, instructions:instructions[planPeptide]?.text||'' }) });
      const d = await res.json();
      setPlanResult(d.success ? '✓ Plan sent to '+planEmail : '⚠ '+(d.error||'Error'));
    } catch(e) { setPlanResult('⚠ '+e); }
    setSending(false);
  };

  const visiblePeptides = peptides.filter(n => !hiddenPeptides.has(n));
  const FREQ = { daily:'Daily', 'twice-daily':'Twice Daily', 'every-other-day':'Every Other Day', '3x-week':'3x Per Week', weekly:'Weekly' };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:200}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* Sidebar */}
      <div style={{width:'250px',flexShrink:0,background:'#111',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #1a1a1a'}}>
          <h2 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:'0 0 12px'}}>Peptide Instructions</h2>
          {/* Tab switcher */}
          <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'3px',marginBottom:'12px'}}>
            {['instructions','plan'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?'#0f0f0f':'transparent',color:tab===t?'#fff':'#6b7280',border:tab===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'5px',padding:'5px 4px',fontSize:'11px',fontWeight:tab===t?600:400,cursor:'pointer'}}>{t==='plan'?'Patient Plan':'Instructions'}</button>
            ))}
          </div>
          {/* Searchable peptide dropdown */}
          <SearchableDropdown
            options={visiblePeptides}
            value={selected}
            onChange={setSelected}
            placeholder='Select peptide...'
          />
        </div>
        {/* Hidden management */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 16px'}}>
          {peptides.length > 0 && (
            <div style={{marginTop:'4px'}}>
              <p style={{color:'#374151',fontSize:'11px',margin:'0 0 6px'}}>Click 👁 to hide a peptide from the list</p>
              {visiblePeptides.map(name=>(
                <div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0'}}>
                  <span style={{fontSize:'12px',color:selected===name?'#e879f9':'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{name}{instructions[name]?.text&&<span style={{color:'#34d399',marginLeft:'4px'}}>✓</span>}</span>
                  <button onClick={()=>toggleHide(name)} title='Hide' style={{background:'transparent',border:'none',color:'#2a2a2a',cursor:'pointer',fontSize:'13px',padding:'0 0 0 6px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='#6b7280'} onMouseOut={e=>e.currentTarget.style.color='#2a2a2a'}>👁</button>
                </div>
              ))}
              {hiddenPeptides.size>0&&(
                <div style={{marginTop:'8px',borderTop:'1px solid #1a1a1a',paddingTop:'8px'}}>
                  <button onClick={()=>setShowHidden(v=>!v)} style={{background:'transparent',border:'none',color:'#4b5563',fontSize:'11px',cursor:'pointer',textDecoration:'underline',padding:0}}>{showHidden?'Hide':'Show'} {hiddenPeptides.size} hidden</button>
                  {showHidden&&[...hiddenPeptides].map(name=>(
                    <div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0'}}>
                      <span style={{fontSize:'12px',color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{name}</span>
                      <button onClick={()=>toggleHide(name)} style={{background:'transparent',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'11px',padding:'0 0 0 6px'}}>↩</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {peptides.length===0&&<p style={{color:'#374151',fontSize:'12px',marginTop:'8px'}}>No purchases yet.<br/>Add purchases to see peptides here.</p>}
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,padding:'28px',overflowY:'auto'}}>
        {!selected ? (
          <div style={{textAlign:'center',padding:'80px',color:'#4b5563'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div><p>Select a peptide from the dropdown</p></div>
        ) : tab==='instructions' ? (
          <div style={{maxWidth:'780px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <div><h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>{selected}</h1><p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Reconstitution &amp; patient instructions</p></div>
              <button onClick={saveInstructions} disabled={saving} style={{background:saving?'#2d0e18':'#7b1c2e',color:saving?'#5a2030':'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>{saving?'Saving...':'Save'}</button>
            </div>
            <div style={{...card,marginBottom:'14px',background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
              <h3 style={{color:'#93c5fd',fontSize:'13px',fontWeight:700,margin:'0 0 12px'}}>⚗️ Reconstitution</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Vial Amount (mg)</label><input type='number' placeholder='e.g. 10' value={currentInstr.vialMg||''} onChange={e=>setField('vialMg',e.target.value)} style={inp} /></div>
                <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' placeholder='e.g. 2' value={currentInstr.reconMl||''} onChange={e=>setField('reconMl',e.target.value)} style={inp} /></div>
              </div>
              {currentInstr.vialMg&&currentInstr.reconMl&&(
                <div style={{marginTop:'10px',fontSize:'12px',color:'#60a5fa'}}>→ {((parseFloat(currentInstr.vialMg)*1000)/parseFloat(currentInstr.reconMl)).toFixed(0)} mcg/mL · 1 unit = {((parseFloat(currentInstr.vialMg)*1000)/(parseFloat(currentInstr.reconMl)*100)).toFixed(1)} mcg</div>
              )}
            </div>
            <div style={{...card,marginBottom:'14px'}}><label style={lbl}>Patient Instructions</label><textarea value={currentInstr.text||''} onChange={e=>setField('text',e.target.value)} placeholder={'Instructions for '+selected+'...'} style={{...inp,minHeight:'160px',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}} /></div>
            <div style={{...card,marginBottom:'14px'}}><label style={lbl}>Side Effects &amp; Notes</label><textarea value={currentInstr.sideEffects||''} onChange={e=>setField('sideEffects',e.target.value)} placeholder='Common side effects...' style={{...inp,minHeight:'80px',resize:'vertical',fontFamily:'inherit'}} /></div>
            <div style={card}><label style={lbl}>Storage</label><input type='text' value={currentInstr.storage||''} onChange={e=>setField('storage',e.target.value)} placeholder='e.g. Refrigerate after reconstitution.' style={inp} /></div>
          </div>
        ) : (
          <div style={{maxWidth:'680px'}}>
            <div style={{marginBottom:'24px'}}><h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>Patient Plan</h1><p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Generate and send a dosage plan</p></div>
            <div style={{...card,marginBottom:'14px'}}>
              <h3 style={{color:'#9ca3af',fontSize:'13px',fontWeight:700,margin:'0 0 14px'}}>Patient Details</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Patient Name</label><input type='text' placeholder='e.g. John Smith' value={planPatient} onChange={e=>setPlanPatient(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Patient Email</label><input type='email' placeholder='patient@email.com' value={planEmail} onChange={e=>setPlanEmail(e.target.value)} style={inp} /></div>
              </div>
            </div>
            <div style={{...card,marginBottom:'14px'}}>
              <h3 style={{color:'#9ca3af',fontSize:'13px',fontWeight:700,margin:'0 0 14px'}}>Peptide &amp; Dosage</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                <div><label style={lbl}>Peptide</label><SearchableDropdown options={visiblePeptides} value={planPeptide} onChange={setPlanPeptide} placeholder='Search peptide...' /></div>
                <div><label style={lbl}>Frequency</label><select value={planFreq} onChange={e=>setPlanFreq(e.target.value)} style={{...inp,color:'#fff'}}><option value='daily'>Daily</option><option value='twice-daily'>Twice Daily</option><option value='every-other-day'>Every Other Day</option><option value='3x-week'>3x Per Week</option><option value='weekly'>Weekly</option></select></div>
                <div><label style={lbl}>Vial Size (mg)</label><input type='number' placeholder='e.g. 10' value={planVialMg} onChange={e=>setPlanVialMg(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' value={planReconMl} onChange={e=>setPlanReconMl(e.target.value)} style={inp} /></div>
              </div>
              <div><label style={lbl}>Dose — Units to Draw (IU)</label>
                <div style={{position:'relative'}}><input type='number' step='0.5' placeholder='e.g. 10' value={planDoseUnits} onChange={e=>setPlanDoseUnits(e.target.value)} style={{...inp,paddingRight:'80px'}} /><span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:'#6b7280',fontSize:'12px',pointerEvents:'none'}}>units (IU)</span></div>
                {planMcg&&planDoseUnits&&<div style={{marginTop:'6px',fontSize:'12px',color:'#a78bfa'}}>→ {planDoseUnits} units = <strong style={{color:'#c084fc'}}>{planMcg} mcg</strong>{planVialMg&&planReconMl&&<span style={{color:'#6b7280'}}> ({planVialMg}mg / {planReconMl}mL)</span>}</div>}
              </div>
            </div>
            <div style={{...card,marginBottom:'14px'}}><label style={lbl}>Additional Notes</label><textarea value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder='Specific instructions for this patient...' style={{...inp,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}} /></div>
            {planPeptide&&planDoseUnits&&planVialMg&&planReconMl&&(
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'16px',marginBottom:'14px',fontSize:'13px',color:'#9ca3af',lineHeight:2}}>
                <div style={{color:'#fff',fontWeight:700,marginBottom:'4px'}}>Plan Preview</div>
                <div>💊 <strong style={{color:'#d1d5db'}}>{planPeptide}</strong></div>
                <div>💉 Draw <strong style={{color:'#fbbf24'}}>{planDoseUnits} units</strong> {planMcg&&<span>({planMcg} mcg)</span>}</div>
                <div>📅 {FREQ[planFreq]||planFreq}</div>
                <div>⚗️ {planVialMg}mg in {planReconMl}mL BAC water</div>
                {planNotes&&<div>📝 {planNotes}</div>}
              </div>
            )}
            <button onClick={sendPlan} disabled={sending||!planPatient||!planEmail||!planPeptide||!planDoseUnits} style={{background:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'#7b1c2e':'#2d0e18',color:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px 24px',fontSize:'14px',fontWeight:700,cursor:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'pointer':'not-allowed'}}>{sending?'Sending...':'📧 Send Plan to Patient'}</button>
            {planResult&&<div style={{marginTop:'10px',fontSize:'13px',color:planResult.startsWith('✓')?'#34d399':'#f87171',fontWeight:600}}>{planResult}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
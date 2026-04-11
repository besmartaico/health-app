// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' };

export default function InstructionsPage() {
  const [peptides, setPeptides] = useState([]); // from purchases
  const [selected, setSelected] = useState('');
  const [instructions, setInstructions] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);

  // Patient plan state
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
    // Load unique peptides from purchases
    fetch('/api/purchases').then(r=>r.json()).then(d => {
      const names = [...new Set((d.purchases||[]).map(p=>p.item).filter(Boolean))].sort();
      setPeptides(names);
      if (names.length > 0 && !selected) setSelected(names[0]);
    });
    // Load saved instructions
    fetch('/api/instructions').then(r=>r.json()).then(d => {
      const map = {};
      (d.instructions||[]).forEach(i => { map[i.peptide] = i; });
      setInstructions(map);
    });
  }, []);

  // Auto-fill vial mg from instructions when peptide selected for plan
  useEffect(() => {
    if (planPeptide && instructions[planPeptide]) {
      const instr = instructions[planPeptide];
      if (instr.vialMg) setPlanVialMg(instr.vialMg);
      if (instr.reconMl) setPlanReconMl(instr.reconMl);
    }
  }, [planPeptide, instructions]);

  const currentInstr = instructions[selected] || {};

  const setField = (field, val) => {
    setInstructions(prev => ({ ...prev, [selected]: { ...(prev[selected]||{peptide:selected}), [field]: val } }));
  };

  // Dosage calc: units = (doseMcg / (vialMg*1000/reconMl)) * 100
  const calcUnitsFromMcg = (doseMcg, vialMg, reconMl) => {
    const mgF = parseFloat(vialMg), mlF = parseFloat(reconMl), mcgF = parseFloat(doseMcg);
    if (!mgF || !mlF || !mcgF) return null;
    const mcgPerMl = (mgF * 1000) / mlF;
    const drawMl = mcgF / mcgPerMl;
    return (drawMl * 100).toFixed(1);
  };

  const calcMcgFromUnits = (units, vialMg, reconMl) => {
    const mgF = parseFloat(vialMg), mlF = parseFloat(reconMl), uF = parseFloat(units);
    if (!mgF || !mlF || !uF) return null;
    const mcgPerMl = (mgF * 1000) / mlF;
    const mcg = (uF / 100) * mcgPerMl;
    return mcg.toFixed(0);
  };

  // Derived dose info for plan
  const planMcg = planDoseUnits && planVialMg && planReconMl ? calcMcgFromUnits(planDoseUnits, planVialMg, planReconMl) : null;

  const saveInstructions = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch('/api/instructions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save', peptide: selected, data: instructions[selected]||{} }) });
      const d = await res.json();
      if (d.error) { setToast('Error: '+d.error); setToastErr(true); }
      else { setToast('Instructions saved!'); setToastErr(false); }
    } catch(e) { setToast('Error: '+String(e)); setToastErr(true); }
    setSaving(false);
    setTimeout(() => setToast(''), 3000);
  };

  const sendPlan = async () => {
    if (!planPatient || !planEmail || !planPeptide || !planDoseUnits) return;
    setSending(true); setPlanResult('');
    const mcg = planMcg || '?';
    try {
      const res = await fetch('/api/send-plan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        patient: planPatient,
        email: planEmail,
        peptide: planPeptide,
        dose: planDoseUnits + ' units (' + mcg + ' mcg)',
        vialMg: planVialMg,
        reconMl: planReconMl,
        units: planDoseUnits,
        mcg,
        frequency: planFreq,
        notes: planNotes,
        instructions: instructions[planPeptide]?.text || '',
      }) });
      const d = await res.json();
      setPlanResult(d.success ? '✓ Plan sent to '+planEmail : '⚠ '+d.error);
    } catch(e) { setPlanResult('⚠ '+String(e)); }
    setSending(false);
  };

  const FREQ_LABELS = { daily:'Daily', 'twice-daily':'Twice Daily', 'every-other-day':'Every Other Day', '3x-week':'3x Per Week', weekly:'Weekly' };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#131313'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* Peptide sidebar - from purchases */}
      <div style={{width:'220px',flexShrink:0,background:'#111',borderRight:'1px solid #1a1a1a',padding:'20px 0'}}>
        <div style={{padding:'0 16px 12px',borderBottom:'1px solid #1a1a1a',marginBottom:'8px'}}>
          <h2 style={{color:'#fff',fontSize:'15px',fontWeight:700,margin:'0 0 2px'}}>Peptide Instructions</h2>
          <p style={{color:'#4b5563',fontSize:'11px',margin:0}}>From your purchases</p>
        </div>
        {peptides.length === 0 ? (
          <div style={{padding:'16px',color:'#4b5563',fontSize:'12px',lineHeight:1.5}}>No purchases yet.<br/>Add purchases to see peptides here.</div>
        ) : peptides.map(name => (
          <button key={name} onClick={() => setSelected(name)}
            style={{width:'100%',textAlign:'left',padding:'10px 16px',background:selected===name?'rgba(123,28,46,0.2)':'transparent',color:selected===name?'#fff':'#9ca3af',borderLeft:selected===name?'2px solid #7b1c2e':'2px solid transparent',border:'none',fontSize:'13px',fontWeight:selected===name?600:400,cursor:'pointer',display:'block'}}
            onMouseOver={e=>{if(selected!==name)e.currentTarget.style.color='#d1d5db';}}
            onMouseOut={e=>{if(selected!==name)e.currentTarget.style.color='#9ca3af';}}
          >
            {name}
            {instructions[name]?.text && <span style={{marginLeft:'6px',fontSize:'10px',color:'#34d399'}}>✓</span>}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{flex:1,padding:'28px',overflowY:'auto'}}>
        {!selected ? (
          <div style={{textAlign:'center',padding:'80px',color:'#4b5563'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div>
            <p>Select a peptide to view or edit instructions</p>
          </div>
        ) : (
          <div style={{maxWidth:'800px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <div>
                <h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>{selected}</h1>
                <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Patient instructions &amp; dosage guide</p>
              </div>
              <button onClick={saveInstructions} disabled={saving} style={{background:saving?'#2d0e18':'#7b1c2e',color:saving?'#5a2030':'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>{saving?'Saving...':'Save Instructions'}</button>
            </div>

            {/* Reconstitution settings - stored per peptide */}
            <div style={{...card,marginBottom:'16px',background:'rgba(59,130,246,0.04)',border:'1px solid rgba(59,130,246,0.12)'}}>
              <h3 style={{color:'#93c5fd',fontSize:'13px',fontWeight:700,margin:'0 0 14px'}}>⚗️ Default Reconstitution (used for unit calculations)</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Vial Amount (mg)</label><input type='number' placeholder='e.g. 10' value={currentInstr.vialMg||''} onChange={e=>setField('vialMg',e.target.value)} style={inp} /></div>
                <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' placeholder='e.g. 2' value={currentInstr.reconMl||''} onChange={e=>setField('reconMl',e.target.value)} style={inp} /></div>
              </div>
              {currentInstr.vialMg && currentInstr.reconMl && (
                <div style={{marginTop:'10px',fontSize:'12px',color:'#60a5fa'}}>
                  → Concentration: {((parseFloat(currentInstr.vialMg)*1000)/parseFloat(currentInstr.reconMl)).toFixed(0)} mcg/mL &nbsp;|&nbsp; 1 unit (IU) = {((parseFloat(currentInstr.vialMg)*1000)/(parseFloat(currentInstr.reconMl)*100)).toFixed(1)} mcg
                </div>
              )}
            </div>

            {/* Instructions text */}
            <div style={{...card,marginBottom:'16px'}}>
              <label style={lbl}>Patient Instructions</label>
              <textarea
                value={currentInstr.text||''}
                onChange={e=>setField('text',e.target.value)}
                placeholder={'Enter instructions for '+selected+'...\n\nInclude: storage, reconstitution steps, injection site rotation, timing, etc.'}
                style={{...inp,minHeight:'180px',resize:'vertical',fontFamily:'inherit',lineHeight:1.6}}
              />
            </div>

            {/* Side effects */}
            <div style={{...card,marginBottom:'16px'}}>
              <label style={lbl}>Common Side Effects &amp; Notes</label>
              <textarea value={currentInstr.sideEffects||''} onChange={e=>setField('sideEffects',e.target.value)} placeholder='List common side effects and management tips...' style={{...inp,minHeight:'100px',resize:'vertical',fontFamily:'inherit'}} />
            </div>

            {/* Storage */}
            <div style={{...card,marginBottom:'28px'}}>
              <label style={lbl}>Storage Instructions</label>
              <input type='text' value={currentInstr.storage||''} onChange={e=>setField('storage',e.target.value)} placeholder='e.g. Refrigerate after reconstitution. Use within 28 days.' style={inp} />
            </div>

            {/* Patient Plan Generator */}
            <div style={{...card,background:'rgba(123,28,46,0.06)',border:'1px solid rgba(123,28,46,0.2)'}}>
              <h3 style={{color:'#f9a8d4',fontSize:'15px',fontWeight:700,margin:'0 0 18px'}}>📋 Generate Patient Plan</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                <div><label style={lbl}>Patient Name</label><input type='text' placeholder='e.g. John Smith' value={planPatient} onChange={e=>setPlanPatient(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Patient Email</label><input type='email' placeholder='patient@email.com' value={planEmail} onChange={e=>setPlanEmail(e.target.value)} style={inp} /></div>
                <div>
                  <label style={lbl}>Peptide</label>
                  <select value={planPeptide} onChange={e=>setPlanPeptide(e.target.value)} style={{...inp,color:planPeptide?'#fff':'#4b5563'}}>
                    <option value=''>Select peptide...</option>
                    {peptides.map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Frequency</label>
                  <select value={planFreq} onChange={e=>setPlanFreq(e.target.value)} style={{...inp,color:'#fff'}}>
                    <option value='daily'>Daily</option>
                    <option value='twice-daily'>Twice Daily</option>
                    <option value='every-other-day'>Every Other Day</option>
                    <option value='3x-week'>3x Per Week</option>
                    <option value='weekly'>Weekly</option>
                  </select>
                </div>
              </div>

              {/* Reconstitution for this plan */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
                <div><label style={lbl}>Vial Size (mg)</label><input type='number' placeholder='e.g. 10' value={planVialMg} onChange={e=>setPlanVialMg(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>BAC Water (mL)</label><input type='number' step='0.1' placeholder='e.g. 2' value={planReconMl} onChange={e=>setPlanReconMl(e.target.value)} style={inp} /></div>
              </div>

              {/* Dose in UNITS */}
              <div style={{marginBottom:'12px'}}>
                <label style={lbl}>Dose — Units to Draw (IU on insulin syringe)</label>
                <div style={{position:'relative'}}>
                  <input type='number' step='0.5' placeholder='e.g. 10' value={planDoseUnits} onChange={e=>setPlanDoseUnits(e.target.value)} style={{...inp,paddingRight:'80px'}} />
                  <span style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:'#6b7280',fontSize:'12px',pointerEvents:'none'}}>units (IU)</span>
                </div>
                {planMcg && planDoseUnits && (
                  <div style={{marginTop:'6px',fontSize:'12px',color:'#a78bfa'}}>
                    → {planDoseUnits} units = <strong style={{color:'#c084fc'}}>{planMcg} mcg</strong>
                    {planVialMg && planReconMl && <span style={{color:'#6b7280'}}> &nbsp;(based on {planVialMg}mg/{planReconMl}mL)</span>}
                  </div>
                )}
              </div>

              <div style={{marginBottom:'16px'}}><label style={lbl}>Additional Notes</label><textarea value={planNotes} onChange={e=>setPlanNotes(e.target.value)} placeholder='Any specific instructions for this patient...' style={{...inp,minHeight:'70px',resize:'vertical',fontFamily:'inherit'}} /></div>

              {/* Plan preview */}
              {planPeptide && planDoseUnits && planVialMg && planReconMl && (
                <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'14px',marginBottom:'14px',fontSize:'13px',color:'#9ca3af',lineHeight:1.8}}>
                  <div style={{color:'#fff',fontWeight:700,marginBottom:'8px'}}>Plan Preview</div>
                  <div>💊 <strong style={{color:'#d1d5db'}}>{planPeptide}</strong></div>
                  <div>💉 Draw <strong style={{color:'#fbbf24'}}>{planDoseUnits} units</strong> on insulin syringe {planMcg&&<span>({planMcg} mcg)</span>}</div>
                  <div>📅 Frequency: {FREQ_LABELS[planFreq]||planFreq}</div>
                  <div>⚗️ Reconstituted: {planVialMg}mg in {planReconMl}mL BAC water</div>
                  {planNotes&&<div>📝 {planNotes}</div>}
                </div>
              )}

              <button onClick={sendPlan} disabled={sending||!planPatient||!planEmail||!planPeptide||!planDoseUnits} style={{background:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'#7b1c2e':'#2d0e18',color:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'#fff':'#5a2030',border:'none',borderRadius:'10px',padding:'13px 24px',fontSize:'14px',fontWeight:700,cursor:!sending&&planPatient&&planEmail&&planPeptide&&planDoseUnits?'pointer':'not-allowed'}}>{sending?'Sending...':'📧 Send Plan to Patient'}</button>
              {planResult&&<div style={{marginTop:'10px',fontSize:'13px',color:planResult.startsWith('✓')?'#34d399':'#f87171',fontWeight:600}}>{planResult}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
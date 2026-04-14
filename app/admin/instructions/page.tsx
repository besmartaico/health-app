// @ts-nocheck
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };
const card = { background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'12px', padding:'20px' };

// ── Rich Text Toolbar ──
// Inserts markdown-style formatting at the cursor position in a textarea
function RichTextArea({ value, onChange, placeholder, minHeight = '160px', id }) {
  const ref = useRef(null);

  const insert = useCallback((before, after = '', sample = '') => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end) || sample;
    const newVal = el.value.substring(0, start) + before + selected + after + el.value.substring(end);
    onChange(newVal);
    // Restore cursor after React re-render
    setTimeout(() => {
      el.focus();
      const newPos = start + before.length + selected.length + after.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  }, [onChange]);

  const insertLine = useCallback((prefix) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    // Find start of current line
    const beforeCursor = el.value.substring(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const newVal = el.value.substring(0, lineStart) + prefix + el.value.substring(lineStart);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [onChange]);

  const btnStyle = (color = '#6b7280') => ({
    background:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:'6px',
    color, fontSize:'12px', fontWeight:700, padding:'4px 8px',
    cursor:'pointer', lineHeight:1.2, whiteSpace:'nowrap',
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'6px',background:'#111',border:'1px solid #2a2a2a',borderRadius:'8px 8px 0 0',padding:'6px 8px',borderBottom:'1px solid #1a1a1a'}}>
        <button type='button' style={btnStyle('#93c5fd')} title='Bold' onClick={()=>insert('**','**','bold text')}>B</button>
        <button type='button' style={{...btnStyle('#d1d5db'),fontStyle:'italic'}} title='Italic' onClick={()=>insert('*','*','italic text')}>I</button>
        <button type='button' style={btnStyle('#d1d5db')} title='Underline' onClick={()=>insert('__','__','underlined text')}>U̲</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}} />
        <button type='button' style={btnStyle('#34d399')} title='Bullet point' onClick={()=>insertLine('• ')}>• Bullet</button>
        <button type='button' style={btnStyle('#fbbf24')} title='Numbered list' onClick={()=>insertLine('1. ')}>1. List</button>
        <div style={{width:'1px',background:'#2a2a2a',margin:'0 2px'}} />
        <button type='button' style={btnStyle('#a78bfa')} title='Section heading' onClick={()=>insertLine('## ')}>## Heading</button>
        <button type='button' style={btnStyle('#6b7280')} title='Horizontal divider' onClick={()=>insert('\n---\n')}>― Divider</button>
      </div>
      {/* Textarea */}
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{...inp, minHeight, resize:'vertical', fontFamily:'monospace', fontSize:'13px', lineHeight:1.7,
                borderRadius:'0 0 8px 8px', borderTop:'none'}}
      />
      {/* Mini legend */}
      <div style={{fontSize:'10px',color:'#374151',marginTop:'3px',display:'flex',gap:'12px',flexWrap:'wrap'}}>
        <span>**bold**</span><span>*italic*</span><span>• bullet</span><span>## heading</span>
      </div>
    </div>
  );
}

// ── Searchable Dropdown ──
function SearchableDropdown({ options, value, onChange, placeholder, instrMap }) {
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
          <div style={{padding:'8px'}}><input autoFocus type='text' placeholder='Search peptides...' value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,fontSize:'13px',padding:'8px 12px'}} onClick={e=>e.stopPropagation()} /></div>
          <div style={{maxHeight:'220px',overflowY:'auto'}}>
            {filtered.length===0
              ? <div style={{padding:'12px 16px',color:'#4b5563',fontSize:'13px'}}>No matches</div>
              : filtered.map(o=>(
                <div key={o} onClick={()=>{onChange(o);setOpen(false);setSearch('');}}
                  style={{padding:'10px 16px',fontSize:'13px',color:o===value?'#fff':'#9ca3af',background:o===value?'rgba(123,28,46,0.25)':'transparent',cursor:'pointer',borderLeft:o===value?'2px solid #7b1c2e':'2px solid transparent',display:'flex',alignItems:'center',justifyContent:'space-between'}}
                  onMouseOver={e=>{if(o!==value)e.currentTarget.style.background='rgba(255,255,255,0.05)';}}
                  onMouseOut={e=>{if(o!==value)e.currentTarget.style.background='transparent';}}
                >
                  <span>{o}</span>
                  {instrMap&&instrMap[o]?.text&&<span style={{fontSize:'10px',color:'#34d399',marginLeft:'6px'}}>✓</span>}
                </div>
              ))
            }
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
      const raw = d.instructions || {};
      const map = {};
      // Handle both array format [{peptide,text,...}] and object format {"name":"text or json"}
      if (Array.isArray(raw)) {
        raw.forEach(i => { map[i.peptide] = i; });
      } else {
        Object.entries(raw).forEach(([peptide, val]) => {
          if (typeof val === 'string') {
            // Try to parse as JSON first (new multi-field format stored as string)
            try { map[peptide] = { peptide, ...JSON.parse(val) }; }
            catch { map[peptide] = { peptide, text: val }; } // plain text (old format)
          } else if (typeof val === 'object' && val) {
            map[peptide] = { peptide, ...val };
          }
        });
      }
      // Merge any localStorage drafts on top (drafts win over sheet for unsaved changes)
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

  // When selecting from list, also sync the dropdown
  const selectPeptide = (name) => {
    setSelected(name);
  };

  const currentInstr = instructions[selected] || {};
  const setField = (field, val) => {
    setInstructions(prev => {
      const updated = { ...(prev[selected]||{peptide:selected}), [field]: val };
      const next = { ...prev, [selected]: updated };
      // Auto-save draft to localStorage immediately
      try {
        const drafts = JSON.parse(localStorage.getItem('instr_drafts') || '{}');
        drafts[selected] = { ...drafts[selected], [field]: val };
        localStorage.setItem('instr_drafts', JSON.stringify(drafts));
      } catch {}
      return next;
    });
    setUnsaved(prev => new Set([...prev, selected]));
  };

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
      {toast&&<div style={{position:'fixed',top:'70px',left:'50%',transform:'translateX(-50%)',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:200,whiteSpace:'nowrap'}}>{toastErr?'⚠️ ':'✓ '}{toast}</div>}

      {/* ── SIDEBAR ── */}
      <div style={{width:'240px',flexShrink:0,background:'#111',borderRight:'1px solid #1a1a1a',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #1a1a1a'}}>
          <h2 style={{color:'#fff',fontSize:'14px',fontWeight:700,margin:'0 0 12px'}}>Peptide Instructions</h2>
          {/* Tab switcher */}
          <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'7px',padding:'3px',marginBottom:'12px'}}>
            {['instructions','plan'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:tab===t?'#0f0f0f':'transparent',color:tab===t?'#fff':'#6b7280',border:tab===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'5px',padding:'5px 4px',fontSize:'11px',fontWeight:tab===t?600:400,cursor:'pointer'}}>
                {t==='plan'?'Patient Plan':'Instructions'}
              </button>
            ))}
          </div>
          {/* Searchable dropdown — synced with list below */}
          <SearchableDropdown
            options={visiblePeptides}
            value={selected}
            onChange={selectPeptide}
            placeholder='Select peptide...'
            instrMap={instructions}
          />
        </div>

        {/* ── Clickable list — also selects peptide ── */}
        <div style={{flex:1,overflowY:'auto'}}>
          {peptides.length===0 && <p style={{color:'#374151',fontSize:'12px',padding:'12px 16px'}}>No purchases yet.</p>}
          {visiblePeptides.map(name => (
            <div key={name} style={{display:'flex',alignItems:'center',borderLeft:name===selected?'2px solid #7b1c2e':'2px solid transparent'}}>
              {/* Clickable row selects the peptide */}
              <button
                onClick={() => selectPeptide(name)}
                style={{flex:1,textAlign:'left',padding:'10px 14px',background:name===selected?'rgba(123,28,46,0.18)':'transparent',color:name===selected?'#fff':'#9ca3af',border:'none',fontSize:'13px',fontWeight:name===selected?600:400,cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'6px'}}
                onMouseOver={e=>{if(name!==selected){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#d1d5db';}}}
                onMouseOut={e=>{if(name!==selected){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#9ca3af';}}}
              >
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{name}</span>
                {instructions[name]?.text && <span style={{fontSize:'10px',color:'#34d399',flexShrink:0}}>✓</span>}
              </button>
              {/* Hide button */}
              <button onClick={()=>toggleHide(name)} title='Hide' style={{background:'transparent',border:'none',color:'#1f1f1f',cursor:'pointer',fontSize:'13px',padding:'10px 10px',flexShrink:0}} onMouseOver={e=>e.currentTarget.style.color='#6b7280'} onMouseOut={e=>e.currentTarget.style.color='#1f1f1f'}>👁</button>
            </div>
          ))}
          {/* Hidden peptides */}
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
        {!selected ? (
          <div style={{textAlign:'center',padding:'80px',color:'#4b5563'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>💉</div><p>Select a peptide from the dropdown or list</p></div>
        ) : tab==='instructions' ? (
          /* ── INSTRUCTIONS TAB ── */
          <div style={{maxWidth:'800px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
              <div><h1 style={{color:'#fff',fontSize:'22px',fontWeight:800,margin:'0 0 4px'}}>{selected}</h1><p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Reconstitution &amp; patient instructions</p></div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                {unsaved.has(selected)&&<span style={{fontSize:'10px',color:'#fbbf24',fontWeight:700,background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.3)',borderRadius:'4px',padding:'2px 6px'}}>UNSAVED</span>}
                <button onClick={saveInstructions} disabled={saving} style={{background:saving?'#2d0e18':'#7b1c2e',color:saving?'#5a2030':'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:saving?'not-allowed':'pointer'}}>{saving?'Saving...':'Save'}</button>
              </div>
            </div>

            {/* Reconstitution */}
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

            {/* Patient Instructions — rich text */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Patient Instructions</label>
              <RichTextArea
                id='instr-text'
                value={currentInstr.text||''}
                onChange={val=>setField('text',val)}
                placeholder={'Instructions for '+selected+'...\n\nTip: use the toolbar above to add bullets, bold text, headings, etc.'}
                minHeight='180px'
              />
            </div>

            {/* Side Effects — rich text */}
            <div style={{...card,marginBottom:'14px'}}>
              <label style={{...lbl,marginBottom:'8px'}}>Side Effects &amp; Notes</label>
              <RichTextArea
                id='instr-side'
                value={currentInstr.sideEffects||''}
                onChange={val=>setField('sideEffects',val)}
                placeholder={'• Common side effect 1\n• Common side effect 2\n\nTip: click • Bullet to add bullet points'}
                minHeight='120px'
              />
            </div>

            {/* Storage */}
            <div style={card}><label style={lbl}>Storage</label><input type='text' value={currentInstr.storage||''} onChange={e=>setField('storage',e.target.value)} placeholder='e.g. Refrigerate after reconstitution. Use within 28 days.' style={inp} /></div>
          </div>
        ) : (
          /* ── PATIENT PLAN TAB ── */
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
                <div><label style={lbl}>Peptide</label><SearchableDropdown options={visiblePeptides} value={planPeptide} onChange={setPlanPeptide} placeholder='Search peptide...' instrMap={instructions} /></div>
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
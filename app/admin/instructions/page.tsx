// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';

const PEPTIDES = ['BPC-157','TB-500','CJC-1295','Ipamorelin','Semaglutide','Tirzepatide','NAD+','Sermorelin','GHK-Cu','PT-141','Oxytocin'];
const inp = { width:'100%', background:'#0f0f0f', border:'1px solid #2a2a2a', borderRadius:'8px', padding:'10px 13px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' };
const lbl = { display:'block', color:'#6b7280', fontSize:'11px', fontWeight:600, marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.07em' };

const DEFAULT_INSTRUCTIONS = {
  'BPC-157': `Reconstitution:\n• Add 2mL bacteriostatic water to vial\n• Concentration: 2500 mcg/mL\n\nDosing Protocol:\n• Typical dose: 250-500 mcg twice daily\n• Inject subcutaneously near injury site\n• Morning and evening injections\n\nStorage:\n• Refrigerate after reconstitution\n• Use within 30 days\n• Keep away from light`,
  'Semaglutide': `Reconstitution:\n• Add 2mL bacteriostatic water to 5mg vial\n• Concentration: 2.5 mg/mL\n\nDosing Protocol (Weekly):\n• Week 1-4: 0.25 mg weekly\n• Week 5-8: 0.5 mg weekly\n• Week 9+: 1 mg weekly (maintenance)\n\nInjection:\n• Subcutaneous injection in abdomen or thigh\n• Rotate injection sites\n• Same day each week`,
  'Tirzepatide': `Reconstitution:\n• Add 2mL bacteriostatic water to 5mg vial\n\nDosing Protocol (Weekly):\n• Week 1-4: 2.5 mg weekly\n• Week 5-8: 5 mg weekly\n• Week 9+: 7.5 mg as needed\n\nInjection:\n• Subcutaneous, rotate sites\n• Weekly same day`,
};

export default function InstructionsPage() {
  const [activeTab,setActiveTab]=useState('instructions');
  const [selectedPeptide,setSelectedPeptide]=useState('BPC-157');
  const [instructions,setInstructions]=useState({});
  const [editMode,setEditMode]=useState(false);
  const [editText,setEditText]=useState('');
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState('');
  // Plan generator
  const [planCustomer,setPlanCustomer]=useState('');
  const [planCustomerEmail,setPlanCustomerEmail]=useState('');
  const [planPeptides,setPlanPeptides]=useState([{peptide:'BPC-157',dose:'250',frequency:'twice daily',duration:'8 weeks',notes:''}]);
  const [planGoal,setPlanGoal]=useState('');
  const [planLoading,setPlanLoading]=useState(false);
  const [planResult,setPlanResult]=useState('');
  const [planError,setPlanError]=useState('');
  const [sending,setSending]=useState(false);

  useEffect(()=>{ loadInstructions(); },[]);

  const loadInstructions = async () => {
    try {
      const r=await fetch('/api/instructions').then(x=>x.json());
      setInstructions({...DEFAULT_INSTRUCTIONS,...(r.instructions||{})});
    } catch { setInstructions({...DEFAULT_INSTRUCTIONS}); }
  };

  const getCurrentText = () => instructions[selectedPeptide]||`No instructions yet for ${selectedPeptide}.\n\nClick Edit to add instructions.`;

  const startEdit = () => { setEditText(getCurrentText()); setEditMode(true); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated={...instructions,[selectedPeptide]:editText};
      await fetch('/api/instructions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({peptide:selectedPeptide,text:editText})});
      setInstructions(updated);
      setEditMode(false);
      setToast('Instructions saved!');
      setTimeout(()=>setToast(''),3000);
    } catch(e){setToast('Error: '+String(e));}
    setSaving(false);
  };

  const addPlanRow = () => setPlanPeptides(p=>[...p,{peptide:'BPC-157',dose:'250',frequency:'daily',duration:'4 weeks',notes:''}]);
  const removePlanRow = (i) => setPlanPeptides(p=>p.filter((_,idx)=>idx!==i));
  const updatePlanRow = (i,field,val) => setPlanPeptides(p=>p.map((r,idx)=>idx===i?{...r,[field]:val}:r));

  const generatePlan = async () => {
    if(!planCustomer.trim()){setPlanError('Please enter customer name.');return;}
    setPlanLoading(true); setPlanError(''); setPlanResult('');
    try {
      const prompt=`Create a personalized peptide protocol plan for ${planCustomer}.\nGoal: ${planGoal||'General wellness'}\n\nPrescribed peptides:\n${planPeptides.map(p=>`- ${p.peptide}: ${p.dose}mcg ${p.frequency} for ${p.duration}${p.notes?', notes: '+p.notes:''}`).join('\n')}\n\nPlease create a professional, detailed patient instruction plan including:\n1. Overview of each peptide and its benefits for their goals\n2. Reconstitution instructions\n3. Exact dosing schedule\n4. Storage instructions\n5. What to expect / timeline\n6. Important safety notes\n\nFormat it as a clean patient-friendly document they can follow.`;
      const res=await fetch('/api/peptide-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt})});
      const d=await res.json();
      setPlanResult(d.response||d.error||'No response');
    } catch(e){setPlanError(String(e));}
    setPlanLoading(false);
  };

  const emailPlan = async () => {
    if(!planCustomerEmail){setPlanError('Enter customer email to send.');return;}
    setSending(true);
    try {
      const res=await fetch('/api/send-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:planCustomerEmail,name:planCustomer,plan:planResult})});
      const d=await res.json();
      if(d.success)setToast('Plan emailed to '+planCustomerEmail+'!');
      else setPlanError(d.error||'Failed to send');
    } catch(e){setPlanError(String(e));}
    setSending(false);
  };

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'1000px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:'#1a3a2a',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'10px',padding:'12px 20px',color:'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>✓ {toast}</div>}

      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Instructions & Patient Plans</h1>
        <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Manage peptide instructions and generate personalized patient plans</p>
      </div>

      <div style={{display:'flex',gap:'4px',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'4px',marginBottom:'24px',width:'fit-content'}}>
        {[['instructions','📋 Instructions'],['plan','✉️ Create Patient Plan']].map(([t,label])=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{background:activeTab===t?'#0f0f0f':'transparent',color:activeTab===t?'#fff':'#6b7280',border:activeTab===t?'1px solid #2a2a2a':'1px solid transparent',borderRadius:'7px',padding:'8px 18px',fontSize:'13px',fontWeight:activeTab===t?600:400,cursor:'pointer'}}>{label}</button>
        ))}
      </div>

      {activeTab==='instructions'&&(
        <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:'16px'}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'8px',height:'fit-content'}}>
            {PEPTIDES.map(p=>(
              <button key={p} onClick={()=>{setSelectedPeptide(p);setEditMode(false);}} style={{width:'100%',textAlign:'left',padding:'10px 14px',borderRadius:'8px',border:'none',background:selectedPeptide===p?'rgba(123,28,46,0.25)':'transparent',color:selectedPeptide===p?'#f87171':'#9ca3af',fontSize:'13px',fontWeight:selectedPeptide===p?600:400,cursor:'pointer',borderLeft:selectedPeptide===p?'2px solid #7b1c2e':'2px solid transparent',marginBottom:'1px'}} onMouseOver={e=>{if(selectedPeptide!==p)e.currentTarget.style.background='rgba(255,255,255,0.04)';}} onMouseOut={e=>{if(selectedPeptide!==p)e.currentTarget.style.background='transparent';}}>{p}</button>
            ))}
          </div>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'24px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
              <h2 style={{color:'#fff',fontSize:'18px',fontWeight:700,margin:0}}>{selectedPeptide}</h2>
              {!editMode&&<button onClick={startEdit} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#9ca3af',fontSize:'13px',padding:'7px 16px',cursor:'pointer'}}>✏️ Edit</button>}
            </div>
            {editMode?(
              <><textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #3a3a3a',borderRadius:'10px',padding:'16px',color:'#d1d5db',fontSize:'13px',lineHeight:1.8,fontFamily:'monospace',minHeight:'360px',outline:'none',resize:'vertical',boxSizing:'border-box'}} />
                <div style={{display:'flex',gap:'10px',marginTop:'12px'}}>
                  <button onClick={saveEdit} disabled={saving} style={{flex:1,background:'#7b1c2e',color:'#fff',border:'none',borderRadius:'9px',padding:'11px',fontSize:'13px',fontWeight:700,cursor:'pointer'}}>{saving?'Saving...':'Save Instructions'}</button>
                  <button onClick={()=>setEditMode(false)} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'9px',padding:'11px',fontSize:'13px',cursor:'pointer'}}>Cancel</button>
                </div>
              </>
            ):(
              <div style={{color:'#d1d5db',fontSize:'13px',lineHeight:2,whiteSpace:'pre-wrap',background:'#0f0f0f',borderRadius:'10px',padding:'20px',minHeight:'300px'}}>{getCurrentText()}</div>
            )}
          </div>
        </div>
      )}

      {activeTab==='plan'&&(
        <div>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'24px',marginBottom:'16px'}}>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'0 0 20px'}}>Patient Information</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'14px'}}>
              <div><label style={lbl}>Customer Name *</label><input type='text' placeholder='Jane Smith' value={planCustomer} onChange={e=>setPlanCustomer(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Email (for sending)</label><input type='email' placeholder='jane@example.com' value={planCustomerEmail} onChange={e=>setPlanCustomerEmail(e.target.value)} style={inp} /></div>
              <div style={{gridColumn:'1/-1'}}><label style={lbl}>Goal / Reason</label><input type='text' placeholder='e.g. Weight loss, injury recovery, anti-aging...' value={planGoal} onChange={e=>setPlanGoal(e.target.value)} style={inp} /></div>
            </div>
            <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:'20px 0 14px'}}>Prescribed Peptides</h3>
            {planPeptides.map((row,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 1fr 100px 1fr 36px',gap:'8px',marginBottom:'10px',alignItems:'end'}}>
                <div><label style={lbl}>Peptide</label><select value={row.peptide} onChange={e=>updatePlanRow(i,'peptide',e.target.value)} style={{...inp,color:'#fff'}}>{PEPTIDES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
                <div><label style={lbl}>Dose (mcg)</label><input type='number' value={row.dose} onChange={e=>updatePlanRow(i,'dose',e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Frequency</label><input type='text' placeholder='twice daily' value={row.frequency} onChange={e=>updatePlanRow(i,'frequency',e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Duration</label><input type='text' placeholder='8 weeks' value={row.duration} onChange={e=>updatePlanRow(i,'duration',e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Notes</label><input type='text' placeholder='Optional' value={row.notes} onChange={e=>updatePlanRow(i,'notes',e.target.value)} style={inp} /></div>
                <div style={{paddingBottom:'1px'}}><button onClick={()=>removePlanRow(i)} disabled={planPeptides.length===1} style={{width:'36px',height:'38px',background:'transparent',border:'1px solid #2a2a2a',borderRadius:'7px',color:'#6b7280',cursor:'pointer',fontSize:'16px'}}>×</button></div>
              </div>
            ))}
            <button onClick={addPlanRow} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#9ca3af',fontSize:'13px',padding:'8px 16px',cursor:'pointer',marginBottom:'20px'}}>+ Add Peptide</button>
            {planError&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:'8px',padding:'11px',color:'#fca5a5',fontSize:'13px',marginBottom:'12px'}}>⚠️ {planError}</div>}
            <button onClick={generatePlan} disabled={planLoading} style={{width:'100%',background:planLoading?'#2d0e18':'#7b1c2e',color:planLoading?'#6b2d3e':'#fff',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:planLoading?'not-allowed':'pointer'}}>
              {planLoading?'🤖 Generating plan...':'🤖 Generate Patient Plan'}
            </button>
          </div>

          {planResult&&(
            <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                <h3 style={{color:'#fff',fontSize:'16px',fontWeight:700,margin:0}}>Generated Plan for {planCustomer}</h3>
                <div style={{display:'flex',gap:'8px'}}>
                  <button onClick={()=>{navigator.clipboard?.writeText(planResult);setToast('Copied!');setTimeout(()=>setToast(''),2000);}} style={{background:'#242424',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#9ca3af',fontSize:'12px',padding:'7px 14px',cursor:'pointer'}}>📋 Copy</button>
                  {planCustomerEmail&&<button onClick={emailPlan} disabled={sending} style={{background:'#7b1c2e',border:'none',borderRadius:'8px',color:'#fff',fontSize:'12px',padding:'7px 14px',cursor:'pointer',fontWeight:600}}>{sending?'Sending...':'📧 Email to Patient'}</button>}
                </div>
              </div>
              <div style={{background:'#0f0f0f',borderRadius:'10px',padding:'20px',color:'#d1d5db',fontSize:'13px',lineHeight:1.9,whiteSpace:'pre-wrap',maxHeight:'500px',overflowY:'auto'}}>{planResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
'use client';
// @ts-nocheck
import { useState, useEffect } from 'react';

const LOGO = '/logo.png';

function ContactForm() {
  const [form, setForm] = useState({name:'',email:'',phone:'',goals:'',questions:''});
  const [status, setStatus] = useState('');
  const inp:any = {width:'100%',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'12px 14px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box'};
  const lbl:any = {display:'block',color:'#9ca3af',fontSize:'13px',fontWeight:600,marginBottom:'6px'};
  const f = (k:string) => (e:any) => setForm((p:any)=>({...p,[k]:e.target.value}));
  async function submit(e:any) {
    e.preventDefault(); setStatus('sending');
    try {
      await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      setStatus('sent'); setForm({name:'',email:'',phone:'',goals:'',questions:''});
    } catch { setStatus('error'); }
  }
  return (
    <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'20px'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div><label style={lbl}>Name *</label><input required value={form.name} onChange={f('name')} placeholder='Your full name' style={inp}/></div>
        <div><label style={lbl}>Phone</label><input value={form.phone} onChange={f('phone')} placeholder='(555) 000-0000' style={inp}/></div>
      </div>
      <div><label style={lbl}>Email *</label><input required type='email' value={form.email} onChange={f('email')} placeholder='you@email.com' style={inp}/></div>
      <div><label style={lbl}>Your Goals</label><textarea value={form.goals} onChange={f('goals')} placeholder='What are you hoping to achieve?' rows={4} style={{...inp,resize:'vertical'}}/></div>
      <div><label style={lbl}>Questions</label><textarea value={form.questions} onChange={f('questions')} placeholder='Any questions for us...' rows={3} style={{...inp,resize:'vertical'}}/></div>
      <button type='submit' disabled={status==='sending'} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'10px',padding:'14px',fontSize:'16px',fontWeight:700,cursor:'pointer',opacity:status==='sending'?0.7:1}}>
        {status==='sending'?'Sending...':'Send My Info'}
      </button>
      {status==='sent'&&<p style={{color:'#34d399',textAlign:'center',fontWeight:600}}>Got it! We will be in touch within 24 hours.</p>}
      {status==='error'&&<p style={{color:'#f87171',textAlign:'center'}}>Something went wrong. Please try again.</p>}
    </form>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  useEffect(()=>{ fetch('/api/inventory').then(r=>r.json()).then(d=>setItems(d.items||[])); },[]);
  const peptides = items.filter((i:any)=>i.itemType==='Peptide');
  const cardStyle:any = {background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'16px',padding:'24px',display:'flex',alignItems:'flex-start',gap:'16px'};
  const features = [
    {icon:'🔬',title:'3rd Party Tested',desc:'Every batch independently tested at 98%+ purity'},
    {icon:'✅',title:'Lab Verified Quality',desc:'Rigorous quality control on every formulation'},
    {icon:'💊',title:'Peptides',desc:'Custom-formulated to your specific protocol'},
    {icon:'🩺',title:'Expert Guidance',desc:'Personalized dosing protocols & ongoing support'},
  ];
  return (
    <main style={{minHeight:'100vh',background:'#131313',color:'#fff',fontFamily:'system-ui,sans-serif'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 24px',borderBottom:'1px solid #1f1f1f',position:'sticky',top:0,background:'rgba(19,19,19,0.95)',backdropFilter:'blur(10px)',zIndex:50}}>
        <img src={LOGO} alt='HealthEasy' style={{height:'56px',display:'block'}}/>
        <a href='/admin' style={{background:'#1a4fa8',color:'#fff',padding:'8px 20px',borderRadius:'8px',textDecoration:'none',fontWeight:600,fontSize:'14px'}}>Login</a>
      </nav>
      <section style={{textAlign:'center',padding:'100px 24px 80px'}}>
        <h1 style={{fontSize:'clamp(40px,6vw,72px)',fontWeight:900,lineHeight:1.1,margin:'0 0 20px',letterSpacing:'-1.5px'}}>
          Precision Wellness<br />
          <span style={{color:'#1a4fa8'}}>Peptides</span>
        </h1>
        <p style={{fontSize:'18px',color:'#9ca3af',lineHeight:1.6,maxWidth:'560px',margin:'0 auto 40px'}}>
          Personalized peptide therapies, independently tested and batch-documented for your confidence.
        </p>
        <a href='#get-started' style={{background:'#1a4fa8',color:'#fff',padding:'14px 32px',borderRadius:'12px',textDecoration:'none',fontWeight:700,fontSize:'16px',display:'inline-block'}}>
          View Our Peptides
        </a>
      </section>
      <section style={{padding:'0 24px 80px',maxWidth:'900px',margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'16px'}}>
          {features.map(feat=>(
            <div key={feat.title} style={cardStyle}>
              <span style={{fontSize:'28px'}}>{feat.icon}</span>
              <div>
                <div style={{fontWeight:700,marginBottom:'4px'}}>{feat.title}</div>
                <div style={{color:'#6b7280',fontSize:'14px'}}>{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{padding:'0 24px 80px',maxWidth:'900px',margin:'0 auto'}}>
        <h2 style={{fontSize:'32px',fontWeight:800,textAlign:'center',margin:'0 0 40px'}}>Our Peptides</h2>
        {peptides.length>0?(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'16px'}}>
            {peptides.map((it:any)=>(
              <div key={it.id} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'12px',padding:'20px'}}>
                <div style={{fontWeight:700,marginBottom:'6px'}}>{it.name}</div>
                {it.priceStandard&&<div style={{color:'#1a4fa8',fontWeight:600}}>${it.priceStandard}</div>}
              </div>
            ))}
          </div>
        ):(
          <p style={{textAlign:'center',color:'#4b5563'}}>Peptide catalog coming soon.</p>
        )}
      </section>
      <section id='get-started' style={{padding:'80px 24px',background:'#0d0d0d'}}>
        <div style={{maxWidth:'640px',margin:'0 auto'}}>
          <h2 style={{fontSize:'32px',fontWeight:800,color:'#fff',textAlign:'center',margin:'0 0 8px'}}>Get Started</h2>
          <p style={{color:'#6b7280',textAlign:'center',margin:'0 0 40px',fontSize:'16px'}}>Tell us about yourself and your goals — we will be in touch within 24 hours.</p>
          <ContactForm />
        </div>
      </section>
      <footer style={{textAlign:'center',padding:'32px 24px',borderTop:'1px solid #1f1f1f',color:'#4b5563',fontSize:'14px'}}>
        HealthEasy. All rights reserved.
      </footer>
    </main>
  );
}
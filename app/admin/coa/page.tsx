// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

const PEPTIDES = ['BPC-157','TB-500','CJC-1295','Ipamorelin','Semaglutide','Tirzepatide','NAD+','Sermorelin','GHK-Cu','PT-141','Oxytocin'];

export default function COAPage() {
  const [docs,setDocs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);
  const [showUpload,setShowUpload]=useState(false);
  const [peptide,setPeptide]=useState('BPC-157');
  const [batchNo,setBatchNo]=useState('');
  const [testDate,setTestDate]=useState('');
  const [purity,setPurity]=useState('');
  const [notes,setNotes]=useState('');
  const [file,setFile]=useState(null);
  const [toast,setToast]=useState('');
  const [toastErr,setToastErr]=useState(false);
  const [filterPeptide,setFilterPeptide]=useState('All');
  const [search,setSearch]=useState('');
  const fileRef=useRef(null);

  useEffect(()=>{ load(); },[]);

  const load = async () => {
    setLoading(true);
    try { const r=await fetch('/api/coa').then(x=>x.json()); setDocs(r.docs||[]); } catch {}
    setLoading(false);
  };

  const showT=(msg,err)=>{ setToast(msg); setToastErr(!!err); setTimeout(()=>setToast(''),3500); };

  const upload = async () => {
    if(!file&&!batchNo){showT('Please add a batch number.',true);return;}
    setUploading(true);
    try {
      let fileData=null; let fileName=''; let fileType='';
      if(file){
        const reader=new FileReader();
        await new Promise(r=>{reader.onload=e=>{fileData=e.target.result.split(',')[1];fileName=file.name;fileType=file.type;r();};reader.readAsDataURL(file);});
      }
      const res=await fetch('/api/coa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'upload',peptide,batchNo,testDate,purity,notes,fileData,fileName,fileType})});
      const d=await res.json();
      if(d.error)showT('Error: '+d.error,true);
      else{showT('COA uploaded!',false);setShowUpload(false);setBatchNo('');setTestDate('');setPurity('');setNotes('');setFile(null);await load();}
    } catch(e){showT('Error: '+String(e),true);}
    setUploading(false);
  };

  const del = async (id,name) => {
    if(!confirm('Delete COA for '+name+'?'))return;
    await fetch('/api/coa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'delete',id})});
    await load();
  };

  const filtered=docs.filter(d=>{
    const mp=filterPeptide==='All'||d.peptide===filterPeptide;
    const ms=!search||d.peptide?.toLowerCase().includes(search.toLowerCase())||d.batchNo?.toLowerCase().includes(search.toLowerCase());
    return mp&&ms;
  });

  const purityColor=(p)=>{ const n=parseFloat(p); if(!n)return'#9ca3af'; if(n>=99)return'#34d399'; if(n>=95)return'#60a5fa'; if(n>=90)return'#fbbf24'; return'#f87171'; };

  return (
    <div style={{background:'#131313',minHeight:'100vh',padding:'28px',maxWidth:'1100px'}}>
      {toast&&<div style={{position:'fixed',top:'24px',right:'24px',background:toastErr?'#3a1a1a':'#1a3a2a',border:'1px solid '+(toastErr?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'),borderRadius:'10px',padding:'12px 20px',color:toastErr?'#fca5a5':'#34d399',fontSize:'13px',fontWeight:600,zIndex:100}}>✓ {toast}</div>}

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'24px'}}>
        <div>
          <h1 style={{fontSize:'22px',fontWeight:800,color:'#fff',margin:'0 0 4px'}}>COA Document Library</h1>
          <p style={{color:'#6b7280',fontSize:'13px',margin:0}}>Certificates of Analysis — {docs.length} documents on file</p>
        </div>
        <button onClick={()=>setShowUpload(true)} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'9px',padding:'10px 20px',fontSize:'13px',fontWeight:600,cursor:'pointer'}}>+ Upload COA</button>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'14px'}}>
        {['All',...PEPTIDES].map(p=>(
          <button key={p} onClick={()=>setFilterPeptide(p)} style={{background:filterPeptide===p?'rgba(26,79,168,0.2)':'#1a1a1a',color:filterPeptide===p?'#f87171':'#6b7280',border:'1px solid '+(filterPeptide===p?'rgba(26,79,168,0.35)':'#2a2a2a'),borderRadius:'20px',padding:'5px 13px',fontSize:'12px',cursor:'pointer',fontWeight:filterPeptide===p?600:400}}>{p}</button>
        ))}
      </div>
      <div style={{marginBottom:'20px'}}>
        <input type='text' placeholder='Search by peptide or batch number...' value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',maxWidth:'320px',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'9px 13px',color:'#fff',fontSize:'13px',outline:'none',boxSizing:'border-box'}} />
      </div>

      {loading?<div style={{padding:'48px',textAlign:'center',color:'#4b5563'}}>Loading...</div>
      :filtered.length===0?(
        <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'60px',textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🔬</div>
          <div style={{color:'#fff',fontWeight:700,fontSize:'17px',marginBottom:'8px'}}>{docs.length===0?'No COAs yet':'No matching documents'}</div>
          <div style={{color:'#4b5563',fontSize:'13px',marginBottom:'20px'}}>{docs.length===0?'Upload your first Certificate of Analysis to get started.':'Try a different filter.'}</div>
          {docs.length===0&&<button onClick={()=>setShowUpload(true)} style={{background:'#1a4fa8',color:'#fff',border:'none',borderRadius:'9px',padding:'11px 22px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>+ Upload First COA</button>}
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px'}}>
          {filtered.map((doc,i)=>(
            <div key={i} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'14px',padding:'20px',display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{color:'#fff',fontWeight:700,fontSize:'15px',marginBottom:'3px'}}>{doc.peptide}</div>
                  <div style={{color:'#4b5563',fontSize:'12px'}}>Batch: {doc.batchNo||'—'}</div>
                </div>
                {doc.purity&&<div style={{textAlign:'right'}}><div style={{color:purityColor(doc.purity),fontWeight:800,fontSize:'20px'}}>{doc.purity}%</div><div style={{color:'#4b5563',fontSize:'11px'}}>Purity</div></div>}
              </div>
              {doc.testDate&&<div style={{display:'flex',alignItems:'center',gap:'6px',color:'#6b7280',fontSize:'12px'}}><span>📅</span> Tested: {doc.testDate}</div>}
              {doc.notes&&<div style={{color:'#4b5563',fontSize:'12px',lineHeight:1.5}}>{doc.notes}</div>}
              <div style={{display:'flex',gap:'8px',marginTop:'auto'}}>
                {doc.fileUrl&&<a href={doc.fileUrl} target='_blank' rel='noreferrer' style={{flex:1,background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:'8px',color:'#60a5fa',fontSize:'12px',padding:'8px',textAlign:'center',textDecoration:'none',fontWeight:600}}>📄 View PDF</a>}
                <button onClick={()=>del(doc.id||i,doc.peptide)} style={{background:'transparent',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#6b7280',fontSize:'12px',padding:'8px 12px',cursor:'pointer'}} onMouseOver={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.borderColor='rgba(239,68,68,0.35)';}} onMouseOut={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#2a2a2a';}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50}}>
          <div style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'18px',padding:'32px',width:'100%',maxWidth:'480px',boxShadow:'0 32px 64px rgba(0,0,0,0.5)',maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{color:'#fff',fontSize:'20px',fontWeight:800,margin:'0 0 24px'}}>Upload COA</h2>
            <div style={{display:'grid',gap:'14px'}}>
              <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Peptide *</label><select value={peptide} onChange={e=>setPeptide(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 13px',color:'#fff',fontSize:'14px',outline:'none'}}>{PEPTIDES.map(p=><option key={p} value={p}>{p}</option>)}</select></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Batch Number *</label><input type='text' placeholder='e.g. BPC-2024-001' value={batchNo} onChange={e=>setBatchNo(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 13px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Test Date</label><input type='date' value={testDate} onChange={e=>setTestDate(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 13px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box',colorScheme:'dark'}} /></div>
              </div>
              <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Purity (%)</label><input type='number' placeholder='e.g. 99.2' value={purity} onChange={e=>setPurity(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 13px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} /></div>
              <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Notes</label><input type='text' placeholder='Lab name, additional info...' value={notes} onChange={e=>setNotes(e.target.value)} style={{width:'100%',background:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'8px',padding:'10px 13px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} /></div>
              <div><label style={{display:'block',color:'#6b7280',fontSize:'11px',fontWeight:600,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.07em'}}>PDF Document</label>
                <div onClick={()=>fileRef.current?.click()} style={{border:'2px dashed #2a2a2a',borderRadius:'10px',padding:'20px',textAlign:'center',cursor:'pointer',background:'rgba(255,255,255,0.01)'}} onMouseOver={e=>e.currentTarget.style.borderColor='#1a4fa8'} onMouseOut={e=>e.currentTarget.style.borderColor='#2a2a2a'}>
                  {file?<div style={{color:'#34d399',fontSize:'13px',fontWeight:600}}>📄 {file.name}</div>:<div style={{color:'#4b5563',fontSize:'13px'}}>Click to upload PDF<br/><span style={{fontSize:'11px',color:'#374151'}}>PDF, max 10MB</span></div>}
                </div>
                <input ref={fileRef} type='file' accept='.pdf,.png,.jpg' onChange={e=>setFile(e.target.files[0])} style={{display:'none'}} />
              </div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px'}}>
              <button onClick={upload} disabled={uploading||!batchNo.trim()} style={{flex:1,background:!uploading&&batchNo.trim()?'#1a4fa8':'#0d2d6b',color:!uploading&&batchNo.trim()?'#fff':'#1a3a7a',border:'none',borderRadius:'10px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:!uploading&&batchNo.trim()?'pointer':'not-allowed'}}>{uploading?'Uploading...':'Upload COA'}</button>
              <button onClick={()=>{setShowUpload(false);setBatchNo('');setTestDate('');setPurity('');setNotes('');setFile(null);}} style={{flex:1,background:'#242424',color:'#9ca3af',border:'1px solid #2a2a2a',borderRadius:'10px',padding:'13px',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
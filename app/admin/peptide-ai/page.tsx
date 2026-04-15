// @ts-nocheck
'use client';
import { useState, useEffect, useRef } from 'react';

const QUICK = [
  'What is BPC-157 used for?',
  'Compare Semaglutide vs Tirzepatide',
  'Explain GHK-Cu benefits',
  'What is the half-life of TB-500?',
  'Best peptides for recovery?',
  'How to store peptides properly?',
];

export default function PeptideAIPage() {
  const [messages,setMessages]=useState([{role:'assistant',content:'Hi! I\'m your Peptide AI assistant. Ask me anything about peptides, dosing, protocols, or client recommendations. 💊',ts:new Date()}]);
  const [input,setInput]=useState('');
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  const inputRef=useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const send = async (text) => {
    const msg=text||input.trim();
    if(!msg||loading)return;
    setInput('');
    const userMsg={role:'user',content:msg,ts:new Date()};
    setMessages(prev=>[...prev,userMsg]);
    setLoading(true);
    try {
      const res=await fetch('/api/peptide-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history:messages.slice(-10).map(m=>({role:m.role,content:m.content}))})});
      const d=await res.json();
      setMessages(prev=>[...prev,{role:'assistant',content:d.response||d.error||'Sorry, I encountered an error.',ts:new Date()}]);
    } catch(e){
      setMessages(prev=>[...prev,{role:'assistant',content:'Connection error: '+String(e),ts:new Date()}]);
    }
    setLoading(false);
    setTimeout(()=>inputRef.current?.focus(),100);
  };

  const fmt = (ts) => ts.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});

  return (
    <div style={{background:'#131313',height:'calc(100vh - 56px)',display:'flex',flexDirection:'column',maxWidth:'800px',margin:'0 auto'}}>

      {/* Header */}
      <div style={{padding:'16px 24px',borderBottom:'1px solid #1f1f1f',display:'flex',alignItems:'center',gap:'14px',flexShrink:0}}>
        <div style={{width:'42px',height:'42px',borderRadius:'50%',background:'linear-gradient(135deg,#1a4fa8,#c0394f)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🤖</div>
        <div>
          <div style={{color:'#fff',fontWeight:700,fontSize:'15px'}}>Peptide AI</div>
          <div style={{color:'#34d399',fontSize:'12px',display:'flex',alignItems:'center',gap:'4px'}}><div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#34d399'}}></div>Online</div>
        </div>
        <button onClick={()=>setMessages([{role:'assistant',content:'Hi! I\'m your Peptide AI assistant. Ask me anything about peptides, dosing, protocols, or client recommendations. 💊',ts:new Date()}])} style={{marginLeft:'auto',background:'#242424',border:'1px solid #2a2a2a',borderRadius:'8px',color:'#6b7280',fontSize:'12px',padding:'6px 12px',cursor:'pointer'}}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:'4px'}}>
        {messages.map((msg,i)=>{
          const isUser=msg.role==='user';
          return(
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:isUser?'flex-end':'flex-start',marginBottom:'8px'}}>
              <div style={{
                maxWidth:'72%',
                background:isUser?'#1a4fa8':'#1e1e1e',
                border:isUser?'none':'1px solid #2a2a2a',
                borderRadius:isUser?'18px 18px 4px 18px':'18px 18px 18px 4px',
                padding:'10px 15px',
                color:'#fff',
                fontSize:'14px',
                lineHeight:1.6,
                whiteSpace:'pre-wrap',
                wordBreak:'break-word',
              }}>
                {msg.content}
              </div>
              <div style={{color:'#374151',fontSize:'11px',marginTop:'3px',marginLeft:isUser?0:'4px',marginRight:isUser?'4px':0}}>{fmt(msg.ts)}</div>
            </div>
          );
        })}
        {loading&&(
          <div style={{display:'flex',alignItems:'flex-start',marginBottom:'8px'}}>
            <div style={{background:'#1e1e1e',border:'1px solid #2a2a2a',borderRadius:'18px 18px 18px 4px',padding:'12px 16px',display:'flex',gap:'4px',alignItems:'center'}}>
              {[0,1,2].map(n=>(
                <div key={n} style={{width:'6px',height:'6px',borderRadius:'50%',background:'#4b5563',animation:'pulse 1.2s ease-in-out '+n*0.2+'s infinite'}}></div>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick prompts */}
      {messages.length<=2&&(
        <div style={{padding:'0 24px 12px',flexShrink:0}}>
          <div style={{color:'#4b5563',fontSize:'11px',fontWeight:600,marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.07em'}}>Quick questions</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
            {QUICK.map(q=>(
              <button key={q} onClick={()=>send(q)} style={{background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'20px',color:'#9ca3af',fontSize:'12px',padding:'6px 14px',cursor:'pointer',whiteSpace:'nowrap'}} onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(26,79,168,0.5)';e.currentTarget.style.color='#fff';}} onMouseOut={e=>{e.currentTarget.style.borderColor='#2a2a2a';e.currentTarget.style.color='#9ca3af';}}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{padding:'12px 24px 16px',borderTop:'1px solid #1f1f1f',flexShrink:0}}>
        <div style={{display:'flex',gap:'10px',alignItems:'flex-end',background:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'24px',padding:'8px 8px 8px 18px'}}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e=>{setInput(e.target.value);e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}
            onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder='Ask about peptides...'
            rows={1}
            disabled={loading}
            style={{flex:1,background:'transparent',border:'none',color:'#fff',fontSize:'14px',outline:'none',resize:'none',lineHeight:1.5,maxHeight:'120px',padding:'4px 0',fontFamily:'inherit'}}
          />
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{width:'36px',height:'36px',borderRadius:'50%',background:input.trim()&&!loading?'#1a4fa8':'#2a2a2a',border:'none',color:input.trim()&&!loading?'#fff':'#4b5563',cursor:input.trim()&&!loading?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'16px',transition:'background 0.2s'}}>
            ↑
          </button>
        </div>
        <p style={{color:'#374151',fontSize:'11px',textAlign:'center',margin:'8px 0 0'}}>AI may make mistakes — verify dosing information independently</p>
      </div>
    </div>
  );
}
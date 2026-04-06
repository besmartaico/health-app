'use client';
import { useState } from 'react';
export default function PeptideAIPage() {
  const [messages, setMessages] = useState<{role:string;content:string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role:'user', content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    const r = await fetch('/api/peptide-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:input,history:messages})});
    const d = await r.json();
    setMessages([...history, { role:'assistant', content: d.response }]);
    setLoading(false);
  };
  return (
    <div className="p-8 flex flex-col h-screen">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Peptide AI</h1>
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-4 overflow-y-auto space-y-4 mb-4">
        {messages.length===0&&<p className="text-slate-400 text-center mt-8">Ask anything about peptides...</p>}
        {messages.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':''}`}>
            <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${m.role==='user'?'bg-green-600 text-white':'bg-slate-100 text-slate-800'}`}>{m.content}</div>
          </div>
        ))}
        {loading&&<div className="flex"><div className="bg-slate-100 px-4 py-3 rounded-2xl text-sm text-slate-400">Thinking...</div></div>}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about peptides..." className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
        <button onClick={send} disabled={loading} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium">Send</button>
      </div>
    </div>
  );
}
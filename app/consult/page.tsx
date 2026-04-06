'use client';
import { useState } from 'react';
export default function ConsultPage() {
  const [form, setForm] = useState({ goals:'', conditions:'', current:'', tried:'', age:'', weight:'', activity:'' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    const r = await fetch('/api/consult', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const d = await r.json();
    setResult(d.response);
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Peptide Guidance</h1>
        <p className="text-slate-400 mb-8">Tell us about your goals and we'll suggest a protocol.</p>
        <div className="space-y-4 mb-6">
          {[['goals','Your health goals'],['conditions','Any health conditions'],['current','Current peptides (if any)'],['tried','Previously tried'],['age','Age'],['weight','Weight (lbs)'],['activity','Activity level']].map(([k,l]) => (
            <div key={k}><label className="text-sm text-slate-400 block mb-1">{l}</label>
              <textarea className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" rows={2} value={form[k as keyof typeof form]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} /></div>
          ))}
        </div>
        <button onClick={submit} disabled={loading} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium">{loading ? 'Analyzing...' : 'Get Guidance'}</button>
        {result && <div className="mt-6 bg-slate-800 rounded-xl p-6 text-sm text-slate-200 whitespace-pre-wrap">{result}</div>}
      </div>
    </div>
  );
}
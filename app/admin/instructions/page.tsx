'use client';
import { useState } from 'react';
const PROTOCOLS = [
  { name:'BPC-157', vialMg:5, bacWaterMl:2, baseDoseUg:250, frequency:'Once or twice daily', storage:'Refrigerate', notes:'Stable at room temp short-term.' },
  { name:'Semaglutide', vialMg:5, bacWaterMl:2, baseDoseUg:250, frequency:'Once weekly', storage:'Refrigerate', notes:'Start at 0.25mg/week, titrate up.' },
  { name:'Tirzepatide', vialMg:5, bacWaterMl:2, baseDoseUg:2500, frequency:'Once weekly', storage:'Refrigerate', notes:'Start at 2.5mg/week.' },
  { name:'TB-500', vialMg:5, bacWaterMl:2, baseDoseUg:2500, frequency:'2-3x per week', storage:'Freeze, refrigerate after reconstitution', notes:'Loading phase 4-6 weeks.' },
  { name:'Ipamorelin', vialMg:5, bacWaterMl:2, baseDoseUg:200, frequency:'2-3x daily', storage:'Freeze, refrigerate after', notes:'Best taken fasted.' },
  { name:'Sermorelin', vialMg:15, bacWaterMl:5, baseDoseUg:500, frequency:'Once daily (before bed)', storage:'Freeze, refrigerate after', notes:'Inject SC before sleep.' },
];
export default function InstructionsPage() {
  const [selected, setSelected] = useState(PROTOCOLS[0]);
  const [bacWater, setBacWater] = useState(selected.bacWaterMl);
  const mgPerMl = selected.vialMg / bacWater;
  const mlPerDose = (selected.baseDoseUg/1000) / mgPerMl;
  const unitsPerDose = mlPerDose * 100;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Reconstitution Instructions</h1>
      <div className="flex gap-2 mb-6 flex-wrap">{PROTOCOLS.map(p=>(<button key={p.name} onClick={()=>{setSelected(p);setBacWater(p.bacWaterMl);}} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selected.name===p.name?'bg-green-600 text-white':'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p.name}</button>))}</div>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 text-lg mb-4">{selected.name}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Frequency</span><span className="font-medium">{selected.frequency}</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-slate-500">Storage</span><span className="font-medium">{selected.storage}</span></div>
            <div className="flex justify-between py-2"><span className="text-slate-500">Notes</span><span className="font-medium text-right max-w-xs">{selected.notes}</span></div>
          </div>
          <div className="mt-4"><label className="text-xs text-slate-600 mb-1 block">Adjust Bac Water (mL)</label><input type="number" min={0.5} max={10} step={0.5} value={bacWater} onChange={e=>setBacWater(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-bold text-green-800 mb-4">Quick Reference</h3>
          <div className="grid grid-cols-2 gap-3">
            {[['Concentration',`${mgPerMl.toFixed(2)} mg/mL`],['Units/Dose',`${unitsPerDose.toFixed(1)}u`],['mL/Dose',`${mlPerDose.toFixed(3)}`],['Vial Size',`${selected.vialMg}mg`]].map(([l,v])=>(
              <div key={l} className="bg-white rounded-lg p-3"><div className="text-xs text-slate-400">{l}</div><div className="font-bold text-slate-900">{v}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
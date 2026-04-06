'use client';
import { useState } from 'react';
const PEPTIDES = ['BPC-157','Semaglutide','Tirzepatide','TB-500','CJC-1295','Ipamorelin','AOD-9604','Sermorelin'];
export default function CalculatorPage() {
  const [peptide, setPeptide] = useState(PEPTIDES[0]);
  const [vialMg, setVialMg] = useState(5);
  const [bacWater, setBacWater] = useState(2);
  const [doseUg, setDoseUg] = useState(250);
  const mgPerMl = vialMg / bacWater;
  const doseMg = doseUg / 1000;
  const mlPerDose = doseMg / mgPerMl;
  const unitsPerDose = mlPerDose * 100;
  const dosesPerVial = (vialMg * 1000) / doseUg;
  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Dose Calculator</h1>
      <p className="text-slate-500 mb-8">Calculate exact units for any peptide protocol.</p>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div><label className="text-sm text-slate-600 mb-1 block">Peptide</label>
          <select value={peptide} onChange={e=>setPeptide(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">{PEPTIDES.map(p=><option key={p}>{p}</option>)}</select></div>
        {[['Vial Size (mg)',vialMg,setVialMg,0.1],['Bac Water (mL)',bacWater,setBacWater,0.5],['Dose (mcg)',doseUg,setDoseUg,50]].map(([l,v,s,step])=>(
          <div key={String(l)}><label className="text-sm text-slate-600 mb-1 block">{String(l)}</label>
            <input type="number" min={0} step={Number(step)} value={Number(v)} onChange={e=>(s as Function)(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" /></div>
        ))}
      </div>
      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
        <h2 className="font-bold text-green-800 mb-4">Results</h2>
        <div className="grid grid-cols-2 gap-4">
          {[['Concentration',`${mgPerMl.toFixed(2)} mg/mL`],['Units Per Dose',`${unitsPerDose.toFixed(1)} units`],['mL Per Dose',`${mlPerDose.toFixed(3)} mL`],['Doses Per Vial',`${dosesPerVial.toFixed(0)}`]].map(([l,v])=>(
            <div key={l} className="bg-white rounded-lg p-3"><div className="text-xs text-slate-500">{l}</div><div className="text-lg font-bold text-slate-900">{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
'use client';
export default function Home() {
  const peptides = [
    {name:'BPC-157',goal:'Recovery & Healing',desc:'Accelerates tissue repair and reduces inflammation.',c:'from-blue-900/30'},
    {name:'Semaglutide',goal:'Weight Management',desc:'GLP-1 agonist for appetite control.',c:'from-purple-900/30'},
    {name:'Tirzepatide',goal:'Fat Loss',desc:'Dual GIP/GLP-1 agonist for body composition.',c:'from-red-900/30'},
    {name:'TB-500',goal:'Muscle & Joints',desc:'Promotes muscle growth and injury recovery.',c:'from-green-900/30'},
    {name:'CJC-1295',goal:'Growth Hormone',desc:'Stimulates GH release for recovery.',c:'from-yellow-900/30'},
    {name:'Ipamorelin',goal:'Anti-Aging',desc:'Selective GH secretagogue for longevity.',c:'from-pink-900/30'},
    {name:'AOD-9604',goal:'Fat Burning',desc:'Mimics fat-burning HGH effects.',c:'from-orange-900/30'},
    {name:'Sermorelin',goal:'Sleep & Recovery',desc:'Stimulates GH for better sleep.',c:'from-teal-900/30'},
  ];
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <nav className="bg-[#0f0f0f] border-b border-[#7b1c2e] sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#7b1c2e] rounded-lg flex items-center justify-center font-bold">BS</div>
            <span className="font-bold text-xl">BeSmart <span className="text-[#c0394f]">Health</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="/" className="text-white font-medium">Home</a>
            <a href="/consult" className="hover:text-white transition-colors">Consultation</a>
            <a href="#protocols" className="hover:text-white transition-colors">Protocols</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <a href="/consult" className="bg-[#7b1c2e] hover:bg-[#9b2438] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
            Get Started
          </a>
        </div>
      </nav>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7b1c2e]/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#7b1c2e]/20 border border-[#7b1c2e]/50 rounded-full px-4 py-1.5 text-sm text-[#e05070] mb-8 font-medium">
              <span className="w-2 h-2 bg-[#e05070] rounded-full inline-block" style={{animation:'pulse 2s infinite'}}></span>
              Premium Peptide Therapy
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-none mb-6 tracking-tight">
              Optimize Your<br/><span className="text-[#c0394f]">Health</span> With<br/>Precision Peptides
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
              Personalized peptide protocols backed by science. Get AI-powered guidance tailored to your unique goals — fat loss, recovery, longevity, or peak performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/consult" className="bg-[#7b1c2e] hover:bg-[#9b2438] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[#7b1c2e]/30 text-center">
                Get My Free Protocol &rarr;
              </a>
              <a href="#protocols" className="bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 px-8 py-4 rounded-xl font-bold text-lg border border-gray-700 transition-all text-center">
                Explore Peptides
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0f0f0f] border-y border-gray-800/60">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['8+','Peptide Protocols'],['100%','Pharmaceutical Grade'],['AI-Powered','Personalization'],['24/7','Support Available']].map(([v,l]) => (
            <div key={l} className="py-2">
              <div className="text-3xl font-extrabold text-[#c0394f]">{v}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="protocols" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-white mb-3">Peptide Protocols</h2>
          <p className="text-gray-500 text-lg">Science-backed peptides matched to your goals</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {peptides.map((p) => (
            <div key={p.name} className={'bg-gradient-to-b ' + p.c + ' to-[#1d1d1d] border border-gray-800 rounded-2xl p-6 hover:border-[#7b1c2e]/60 transition-all duration-200 hover:-translate-y-1 cursor-default'}>
              <div className="text-[#c0394f] text-xs font-bold uppercase tracking-widest mb-3">{p.goal}</div>
              <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-[#0f0f0f] border-y border-gray-800/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-white mb-3">How It Works</h2>
            <p className="text-gray-500 text-lg">Your personalized protocol in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {n:'01',t:'Complete Your Profile',d:'Share your health goals, conditions, and current supplements through our quick consultation form.'},
              {n:'02',t:'AI Analysis',d:'Our AI analyzes your unique profile and recommends the optimal peptide protocol based on proven research.'},
              {n:'03',t:'Get Your Protocol',d:'Receive detailed dosing guides, reconstitution instructions, and ongoing AI-powered support.'},
            ].map((s) => (
              <div key={s.n} className="flex gap-5 items-start">
                <div className="text-6xl font-black text-[#7b1c2e]/25 leading-none select-none">{s.n}</div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.t}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-br from-[#7b1c2e]/25 via-[#1e1e1e] to-[#1a1a1a] border border-[#7b1c2e]/30 rounded-3xl p-12 md:p-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Ready to Transform?</h2>
          <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto">Join the growing community optimizing their health with precision peptide therapy.</p>
          <a href="/consult" className="inline-block bg-[#7b1c2e] hover:bg-[#9b2438] text-white px-12 py-5 rounded-xl font-bold text-xl transition-all shadow-xl shadow-[#7b1c2e]/20">
            Start Free Consultation &rarr;
          </a>
        </div>
      </section>

      <footer className="bg-[#0a0a0a] border-t border-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#7b1c2e] rounded-lg flex items-center justify-center font-bold">BS</div>
                <span className="font-bold text-lg text-white">BeSmart Health</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm">Premium AI-powered peptide therapy guidance. Personalized protocols for performance, recovery, and longevity.</p>
            </div>
            <div>
              <h4 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wider">Protocols</h4>
              <ul className="space-y-2.5">
                {['BPC-157','Semaglutide','Tirzepatide','TB-500','Sermorelin'].map(name => (
                  <li key={name}><a href="/consult" className="text-gray-600 hover:text-[#c0394f] text-sm transition-colors">{name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-300 font-semibold mb-4 text-sm uppercase tracking-wider">Links</h4>
              <ul className="space-y-2.5">
                <li><a href="/consult" className="text-gray-600 hover:text-[#c0394f] text-sm transition-colors">Free Consultation</a></li>
                <li><a href="#protocols" className="text-gray-600 hover:text-[#c0394f] text-sm transition-colors">Protocol Library</a></li>
                <li><a href="/admin" className="text-gray-600 hover:text-[#c0394f] text-sm transition-colors">Admin Portal</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-700 text-sm">2025 BeSmart Health. All rights reserved.</p>
            <p className="text-gray-800 text-xs text-center max-w-md">For informational purposes only. Not medical advice. Consult a healthcare provider before starting any peptide therapy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BeSmart Health — Precision Peptide Therapy',
  description: 'AI-powered personalized peptide protocols for fat loss, recovery, longevity and peak performance.',
  icons: { icon: 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w', apple: 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w' },
};

const LOGO_URL = 'https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w';

const peptides = [
  {name:'BPC-157',goal:'Recovery & Healing',desc:'Accelerates tissue repair and reduces inflammation. Supports gut health and wound healing.'},
  {name:'Semaglutide',goal:'Weight Management',desc:'GLP-1 receptor agonist for appetite control and sustainable metabolic optimization.'},
  {name:'Tirzepatide',goal:'Fat Loss',desc:'Dual GIP/GLP-1 agonist delivering powerful body composition transformation results.'},
  {name:'TB-500',goal:'Muscle & Joints',desc:'Promotes muscle growth, enhances flexibility, and accelerates injury recovery.'},
  {name:'CJC-1295',goal:'Growth Hormone',desc:'Stimulates sustained GH release for improved body composition and deep recovery.'},
  {name:'Ipamorelin',goal:'Anti-Aging',desc:'Selective growth hormone secretagogue with minimal side effects for longevity.'},
  {name:'AOD-9604',goal:'Fat Burning',desc:'Mimics the fat-burning effects of HGH without raising IGF-1 levels.'},
  {name:'Sermorelin',goal:'Sleep & Recovery',desc:'Naturally stimulates GH production for better sleep quality and overnight recovery.'},
];

export default function Home() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <img src={LOGO_URL} alt="BeSmart Health" />
          </a>
          <div className="nav-links">
            <a href="/">Home</a>
            <a href="/consult">Consultation</a>
            <a href="#protocols">Protocols</a>
            <a href="#how">How It Works</a>
          </div>
          <a href="/consult" className="nav-cta">Get Started</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Premium Peptide Therapy
          </div>
          <h1>Optimize Your<br/><span>Health</span> With<br/>Precision Peptides</h1>
          <p>Personalized peptide protocols backed by science. Get AI-powered guidance tailored to your goals — fat loss, recovery, longevity, or peak performance.</p>
          <div className="hero-btns">
            <a href="/consult" className="btn-primary">Get My Free Protocol →</a>
            <a href="#protocols" className="btn-secondary">Explore Peptides</a>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-inner">
          {[['8+','Peptide Protocols'],['100%','Pharmaceutical Grade'],['AI-Powered','Personalization'],['24/7','Support Available']].map(([v,l]) => (
            <div key={l}>
              <div className="stat-val">{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <div id="protocols">
        <div className="section">
          <div className="section-header">
            <h2>Our Peptide Protocols</h2>
            <p>Science-backed peptides precisely matched to your individual goals</p>
          </div>
          <div className="protocols-grid">
            {peptides.map((p) => (
              <div key={p.name} className="protocol-card">
                <div className="protocol-tag">{p.goal}</div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="how" className="dark-section">
        <div className="section">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Your personalized protocol in 3 simple steps</p>
          </div>
          <div className="steps-grid">
            {[
              {n:'01',t:'Complete Your Profile',d:'Tell us about your health goals, current conditions, and supplements through our quick AI-powered consultation form.'},
              {n:'02',t:'AI Analysis',d:'Our AI analyzes your unique profile and matches you with the optimal peptide protocol based on peer-reviewed research.'},
              {n:'03',t:'Get Your Protocol',d:'Receive detailed dosing guides, reconstitution instructions, and ongoing AI-powered support throughout your journey.'},
            ].map((s) => (
              <div key={s.n} className="step">
                <div className="step-num">{s.n}</div>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="cta-banner">
          <h2>Ready to Transform Your Health?</h2>
          <p>Join the growing community optimizing performance with precision peptide therapy.</p>
          <a href="/consult" className="btn-primary">Start Free Consultation →</a>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src={LOGO_URL} alt="BeSmart Health" />
              </div>
              <p className="footer-desc">Premium AI-powered peptide therapy guidance. Personalized protocols for performance, recovery, and longevity.</p>
            </div>
            <div>
              <h4>Protocols</h4>
              <ul>
                {['BPC-157','Semaglutide','Tirzepatide','TB-500','Sermorelin'].map(name => (
                  <li key={name}><a href="/consult">{name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/consult">Free Consultation</a></li>
                <li><a href="#protocols">Protocol Library</a></li>
                <li><a href="#how">How It Works</a></li>
                <li><a href="/admin">Admin Portal</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 BeSmart Health. All rights reserved.</p>
            <p className="footer-disclaimer">For informational purposes only. Not medical advice. Consult a healthcare provider before starting any peptide therapy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
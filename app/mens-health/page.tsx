import type { Metadata } from 'next';
import Script from 'next/script';
import LeadForm from './LeadForm';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://healtheasy.co';
const LOGO = '/logo-dark.png';

// ─────────────────────────────────────────────────────────────────────────────
// Google Ads conversion tracking.
// Replace these two placeholders once your Google Ads conversion action exists:
//   GOOGLE_ADS_ID   → "AW-XXXXXXXXXX"        (Conversions → your action → Tag setup)
//   CONVERSION_LABEL→ "AbC-D_efGhIjK"        (the label shown next to the Ads ID)
// Until they're real, the tag loads but fires nothing (guarded in LeadForm).
const GOOGLE_ADS_ID = 'AW-CONVERSION_ID';
const CONVERSION_LABEL = 'CONVERSION_LABEL';
const CONVERSION_SEND_TO = `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`;
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Men's Health & Weight Loss Coaching | Custom Plans That Work",
  description:
    'Personalized weight loss, nutrition, and fitness plans for men — built around your body and your goals. Free consultation. Real results, expert guidance.',
  alternates: { canonical: `${SITE_URL}/mens-health` },
  keywords: [
    "men's health", 'weight loss for men', 'mens weight loss program',
    'personalized meal plans', 'fitness coaching for men', 'lose weight men',
    'mens health coaching', 'fat loss program',
  ],
  openGraph: {
    title: "Men's Health & Weight Loss Coaching | HealthEasy",
    description:
      'Custom meal, fitness, and wellness plans for men. Lose weight, build muscle, get your energy back. Free consultation.',
    url: `${SITE_URL}/mens-health`,
    siteName: 'HealthEasy',
    type: 'website',
    images: [{ url: `${SITE_URL}/logo.png`, width: 1200, height: 630, alt: 'HealthEasy Men\'s Health' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Men's Health & Weight Loss Coaching | HealthEasy",
    description: 'Custom meal, fitness, and wellness plans for men. Free consultation.',
  },
  robots: { index: true, follow: true },
};

const FAQ = [
  {
    q: 'How does the program work?',
    a: 'You start with a free consultation where we learn your goals, body, and lifestyle. From there we build a personalized plan — nutrition, training, and wellness guidance — and support you as you follow it.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Most men notice improved energy within the first couple of weeks and visible changes in 4–8 weeks when they follow the plan consistently. Your plan is built to be sustainable, not a crash diet.',
  },
  {
    q: 'Do I need a gym?',
    a: 'No. Your exercise plan is built around what you have access to — home, gym, or minimal equipment — and your current fitness level.',
  },
  {
    q: 'What does the consultation cost?',
    a: 'The initial consultation is free. We use it to understand your goals and show you exactly how we can help before you commit to anything.',
  },
];

// Structured data helps Google understand the page (rich results + SEO).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      name: "Men's Health & Weight Loss Coaching",
      serviceType: 'Health and wellness coaching',
      provider: { '@type': 'Organization', name: 'HealthEasy', url: SITE_URL },
      areaServed: 'US',
      description:
        'Personalized weight loss, nutrition, fitness, and wellness coaching for men, including custom meal plans, exercise plans, and peptide therapy guidance.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

const section: any = { maxWidth: '1040px', margin: '0 auto', padding: '0 24px' };
const card: any = { background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px' };

const PLANS = [
  ['🍽️', 'Custom Meal Plans', 'Nutrition built around your body, your schedule, and food you actually like — designed to drop fat without feeling starved.'],
  ['🏋️', 'Personalized Exercise Plans', 'Training matched to your fitness level and equipment, whether that\'s a full gym or your living room. Build strength, burn fat, stay consistent.'],
  ['🧬', 'Peptide Therapy Guidance', 'Expert, personalized guidance on peptide protocols to support your metabolism, recovery, and energy — with quality you can verify.'],
];

const STEPS = [
  ['1', 'Free consultation', 'Tell us your goals. We learn your body, lifestyle, and what\'s held you back.'],
  ['2', 'Your custom plan', 'We build your nutrition, training, and wellness plan around the real you.'],
  ['3', 'Follow & adjust', 'You execute with our guidance. We adjust as you progress so the results keep coming.'],
];

export default function MensHealthPage() {
  return (
    <div style={{ fontFamily: 'Inter,system-ui,sans-serif', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Google Ads global site tag */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={LOGO} alt='HealthEasy' style={{ height: '52px', display: 'block' }} />
        <a href='#start' style={{ background: '#1a4fa8', color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '10px 20px', borderRadius: '8px', fontWeight: 700 }}>Get Started</a>
      </nav>

      {/* Hero */}
      <section style={{ ...section, textAlign: 'center', padding: '72px 24px 48px', maxWidth: '820px' }}>
        <div style={{ display: 'inline-block', background: 'rgba(192,57,79,0.12)', border: '1px solid rgba(192,57,79,0.3)', color: '#f0a3ae', fontSize: '13px', fontWeight: 700, padding: '6px 14px', borderRadius: '999px', marginBottom: '22px' }}>
          For men ready to change their health
        </div>
        <h1 style={{ fontSize: 'clamp(34px,6vw,60px)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 20px', letterSpacing: '-1.5px' }}>
          Lose the weight.<br />
          <span style={{ background: 'linear-gradient(135deg,#c0394f,#1a4fa8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get your edge back.</span>
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: '560px' }}>
          A personalized plan built for your body and your life — custom nutrition, training, and expert wellness guidance. No fads. No guesswork. Just results.
        </p>
        <a href='#start' style={{ display: 'inline-block', background: 'linear-gradient(135deg,#c0394f,#1a4fa8)', color: '#fff', textDecoration: 'none', padding: '16px 36px', borderRadius: '12px', fontWeight: 800, fontSize: '16px' }}>
          Get My Free Plan Consultation
        </a>
        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '16px' }}>Free · No obligation · Response within 24 hours</p>
      </section>

      {/* Trust badges */}
      <section style={{ ...section, padding: '12px 24px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px' }}>
          {[['🎯', 'Built for you', 'Plans personalized to your body and goals — not a template'], ['🧪', 'Quality you can verify', 'Guidance backed by tested, lab-verified standards'], ['🤝', '1-on-1 support', 'Real guidance and adjustments, not an app you\'re left alone with'], ['⏱️', 'Sustainable results', 'A plan you can actually stick to and keep']].map(([icon, title, desc]) => (
            <div key={title} style={{ ...card, padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
              <div><div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px' }}>{title}</div><div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section style={{ ...section, padding: '0 24px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Everything you need to transform</h2>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Three pillars, one plan, built around you.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '18px' }}>
          {PLANS.map(([icon, title, desc]) => (
            <div key={title} style={card}>
              <div style={{ fontSize: '34px', marginBottom: '14px' }}>{icon}</div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 10px' }}>{title}</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#0d0d0d', padding: '64px 0' }}>
        <div style={section}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>How it works</h2>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>Simple to start. Built to last.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '18px' }}>
            {STEPS.map(([n, title, desc]) => (
              <div key={n} style={{ ...card, textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg,#c0394f,#1a4fa8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '20px' }}>{n}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id='start' style={{ padding: '72px 0' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Start with a free consultation</h2>
            <p style={{ color: '#9ca3af', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>Tell us where you want to go. We&apos;ll show you how to get there.</p>
          </div>
          <LeadForm conversionSendTo={CONVERSION_SEND_TO} />
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...section, padding: '0 24px 72px', maxWidth: '760px' }}>
        <h2 style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 800, margin: '0 0 28px', letterSpacing: '-0.5px', textAlign: 'center' }}>Common questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQ.map((item) => (
            <div key={item.q} style={{ ...card, padding: '22px 24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>{item.q}</h3>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '5px 14px', display: 'inline-block', marginBottom: '16px' }}>
          <img src={LOGO} alt='HealthEasy' style={{ height: '24px', display: 'block' }} />
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px', margin: '0 0 8px' }}>Personalized men&apos;s health, weight loss &amp; wellness coaching</p>
        <p style={{ color: '#374151', fontSize: '12px', margin: 0 }}>
          This program offers wellness and lifestyle guidance and is not a substitute for medical care.
        </p>
      </footer>
    </div>
  );
}

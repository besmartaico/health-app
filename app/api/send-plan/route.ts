// @ts-nocheck
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  const { email, name, plan } = await req.json();
  if (!email || !plan) return NextResponse.json({ success: false, error: 'Missing email or plan' });
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = `
      <div style='font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#ffffff;'>
        <img src='https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w' height='36' style='margin-bottom:24px;' />
        <h2 style='color:#111;margin:0 0 8px;'>Your Personalized Peptide Plan</h2>
        <p style='color:#555;margin:0 0 24px;'>Hi ${name}, here is your personalized peptide protocol from BeSmart Health.</p>
        <div style='background:#f9f9f9;border-radius:10px;padding:24px;white-space:pre-wrap;font-size:14px;line-height:1.8;color:#333;'>${plan.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
        <p style='color:#999;font-size:12px;margin-top:24px;'>This plan was created specifically for you. Please follow up with any questions.</p>
      </div>
    `;
    await resend.emails.send({
      from: 'BeSmart Health <admin@besmartai.co>',
      to: email,
      subject: `Your Personalized Peptide Plan — BeSmart Health`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
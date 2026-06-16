// @ts-nocheck
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function POST(req) {
  const { name, email, phone, goals, questions, source } = await req.json();
  const date = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });

  // Log to Google Sheets (Contacts tab). Col G = lead source (e.g. campaign), blank for general site inquiries.
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_CRM_ID,
      range: 'Contacts!A:G',
      valueInputOption: 'RAW',
      requestBody: { values: [[date, name, email, phone, goals, questions, source || '']] },
    });
  } catch(e) { console.error('Sheets error:', e); }

  // Send email notification via Resend
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'HealthEasy <onboarding@resend.dev>',
      to: ['besmartaico@gmail.com'],
      subject: `New Inquiry from ${name}${source ? ` [${source}]` : ''}`,
      html: `
        <h2>New Website Inquiry</h2>
        ${source ? `<p><strong>Source:</strong> ${source}</p>` : ''}
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Goals:</strong><br/>${(goals||'').replace(/\n/g,'<br/>')}</p>
        <p><strong>Questions:</strong><br/>${(questions||'').replace(/\n/g,'<br/>')}</p>
        <p><em>Submitted: ${date}</em></p>
      `,
    });
  } catch(e) { console.error('Resend error:', e); }

  return NextResponse.json({ success: true });
}
// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;

export async function POST(req) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ success: false, error: 'Missing fields' });
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' });
    const rows = res.data.values || [];
    const row = rows.find(r => r[0]?.toLowerCase() === email.toLowerCase());
    if (!row) return NextResponse.json({ success: false, error: 'Invalid email or password' });
    const hash = row[6];
    if (!hash) return NextResponse.json({ success: false, error: 'Account not set up yet. Check your invite email.' });
    const match = await bcrypt.compare(password, hash);
    if (!match) return NextResponse.json({ success: false, error: 'Invalid email or password' });
    return NextResponse.json({ success: true, user: { email: row[0], name: row[1], role: row[2], teamId: row[5] || '' } });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
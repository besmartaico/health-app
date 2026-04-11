// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;

export async function POST(req) {
  const { token, password, name } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 });
  try {
    const sheets = getSheets();
    // Find invite by token
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' });
    const rows = res.data.values || [];
    const inviteIdx = rows.findIndex(r => r[6] === token && r[4] === 'pending');
    if (inviteIdx === -1) return NextResponse.json({ error: 'Invalid or expired invitation link' }, { status: 400 });
    const invite = rows[inviteIdx];
    const email = invite[0];
    const inviteName = name || invite[1] || '';
    const role = invite[2] || 'user';
    // Check expiry
    const expiry = invite[5] ? new Date(invite[5]) : null;
    if (expiry && expiry < new Date()) return NextResponse.json({ error: 'Invitation link has expired. Ask an admin to resend.' }, { status: 400 });
    // Check not already registered
    const usersRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' });
    const existing = (usersRes.data.values||[]).find(r => r[0]?.toLowerCase() === email.toLowerCase());
    if (existing) return NextResponse.json({ error: 'Account already exists for this email' }, { status: 400 });
    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'AdminUsers!A:G', valueInputOption: 'RAW', requestBody: { values: [[email, inviteName, role, new Date().toISOString().split('T')[0], 'invite', '', hash]] } });
    // Mark invite as accepted
    await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `AdminInvites!E${inviteIdx+2}`, valueInputOption: 'RAW', requestBody: { values: [['accepted']] } });
    return NextResponse.json({ success: true });
  } catch(e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
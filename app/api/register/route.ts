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
  const { email, password, name } = await req.json();
  if (!email || !password || !name) return NextResponse.json({ success: false, error: 'All fields are required.' });
  if (password.length < 8) return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' });
  try {
    const sheets = getSheets();
    // Check if email exists in AdminInvites
    const invRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' });
    const invites = invRes.data.values || [];
    const invite = invites.find(r => r[0]?.toLowerCase() === email.toLowerCase() && r[4] !== 'revoked');
    if (!invite) return NextResponse.json({ success: false, error: 'No invite found for this email. Please contact your administrator.' });
    // Check if already registered in AdminUsers
    const usersRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' });
    const users = usersRes.data.values || [];
    const existing = users.find(r => r[0]?.toLowerCase() === email.toLowerCase());
    if (existing && existing[6]) return NextResponse.json({ success: false, error: 'Account already exists. Please sign in.' });
    const hash = await bcrypt.hash(password, 10);
    const role = invite[2] || 'admin';
    const teamId = invite[7] || '';
    if (existing) {
      const rowIdx = users.findIndex(r => r[0]?.toLowerCase() === email.toLowerCase());
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `AdminUsers!A${rowIdx+2}:G${rowIdx+2}`, valueInputOption: 'RAW', requestBody: { values: [[email, name, role, new Date().toISOString().split('T')[0], '', teamId, hash]] } });
    } else {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'AdminUsers!A:G', valueInputOption: 'RAW', requestBody: { values: [[email, name, role, new Date().toISOString().split('T')[0], '', teamId, hash]] } });
    }
    // Mark invite as active
    const invRowIdx = invites.findIndex(r => r[0]?.toLowerCase() === email.toLowerCase());
    if (invRowIdx >= 0) await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `AdminInvites!E${invRowIdx+2}`, valueInputOption: 'RAW', requestBody: { values: [['active']] } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
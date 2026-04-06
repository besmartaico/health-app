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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false, error: 'No token' });
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:G' });
    const rows = res.data.values || [];
    const row = rows.find(r => r[6] === token);
    if (!row) return NextResponse.json({ valid: false, error: 'Invalid token' });
    const expiry = row[5] ? new Date(row[5]) : null;
    if (expiry && expiry < new Date()) return NextResponse.json({ valid: false, error: 'Token expired' });
    if (row[4] === 'active') return NextResponse.json({ valid: false, error: 'Already signed up' });
    return NextResponse.json({ valid: true, email: row[0], name: row[1], role: row[2], teamId: row[7] || '' });
  } catch (e) {
    return NextResponse.json({ valid: false, error: String(e) });
  }
}

export async function POST(req) {
  const { token, password, name } = await req.json();
  if (!token || !password) return NextResponse.json({ success: false, error: 'Missing fields' });
  try {
    const sheets = getSheets();
    const invRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' });
    const rows = invRes.data.values || [];
    const rowIdx = rows.findIndex(r => r[6] === token);
    if (rowIdx < 0) return NextResponse.json({ success: false, error: 'Invalid token' });
    const row = rows[rowIdx];
    if (row[4] === 'active') return NextResponse.json({ success: false, error: 'Already signed up' });
    const hash = await bcrypt.hash(password, 10);
    const email = row[0];
    const role = row[2];
    const teamId = row[7] || '';
    const finalName = name || row[1] || '';
    // Mark invite as active
    await sheets.spreadsheets.values.update({
      spreadsheetId: SID(), range: `AdminInvites!E${rowIdx + 2}`, valueInputOption: 'RAW',
      requestBody: { values: [['active']] },
    });
    // Add/update user in AdminUsers with password hash
    const usersRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' });
    const users = usersRes.data.values || [];
    const userIdx = users.findIndex(r => r[0] === email);
    if (userIdx >= 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SID(), range: `AdminUsers!A${userIdx + 2}:G${userIdx + 2}`, valueInputOption: 'RAW',
        requestBody: { values: [[email, finalName, role, new Date().toISOString().split('T')[0], '', teamId, hash]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID(), range: 'AdminUsers!A:G', valueInputOption: 'RAW',
        requestBody: { values: [[email, finalName, role, new Date().toISOString().split('T')[0], '', teamId, hash]] },
      });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
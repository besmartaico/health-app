import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_CRM_ID;

async function ensureSheets() {
  const sheets = getSheets();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID! });
  const existing = meta.data.sheets?.map(s => s.properties?.title) || [];
  const toAdd = [];
  if (!existing.includes('AdminUsers')) toAdd.push({ addSheet: { properties: { title: 'AdminUsers' } } });
  if (!existing.includes('AdminInvites')) toAdd.push({ addSheet: { properties: { title: 'AdminInvites' } } });
  if (toAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID!, requestBody: { requests: toAdd } });
    if (!existing.includes('AdminUsers')) {
      await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID!, range: 'AdminUsers!A1:E1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','addedDate','addedBy']] } });
    }
    if (!existing.includes('AdminInvites')) {
      await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID!, range: 'AdminInvites!A1:E1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','sentDate','status']] } });
    }
  }
}

export async function GET() {
  try {
    await ensureSheets();
    const sheets = getSheets();
    const [usersRes, invitesRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'AdminUsers!A2:E' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'AdminInvites!A2:E' }),
    ]);
    const users = (usersRes.data.values || []).map(r => ({ email:r[0]||'', name:r[1]||'', role:r[2]||'admin', addedDate:r[3]||'', addedBy:r[4]||'' }));
    const invites = (invitesRes.data.values || []).filter(r => r[4] !== 'revoked').map(r => ({ email:r[0]||'', name:r[1]||'', role:r[2]||'admin', sentDate:r[3]||'', status:r[4]||'pending' }));
    return NextResponse.json({ users, invites });
  } catch(e) {
    return NextResponse.json({ users: [], invites: [], error: String(e) });
  }
}

export async function POST(req: Request) {
  const { action, email, name, role } = await req.json();
  try {
    await ensureSheets();
    const sheets = getSheets();
    if (action === 'invite') {
      await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID!, range: 'AdminInvites!A:E', valueInputOption: 'RAW',
        requestBody: { values: [[email, name||'', role||'admin', new Date().toISOString().split('T')[0], 'pending']] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'remove') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'AdminUsers!A:A' });
      const rows = res.data.values || [];
      const rowIdx = rows.findIndex(r => r[0] === email);
      if (rowIdx > 0) {
        await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID!, requestBody: { requests: [{ deleteDimension: { range: { sheetId: await getSheetId(sheets, 'AdminUsers'), dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx+1 } } }] } });
      }
      return NextResponse.json({ success: true });
    }
    if (action === 'revoke') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'AdminInvites!A:A' });
      const rows = res.data.values || [];
      const rowIdx = rows.findIndex(r => r[0] === email);
      if (rowIdx > 0) {
        await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID!, range: `AdminInvites!E${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [['revoked']] } });
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch(e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}

async function getSheetId(sheets: any, title: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = meta.data.sheets?.find((s: any) => s.properties?.title === title);
  return sheet?.properties?.sheetId || 0;
}
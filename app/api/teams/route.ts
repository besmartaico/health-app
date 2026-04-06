// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version: 'v4', auth });
}
const SID = process.env.GOOGLE_SHEETS_CRM_ID;

async function ensureSheets(sheets) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID });
    const existing = meta.data.sheets?.map(s => s.properties?.title) || [];
    const toAdd = [];
    if (!existing.includes('AdminUsers')) toAdd.push({ addSheet: { properties: { title: 'AdminUsers' } } });
    if (!existing.includes('AdminInvites')) toAdd.push({ addSheet: { properties: { title: 'AdminInvites' } } });
    if (toAdd.length > 0) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID, requestBody: { requests: toAdd } });
      if (!existing.includes('AdminUsers')) await sheets.spreadsheets.values.update({ spreadsheetId: SID, range: 'AdminUsers!A1:F1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','addedDate','addedBy','teamId']] } });
      if (!existing.includes('AdminInvites')) await sheets.spreadsheets.values.update({ spreadsheetId: SID, range: 'AdminInvites!A1:F1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','sentDate','status','teamId']] } });
    }
  } catch {}
}

export async function GET() {
  try {
    const sheets = getSheets();
    await ensureSheets(sheets);
    const [usersRes, invitesRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'AdminUsers!A2:F' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'AdminInvites!A2:F' }),
    ]);
    const users = (usersRes.data.values || []).map(r => ({ email:r[0]||'', name:r[1]||'', role:r[2]||'admin', addedDate:r[3]||'', addedBy:r[4]||'', teamId:r[5]||'' }));
    const invites = (invitesRes.data.values || []).filter(r => r[4] !== 'revoked').map(r => ({ email:r[0]||'', name:r[1]||'', role:r[2]||'admin', sentDate:r[3]||'', status:r[4]||'pending', teamId:r[5]||'' }));
    return NextResponse.json({ users, invites });
  } catch(e) { return NextResponse.json({ users:[], invites:[], error:String(e) }); }
}

export async function POST(req) {
  const { action, email, name, role, teamId } = await req.json();
  try {
    const sheets = getSheets();
    await ensureSheets(sheets);

    if (action === 'invite') {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID, range: 'AdminInvites!A:F', valueInputOption: 'RAW', requestBody: { values: [[email, name||'', role||'admin', new Date().toISOString().split('T')[0], 'pending', teamId||'']] } });
      return NextResponse.json({ success: true });
    }

    if (action === 'assign_team') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'AdminUsers!A:A' });
      const rows = res.data.values || [];
      const rowIdx = rows.findIndex(r => r[0] === email);
      if (rowIdx > 0) {
        await sheets.spreadsheets.values.update({ spreadsheetId: SID, range: `AdminUsers!F${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [[teamId||'']] } });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'AdminUsers');
      const sheetId = sheet?.properties?.sheetId || 0;
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'AdminUsers!A:A' });
      const rows = res.data.values || [];
      const rowIdx = rows.findIndex(r => r[0] === email);
      if (rowIdx > 0) await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID, requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx+1 } } }] } });
      return NextResponse.json({ success: true });
    }

    if (action === 'revoke') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'AdminInvites!A:A' });
      const rows = res.data.values || [];
      const rowIdx = rows.findIndex(r => r[0] === email);
      if (rowIdx > 0) await sheets.spreadsheets.values.update({ spreadsheetId: SID, range: `AdminInvites!E${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [['revoked']] } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch(e) { return NextResponse.json({ success: false, error: String(e) }); }
}
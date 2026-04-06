// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Resend } from 'resend';
function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;
async function ensureSheets(sheets) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    const ex = meta.data.sheets?.map(s => s.properties?.title) || [];
    const toAdd = [];
    if (!ex.includes('AdminUsers')) toAdd.push({ addSheet: { properties: { title: 'AdminUsers' } } });
    if (!ex.includes('AdminInvites')) toAdd.push({ addSheet: { properties: { title: 'AdminInvites' } } });
    if (toAdd.length > 0) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: toAdd } });
      if (!ex.includes('AdminUsers')) await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: 'AdminUsers!A1:G1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','addedDate','addedBy','teamId','passwordHash']] } });
      if (!ex.includes('AdminInvites')) await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: 'AdminInvites!A1:H1', valueInputOption: 'RAW', requestBody: { values: [['email','name','role','sentDate','status','tokenExpiry','token','teamId']] } });
    }
  } catch {}
}
export async function GET() {
  try {
    const sheets = getSheets();
    await ensureSheets(sheets);
    const [ur, ir] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' }),
    ]);
    const users = (ur.data.values || []).map(r => ({ email: r[0]||'', name: r[1]||'', role: r[2]||'admin', addedDate: r[3]||'', addedBy: r[4]||'', teamId: r[5]||'' }));
    const invites = (ir.data.values || []).filter(r => r[4] !== 'revoked' && r[4] !== 'active').map(r => ({ email: r[0]||'', name: r[1]||'', role: r[2]||'admin', sentDate: r[3]||'', status: r[4]||'pending', teamId: r[7]||'' }));
    return NextResponse.json({ users, invites });
  } catch (e) {
    return NextResponse.json({ users: [], invites: [], error: String(e) }, { status: 500 });
  }
}
export async function POST(req) {
  const { action, email, name, role, teamId } = await req.json();
  try {
    const sheets = getSheets();
    await ensureSheets(sheets);
    if (action === 'invite') {
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://health.besmartai.co';
      const signupUrl = `${appUrl}/signup?token=${token}`;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID(), range: 'AdminInvites!A:H', valueInputOption: 'RAW',
        requestBody: { values: [[email, name||'', role||'admin', new Date().toISOString().split('T')[0], 'pending', expiry, token, teamId||'']] },
      });
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'BeSmart Health <admin@besmartai.co>',
          to: email,
          subject: 'You have been invited to BeSmart Health Admin',
          html: `<div style='font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;'><img src='https://images.squarespace-cdn.com/content/v1/69270d3f55d63e364a913bdd/68b6d2d1-03ce-44bb-88c2-85618d6a7eff/BeSmartAI.png?format=300w' height='36' style='margin-bottom:24px;' /><h2 style='color:#111;margin:0 0 8px;'>You've been invited</h2><p style='color:#555;margin:0 0 24px;'>You have been invited to join the BeSmart Health admin portal as <strong>${role}</strong>.</p><a href='${signupUrl}' style='display:inline-block;background:#7b1c2e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;'>Create your password →</a><p style='color:#999;font-size:12px;margin-top:24px;'>This link expires in 7 days.</p></div>`,
        });
      }
      return NextResponse.json({ success: true });
    }
    if (action === 'assign_team') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === email);
      if (rowIdx > 0) await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `AdminUsers!F${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [[teamId||'']] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'remove') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'AdminUsers');
      const sheetId = sheet?.properties?.sheetId || 0;
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === email);
      if (rowIdx > 0) await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx+1 } } }] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'revoke') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === email);
      if (rowIdx > 0) await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `AdminInvites!E${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [['revoked']] } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
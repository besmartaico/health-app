// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;

async function ensureSheet(sheets) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    if (!meta.data.sheets?.some(s => s.properties?.title === 'Instructions')) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ addSheet: { properties: { title: 'Instructions' } } }] } });
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: 'Instructions!A1:B1', valueInputOption: 'RAW', requestBody: { values: [['peptide','text']] } });
    }
  } catch {}
}

export async function GET() {
  try {
    const sheets = getSheets();
    await ensureSheet(sheets);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Instructions!A2:B' });
    const instructions = {};
    (res.data.values || []).forEach(r => { if (r[0]) instructions[r[0]] = r[1] || ''; });
    return NextResponse.json({ instructions });
  } catch (e) {
    return NextResponse.json({ instructions: {}, error: String(e) });
  }
}

export async function POST(req) {
  const { peptide, text } = await req.json();
  try {
    const sheets = getSheets();
    await ensureSheet(sheets);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Instructions!A:A' });
    const rows = res.data.values || [];
    const rowIdx = rows.findIndex(r => r[0] === peptide);
    if (rowIdx > 0) {
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `Instructions!A${rowIdx+1}:B${rowIdx+1}`, valueInputOption: 'RAW', requestBody: { values: [[peptide, text]] } });
    } else {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Instructions!A:B', valueInputOption: 'RAW', requestBody: { values: [[peptide, text]] } });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
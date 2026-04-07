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

// Columns: date, vendor, item, quantity, unit, unitCost, discount, totalCost, notes
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Purchases!A2:I' });
    const purchases = (res.data.values || []).map((r, i) => ({
      id: String(i),
      date: r[0]||'', vendor: r[1]||'', item: r[2]||'', quantity: r[3]||'', unit: r[4]||'',
      unitCost: r[5]||'', discount: r[6]||'', totalCost: r[7]||'', notes: r[8]||'',
    }));
    return NextResponse.json({ purchases });
  } catch (e) {
    return NextResponse.json({ purchases: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  const { action, purchase, index } = await req.json();
  try {
    const sheets = getSheets();
    const row = (p) => [p.date||'', p.vendor||'', p.item||'', p.quantity||'', p.unit||'', p.unitCost||'', p.discount||'', p.totalCost||'', p.notes||''];
    if (action === 'add') {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Purchases!A:I', valueInputOption: 'RAW', requestBody: { values: [row(purchase)] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      const r = Number(index) + 2;
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `Purchases!A${r}:I${r}`, valueInputOption: 'RAW', requestBody: { values: [row(purchase)] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Purchases');
      const sheetId = sheet?.properties?.sheetId || 0;
      const rowIdx = Number(index) + 1;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx + 1 } } }] } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
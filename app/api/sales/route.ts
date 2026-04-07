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

// Columns A-F: date, customer, lines(JSON), total, notes, id
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Sales!A2:F' });
    const sales = (res.data.values || []).map((r, i) => ({
      id: String(i), date: r[0]||'', customer: r[1]||'', lines: r[2]||'[]', total: r[3]||'', notes: r[4]||'',
    }));
    return NextResponse.json({ sales });
  } catch (e) { return NextResponse.json({ sales: [], error: String(e) }, { status: 500 }); }
}

async function decrementInventory(sheets, lines) {
  try {
    const invRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:F' });
    const rows = invRes.data.values || [];
    for (const line of lines) {
      const idx = rows.findIndex(r => r[1]?.toLowerCase().trim() === line.product?.toLowerCase().trim());
      if (idx >= 0) {
        const current = parseFloat(rows[idx][2]) || 0;
        const newQty = Math.max(0, current - (parseFloat(line.qty)||1));
        await sheets.spreadsheets.values.update({
          spreadsheetId: SID(), range: `Inventory!C${idx + 2}`,
          valueInputOption: 'RAW', requestBody: { values: [[String(newQty)]] },
        });
      }
    }
  } catch (e) { console.error('Inventory decrement failed:', e?.message); }
}

export async function POST(req) {
  const { action, sale: s, index } = await req.json();
  try {
    const sheets = getSheets();
    const row = (s) => [s.date||'', s.customer||'', s.lines||'[]', s.total||'', s.notes||''];
    if (action === 'add') {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Sales!A:E', valueInputOption: 'RAW', requestBody: { values: [row(s)] } });
      // Decrement inventory for each line item sold
      try { const lines = JSON.parse(s.lines||'[]'); await decrementInventory(sheets, lines); } catch {}
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      const r = Number(index) + 2;
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `Sales!A${r}:E${r}`, valueInputOption: 'RAW', requestBody: { values: [row(s)] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Sales');
      const sheetId = sheet?.properties?.sheetId || 0;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: Number(index)+1, endIndex: Number(index)+2 } } }] } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
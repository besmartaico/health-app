// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;

export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:L' });
    const items = (res.data.values || []).map((r, i) => ({
      id: String(i),
      itemType: r[0] || '',
      name: r[1] || '',
      quantity: r[2] || '0',
      unit: r[3] || '',
      reorderLevel: r[4] || '',
      notes: r[5] || '',
      priceStandard: r[9] || '',
      priceFnF: r[10] || '',
      cost: r[11] || '',
    }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ items: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  const { action, item, index } = await req.json();
  try {
    const sheets = getSheets();
    if (action === 'add') {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID(), range: 'Inventory!A:F', valueInputOption: 'RAW',
        requestBody: { values: [[item.itemType||'', item.name||'', item.quantity||'0', item.unit||'', item.reorderLevel||'', item.notes||'']] },
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      const row = Number(index) + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SID(), range: `Inventory!A${row}:F${row}`, valueInputOption: 'RAW',
        requestBody: { values: [[item.itemType||'', item.name||'', item.quantity||'0', item.unit||'', item.reorderLevel||'', item.notes||'']] },
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'update_price') {
      const rowNum = Number(index) + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SID(), range: `Inventory!J${rowNum}:K${rowNum}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[item.priceStandard||'', item.priceFnF||'']] },
      });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Inventory');
      const sheetId = sheet?.properties?.sheetId || 0;
      const row = Number(index) + 1;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SID(),
        requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: row, endIndex: row + 1 } } }] },
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
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

// Columns A-H: date, vendor, item, quantity, unitCost, discount, totalCost, notes
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Purchases!A2:H' });
    const purchases = (res.data.values || []).map((r, i) => ({
      id: String(i), date: r[0]||'', vendor: r[1]||'', item: r[2]||'',
      quantity: r[3]||'', unitCost: r[4]||'', discount: r[5]||'', totalCost: r[6]||'', notes: r[7]||'',
    }));
    return NextResponse.json({ purchases });
  } catch (e) { return NextResponse.json({ purchases: [], error: String(e) }, { status: 500 }); }
}

async function updateInventory(sheets, itemName, qty) {
  try {
    const invRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:F' });
    const rows = invRes.data.values || [];
    // Find matching row (col B = name)
    const idx = rows.findIndex(r => r[1]?.toLowerCase().trim() === itemName.toLowerCase().trim());
    if (idx >= 0) {
      // Update existing - add quantity
      const current = parseFloat(rows[idx][2]) || 0;
      const newQty = current + parseFloat(qty);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SID(), range: `Inventory!C${idx + 2}`,
        valueInputOption: 'RAW', requestBody: { values: [[String(newQty)]] },
      });
    } else {
      // Add new inventory row
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID(), range: 'Inventory!A:F',
        valueInputOption: 'RAW',
        requestBody: { values: [['Peptide', itemName, String(parseFloat(qty)||0), 'vials', '', '']] },
      });
    }
  } catch (e) { console.error('Inventory update failed:', e?.message); }
}

export async function POST(req) {
  const { action, purchase: p, index } = await req.json();
  try {
    const sheets = getSheets();
    const row = (p) => [p.date||'', p.vendor||'', p.item||'', p.quantity||'', p.unitCost||'', p.discount||'', p.totalCost||'', p.notes||''];
    if (action === 'add') {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Purchases!A:H', valueInputOption: 'RAW', requestBody: { values: [row(p)] } });
      // Auto-update inventory
      if (p.item && p.quantity) await updateInventory(sheets, p.item, p.quantity);
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      const r = Number(index) + 2;
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `Purchases!A${r}:H${r}`, valueInputOption: 'RAW', requestBody: { values: [row(p)] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Purchases');
      const sheetId = sheet?.properties?.sheetId || 0;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: Number(index)+1, endIndex: Number(index)+2 } } }] } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
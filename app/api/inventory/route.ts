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

// A=itemType, B=peptide/name, C=vialSize, D=quantity, E=unitCost, F=supplier,
// G=purchaseDate, H=notes, I=createdDate, J=priceStandard, K=priceFnF, L=cost, M=reorderPoint
function rowToObj(r, i) {
  return {
    id:           String(i),
    itemType:     r[0]  || '',
    name:         r[1]  || '',
    vialSize:     r[2]  || '',
    quantity:     r[3]  || '0',
    unitCost:     r[4]  || '',
    supplier:     r[5]  || '',
    purchaseDate: r[6]  || '',
    notes:        r[7]  || '',
    createdDate:  r[8]  || '',
    priceStandard:r[9]  || '',
    priceFnF:     r[10] || '',
    cost:         r[11] || '',
    reorderPoint: r[12] || '',
  };
}

export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:M' });
    const items = (res.data.values || []).map((r, i) => rowToObj(r, i));
    return NextResponse.json({ items });
  } catch(e) { return NextResponse.json({ items: [], error: String(e) }, { status: 500 }); }
}

export async function POST(req) {
  const { action, index, item } = await req.json();
  try {
    const sheets = getSheets();
    const sid = SID();

    if (action === 'add') {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sid, range: 'Inventory!A:M', valueInputOption: 'RAW',
        requestBody: { values: [[
          item.itemType||'Peptide', item.name||'', item.vialSize||'', item.quantity||'0',
          item.unitCost||'', item.supplier||'', item.purchaseDate||'', item.notes||'',
          new Date().toISOString().split('T')[0],
          item.priceStandard||'', item.priceFnF||'', item.cost||'', item.reorderPoint||'',
        ]] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const rowNum = Number(index) + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid, range: `Inventory!A${rowNum}:M${rowNum}`, valueInputOption: 'RAW',
        requestBody: { values: [[
          item.itemType||'Peptide', item.name||'', item.vialSize||'', item.quantity||'0',
          item.unitCost||'', item.supplier||'', item.purchaseDate||'', item.notes||'',
          item.createdDate||'',
          item.priceStandard||'', item.priceFnF||'', item.cost||'', item.reorderPoint||'',
        ]] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update_qty') {
      const rowNum = Number(index) + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid, range: `Inventory!D${rowNum}`, valueInputOption: 'RAW',
        requestBody: { values: [[String(item.quantity)]] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const rowNum = Number(index) + 2;
      await sheets.spreadsheets.values.clear({ spreadsheetId: sid, range: `Inventory!A${rowNum}:M${rowNum}` });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch(e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
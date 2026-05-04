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

// A=itemType B=name C=vialSize D=quantity E=unitCost F=supplier
// G=purchaseDate H=notes I=createdDate J=priceStandard K=priceFnF L=reorderPoint
function isLegacyRow(r) {
  const c = (r[2]||'').trim(); const d = (r[3]||'').trim();
  const cIsNum = c !== '' && !isNaN(parseFloat(c));
  const dIsVials = d.toLowerCase() === 'vials' || d === '';
  const dIsZeroWhileCHasQty = d === '0' && cIsNum && parseFloat(c) > 0;
  return cIsNum && (dIsVials || dIsZeroWhileCHasQty);
}
function getQty(r) {
  if (isLegacyRow(r)) return (r[2]||'0').trim();
  const d = (r[3]||'').trim();
  return !isNaN(parseFloat(d)) ? d : '0';
}
function getVialSize(r) { return isLegacyRow(r) ? '' : (r[2]||'').trim(); }

// id = actual sheet row number (1-based), so row 2 = first data row
function rowToObj(r, sheetRowNum) {
  return {
    id:            String(sheetRowNum),
    itemType:      r[0]  || '',
    name:          r[1]  || '',
    vialSize:      getVialSize(r),
    quantity:      getQty(r),
    unitCost:      r[4]  || '',
    supplier:      r[5]  || '',
    purchaseDate:  r[6]  || '',
    notes:         r[7]  || '',
    createdDate:   r[8]  || '',
    priceStandard: r[9]  || '',
    priceFnF:      r[10] || '',
    reorderPoint:  r[11] || '',
  };
}

function toRow(item, isNew) {
  return [
    item.itemType      || 'Peptide',
    item.name          || '',
    item.vialSize      || '',
    item.quantity      || '0',
    item.unitCost      || '',
    item.supplier      || '',
    item.purchaseDate  || '',
    item.notes         || '',
    isNew ? new Date().toISOString().split('T')[0] : (item.createdDate || ''),
    item.priceStandard || '',
    item.priceFnF      || '',
    item.reorderPoint  || '',
  ];
}

// Get sheet metadata to find the Inventory sheet ID (needed for row deletion)
async function getSheetId(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets.find((s) => s.properties.title === 'Inventory');
  return sheet ? sheet.properties.sheetId : 0;
}

export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:L' });
    const rows = res.data.values || [];
    const items = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      // Skip completely empty rows (from old clear-based deletes)
      if (!r || !r[0] && !r[1]) continue;
      items.push(rowToObj(r, i + 2)); // i+2 = actual sheet row (row 1 is header)
    }
    return NextResponse.json({ items });
  } catch(e) { return NextResponse.json({ items: [], error: String(e) }, { status: 500 }); }
}

export async function POST(req) {
  const { action, item, adjustment } = await req.json();
  try {
    const sheets = getSheets();
    const sid = SID();

    if (action === 'add') {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sid, range: 'Inventory!A:L', valueInputOption: 'RAW',
        requestBody: { values: [toRow(item, true)] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      // item.id is the real sheet row number
      const rowNum = Number(item.id);
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid, range: `Inventory!A${rowNum}:L${rowNum}`, valueInputOption: 'RAW',
        requestBody: { values: [toRow(item, false)] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'adjust') {
      const rowNum = Number(item.id);
      await sheets.spreadsheets.values.update({
        spreadsheetId: sid, range: `Inventory!D${rowNum}`, valueInputOption: 'RAW',
        requestBody: { values: [[String(adjustment.newQty)]] },
      });
      const logDate = new Date().toLocaleString('en-US', { timeZone: 'America/Denver' });
      await sheets.spreadsheets.values.append({
        spreadsheetId: sid, range: 'InventoryLog!A:G', valueInputOption: 'RAW',
        requestBody: { values: [[
          logDate, item.name||'', adjustment.type||'',
          String(adjustment.amount||0), String(adjustment.newQty),
          adjustment.notes||'', item.id||'',
        ]] },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      // Physically delete the row so indexes stay clean
      const rowNum = Number(item.id);
      const sheetId = await getSheetId(sheets, sid);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sid,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNum - 1, // 0-based
                endIndex: rowNum,
              }
            }
          }]
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch(e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
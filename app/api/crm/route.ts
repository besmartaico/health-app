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

// Cols A-J: id, name, email, phone, status, source, notes, addedDate, tags, referralCredits
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Customers!A2:J' });
    const customers = (res.data.values || []).map((r, i) => ({
      id: r[0]||String(i), name: r[1]||'', email: r[2]||'', phone: r[3]||'',
      status: r[4]||'', source: r[5]||'', notes: r[6]||'', addedDate: r[7]||'',
      tags: r[8]||'', referralCredits: r[9]||'0',
    }));
    return NextResponse.json({ customers });
  } catch (e) { return NextResponse.json({ customers: [], error: String(e) }, { status: 500 }); }
}

export async function POST(req) {
  const body = await req.json();
  const { action } = body;
  try {
    const sheets = getSheets();
    const row = (c) => [c.id||'', c.name||'', c.email||'', c.phone||'', c.status||'Active', c.source||'', c.notes||'', c.addedDate||new Date().toISOString().split('T')[0], c.tags||'', c.referralCredits||'0'];

    if (action === 'add') {
      const id = 'C'+Date.now();
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Customers!A:J', valueInputOption: 'RAW', requestBody: { values: [row({...body.customer, id})] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'update') {
      const r = Number(body.index) + 2;
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `Customers!A${r}:J${r}`, valueInputOption: 'RAW', requestBody: { values: [row(body.customer)] } });
      return NextResponse.json({ success: true });
    }
    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Customers');
      const sheetId = sheet?.properties?.sheetId || 0;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: Number(body.index)+1, endIndex: Number(body.index)+2 } } }] } });
      return NextResponse.json({ success: true });
    }
    // Import customers from Sales - adds any customer name not already in CRM
    if (action === 'import_from_sales') {
      const salesRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Sales!A2:G' });
      const salesRows = salesRes.data.values || [];
      const custRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Customers!A2:J' });
      const existingNames = new Set((custRes.data.values||[]).map(r => r[1]?.toLowerCase().trim()).filter(Boolean));
      const toAdd = [];
      for (const row of salesRows) {
        const name = row[1]?.trim();
        if (name && !existingNames.has(name.toLowerCase())) {
          existingNames.add(name.toLowerCase());
          toAdd.push([`C${Date.now()+toAdd.length}`, name, '', '', 'Active', 'Sales Import', '', row[0]||new Date().toISOString().split('T')[0], '', '0']);
        }
      }
      if (toAdd.length > 0) {
        await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'Customers!A:J', valueInputOption: 'RAW', requestBody: { values: toAdd } });
      }
      return NextResponse.json({ success: true, imported: toAdd.length, message: `Imported ${toAdd.length} new customer${toAdd.length!==1?'s':''} from Sales` });
    }
    return NextResponse.json({ error: 'Unknown action' });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
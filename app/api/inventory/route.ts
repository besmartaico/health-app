import { NextResponse } from 'next/server';
import { google } from 'googleapis';
function getSheets() {
  const auth = new google.auth.GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version: 'v4', auth });
}
const SHEET_ID = process.env.GOOGLE_SHEETS_CRM_ID;
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'Inventory!A2:I' });
    const rows = res.data.values || [];
    const inventory = rows.map((r,i) => ({ id: String(i+2), peptide:r[0]||'', vialSize:r[1]||'', quantity:r[2]||'0', unitCost:r[3]||'0', supplier:r[4]||'', purchaseDate:r[5]||'', isPersonal:r[6]||'no', notes:r[7]||'', createdDate:r[8]||'' }));
    return NextResponse.json({ inventory });
  } catch(e) { return NextResponse.json({ inventory:[], error: String(e) }); }
}
export async function POST(req: Request) {
  const { action, item, rowIndex } = await req.json();
  const sheets = getSheets();
  const values = [[item.peptide,item.vialSize,item.quantity,item.unitCost,item.supplier,item.purchaseDate,item.isPersonal,item.notes,item.createdDate||new Date().toISOString().split('T')[0]]];
  if (action === 'update') {
    await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID!, range: `Inventory!A${rowIndex}:I${rowIndex}`, valueInputOption: 'RAW', requestBody: { values } });
  } else {
    await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID!, range: 'Inventory!A:I', valueInputOption: 'RAW', requestBody: { values } });
  }
  return NextResponse.json({ success: true });
}
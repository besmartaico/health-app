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
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID!, range: 'Customers!A2:L' });
    const rows = res.data.values || [];
    const customers = rows.map((r,i) => ({ id: String(i+2), name:r[0]||'', email:r[1]||'', phone:r[2]||'', peptides:r[3]||'', dosage:r[4]||'', startDate:r[5]||'', nextRefill:r[6]||'', notes:r[7]||'', referredBy:r[8]||'', credits:r[9]||'0', status:r[10]||'active', createdDate:r[11]||'' }));
    return NextResponse.json({ customers });
  } catch(e) { return NextResponse.json({ customers:[], error: String(e) }); }
}
export async function POST(req: Request) {
  const { action, item, rowIndex } = await req.json();
  const sheets = getSheets();
  const values = [[item.name,item.email,item.phone,item.peptides,item.dosage,item.startDate,item.nextRefill,item.notes,item.referredBy,item.credits,item.status,item.createdDate||new Date().toISOString().split('T')[0]]];
  if (action === 'update') {
    await sheets.spreadsheets.values.update({ spreadsheetId: SHEET_ID!, range: `Customers!A${rowIndex}:L${rowIndex}`, valueInputOption: 'RAW', requestBody: { values } });
  } else {
    await sheets.spreadsheets.values.append({ spreadsheetId: SHEET_ID!, range: 'Customers!A:L', valueInputOption: 'RAW', requestBody: { values } });
  }
  return NextResponse.json({ success: true });
}
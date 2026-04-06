import { NextResponse } from 'next/server';
import { google } from 'googleapis';
function getSheets() {
  const auth = new google.auth.GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  return google.sheets({ version:'v4', auth });
}
const SID = process.env.GOOGLE_SHEETS_CRM_ID;
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId:SID!, range:'Sales!A2:H' });
    const sales = (res.data.values||[]).map((r,i)=>({ id:String(i+2), date:r[0]||'', customer:r[1]||'', peptide:r[2]||'', quantity:r[3]||'', salePrice:r[4]||'', totalRevenue:r[5]||'', notes:r[6]||'' }));
    return NextResponse.json({ sales });
  } catch(e) {
    try {
      const sheets = getSheets();
      await sheets.spreadsheets.batchUpdate({ spreadsheetId:SID!, requestBody:{ requests:[{addSheet:{properties:{title:'Sales'}}}] } });
      await sheets.spreadsheets.values.update({ spreadsheetId:SID!, range:'Sales!A1:H1', valueInputOption:'RAW', requestBody:{ values:[['date','customer','peptide','quantity','salePrice','totalRevenue','notes','createdDate']] } });
    } catch {}
    return NextResponse.json({ sales:[] });
  }
}
export async function POST(req: Request) {
  const { action, item, rowIndex } = await req.json();
  const sheets = getSheets();
  const values = [[item.date,item.customer,item.peptide,item.quantity,item.salePrice,item.totalRevenue,item.notes,new Date().toISOString().split('T')[0]]];
  if (action==='update') {
    await sheets.spreadsheets.values.update({ spreadsheetId:SID!, range:`Sales!A${rowIndex}:H${rowIndex}`, valueInputOption:'RAW', requestBody:{ values } });
  } else {
    await sheets.spreadsheets.values.append({ spreadsheetId:SID!, range:'Sales!A:H', valueInputOption:'RAW', requestBody:{ values } });
  }
  return NextResponse.json({ success:true });
}
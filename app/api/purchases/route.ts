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
    const res = await sheets.spreadsheets.values.get({ spreadsheetId:SID!, range:'Purchases!A2:I' });
    const purchases = (res.data.values||[]).map((r,i)=>({ id:String(i+2), date:r[0]||'', supplier:r[1]||'', peptide:r[2]||'', quantity:r[3]||'', unitCost:r[4]||'', totalCost:r[5]||'', batchNo:r[6]||'', notes:r[7]||'' }));
    return NextResponse.json({ purchases });
  } catch(e) {
    try {
      const sheets = getSheets();
      await sheets.spreadsheets.batchUpdate({ spreadsheetId:SID!, requestBody:{ requests:[{addSheet:{properties:{title:'Purchases'}}}] } });
      await sheets.spreadsheets.values.update({ spreadsheetId:SID!, range:'Purchases!A1:I1', valueInputOption:'RAW', requestBody:{ values:[['date','supplier','peptide','quantity','unitCost','totalCost','batchNo','notes','createdDate']] } });
    } catch {}
    return NextResponse.json({ purchases:[] });
  }
}
export async function POST(req: Request) {
  const { action, item, rowIndex } = await req.json();
  const sheets = getSheets();
  const values = [[item.date,item.supplier,item.peptide,item.quantity,item.unitCost,item.totalCost,item.batchNo,item.notes,new Date().toISOString().split('T')[0]]];
  if (action==='update') {
    await sheets.spreadsheets.values.update({ spreadsheetId:SID!, range:`Purchases!A${rowIndex}:I${rowIndex}`, valueInputOption:'RAW', requestBody:{ values } });
  } else {
    await sheets.spreadsheets.values.append({ spreadsheetId:SID!, range:'Purchases!A:I', valueInputOption:'RAW', requestBody:{ values } });
  }
  return NextResponse.json({ success:true });
}
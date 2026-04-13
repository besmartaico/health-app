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

export async function GET() {
  try {
    const sheets = getSheets();
    const today = new Date(); today.setHours(0,0,0,0);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    const in14 = new Date(today); in14.setDate(in14.getDate() + 14);
    const alerts = [];

    // Check sales for upcoming refill dates
    const salesRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Sales!A2:H' });
    for (const row of salesRes.data.values||[]) {
      const nextRefill = row[7]; // col H = nextRefillDate
      if (!nextRefill) continue;
      const d = new Date(nextRefill); d.setHours(0,0,0,0);
      const daysUntil = Math.round((d.getTime()-today.getTime())/(1000*60*60*24));
      if (daysUntil <= 7 && daysUntil >= 0) {
        alerts.push({ type:'refill', customer:row[1]||'', peptide:'', nextRefillDate:nextRefill, daysUntil, urgent: daysUntil<=3 });
      }
    }

    // Check CRM for follow-up dates
    const crmRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Customers!A2:K' });
    for (const row of crmRes.data.values||[]) {
      const followUpDate = row[10]; // col K
      if (!followUpDate) continue;
      const d = new Date(followUpDate); d.setHours(0,0,0,0);
      const daysUntil = Math.round((d.getTime()-today.getTime())/(1000*60*60*24));
      if (daysUntil <= 7 && daysUntil >= -1) {
        alerts.push({ type:'followup', customer:row[1]||'', followUpDate, daysUntil, urgent: daysUntil<=1 });
      }
    }

    alerts.sort((a,b) => a.daysUntil - b.daysUntil);
    return NextResponse.json({ alerts, count: alerts.length });
  } catch(e) { return NextResponse.json({ alerts:[], count:0, error:String(e) }, {status:500}); }
}
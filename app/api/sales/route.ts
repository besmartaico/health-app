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

function cleanReferredBy(val) {
  if (!val) return '';
  if (/^\$?[\d,]+\.?\d*$/.test(val.trim())) return '';
  return val;
}

// Cols A-H: date, customer, lines, total, notes, referredBy, referralCredit, nextRefillDate
export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Sales!A2:H' });
    const sales = (res.data.values||[]).map((r,i) => ({
      id: String(i), date:r[0]||'', customer:r[1]||'', lines:r[2]||'[]',
      total:r[3]||'', notes:r[4]||'', referredBy:cleanReferredBy(r[5]||''),
      referralCredit:r[6]||'', nextRefillDate:r[7]||'',
    }));
    return NextResponse.json({ sales });
  } catch(e) { return NextResponse.json({ sales:[], error:String(e) }, {status:500}); }
}

async function decrementInventory(sheets, lines) {
  try {
    const invRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'Inventory!A2:F' });
    const rows = invRes.data.values||[];
    for (const line of lines) {
      const idx = rows.findIndex(r=>r[1]?.toLowerCase().trim()===line.product?.toLowerCase().trim());
      if (idx>=0) {
        const newQty = Math.max(0,(parseFloat(rows[idx][2])||0)-(parseFloat(line.qty)||1));
        await sheets.spreadsheets.values.update({ spreadsheetId:SID(), range:`Inventory!C${idx+2}`, valueInputOption:'RAW', requestBody:{values:[[String(newQty)]]} });
      }
    }
  } catch(e) { console.error('inv decrement:',e?.message); }
}

async function addReferralCredit(sheets, referrerName) {
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId:SID(), range:'Customers!A2:J' });
    const rows = res.data.values||[];
    const idx = rows.findIndex(r=>r[1]?.toLowerCase().trim()===referrerName.toLowerCase().trim());
    if (idx>=0) {
      const newCredit = (parseFloat(rows[idx][9])||0)+20;
      await sheets.spreadsheets.values.update({ spreadsheetId:SID(), range:`Customers!J${idx+2}`, valueInputOption:'RAW', requestBody:{values:[[String(newCredit)]]} });
    }
  } catch(e) { console.error('referral credit:',e?.message); }
}

export async function POST(req) {
  const { action, sale:s, index } = await req.json();
  try {
    const sheets = getSheets();
    const row = (s) => [s.date||'',s.customer||'',s.lines||'[]',s.total||'',s.notes||'',s.referredBy||'',s.referralCredit||'',s.nextRefillDate||''];

    if (action==='add') {
      await sheets.spreadsheets.values.append({ spreadsheetId:SID(), range:'Sales!A:H', valueInputOption:'RAW', requestBody:{values:[row(s)]} });
      try { const lines=JSON.parse(s.lines||'[]'); await decrementInventory(sheets,lines); } catch {}
      if (s.referredBy) await addReferralCredit(sheets,s.referredBy);
      return NextResponse.json({ success:true });
    }
    if (action==='update') {
      const r = Number(index)+2;
      await sheets.spreadsheets.values.update({ spreadsheetId:SID(), range:`Sales!A${r}:H${r}`, valueInputOption:'RAW', requestBody:{values:[row(s)]} });
      return NextResponse.json({ success:true });
    }
    if (action==='delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId:SID() });
      const sheet = meta.data.sheets?.find(s=>s.properties?.title==='Sales');
      const sheetId = sheet?.properties?.sheetId||0;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId:SID(), requestBody:{requests:[{deleteDimension:{range:{sheetId,dimension:'ROWS',startIndex:Number(index)+1,endIndex:Number(index)+2}}}]} });
      return NextResponse.json({ success:true });
    }
    if (action==='cleanup_referrals') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId:SID(), range:'Sales!A2:H' });
      const rows = res.data.values||[]; let fixed=0;
      for (let i=0;i<rows.length;i++) {
        const referredBy=rows[i][5]||'';
        if (referredBy&&/^\$?[\d,]+\.?\d*$/.test(referredBy.trim())) {
          await sheets.spreadsheets.values.update({ spreadsheetId:SID(), range:`Sales!F${i+2}:G${i+2}`, valueInputOption:'RAW', requestBody:{values:[['','']]} });
          fixed++;
        }
      }
      return NextResponse.json({ success:true, fixed });
    }
    return NextResponse.json({ error:'Unknown action' });
  } catch(e) { return NextResponse.json({ error:String(e) }, {status:500}); }
}
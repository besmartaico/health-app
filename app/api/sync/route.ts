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

export async function POST() {
  const results: string[] = [];
  try {
    const sheets = getSheets();
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    const tabNames = meta.data.sheets?.map(s => s.properties?.title) || [];
    const tab = (name: string) => tabNames.find(t => new RegExp(name,'i').test(t)) || name;

    // ── 1. Import customers from Sales → CRM ──
    const salesRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: `${tab('sale')}!A2:G` });
    const salesRows = salesRes.data.values || [];
    const custRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: `${tab('customer')}!A2:J` });
    const existingNames = new Set((custRes.data.values||[]).map(r => r[1]?.toLowerCase().trim()).filter(Boolean));
    const toAdd: any[] = [];
    for (const row of salesRows) {
      const name = row[1]?.trim();
      if (name && !existingNames.has(name.toLowerCase())) {
        existingNames.add(name.toLowerCase());
        toAdd.push([`C${Date.now()+toAdd.length}`, name, '', '', 'Active', 'Sales Import', '', row[0]||'', '', '0']);
      }
    }
    if (toAdd.length > 0) {
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: `${tab('customer')}!A:J`, valueInputOption: 'RAW', requestBody: { values: toAdd } });
    }
    results.push(`✓ Customers: imported ${toAdd.length} new from Sales`);

    // ── 2. Rebuild inventory from Purchases - Sales ──
    const purchRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: `${tab('purchase')}!A1:I` });
    const purchRows = purchRes.data.values || [];
    const bought: Record<string,number> = {};
    for (const row of purchRows.slice(1)) {
      const item = row[2]?.trim(); const qty = parseFloat(row[3]) || 0;
      if (item && qty > 0) bought[item] = (bought[item]||0) + qty;
    }
    const soldMap: Record<string,number> = {};
    for (const row of salesRows) {
      try { const lines = JSON.parse(row[2]||'[]'); for (const l of lines) { const n=l.product?.trim(); const q=parseFloat(l.qty)||0; if(n&&q>0) soldMap[n]=(soldMap[n]||0)+q; } } catch {}
    }
    const allItems = new Set([...Object.keys(bought), ...Object.keys(soldMap)]);
    const netRows = Array.from(allItems).filter(n=>bought[n]>0).map(n=>['Peptide',n,String(Math.max(0,(bought[n]||0)-(soldMap[n]||0))),'vials','','']);
    if (netRows.length > 0) {
      await sheets.spreadsheets.values.clear({ spreadsheetId: SID(), range: `${tab('inventor')}!A2:Z` });
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: `${tab('inventor')}!A2`, valueInputOption: 'RAW', requestBody: { values: netRows } });
    }
    results.push(`✓ Inventory: rebuilt ${netRows.length} items (purchases − sales)`);

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message, results }, { status: 500 });
  }
}
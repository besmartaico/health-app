// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;

export async function POST() {
  try {
    const sheets = getSheets();

    // Get all tab names
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    const tabNames = meta.data.sheets?.map(s => s.properties?.title) || [];
    const purchTab = tabNames.find(t => /purchase/i.test(t)) || 'Purchases';
    const salesTab = tabNames.find(t => /sale/i.test(t)) || 'Sales';
    const invTab   = tabNames.find(t => /inventor/i.test(t)) || 'Inventory';

    // 1. Aggregate purchases: item -> total qty bought
    const purchRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: `${purchTab}!A1:I` });
    const purchRows = purchRes.data.values || [];
    const bought: Record<string, number> = {};
    for (const row of purchRows.slice(1)) {
      const item = row[2]?.trim();
      const qty  = parseFloat(row[3]) || 0;
      if (item && qty > 0) bought[item] = (bought[item] || 0) + qty;
    }

    // 2. Aggregate sales: item -> total qty sold
    const salesRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: `${salesTab}!A1:E` });
    const salesRows = salesRes.data.values || [];
    const sold: Record<string, number> = {};
    for (const row of salesRows.slice(1)) {
      const linesJson = row[2] || '[]';
      try {
        const lines = JSON.parse(linesJson);
        for (const line of lines) {
          const item = line.product?.trim();
          const qty  = parseFloat(line.qty) || 0;
          if (item && qty > 0) sold[item] = (sold[item] || 0) + qty;
        }
      } catch {}
    }

    // 3. Compute net = bought - sold (floor at 0)
    const allItems = new Set([...Object.keys(bought), ...Object.keys(sold)]);
    const netInventory = Array.from(allItems).map(name => ({
      name,
      bought: bought[name] || 0,
      sold:   sold[name] || 0,
      net:    Math.max(0, (bought[name] || 0) - (sold[name] || 0)),
    })).filter(i => i.bought > 0); // only items we've purchased

    if (netInventory.length === 0) {
      return NextResponse.json({ success: false, message: 'No purchases found', tabNames, purchRowCount: purchRows.length, salesRowCount: salesRows.length });
    }

    // 4. Clear and rewrite Inventory sheet
    await sheets.spreadsheets.values.clear({ spreadsheetId: SID(), range: `${invTab}!A2:Z` });

    const invRows = netInventory.map(i => ['Peptide', i.name, String(i.net), 'vials', '', '']);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SID(),
      range: `${invTab}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: invRows },
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${netInventory.length} items: ${purchRows.length - 1} purchases, ${salesRows.length - 1} sales`,
      items: netInventory,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
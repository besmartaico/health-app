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

    // 1. Read all sheet tab names to verify they exist
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    const tabNames = meta.data.sheets?.map(s => s.properties?.title) || [];

    // 2. Read all purchases - try both possible column layouts
    // Old layout: date,vendor,item,quantity,unit,unitCost,discount,totalCost,notes (A-I, item=C, qty=D)
    // New layout: date,vendor,item,quantity,unitCost,discount,totalCost,notes (A-H, item=C, qty=D)
    const purchTab = tabNames.find(t => t.toLowerCase().includes('purchase')) || 'Purchases';
    const invTab = tabNames.find(t => t.toLowerCase().includes('inventor')) || 'Inventory';

    const purchRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SID(),
      range: `${purchTab}!A1:I`,
    });
    const allRows = purchRes.data.values || [];

    // Skip header row, aggregate quantities by item name
    const totals = {};
    for (const row of allRows.slice(1)) {
      const item = row[2]?.trim(); // column C = item
      const qty = parseFloat(row[3]) || 0; // column D = quantity
      if (item && qty > 0) {
        totals[item] = (totals[item] || 0) + qty;
      }
    }

    if (Object.keys(totals).length === 0) {
      return NextResponse.json({ success: false, message: 'No purchases found to backfill', tabNames, rowCount: allRows.length });
    }

    // 3. Clear existing inventory data (keep header)
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SID(),
      range: `${invTab}!A2:Z`,
    });

    // 4. Write aggregated inventory rows
    // Inventory columns: itemType(A), name(B), quantity(C), unit(D), reorderLevel(E), notes(F)
    const invRows = Object.entries(totals).map(([name, qty]) => [
      'Peptide', name, String(qty), 'vials', '', '',
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SID(),
      range: `${invTab}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: invRows },
    });

    return NextResponse.json({
      success: true,
      message: `Backfilled ${invRows.length} inventory items from ${allRows.length - 1} purchases`,
      items: Object.entries(totals).map(([name, qty]) => ({ name, qty })),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || String(e) }, { status: 500 });
  }
}
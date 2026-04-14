// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function POST() {
  try {
    const sheets = getSheets();
    const sid = process.env.GOOGLE_SHEETS_CRM_ID;

    // Read existing inventory rows (all cols A:L) to preserve everything except qty
    const invRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: 'Inventory!A2:L',
    });
    const existingRows = invRes.data.values || [];

    // Read purchases to compute quantities per peptide name
    const purchRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sid,
      range: 'Purchases!A2:F',
    });
    const purchRows = purchRes.data.values || [];

    // Tally quantities from purchases: col B = item name, col C = quantity
    const qtys = {};
    for (const r of purchRows) {
      const name = (r[1] || '').trim();
      const qty = parseInt(r[2]) || 0;
      if (name) qtys[name] = (qtys[name] || 0) + qty;
    }

    // For each existing inventory row, update ONLY col D (quantity) if we have purchase data
    // All other columns are left completely untouched
    const updates = [];
    for (let i = 0; i < existingRows.length; i++) {
      const row = existingRows[i];
      const name = (row[1] || '').trim(); // col B = peptide name
      if (name && qtys[name] !== undefined) {
        const rowNum = i + 2; // +1 for header, +1 for 1-index
        updates.push({
          range: `Inventory!D${rowNum}`,
          values: [[String(qtys[name])]],
        });
      }
    }

    // Batch update only the quantity cells
    if (updates.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sid,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates,
        },
      });
    }

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
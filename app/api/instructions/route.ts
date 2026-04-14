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
const RANGE = 'Instructions!A2:H';

// Row columns: A=peptide, B=text, C=sideEffects, D=storage, E=vialMg, F=reconMl, G=defaultDose, H=defaultFreq
function rowToObj(r) {
  return {
    peptide:     r[0] || '',
    text:        r[1] || '',
    sideEffects: r[2] || '',
    storage:     r[3] || '',
    vialMg:      r[4] || '',
    reconMl:     r[5] || '',
    defaultDose: r[6] || '',
    defaultFreq: r[7] || '',
  };
}

function objToRow(peptide, d) {
  return [
    peptide,
    d.text        || '',
    d.sideEffects || '',
    d.storage     || '',
    d.vialMg      || '',
    d.reconMl     || '',
    d.defaultDose || '',
    d.defaultFreq || '',
  ];
}

export async function GET() {
  try {
    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: RANGE });
    const rows = res.data.values || [];
    // Return as object keyed by peptide name for easy lookup
    const instructions = {};
    rows.forEach(r => {
      if (r[0]) instructions[r[0]] = rowToObj(r);
    });
    return NextResponse.json({ instructions });
  } catch(e) { return NextResponse.json({ instructions: {}, error: String(e) }, { status: 500 }); }
}

export async function POST(req) {
  const { action, peptide, data } = await req.json();
  if (!peptide) return NextResponse.json({ error: 'peptide required' }, { status: 400 });
  try {
    const sheets = getSheets();
    if (action === 'save') {
      // Find existing row for this peptide
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: RANGE });
      const rows = res.data.values || [];
      const idx = rows.findIndex(r => r[0] === peptide);
      if (idx >= 0) {
        // Update existing row
        const rowNum = idx + 2; // +1 for header, +1 for 1-indexed
        await sheets.spreadsheets.values.update({
          spreadsheetId: SID(),
          range: `Instructions!A${rowNum}:H${rowNum}`,
          valueInputOption: 'RAW',
          requestBody: { values: [objToRow(peptide, data || {})] },
        });
      } else {
        // Append new row
        await sheets.spreadsheets.values.append({
          spreadsheetId: SID(),
          range: 'Instructions!A:H',
          valueInputOption: 'RAW',
          requestBody: { values: [objToRow(peptide, data || {})] },
        });
      }
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch(e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
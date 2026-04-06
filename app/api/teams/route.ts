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

const SID = process.env.GOOGLE_SHEETS_CRM_ID;

async function ensureTeamsSheet(sheets) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID });
    const exists = meta.data.sheets?.some(s => s.properties?.title === 'Teams');
    if (!exists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SID,
        requestBody: { requests: [{ addSheet: { properties: { title: 'Teams' } } }] },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SID,
        range: 'Teams!A1:D1',
        valueInputOption: 'RAW',
        requestBody: { values: [['teamId', 'name', 'description', 'createdDate']] },
      });
    }
  } catch (e) {
    console.error('ensureTeamsSheet:', String(e));
  }
}

export async function GET() {
  try {
    const sheets = getSheets();
    await ensureTeamsSheet(sheets);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'Teams!A2:D' });
    const teams = (res.data.values || []).map(r => ({
      teamId: r[0] || '',
      name: r[1] || '',
      description: r[2] || '',
      createdDate: r[3] || '',
    })).filter(t => t.teamId);
    return NextResponse.json({ teams });
  } catch (e) {
    return NextResponse.json({ teams: [], error: String(e) }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { action, team, teamId } = await req.json();
    const sheets = getSheets();
    await ensureTeamsSheet(sheets);

    if (action === 'create') {
      const id = 'team_' + Date.now();
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID,
        range: 'Teams!A:D',
        valueInputOption: 'RAW',
        requestBody: { values: [[id, team.name, team.description || '', new Date().toISOString().split('T')[0]]] },
      });
      return NextResponse.json({ success: true, teamId: id });
    }

    if (action === 'update') {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'Teams!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === teamId);
      if (rowIdx > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SID,
          range: `Teams!A${rowIdx + 1}:D${rowIdx + 1}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[teamId, team.name, team.description || '', team.createdDate || '']] },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'Teams');
      const sheetId = sheet?.properties?.sheetId || 0;
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID, range: 'Teams!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === teamId);
      if (rowIdx > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SID,
          requestBody: {
            requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx + 1 } } }],
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
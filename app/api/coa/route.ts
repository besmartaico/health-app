// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/spreadsheets','https://www.googleapis.com/auth/drive'],
  });
}
const SID = () => process.env.GOOGLE_SHEETS_CRM_ID;
const FOLDER = () => process.env.GOOGLE_DRIVE_FOLDER_ID;

async function ensureSheet(sheets) {
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
    if (!meta.data.sheets?.some(s => s.properties?.title === 'COAs')) {
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ addSheet: { properties: { title: 'COAs' } } }] } });
      await sheets.spreadsheets.values.update({ spreadsheetId: SID(), range: 'COAs!A1:G1', valueInputOption: 'RAW', requestBody: { values: [['id','peptide','batchNo','testDate','purity','notes','fileUrl']] } });
    }
  } catch {}
}

export async function GET() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    await ensureSheet(sheets);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'COAs!A2:G' });
    const docs = (res.data.values || []).map(r => ({ id: r[0]||'', peptide: r[1]||'', batchNo: r[2]||'', testDate: r[3]||'', purity: r[4]||'', notes: r[5]||'', fileUrl: r[6]||'' }));
    return NextResponse.json({ docs });
  } catch (e) {
    return NextResponse.json({ docs: [], error: String(e) });
  }
}

export async function POST(req) {
  const { action, peptide, batchNo, testDate, purity, notes, fileData, fileName, fileType, id } = await req.json();
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    await ensureSheet(sheets);

    if (action === 'upload') {
      let fileUrl = '';
      if (fileData && fileName) {
        const drive = google.drive({ version: 'v3', auth });
        const buf = Buffer.from(fileData, 'base64');
        const { Readable } = await import('stream');
        const stream = Readable.from(buf);
        const uploaded = await drive.files.create({
          requestBody: { name: fileName, parents: FOLDER() ? [FOLDER()] : undefined },
          media: { mimeType: fileType || 'application/pdf', body: stream },
          fields: 'id,webViewLink',
        });
        await drive.permissions.create({ fileId: uploaded.data.id, requestBody: { role: 'reader', type: 'anyone' } });
        fileUrl = uploaded.data.webViewLink || '';
      }
      const docId = 'coa_' + Date.now();
      await sheets.spreadsheets.values.append({ spreadsheetId: SID(), range: 'COAs!A:G', valueInputOption: 'RAW', requestBody: { values: [[docId, peptide||'', batchNo||'', testDate||'', purity||'', notes||'', fileUrl]] } });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'COAs');
      const sheetId = sheet?.properties?.sheetId || 0;
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'COAs!A:A' });
      const rowIdx = (res.data.values || []).findIndex(r => r[0] === String(id));
      if (rowIdx > 0) {
        await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx+1 } } }] } });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) });
  }
}
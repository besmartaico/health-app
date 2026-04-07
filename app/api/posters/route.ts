// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const POSTER_FOLDER_ID = '1uI1QUaT1OswJ1eJOzCs5ohwc0tiF7dm9';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
}

export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
      q: `'${POSTER_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,webViewLink,thumbnailLink)',
      orderBy: 'name',
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    const files = (res.data.files || []).map(f => {
      const id = f.id || '';
      const rawName = f.name || '';
      const name = rawName.replace(/\.(pdf|png|jpg|jpeg|heic|webp)$/i, '');
      const isImage = /image/.test(f.mimeType || '');
      const isPdf = /pdf/.test(f.mimeType || '');
      return {
        id,
        name,
        mimeType: f.mimeType,
        viewUrl: f.webViewLink || `https://drive.google.com/file/d/${id}/view`,
        embedUrl: isPdf
          ? `https://drive.google.com/file/d/${id}/preview`
          : `https://drive.google.com/file/d/${id}/preview`,
        thumbnailUrl: f.thumbnailLink ? f.thumbnailLink.replace('s220','s400') : null,
      };
    });
    return NextResponse.json({ posters: files, count: files.length });
  } catch (e: any) {
    console.error('Posters API error:', e?.message);
    return NextResponse.json({ posters: [], error: e?.message || String(e) }, { status: 500 });
  }
}
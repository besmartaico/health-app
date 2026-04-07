// @ts-nocheck
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g,'\n') },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

const POSTER_FOLDER_ID = '1uI1QUaT1OswJ1eJOzCs5ohwc0tiF7dm9';

export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });
    const res = await drive.files.list({
      q: `'${POSTER_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)',
      orderBy: 'name',
      pageSize: 50,
    });
    const files = (res.data.files || []).map(f => ({
      id: f.id,
      name: f.name?.replace(/\.(pdf|png|jpg|jpeg)$/i,'') || '',
      mimeType: f.mimeType,
      viewUrl: f.webViewLink,
      // Use direct thumbnail from Drive
      thumbnailUrl: f.thumbnailLink ? f.thumbnailLink.replace('s220','s400') : null,
      // Direct embed URL for images
      embedUrl: f.mimeType?.includes('image') 
        ? `https://drive.google.com/uc?export=view&id=${f.id}`
        : `https://drive.google.com/file/d/${f.id}/preview`,
    }));
    return NextResponse.json({ posters: files });
  } catch (e) {
    return NextResponse.json({ posters: [], error: String(e) });
  }
}
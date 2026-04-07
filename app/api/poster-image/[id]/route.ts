// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new NextResponse('Not found', { status: 404 });

  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata to know mime type
    const meta = await drive.files.get({ fileId: id, fields: 'mimeType,name' });
    const mimeType = meta.data.mimeType || 'image/png';

    // Download file content
    const res = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = Buffer.from(res.data as ArrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Content-Length': String(buffer.length),
      },
    });
  } catch (e: any) {
    console.error('poster-image error:', e?.message);
    return new NextResponse('Not found', { status: 404 });
  }
}
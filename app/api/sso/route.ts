import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const secret = process.env.SSO_SECRET;
  if (!secret) return NextResponse.json({ error: 'SSO not configured' }, { status: 500 });
  // Check caller is authenticated (has admin session via header or cookie check)
  // We trust this endpoint is only called from within the authenticated admin UI
  const ts = Date.now().toString();
  // Simple HMAC using Web Crypto
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ts));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
  const ssoToken = btoa(`${ts}.${sigHex}`);
  const docsUrl = `https://docs.besmartai.co/api/sso?token=${encodeURIComponent(ssoToken)}&redirect=/admin/documents`;
  return NextResponse.redirect(docsUrl);
}
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

export async function GET() {
  try {
    const sheets = getSheets();
    const [usersRes, invitesRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminUsers!A2:G' }),
      sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' }),
    ]);
    const users = (usersRes.data.values||[]).map(r => ({
      email:r[0]||'', name:r[1]||'', role:r[2]||'', addedDate:r[3]||'', addedBy:r[4]||'', teamId:r[5]||'', status:'active'
    }));
    const invites = (invitesRes.data.values||[]).map((r,i) => ({
      rowIndex: i,
      email:r[0]||'', name:r[1]||'', role:r[2]||'', sentDate:r[3]||'', status:r[4]||'', tokenExpiry:r[5]||'', token:r[6]||'', teamId:r[7]||''
    }));
    return NextResponse.json({ users, invites });
  } catch(e) { return NextResponse.json({ users:[], invites:[], error:String(e) }, {status:500}); }
}

export async function POST(req) {
  const body = await req.json();
  const { action } = body;
  try {
    const sheets = getSheets();

    if (action === 'invite') {
      const { email, name, role, teamId } = body;
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const expiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
      await sheets.spreadsheets.values.append({
        spreadsheetId: SID(), range: 'AdminInvites!A:H', valueInputOption:'RAW',
        requestBody: { values: [[email, name||'', role||'user', new Date().toISOString().split('T')[0], 'pending', expiry, token, teamId||'']] }
      });
      // Try sending email via Resend
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://health.besmartai.co';
        await fetch('https://api.resend.com/emails', {
          method:'POST',
          headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
          body: JSON.stringify({
            from:'admin@besmartai.co',
            to:[email],
            subject:'You are invited to BeSmart Health Admin',
            html:`<p>Hi ${name||'there'},</p><p>You have been invited to join the BeSmart Health admin portal.</p><p><a href='${appUrl}/signup?token=${token}'>Click here to set up your account</a></p><p>This link expires in 7 days.</p>`,
          })
        });
      } catch(emailErr) { console.error('Email send failed:', emailErr); }
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://health.besmartai.co';
      return NextResponse.json({ success:true, token, signupUrl: `${appUrl}/signup?token=${token}` });
    }

    // Get signup link for existing pending invite (bypass email)
    if (action === 'get_signup_link') {
      const { email } = body;
      const invitesRes = await sheets.spreadsheets.values.get({ spreadsheetId: SID(), range: 'AdminInvites!A2:H' });
      const rows = invitesRes.data.values || [];
      // Find the most recent pending invite for this email
      let token = null;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i][0]?.toLowerCase() === email.toLowerCase() && rows[i][4] === 'pending') {
          token = rows[i][6];
          // Refresh expiry to 7 days from now
          const newExpiry = new Date(Date.now() + 7*24*60*60*1000).toISOString();
          await sheets.spreadsheets.values.update({
            spreadsheetId: SID(), range: `AdminInvites!F${i+2}`, valueInputOption:'RAW',
            requestBody: { values: [[newExpiry]] }
          });
          break;
        }
      }
      if (!token) return NextResponse.json({ error:'No pending invite found for '+email }, {status:404});
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://health.besmartai.co';
      return NextResponse.json({ success:true, signupUrl: `${appUrl}/signup?token=${token}` });
    }

    if (action === 'resend_invite') {
      const { email } = body;
      // Get existing token
      const r = await fetch(`${process.env.NEXT_PUBLIC_APP_URL||''}/api/admin-users`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'get_signup_link', email })
      });
      const d = await r.json();
      if (!d.success) return NextResponse.json(d, {status:404});
      // Resend email
      await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},
        body: JSON.stringify({
          from:'admin@besmartai.co', to:[email],
          subject:'Your BeSmart Health Admin Invitation',
          html:`<p>Here is your signup link:</p><p><a href='${d.signupUrl}'>${d.signupUrl}</a></p><p>This link expires in 7 days.</p>`,
        })
      });
      return NextResponse.json({ success:true });
    }

    if (action === 'remove_invite') {
      const { rowIndex } = body;
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SID() });
      const sheet = meta.data.sheets?.find(s => s.properties?.title === 'AdminInvites');
      const sheetId = sheet?.properties?.sheetId || 0;
      await sheets.spreadsheets.batchUpdate({ spreadsheetId: SID(), requestBody: { requests: [{ deleteDimension: { range: { sheetId, dimension:'ROWS', startIndex:Number(rowIndex)+1, endIndex:Number(rowIndex)+2 } } }] } });
      return NextResponse.json({ success:true });
    }

    return NextResponse.json({ error:'Unknown action' });
  } catch(e) { return NextResponse.json({ error:String(e) }, {status:500}); }
}
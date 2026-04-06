import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const { pin } = await req.json();
  if (pin === process.env.ADMIN_PIN) return NextResponse.json({ success: true });
  return NextResponse.json({ success: false }, { status: 401 });
}
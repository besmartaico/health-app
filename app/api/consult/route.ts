import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();
export async function POST(req: Request) {
  const body = await req.json();
  const msg = await client.messages.create({ model: 'claude-opus-4-5', max_tokens: 1024,
    system: 'You are a peptide therapy expert. Provide helpful guidance on peptide protocols based on user goals.',
    messages: [{ role: 'user', content: JSON.stringify(body) }] });
  return NextResponse.json({ response: msg.content[0].type === 'text' ? msg.content[0].text : '' });
}
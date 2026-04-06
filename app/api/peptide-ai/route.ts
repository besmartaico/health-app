import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();
export async function POST(req: Request) {
  const { message, history } = await req.json();
  const messages = [...(history||[]), { role: 'user', content: message }];
  const msg = await client.messages.create({ model: 'claude-opus-4-5', max_tokens: 1024,
    system: 'You are an expert peptide therapy assistant.',
    messages });
  return NextResponse.json({ response: msg.content[0].type === 'text' ? msg.content[0].text : '' });
}
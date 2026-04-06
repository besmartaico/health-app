// @ts-nocheck
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req) {
  const { imageBase64, imageType } = await req.json();
  if (!imageBase64) return NextResponse.json({ error: 'No image provided' });
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: imageType || 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: `You are a peptide dosage expert. Analyze this image of a peptide vial, label, or dosing document.\n\nPlease provide:\n1. What peptide(s) you can identify\n2. The vial amount/concentration if visible\n3. Recommended reconstitution (how much bacteriostatic water to add)\n4. Suggested dosing protocol with specific measurements\n5. How many units to draw on an insulin syringe for the standard dose\n6. Any important safety notes\n\nBe specific with measurements. Format clearly with sections.` }
        ]
      }]
    });
    const analysis = response.content[0]?.text || 'Could not analyze image';
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
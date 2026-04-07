// @ts-nocheck
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req) {
  const body = await req.json();
  // Support both single image (legacy) and multiple images
  const images = body.images || (body.imageBase64 ? [{ base64: body.imageBase64, type: body.imageType || 'image/jpeg' }] : []);
  if (!images.length) return NextResponse.json({ error: 'No images provided' });
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const content = [
      ...images.map(img => ({
        type: 'image',
        source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.base64 },
      })),
      {
        type: 'text',
        text: `You are a peptide dosage expert. Analyze ${images.length > 1 ? 'these ' + images.length + ' images' : 'this image'} of peptide vial labels, prescriptions, or dosing documents.\n\nPlease provide:\n1. What peptide(s) you can identify from the images\n2. The vial amount/concentration if visible\n3. Recommended reconstitution (how much bacteriostatic water to add)\n4. Suggested dosing protocol with specific measurements\n5. How many units to draw on an insulin syringe for the standard dose\n6. Any important safety notes\n\nBe specific with measurements. Format clearly with sections.`,
      },
    ];
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content }],
    });
    const analysis = response.content[0]?.text || 'Could not analyze images';
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
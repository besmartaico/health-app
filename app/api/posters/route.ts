// @ts-nocheck
import { NextResponse } from 'next/server';

// Static poster config - no Drive API call needed
const POSTERS = [
  { id: '1MW1CqY0IE4FyivWNJ6mlFOJbG01QkXQg', name: '5 Amino 1MQ',  mimeType: 'image/png' },
  { id: '1LXwp_zRwOCHD1TuLpMF38KKyEgjQDkny', name: 'BPC157TB500', mimeType: 'image/png' },
  { id: '1gBE_64Bh7maZyGmZQ2sTlkAbsHw9lsHL', name: 'Glow',         mimeType: 'image/jpeg' },
  { id: '1Se3F4ISuBPjeuTy9yXJ2ZUEy_GSNRC83', name: 'ImmunoGlow',   mimeType: 'image/png' },
  { id: '1RcP7GzwBSiPU8b0rc70as8VUB7KAONYD', name: 'IPAM',          mimeType: 'image/png' },
  { id: '1ztPh3fT-4A2Rx8AQmg76QFjy0IHky-cA', name: 'Mots-c',       mimeType: 'image/png' },
  { id: '1rfXy94Bzr97GVJu7Cy91nw6IDfzTRQyJ', name: 'NAD+',          mimeType: 'image/png' },
  { id: '1iMkbFR6n6oKJ5czVGGKercNewyvXB9-y', name: 'Retatrutide',  mimeType: 'image/png' },
  { id: '15bFjJw2OTHFjwKjkrWMWXx98cuJuo_xF', name: 'Tirzepatide',  mimeType: 'image/png' },
];

export async function GET() {
  const posters = POSTERS.map(p => ({
    ...p,
    // Image served from our own domain via proxy - no Drive URLs exposed
    imageUrl: `/api/poster-image/${p.id}`,
    embedUrl: `/api/poster-image/${p.id}`,
    viewUrl: `/api/poster-image/${p.id}`,
  }));
  return NextResponse.json({ posters, count: posters.length });
}
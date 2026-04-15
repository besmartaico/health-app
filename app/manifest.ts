import { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BeSmart Health',
    short_name: 'BeSmart',
    description: 'BeSmart Health Admin Portal',
    start_url: '/admin',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#1a4fa8',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
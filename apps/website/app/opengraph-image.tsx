import { ImageResponse } from 'next/og';

export const alt = 'Super Black Coffee — Coffee for every moment';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 64, color: '#fffaf7', background: 'radial-gradient(circle at 82% 18%, #805637, transparent 33%), #171411' }}>
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: 5, fontWeight: 700 }}>SUPER BLACK COFFEE</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>COFFEE FOR</div>
        <div style={{ display: 'flex', color: '#d8ac74', fontSize: 76, fontWeight: 700, letterSpacing: -3 }}>EVERY MOMENT.</div>
      </div>
    </div>,
    size,
  );
}

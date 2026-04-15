import { ImageResponse } from 'next/og';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';
export default function Icon() {
  return new ImageResponse(
    <div style={{ width:'100%', height:'100%', background:'#1a4fa8', borderRadius:'80px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'white', fontSize:'280px', fontWeight:'bold', fontFamily:'Arial' }}>B</span>
    </div>
  );
}
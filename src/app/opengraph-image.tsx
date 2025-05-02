import { ImageResponse } from 'next/og';

export const alt = 'Lumalytics';
export const contentType = 'image/png';
export const size = {
  width: 1200,
  height: 630,
};

// This function generates the OpenGraph image for your site
export default async function Image() {
  // Using static image URL directly
  const baseUrl =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://lumalytics.app`;

  // Reference to your public image
  const ogImageUrl = `${baseUrl}/home.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: '#fff',
        }}
      >
        <img
          src={ogImageUrl}
          alt={alt}
          width={1200}
          height={630}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  );
}

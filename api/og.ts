import { ImageResponse } from '@vercel/og';
import type { VercelRequest } from '@vercel/node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest) {
  try {
    const url = new URL(req.url || 'http://localhost');
    const day = url.searchParams.get('day');
    
    let canvasId: number;
    
    if (day) {
      canvasId = parseInt(day, 10);
      if (isNaN(canvasId)) {
        return new Response('Invalid day parameter', { status: 400 });
      }
    } else {
      // Try to get current canvas from our own API
      try {
        const host = req.headers.host || '';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : process.env.VERCEL_BRANCH_URL
          ? `https://${process.env.VERCEL_BRANCH_URL}`
          : `${protocol}://${host}`;
        
        // Fetch from farcaster.json API which has the canvas ID logic
        const response = await fetch(`${baseUrl}/api/farcaster.json`);
        if (response.ok) {
          const data = await response.json();
          // Extract canvas ID from the name if possible, or use a default
          const nameMatch = data.miniapp?.name?.match(/Canvas #(\d+)/);
          canvasId = nameMatch ? parseInt(nameMatch[1], 10) : 0;
        } else {
          canvasId = 0; // Fallback
        }
      } catch (error) {
        console.error('Error fetching current canvas:', error);
        canvasId = 0; // Fallback
      }
    }

    // Fetch the artwork image from basepaint.xyz
    const artworkUrl = `https://basepaint.xyz/api/art/image?day=${canvasId}`;
    let artworkImage: ArrayBuffer | null = null;
    
    try {
      const artworkResponse = await fetch(artworkUrl);
      if (artworkResponse.ok) {
        artworkImage = await artworkResponse.arrayBuffer();
      }
    } catch (error) {
      console.error('Error fetching artwork:', error);
    }

    // Convert image to base64 for embedding (using btoa for edge runtime)
    let imageBase64: string | null = null;
    if (artworkImage) {
      const bytes = new Uint8Array(artworkImage);
      const binary = String.fromCharCode(...bytes);
      imageBase64 = btoa(binary);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: imageBase64 
              ? `url(data:image/png;base64,${imageBase64})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay gradient for text readability */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 20,
                textAlign: 'center',
                textShadow: '0 4px 12px rgba(0,0,0,0.8)',
              }}
            >
              BasePaint Mint Hub
            </div>
            <div
              style={{
                fontSize: 48,
                color: '#ffffff',
                marginBottom: 40,
                textAlign: 'center',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              Canvas #{canvasId}
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#cccccc',
                textAlign: 'center',
                maxWidth: 800,
                textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              }}
            >
              Collaborative on-chain art canvas on Base Network
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Error generating OG image:', error);
    return new Response(`Failed to generate image: ${error.message}`, {
      status: 500,
    });
  }
}


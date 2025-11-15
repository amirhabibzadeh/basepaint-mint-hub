import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

const BASEPAINT_CONTRACT = '0xba5e05cb26b78eda3a2f8e3b3814726305dcac83';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

async function getCurrentCanvasId(): Promise<number> {
  try {
    const data = await publicClient.readContract({
      address: BASEPAINT_CONTRACT,
      abi: [
        {
          name: 'today',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ] as const,
      functionName: 'today',
    } as any);
    
    // Return yesterday's canvas (today - 1)
    return Number(data) - 1;
  } catch (error) {
    console.error('Error fetching canvas ID:', error);
    throw error;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const day = req.query.day as string | undefined;
    
    let canvasId: number | undefined;
    
    if (day) {
      canvasId = parseInt(day, 10);
      if (isNaN(canvasId)) {
        res.status(400).send('Invalid day parameter');
        return;
      }
    } else {
      try {
        canvasId = await getCurrentCanvasId();
      } catch (error) {
        console.error('Error fetching current canvas:', error);
        // Continue without canvasId for fallback
      }
    }

    // Get base URL
    const host = req.headers.host || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : `${protocol}://${host}`;

    // Generate dynamic OG image URL
    const ogImageUrl = canvasId 
      ? `${baseUrl}/api/og?day=${canvasId}`
      : `${baseUrl}/api/og`;

    // Generate dynamic title and description
    const title = canvasId 
      ? `BasePaint Mint Hub - Canvas #${canvasId}`
      : 'BasePaint Mint Hub';
    
    const description = canvasId
      ? `Mint Canvas #${canvasId} - Collaborative on-chain art canvas on Base Network. Earn protocol fees from referrals.`
      : 'Mint and contribute pixels to collaborative on-chain art canvases on Base Network. Earn protocol fees from referrals.';

    // Read the base HTML template
    const htmlPath = join(process.cwd(), 'index.html');
    let html = readFileSync(htmlPath, 'utf-8');

    // Replace meta tags with dynamic values
    html = html.replace(
      /<title>.*?<\/title>/,
      `<title>${title}</title>`
    );

    html = html.replace(
      /<meta name="description" content=".*?"/,
      `<meta name="description" content="${description}"`
    );

    html = html.replace(
      /<meta property="og:image" content=".*?"/,
      `<meta property="og:image" content="${ogImageUrl}"`
    );

    html = html.replace(
      /<meta name="twitter:image" content=".*?"/,
      `<meta name="twitter:image" content="${ogImageUrl}"`
    );

    html = html.replace(
      /<meta property="og:title" content=".*?"/,
      `<meta property="og:title" content="${title}"`
    );

    html = html.replace(
      /<meta name="twitter:title" content=".*?"/,
      `<meta name="twitter:title" content="${title}"`
    );

    html = html.replace(
      /<meta property="og:description" content=".*?"/,
      `<meta property="og:description" content="${description}"`
    );

    html = html.replace(
      /<meta name="twitter:description" content=".*?"/,
      `<meta name="twitter:description" content="${description}"`
    );

    // Update Farcaster meta tags
    const farcasterMeta = JSON.stringify({
      version: "1",
      imageUrl: ogImageUrl,
      button: {
        title: "🎨 Mint Canvas",
        action: {
          type: "launch_miniapp",
          url: baseUrl,
          name: title,
          splashImageUrl: ogImageUrl,
          splashBackgroundColor: "#000000"
        }
      }
    });

    html = html.replace(
      /<meta name="fc:miniapp" content='.*?'/,
      `<meta name="fc:miniapp" content='${farcasterMeta.replace(/'/g, "&apos;")}'`
    );

    html = html.replace(
      /<meta name="fc:frame" content='.*?'/,
      `<meta name="fc:frame" content='${farcasterMeta.replace(/'/g, "&apos;")}'`
    );

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    res.send(html);
  } catch (error) {
    console.error('Error generating dynamic HTML:', error);
    // Fallback to static HTML
    const htmlPath = join(process.cwd(), 'index.html');
    const html = readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}


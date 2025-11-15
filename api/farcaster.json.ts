import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Get base URL from Vercel environment or fallback
    const host = req.headers.host || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : `${protocol}://${host}`;
    
    let imageUrl = `${baseUrl}/og-image.png`; // fallback
    let dayNum: number | undefined;
    
    if (day) {
      dayNum = parseInt(day, 10);
      if (!isNaN(dayNum)) {
        imageUrl = `${baseUrl}/api/art/image?day=${dayNum}`;
      }
    } else {
      // If no day specified, use current canvas
      try {
        dayNum = await getCurrentCanvasId();
        imageUrl = `${baseUrl}/api/art/image?day=${dayNum}`;
      } catch (error) {
        console.error('Error fetching current canvas:', error);
        // Use fallback
      }
    }

    const farcasterJson = {
      accountAssociation: {
        header: "eyJmaWQiOjExODMxLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4QkFiRThBYzFmMDU1OGZiZTNiNDVmNkIzRjZEYUVlMjhGRWUyMDU1QyJ9",
        payload: "eyJkb21haW4iOiJiYXNlcGFpbnQtbWludC1odWIubG92YWJsZS5hcHAifQ",
        signature: "vg9jFUviTGe08dnzGnyQFwnqR7v3Z7ZjK96jtyqvCslkbjLrofxyDJSSq52wOGlVa1jLLU2ytBtG1sTBPXfQyhw="
      },
      miniapp: {
        version: "1",
        name: dayNum ? `BasePaint Mint Hub - Canvas #${dayNum}` : "BasePaint Mint Hub",
        iconUrl: "https://basepaint.xyz/logo.png",
        homeUrl: `${baseUrl}/`,
        splashImageUrl: imageUrl,
        splashBackgroundColor: "#000000",
        subtitle: "Collaborative on-chain art",
        description: dayNum 
          ? `Mint Canvas #${dayNum} - Collaborative on-chain art canvas on Base Network. Earn protocol fees from referrals.`
          : "Mint and contribute pixels to collaborative on-chain art canvases on Base Network. Earn protocol fees from referrals.",
        primaryCategory: "art-creativity",
        tags: [
          "art",
          "base",
          "mint",
          "nft",
          "onchain"
        ],
        requiredChains: [
          "eip155:8453"
        ],
        noindex: false,
        ogTitle: dayNum ? `BasePaint Mint Hub - Canvas #${dayNum}` : "BasePaint Mint Hub",
        ogDescription: dayNum
          ? `Mint Canvas #${dayNum} - Collaborative on-chain art canvas on Base Network`
          : "Mint and contribute to collaborative on-chain art canvases on Base Network",
        ogImageUrl: imageUrl
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    res.json(farcasterJson);
  } catch (error) {
    console.error('Error generating Farcaster JSON:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


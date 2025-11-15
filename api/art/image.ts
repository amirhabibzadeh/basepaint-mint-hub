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
    
    let dayNum: number;
    
    if (!day) {
      // If no day specified, use current canvas
      try {
        dayNum = await getCurrentCanvasId();
      } catch (error) {
        console.error('Error fetching current canvas:', error);
        res.status(500).send('Failed to fetch current canvas');
        return;
      }
    } else {
      dayNum = parseInt(day, 10);
      if (isNaN(dayNum)) {
        res.status(400).send('Invalid day parameter');
        return;
      }
    }

    // Fetch the actual artwork from basepaint.xyz
    const artworkUrl = `https://basepaint.xyz/api/art/image?day=${dayNum}`;
    const response = await fetch(artworkUrl);
    
    if (!response.ok) {
      res.status(500).send('Failed to fetch artwork');
      return;
    }

    const imageBuffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate');
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Internal server error');
  }
}


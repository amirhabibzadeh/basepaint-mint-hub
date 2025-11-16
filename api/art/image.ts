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
    
    // Use ETag with dayNum to invalidate cache when day changes
    const etag = `"day-${dayNum}"`;
    res.setHeader('ETag', etag);
    
    // Check if client has cached version
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end(); // Not Modified
      return;
    }
    
    // Calculate seconds until next midnight UTC (BasePaint likely uses UTC)
    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(23, 59, 59, 999); // Today's midnight UTC
    // If we've already passed midnight today, add 24 hours for tomorrow
    if (midnight.getTime() <= now.getTime()) {
      midnight.setTime(midnight.getTime() + 24 * 60 * 60 * 1000);
    }
    const secondsUntilMidnight = Math.floor((midnight.getTime() - now.getTime()) / 1000);
    
    // Cache until midnight, with a minimum of 60 seconds
    const cacheMaxAge = Math.max(60, secondsUntilMidnight);
    
    res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, s-maxage=${cacheMaxAge}, must-revalidate`);
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).send('Internal server error');
  }
}


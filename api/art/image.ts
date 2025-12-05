
import { base } from 'viem/chains';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASEPAINT_CONTRACT = '0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83';

import { createPublicClient, http, fallback } from 'viem';

// Base RPC configuration with fallbacks
// Prioritize alternative RPCs over mainnet.base.org (which is rate-limited)
const BASE_RPC_URLS = [
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base',
  'https://base.meowrpc.com',
  'https://base.gateway.tenderly.co',
  'https://base.blockpi.network/v1/rpc/public',
  'https://mainnet.base.org', // Last due to rate limiting
];

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const publicClient = createPublicClient({
  chain: base,
  transport: fallback(
    shuffleArray(BASE_RPC_URLS).map(url => http(url, {
      timeout: 10_000, // 10 second timeout
      retryCount: 3,
      retryDelay: 1000, // 1 second between retries
    }))
  ),
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
    const canvasId = Number(data) - 1;
    return canvasId;
  } catch (error) {
    throw error;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const dayParam = req.query.day as string | undefined;

    let day: number;

    if (!dayParam) {
      // No day parameter provided - query contract for current canvas
      try {
        day = await getCurrentCanvasId();
      } catch (error) {
        res.status(500).send('Failed to fetch current canvas');
        return;
      }
    } else {
      // Day parameter provided - skip contract query and use the specified day
      day = parseInt(dayParam, 10);
      if (isNaN(day)) {
        res.status(400).send('Invalid day parameter');
        return;
      }
    }

    // Fetch the actual artwork from basepaint.xyz
    const artworkUrl = `https://basepaint.xyz/api/art/image?day=${day}`;

    const response = await fetch(artworkUrl);

    if (!response.ok) {
      res.status(500).send('Failed to fetch artwork');
      return;
    }

    const imageBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');

    // Use ETag with day to invalidate cache when day changes
    const etag = `"day-${day}"`;
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
    res.status(500).send('Internal server error');
  }
}

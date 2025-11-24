import { createPublicClient, http, fallback } from 'viem';
import { base } from 'viem/chains';

const BASEPAINT_CONTRACT = '0xba5e05cb26b78eda3a2f8e3b3814726305dcac83';
const GRAPHQL_ENDPOINT = 'https://graphql.basepaint.xyz/';

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

export const publicClient = createPublicClient({
  chain: base,
  transport: fallback(
    shuffleArray(BASE_RPC_URLS).map(url => http(url, {
      timeout: 10_000, // 10 second timeout
      retryCount: 3,
      retryDelay: 1000, // 1 second between retries
    }))
  ),
});

export interface Contribution {
  account: {
    id: string;
  };
  pixelsCount: number;
}

export interface CanvasData {
  id: number;
  totalMints: number;
  totalEarned: string;
  pixelsCount: number;
  contributions: {
    items: Contribution[];
  };
}

export async function getCurrentCanvasId(): Promise<number> {

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
    console.error('[basepaint] Error fetching canvas ID:', error);
    throw error;
  }
}

export async function getCanvasData(id: number): Promise<CanvasData> {

  const query = `
    query GetCanvasData($id: Int!) {
      canvas(id: $id) {
        id
        totalMints
        totalEarned
        pixelsCount
        contributions(orderBy: "pixelsCount", orderDirection: "desc", limit: 1000) {
          items {
            account {
              id
            }
            pixelsCount
          }
        }
      }
    }
  `;

  try {

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id },
      }),
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error('[basepaint] GraphQL error response:', errorText);
      throw new Error(`Failed to fetch canvas data: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();


    if (!result.data?.canvas) {
      console.error('[basepaint] No canvas data in response:', result);
      throw new Error('No canvas data returned from API');
    }


    return result.data.canvas;
  } catch (error) {
    console.error('[basepaint] Error fetching canvas data:', error);
    throw error;
  }
}

export function getArtworkUrl(id: number): string {
  // Use local API endpoint if available, otherwise fallback to basepaint.xyz
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${baseUrl}/api/art/image?day=${id}`;
}

export function formatEth(wei: string): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get the epoch duration in seconds (24 hours for BasePaint)
 */
export async function getEpochDuration(): Promise<bigint> {
  try {
    const data = await publicClient.readContract({
      address: BASEPAINT_CONTRACT,
      abi: [
        {
          name: 'epochDuration',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ] as const,
      functionName: 'epochDuration',
    } as any);

    return BigInt(data as string | number | bigint);
  } catch (error) {
    // Fallback to 24 hours (86400 seconds) if contract doesn't have epochDuration
    console.warn('Error fetching epochDuration, using default 24 hours:', error);
    return 86400n;
  }
}

/**
 * Get the startedAt timestamp for the current epoch
 * BasePaint epochs start at midnight UTC
 */
export async function getStartedAt(): Promise<bigint> {
  try {
    const data = await publicClient.readContract({
      address: BASEPAINT_CONTRACT,
      abi: [
        {
          name: 'startedAt',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint256' }],
        },
      ] as const,
      functionName: 'startedAt',
    } as any);

    return BigInt(data as string | number | bigint);
  } catch (error) {
    // Fallback: calculate midnight UTC for today
    const now = new Date();
    const midnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    // If we're past midnight today, use today's midnight
    // Otherwise use yesterday's midnight
    if (now.getTime() < midnight.getTime()) {
      midnight.setUTCDate(midnight.getUTCDate() - 1);
    }
    return BigInt(Math.floor(midnight.getTime() / 1000));
  }
}

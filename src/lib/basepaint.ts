import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const BASEPAINT_CONTRACT = '0xba5e05cb26b78eda3a2f8e3b3814726305dcac83';
const GRAPHQL_ENDPOINT = 'https://graphql.basepaint.xyz/';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
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
    return Number(data) - 1;
  } catch (error) {
    console.error('Error fetching canvas ID:', error);
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
      throw new Error('Failed to fetch canvas data');
    }

    const result = await response.json();
    return result.data.canvas;
  } catch (error) {
    console.error('Error fetching canvas data:', error);
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

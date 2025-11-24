import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { fallback } from 'viem';

// Optional: Add your WalletConnect project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

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

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    // Farcaster miniapp connector (auto-connects in Farcaster)
    farcasterMiniApp(),
    injected(),
    // Only include WalletConnect if valid project ID is provided
    ...(projectId ? [walletConnect({ projectId })] : []),
    coinbaseWallet({ appName: 'Basepaint Mini App' }),
  ],
  transports: {
    [base.id]: fallback(
      shuffleArray(BASE_RPC_URLS).map(url => http(url, {
        timeout: 10_000, // 10 second timeout
        retryCount: 3,
        retryDelay: 1000, // 1 second between retries
      }))
    ),
    [mainnet.id]: http(),
  },
  ssr: false,
});

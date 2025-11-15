import { createConfig, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Optional: Add your WalletConnect project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

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
    [base.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false,
});

import { sdk } from '@farcaster/miniapp-sdk';

// Module-level guard so initialization is idempotent and safe to call multiple times
let _farcasterInitialized = false;

// Track if quickAuth has been attempted globally (prevents duplicate auto-login
// if FarcasterAuth component is rendered multiple times on the same page)
let _quickAuthAttempted = false;

export function hasQuickAuthBeenAttempted(): boolean {
  return _quickAuthAttempted;
}

export function markQuickAuthAsAttempted(): void {
  _quickAuthAttempted = true;
}

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  walletAddress?: string;
}

// Detect if running inside Farcaster MiniApp
export async function isInMiniApp(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    return await sdk.isInMiniApp();
  } catch (e) {
    return false;
  }
}

export async function initializeFarcasterSDK(): Promise<boolean> {
  if (_farcasterInitialized) return true;
  try {
    // Calling ready() will only work when running inside a host; swallow errors
    await sdk.actions.ready();
    _farcasterInitialized = true;
    return true;
  } catch (err) {
    // still mark initialized to avoid repeating noisy calls
    _farcasterInitialized = true;
    return false;
  }
}

// Use Quick Auth for automatic login inside MiniApp
export async function quickAuthUser(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    const { token } = await sdk.quickAuth.getToken();

    // Decode JWT payload (safe decode)
    const base64 = token?.split?.('.')?.[1];
    let payload: unknown = undefined;
    if (base64) {
      try {
        payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
      } catch (err) {
        // ignore
      }
    }
    if (!payload) return null;
    const pl = payload as { sub?: number; username?: string; displayName?: string; pfpUrl?: string };
    return {
      fid: pl.sub || 0,
      username: pl.username,
      displayName: pl.displayName,
      pfpUrl: pl.pfpUrl,
    };
  } catch (err) {
    return null;
  }
}

export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    // Generate a nonce for SIWF
    const randomUUID = typeof crypto !== 'undefined' && typeof (crypto as unknown as { randomUUID?: () => string }).randomUUID === 'function'
      ? (crypto as unknown as { randomUUID: () => string }).randomUUID()
      : Math.random().toString(36).substring(2, 15);
    await sdk.actions.signIn({ nonce: randomUUID, acceptAuthAddress: true });
    // After sign-in, get context
    const context = await sdk.context;
    const custody = (context.user as Record<string, unknown>)?.['custody_address'] as string | undefined;
    return {
      fid: context.user?.fid || 0,
      username: context.user?.username,
      displayName: context.user?.displayName,
      pfpUrl: context.user?.pfpUrl,
      walletAddress: custody,
    };
  } catch (error) {
    return null;
  }
}

export async function getFarcasterContext() {
  try {
    await initializeFarcasterSDK();
    const context = await sdk.context;
    return context;
  } catch (error) {
    return null;
  }

}


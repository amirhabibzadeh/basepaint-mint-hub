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
      console.debug('[farcaster] isInMiniApp check failed', e);
      return false;
    }
  }

  export async function initializeFarcasterSDK(): Promise<boolean> {
    if (_farcasterInitialized) return true;
    try {
      // Calling ready() will only work when running inside a host; swallow errors
      await sdk.actions.ready();
      _farcasterInitialized = true;
      console.debug('[farcaster] SDK ready');
      return true;
    } catch (err) {
      console.debug('[farcaster] sdk.actions.ready() failed (not in host?):', err);
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
      console.debug('[farcaster] quickAuth.getToken returned a token');

      // Decode JWT payload (safe decode)
      const base64 = token?.split?.('.')?.[1];
      let payload: unknown = undefined;
      if (base64) {
        try {
          payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (err) {
          console.debug('[farcaster] failed to decode quickAuth token payload', err);
        }
      }
      if (!payload) return null;
      const pl = payload as { sub?: number; username?: string; displayName?: string; pfpUrl?: string };
      console.debug('[farcaster] quickAuth payload', { fid: pl.sub, username: pl.username });
      return {
        fid: pl.sub || 0,
        username: pl.username,
        displayName: pl.displayName,
        pfpUrl: pl.pfpUrl,
      };
    } catch (err) {
      console.error('[farcaster] quickAuthUser error:', err instanceof Error ? `${err.name}: ${err.message}` : err);
      return null;
    }
  }

  export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
    try {
      await initializeFarcasterSDK();
      // Generate a nonce for SIWF
      const nonce = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? (crypto as any).randomUUID() : Math.random().toString(36).substring(2, 15);
      await sdk.actions.signIn({ nonce, acceptAuthAddress: true });
      // After sign-in, get context
      const context = await sdk.context;
      return {
        fid: context.user?.fid || 0,
        username: context.user?.username,
        displayName: context.user?.displayName,
        pfpUrl: context.user?.pfpUrl,
        walletAddress: (context.user as any)?.custody_address,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'RejectedByUser') {
        console.log('[farcaster] User rejected sign-in');
      } else {
        console.error('[farcaster] Error signing in with Farcaster:', error);
      }
      return null;
    }
  }

  export async function getFarcasterContext() {
    try {
      await initializeFarcasterSDK();
      const context = await sdk.context;
      return context;
    } catch (error) {
      console.error('[farcaster] Error getting Farcaster context:', error);
      return null;
    }

  }

}

// Detect if running inside Farcaster MiniApp
export async function isInMiniApp(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    await initializeFarcasterSDK();
    return await sdk.isInMiniApp();
  } catch {
    return false;
  }
}

// Use Quick Auth for automatic login inside MiniApp (latest SDK)
export async function quickAuthUser(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    const { token } = await sdk.quickAuth.getToken();
    // Decode JWT payload
    const base64 = token.split('.')[1];
  let payload: unknown = undefined;
    if (base64) {
      try {
        payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
      } catch (err) {
        console.debug('failed to decode quickAuth token payload', err);
      }
    }
    if (!payload) return null;
    // JWT payload type: { sub: number, username?: string, displayName?: string, pfpUrl?: string }
    const pl = payload as { sub?: number; username?: string; displayName?: string; pfpUrl?: string };
    return {
      fid: pl.sub || 0,
      username: pl.username,
      displayName: pl.displayName,
      pfpUrl: pl.pfpUrl,
    };
  } catch {
    return null;
  }
      const { token } = await sdk.quickAuth.getToken();
      console.debug('[farcaster] quickAuth.getToken returned a token');
      // Decode JWT payload
      const base64 = token.split('.')[1];
      let payload: unknown = undefined;
      if (base64) {
        try {
          payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (err) {
          console.debug('[farcaster] failed to decode quickAuth token payload', err);
        }
      }
      if (!payload) return null;
      // JWT payload type: { sub: number, username?: string, displayName?: string, pfpUrl?: string }
      const pl = payload as { sub?: number; username?: string; displayName?: string; pfpUrl?: string };
      console.debug('[farcaster] quickAuth payload', { fid: pl.sub, username: pl.username });
      return {
        fid: pl.sub || 0,
        username: pl.username,
        displayName: pl.displayName,
        pfpUrl: pl.pfpUrl,
      };
  }
      console.error('[farcaster] quickAuthUser error:', err instanceof Error ? `${err.name}: ${err.message}` : err);
      return null;
export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    // Generate a secure nonce for SIWF
    const nonce = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    const result = await sdk.actions.signIn({ 
      nonce,
      acceptAuthAddress: true 
    });
    // Get user context after sign-in
    const context = await sdk.context;
    return {
      fid: context.user?.fid || 0,
      username: context.user?.username,
      displayName: context.user?.displayName,
      pfpUrl: context.user?.pfpUrl,
      walletAddress: (context.user as { custody_address?: string }).custody_address,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name === 'RejectedByUser') {
      console.log('User rejected sign-in');
    } else {
      console.error('Error signing in with Farcaster:', error);
    }
    return null;
  }
}

export async function getFarcasterContext() {
  try {
    await initializeFarcasterSDK();
    const context = await sdk.context;
    return context;
  } catch (error) {
    console.error('Error getting Farcaster context:', error);
    return null;
  }
}

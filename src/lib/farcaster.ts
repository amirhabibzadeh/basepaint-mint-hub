import { sdk } from '@farcaster/frame-sdk';

// Module-level guard so initialization is idempotent and safe to call multiple times
let _farcasterInitialized = false;

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

// Use quickAuth for automatic login inside MiniApp
export async function quickAuthUser(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    const result = await sdk.experimental.quickAuth();
    // result is { token, payload } or just { token } (older SDKs)
  let payload: unknown = undefined;
    if ('payload' in result && result.payload) {
      payload = result.payload;
    } else if (result.token) {
      // Try to decode JWT if payload missing (for older SDKs)
      const base64 = result.token.split('.')[1];
      if (base64) {
        try {
          payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (err) {
          console.debug('failed to decode quickAuth token payload', err);
        }
      }
    }
    if (!payload) return null;
    const pl = payload as { fid?: number; username?: string; displayName?: string; pfpUrl?: string };
    return {
      fid: pl.fid || 0,
      username: pl.username,
      displayName: pl.displayName,
      pfpUrl: pl.pfpUrl,
    };
  } catch {
    return null;
  }
}

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export async function initializeFarcasterSDK() {
  if (_farcasterInitialized) return true;
  try {
    await sdk.actions.ready();
    _farcasterInitialized = true;
    console.log('Farcaster SDK initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
    return false;
  }
}

export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
  try {
    await initializeFarcasterSDK();
    // Generate a simple nonce for SIWE
    const nonce = Math.random().toString(36).substring(2, 15);
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

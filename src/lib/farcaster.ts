import { sdk } from '@farcaster/frame-sdk';

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export async function initializeFarcasterSDK() {
  try {
    await sdk.actions.ready();
    console.log('Farcaster SDK initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error);
    return false;
  }
}

export async function signInWithFarcaster(): Promise<FarcasterUser | null> {
  try {
    // Generate a simple nonce for SIWE
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const result = await sdk.actions.signIn({ 
      nonce,
      acceptAuthAddress: true 
    });
    
    console.log('Farcaster sign-in result:', result);
    
    // Get user context after sign-in
    const context = await sdk.context;
    
    return {
      fid: context.user?.fid || 0,
      username: context.user?.username,
      displayName: context.user?.displayName,
      pfpUrl: context.user?.pfpUrl,
    };
  } catch (error: any) {
    if (error.name === 'RejectedByUser') {
      console.log('User rejected sign-in');
    } else {
      console.error('Error signing in with Farcaster:', error);
    }
    return null;
  }
}

export async function getFarcasterContext() {
  try {
    const context = await sdk.context;
    return context;
  } catch (error) {
    console.error('Error getting Farcaster context:', error);
    return null;
  }
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { initializeFarcasterSDK, quickAuthUser, signInWithFarcaster, getFarcasterContext, FarcasterUser } from '@/lib/farcaster';

type FarcasterState = {
  initialized: boolean;
  user: FarcasterUser | null;
  client?: Record<string, unknown>;
  quickAuthAvailable?: boolean;
  signIn: () => Promise<FarcasterUser | null>;
  quickAuth: () => Promise<FarcasterUser | null>;
};

const FarcasterContext = createContext<FarcasterState | undefined>(undefined);

export function useFarcaster() {
  const ctx = useContext(FarcasterContext);
  if (!ctx) throw new Error('useFarcaster must be used within FarcasterProvider');
  return ctx;
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [client, setClient] = useState<Record<string, unknown> | undefined>(undefined);

  // Initialize SDK on mount (idempotent)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initializeFarcasterSDK();
        if (!mounted) return;
        setInitialized(true);

        // Get context and set user state - this is the primary source of truth
        const ctx = await getFarcasterContext();
        if (mounted) {
          if (ctx?.user) {
            const farcasterUser: FarcasterUser = {
              fid: ctx.user.fid,
              username: ctx.user.username,
              displayName: ctx.user.displayName,
              pfpUrl: ctx.user.pfpUrl,
            };
            setUser(farcasterUser);
          }
          if (ctx?.client) setClient(ctx.client as Record<string, unknown>);
        }

        // Listen to client events (if host provides sdk events)
        if (sdk && typeof (sdk as unknown as Record<string, unknown>)['on'] === 'function') {
          const onMiniappAdded = (payload: unknown) => {
            console.debug('[farcaster] event miniappAdded', payload);
          };
          const onContext = async () => {
            const updated = await getFarcasterContext();
            if (mounted && updated?.user) {
              const farcasterUser: FarcasterUser = {
                fid: updated.user.fid,
                username: updated.user.username,
                displayName: updated.user.displayName,
                pfpUrl: updated.user.pfpUrl,
              };
              setUser(farcasterUser);
            }
            if (mounted && updated?.client) setClient(updated.client as Record<string, unknown>);
          };

          const sdkEvents = sdk as unknown as {
            on: (event: string, cb: (...args: unknown[]) => void) => void;
            off?: (event: string, cb: (...args: unknown[]) => void) => void;
          };

          sdkEvents.on('miniappAdded', onMiniappAdded);
          sdkEvents.on('miniappRemoved', onContext);
          sdkEvents.on('notificationsEnabled', onContext);
          sdkEvents.on('notificationsDisabled', onContext);

          // Cleanup
          return () => {
            sdkEvents.off?.('miniappAdded', onMiniappAdded);
            sdkEvents.off?.('miniappRemoved', onContext);
            sdkEvents.off?.('notificationsEnabled', onContext);
            sdkEvents.off?.('notificationsDisabled', onContext);
          };
        }
      } catch (e) {
        console.debug('[farcaster] provider init error', e);
        try {
          window.dispatchEvent(new CustomEvent('farcaster:error', { detail: { source: 'provider-init', error: `${e instanceof Error ? e.name + ': ' + e.message : String(e)}` } }));
        } catch (err) {
          // ignore dispatch errors
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const signIn = async () => {
    try {
      const u = await signInWithFarcaster();
      if (u) setUser(u);
      return u;
    } catch (e) {
      console.error('[farcaster] signIn error', e);
      try {
        window.dispatchEvent(new CustomEvent('farcaster:error', { detail: { source: 'signIn', error: `${e instanceof Error ? e.name + ': ' + e.message : String(e)}` } }));
      } catch (err) {
        // ignore
      }
      return null;
    }
  };

  const quickAuth = async () => {
    try {
      const u = await quickAuthUser();
      if (u) setUser(u);
      return u;
    } catch (e) {
      console.error('[farcaster] quickAuth error', e);
      try {
        window.dispatchEvent(new CustomEvent('farcaster:error', { detail: { source: 'quickAuth', error: `${e instanceof Error ? e.name + ': ' + e.message : String(e)}` } }));
      } catch (err) {
        // ignore
      }
      return null;
    }
  };

  const value = useMemo(() => ({ initialized, user, client, signIn, quickAuth }), [initialized, user, client]);

  return <FarcasterContext.Provider value={value}>{children}</FarcasterContext.Provider>;
}

export default FarcasterProvider;

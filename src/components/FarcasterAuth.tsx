
import { useState, useEffect } from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { hasQuickAuthBeenAttempted, markQuickAuthAsAttempted, FarcasterUser } from "@/lib/farcaster";
import { useFarcaster } from "@/providers/FarcasterProvider";
import { useInMiniApp } from "@/hooks/useInMiniApp";
import { LogIn, User, Info, Palette } from "lucide-react";
import { toast } from "sonner";

export function FarcasterAuth({ compact = false }: { compact?: boolean } = {}) {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const { connect, connectors } = useConnect();

  const farcaster = useFarcaster();
  const providerUser = farcaster?.user ?? null;
  const inMiniApp = useInMiniApp();

  // Sync provider user to local state immediately
  useEffect(() => {
    if (providerUser) {
      setUser(providerUser);
    }
  }, [providerUser]);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      // Use provider for auth flow; still detect MiniApp for quick auth attempts
      if (inMiniApp && !hasQuickAuthBeenAttempted()) {
        markQuickAuthAsAttempted();
        setAutoLogin(true);
        setIsLoading(true);
        try {
          const quickUser = await farcaster.quickAuth();
          if (!cancelled && quickUser) {
            toast.success(`Welcome, ${quickUser.displayName || quickUser.username || 'Farcaster User'}!`, {
              description: `FID: ${quickUser.fid}`,
            });
          }
        } catch (e) {
          if (!cancelled) toast.error("Automatic login failed");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, [farcaster, inMiniApp]);

  // Notify parent / global listeners about auth state changes
  useEffect(() => {
    try {
      // Emit a window event so pages (like Index) can react to Farcaster sign-in
      window.dispatchEvent(new CustomEvent('farcaster:auth', { detail: providerUser }));
    } catch (e) {
      // ignore
    }
  }, [providerUser]);

  // Listen for provider error events and surface them as toasts + console logs
  useEffect(() => {
    const onError = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail;
        const message = detail?.error || 'Unknown Farcaster error';
        console.error('[farcaster] event error', detail);
        toast.error(`Farcaster error: ${message}`);
      } catch (err) {
        console.error('Error handling farcaster:error event', err);
      }
    };
    window.addEventListener('farcaster:error', onError as EventListener);
    return () => window.removeEventListener('farcaster:error', onError as EventListener);
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await farcaster.signIn();
      if (result) {
        toast.success(`Welcome, ${result.displayName || result.username || 'Farcaster User'}!`, {
          description: `FID: ${result.fid}`,
        });

        // Auto-connect wallet if wallet address is available from Farcaster auth
        if (result.walletAddress) {
          const connector = connectors.find(c =>
            c.id === 'coinbaseWalletSDK' || c.id === 'injected'
          );
          if (connector) {
            try {
              connect({ connector });
            } catch (err) {
              console.debug('Auto wallet connect attempt:', err);
            }
          }
        }
      } else {
        toast.error("Sign-in was cancelled or failed");
      }
    } catch (error) {
      console.error('Farcaster sign-in error:', error);
      toast.error("Failed to sign in with Farcaster");
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <Card className="border-border/50 bg-gradient-card backdrop-blur-xl" style={compact ? { minWidth: 0 } : {}}>
        <div className={compact ? 'p-1.5' : 'p-2'}>
          <div className={`flex items-center ${compact ? 'gap-1.5' : 'gap-2'}`}>
            <Avatar className={compact ? 'w-5 h-5 ring-1 ring-primary/20' : 'w-7 h-7 ring-1 ring-primary/20'}>
              <AvatarImage src={user.pfpUrl} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-foreground truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                {user.displayName || user.username || 'Farcaster User'}
              </div>
              <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground truncate`}>
                FID: {user.fid}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant="outline"
      className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
    >
      <LogIn className="w-4 h-4 mr-2" />
      {isLoading
        ? (autoLogin ? "Connecting to Farcaster..." : "Connecting...")
        : "Connect with Farcaster"}
    </Button>
  );
}

// Helper component: small button to open the Farcaster Mini App Preview Tool
export function FarcasterPreviewButton() {
  const openPreview = () => {
    try {
      const encoded = encodeURIComponent(window.location.href);
      const url = `https://farcaster.xyz/~/developers/mini-apps/preview?url=${encoded}`;
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to open Farcaster preview:', e);
    }
  };

  return (
    <div className="mt-2 text-center">
      <Button onClick={openPreview} variant="ghost" size="sm" className="text-xs">
        Preview in Farcaster
      </Button>
    </div>
  );
}

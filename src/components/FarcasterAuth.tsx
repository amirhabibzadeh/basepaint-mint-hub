
import { useState, useEffect } from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { isInMiniApp, hasQuickAuthBeenAttempted, markQuickAuthAsAttempted, FarcasterUser } from "@/lib/farcaster";
import { useFarcaster } from "@/providers/FarcasterProvider";
import { LogIn, User } from "lucide-react";
import { toast } from "sonner";

export function FarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const { connect, connectors } = useConnect();

  const farcaster = useFarcaster();
  const providerUser = farcaster?.user ?? null;

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      // Use provider for auth flow; still detect MiniApp for quick auth attempts
      const inMiniApp = await isInMiniApp();
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
  }, [farcaster]);

  // Notify parent / global listeners about auth state changes
  useEffect(() => {
    try {
      // Emit a window event so pages (like Index) can react to Farcaster sign-in
      window.dispatchEvent(new CustomEvent('farcaster:auth', { detail: providerUser }));
      // Mirror provider user into local UI state for backwards compatibility
      setUser(providerUser);
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
      <Card className="border-border/50 bg-gradient-card backdrop-blur-xl">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20">
              <AvatarImage src={user.pfpUrl} alt={user.username} />
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-bold text-foreground">
                {user.displayName || user.username || 'Farcaster User'}
              </div>
              <div className="text-sm text-muted-foreground">
                FID: {user.fid}
                {user.username && ` • @${user.username}`}
              </div>
              {user.walletAddress && (
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </div>
              )}
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

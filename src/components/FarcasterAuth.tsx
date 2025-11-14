
import { useState, useEffect } from "react";
import { useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signInWithFarcaster, getFarcasterContext, FarcasterUser, quickAuthUser, isInMiniApp, hasQuickAuthBeenAttempted, markQuickAuthAsAttempted } from "@/lib/farcaster";
import { LogIn, User } from "lucide-react";
import { toast } from "sonner";

export function FarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const { connect, connectors } = useConnect();

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      // Detect if inside Farcaster MiniApp
      const inMiniApp = await isInMiniApp();
      // Prevent repeated automatic login attempts globally (prevents duplicates
      // if FarcasterAuth component is rendered multiple times on the same page)
      if (inMiniApp && !hasQuickAuthBeenAttempted()) {
        markQuickAuthAsAttempted();
        setAutoLogin(true);
        setIsLoading(true);
        try {
          const quickUser = await quickAuthUser();
          if (!cancelled && quickUser) {
            setUser(quickUser);
            toast.success(`Welcome, ${quickUser.displayName || quickUser.username || 'Farcaster User'}!`, {
              description: `FID: ${quickUser.fid}`,
            });
          }
        } catch (e) {
          if (!cancelled) toast.error("Automatic login failed");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      } else if (!inMiniApp) {
        // Fallback: check normal context
        const context = await getFarcasterContext();
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      }
    };
    checkAuth();
    return () => { cancelled = true; };
  }, []);

  // Notify parent / global listeners about auth state changes
  useEffect(() => {
    try {
      // Emit a window event so pages (like Index) can react to Farcaster sign-in
      window.dispatchEvent(new CustomEvent('farcaster:auth', { detail: user }));
    } catch (e) {
      // ignore
    }
  }, [user]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithFarcaster();
      if (result) {
        setUser(result);
        toast.success(`Welcome, ${result.displayName || result.username || 'Farcaster User'}!`, {
          description: `FID: ${result.fid}`,
        });
        
        // Auto-connect wallet if wallet address is available from Farcaster auth
        if (result.walletAddress) {
          // Find a connector that can connect to this address (e.g., CoinbaseWallet, Injected)
          const connector = connectors.find(c => 
            c.id === 'coinbaseWalletSDK' || c.id === 'injected'
          );
          if (connector) {
            try {
              connect({ connector });
            } catch (err) {
              console.debug('Auto wallet connect attempt:', err);
              // Non-critical; user can click wallet button manually if needed
            }
          }
        }
      } else {
        toast.error("Sign-in was cancelled or failed");
      }
    } catch (error) {
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

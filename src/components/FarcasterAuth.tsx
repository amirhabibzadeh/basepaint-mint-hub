
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signInWithFarcaster, getFarcasterContext, FarcasterUser, quickAuthUser, isInMiniApp } from "@/lib/farcaster";
import { LogIn, User } from "lucide-react";
import { toast } from "sonner";

export function FarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      // Detect if inside Farcaster MiniApp
      const inMiniApp = await isInMiniApp();
      if (inMiniApp) {
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
      } else {
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

import { useQuery } from "@tanstack/react-query";
import { getCurrentCanvasId, getCanvasData, getArtworkUrl, formatEth } from "@/lib/basepaint";
import { generateMiniappEmbed, injectEmbedMeta } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { MintWithWallet } from "@/components/MintWithWallet";
import { FarcasterAuth } from "@/components/FarcasterAuth";
import { WalletConnect } from "@/components/WalletConnect";
import { Palette, Coins, Grid3x3, Users, Copy, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { getFarcasterContext } from "@/lib/farcaster";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const Index = () => {
  const [referralId, setReferralId] = useState<string | null>(null);
  const [refLink, setRefLink] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const [isFarcasterConnected, setIsFarcasterConnected] = useState(false);
  const farcasterUser = useFarcasterUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      setReferralId(ref);
      console.log('Referral ID detected from URL:', ref);
    }
  }, []);

  // Initial Farcaster context check (so Index knows whether Farcaster is connected)
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const context = await getFarcasterContext();
        if (!cancelled && context?.user) setIsFarcasterConnected(true);
      } catch (e) {
        // ignore
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  // Listen for Farcaster auth events emitted by the FarcasterAuth component
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const user = ce?.detail || null;
      setIsFarcasterConnected(!!user);
    };
    window.addEventListener('farcaster:auth', handler as EventListener);
    return () => window.removeEventListener('farcaster:auth', handler as EventListener);
  }, []);

  // Generate a referral link when the user connects their wallet
  useEffect(() => {
    if (isConnected && address) {
      const link = `${window.location.origin}?referrer=${address}`;
      setRefLink(link);
      
      // Inject embed metadata for rich sharing on Farcaster
      const embedJson = generateMiniappEmbed(link, {
        imageUrl: "https://basepaint-mint-hub.lovable.app/og-image.png",
        buttonTitle: "🎨 Mint Canvas",
        buttonUrl: link,
        appName: "BasePaint Mint Hub"
      });
      injectEmbedMeta(embedJson);
    } else {
      setRefLink(null);
    }
  }, [isConnected, address]);

  const { data: canvasId, isLoading: isLoadingId, error: idError } = useQuery({
    queryKey: ['canvasId'],
    queryFn: getCurrentCanvasId,
  });

  const { data: canvasData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['canvasData', canvasId],
    queryFn: () => getCanvasData(canvasId!),
    enabled: !!canvasId,
  });

  const isLoading = isLoadingId || isLoadingData;
  const error = idError || dataError;

  const copyRef = async () => {
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      toast.success('Referral link copied to clipboard');
    } catch (err) {
      console.error('Copy failed', err);
      toast.error('Failed to copy link');
    }
  };

  const shareRef = async () => {
    if (!refLink) return;
    const text = `Mint on BasePaint: ${refLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BasePaint', text, url: refLink });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      await copyRef();
      toast('Share not supported in this browser — link copied');
    }
  };

  const shareToFarcaster = () => {
    if (!refLink) return;
    const text = `Mint on BasePaint: ${refLink}\n\nEarn 10% of protocol fees on referrals! 💰`;
    // Try opening Warpcast compose with prefilled text (best-effort)
    const warpUrl = `https://warpcast.com/compose?text=${encodeURIComponent(text)}`;
    try {
      window.open(warpUrl, '_blank');
    } catch (err) {
      // Fallback: open the Farcaster share-extension docs
      window.open('https://miniapps.farcaster.xyz/docs/guides/share-extension', '_blank');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Failed to load canvas data. Please try again later.
            <br />
            <span className="text-xs mt-2 block">Error: {error.message}</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header: logo left, connections right (compact, single row) */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <Palette className="w-10 h-10 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Basepaint
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Show wallet if connected. If not, show Farcaster + connect button(s). If Farcaster is connected and user has wallet, show both. */}
            {isConnected ? (
              <div className="w-40">
                <WalletConnect />
              </div>
            ) : isFarcasterConnected ? (
              farcasterUser?.walletAddress ? (
                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <FarcasterAuth compact />
                  </div>
                  <div className="w-32">
                    <WalletConnect addressOverride={farcasterUser.walletAddress} />
                  </div>
                </div>
              ) : (
                <div className="w-40">
                  <FarcasterAuth compact />
                </div>
              )
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <FarcasterAuth compact />
                </div>
                <div className="w-32">
                  <WalletConnect />
                </div>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        ) : canvasData && canvasId ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Artwork Display */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-primary opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-300 rounded-2xl" />
              <img
                src={getArtworkUrl(canvasId)}
                alt={`Canvas #${canvasId}`}
                className="relative w-full aspect-square rounded-2xl border-2 border-border/50 shadow-2xl object-cover"
              />
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
                <span className="text-sm font-bold text-foreground">
                  Canvas #{canvasData.id}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={Coins}
                label="Total Mints"
                value={canvasData.totalMints.toLocaleString()}
              />
              <StatCard
                icon={Palette}
                label="Total Earned"
                value={`${formatEth(canvasData.totalEarned)} ETH`}
              />
              <StatCard
                icon={Grid3x3}
                label="Total Pixels"
                value={canvasData.pixelsCount.toLocaleString()}
              />
              <StatCard
                icon={Users}
                label="Contributors"
                value={
                  canvasData.contributions?.items
                    ? canvasData.contributions.items.length.toLocaleString()
                    : '—'
                }
              />
            </div>

            {/* Mint Button */}
            <MintWithWallet price={2600000000000000n} canvasId={canvasId} referralId={referralId} />

            {/* Referral / Share UI (shows when wallet connected). Moved below the mint button */}
            {refLink && (
              <div className="mt-4 p-4 border border-border/50 rounded-lg bg-background/60 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Your referral link</div>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      readOnly
                      value={refLink}
                      className="flex-1 font-mono text-sm bg-transparent border border-border/30 px-3 py-2 rounded-md truncate"
                      title="Share this link with others - you earn 10% of protocol fees for mints that use it"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Share this link — you earn 10% of protocol fees for mints that use it. 
                  </div>
                </div>
                <div className="flex gap-2 mt-3 md:mt-0">
                  <a href={refLink} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Open Mint
                    </Button>
                  </a>
                  <Button onClick={copyRef} variant="outline" size="sm" className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button onClick={shareRef} variant="ghost" size="sm" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button onClick={shareToFarcaster} variant="outline" size="sm" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share to Farcaster
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="text-center text-sm text-muted-foreground">
              <p>Powered by Base Network</p>
              <p className="text-xs mt-1">
                Contract: {import.meta.env.VITE_CONTRACT_ADDRESS || '0xba5e...c83'}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Index;

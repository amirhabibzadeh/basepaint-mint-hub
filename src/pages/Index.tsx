import { useQuery } from "@tanstack/react-query";
import { getCurrentCanvasId, getCanvasData, getArtworkUrl, formatEth, getEpochDuration, getStartedAt } from "@/lib/basepaint";
import { generateMiniappEmbed, injectEmbedMeta, updateOgImage } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { MintWithWallet } from "@/components/MintWithWallet";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { SubHeader } from "@/components/SubHeader";
import Countdown, { getSecondsLeft } from "@/components/Countdown";
import { Palette, Coins, Grid3x3, Users, Copy, Share2, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { getFarcasterContext, initializeFarcasterSDK } from "@/lib/farcaster";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { sdk } from "@farcaster/miniapp-sdk";

const Index = () => {
  const [searchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const [referralId, setReferralId] = useState<string | null>(null);
  const [refLink, setRefLink] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "mint" | "subscribe">("mint");
  const { address, isConnected } = useAccount();
  const farcasterUser = useFarcasterUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      setReferralId(ref);
    }
  }, []);

  // Use farcasterUser from hook to get wallet address if available




  // Prompt user to add mini app after 10 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    let cancelled = false;

    const promptAddMiniApp = async () => {
      if (cancelled) return;

      try {
        // Initialize SDK first - this calls ready() which is required
        await initializeFarcasterSDK();

        // Check if we're in a Farcaster context by trying to get context
        // If we can't get context, we're probably not in a Farcaster client
        let context = null;
        try {
          context = await getFarcasterContext();
          if (!context) {
            return;
          }
        } catch (e) {
          // If we can't get context, we're probably not in a Farcaster client
          // In this case, addMiniApp won't work anyway, so skip
          return;
        }

        // Check if SDK actions are available
        if (!sdk?.actions?.addMiniApp) {
          return;
        }

        // Note: We don't check isInMiniApp() here because it may return true
        // when viewing in Warpcast even if the app isn't added yet.
        // The SDK will handle the case where the app is already added.

        // Prompt user to add the mini app
        // The SDK will handle errors if the app is already added or other issues
        await sdk.actions.addMiniApp();
      } catch (error) {
        if (cancelled) return;

        // Handle specific error cases silently
        // RejectedByUser and InvalidDomainManifestJson are expected in some cases
        // No need to log or show errors to the user
      }
    };

    // Set timer for 10 seconds (10000 milliseconds)
    timeoutId = setTimeout(promptAddMiniApp, 10000);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const { data: canvasId, isLoading: isLoadingId, error: idError } = useQuery({
    queryKey: ['canvasId', dayParam],
    queryFn: async () => {
      if (dayParam) {
        const day = parseInt(dayParam, 10);
        if (!isNaN(day)) {
          return day;
        }
      }

      // Fallback to contract call
      return getCurrentCanvasId();
    },
  });

  const { data: latestCanvasId, isLoading: isLoadingLatest } = useQuery({
    queryKey: ['latestCanvasId'],
    queryFn: getCurrentCanvasId,
  });



  const { data: canvasData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['canvasData', canvasId],
    queryFn: () => getCanvasData(canvasId!),
    enabled: !!canvasId,
  });



  const { data: epochDuration } = useQuery({
    queryKey: ['epochDuration'],
    queryFn: getEpochDuration,
  });

  const { data: startedAt } = useQuery({
    queryKey: ['startedAt'],
    queryFn: getStartedAt,
  });

  const isLoading = isLoadingId || isLoadingData || isLoadingLatest;
  const error = idError || dataError;


  // Update og-image and Farcaster embed meta tags when canvasId is available
  // This overwrites the static fallback meta tags from index.html with dynamic canvas artwork
  useEffect(() => {
    if (canvasId) {
      // Get dynamic canvas artwork URL
      const imageUrl = getArtworkUrl(canvasId);

      // Update Open Graph and Twitter meta tags with dynamic image and canvas info
      updateOgImage(imageUrl, canvasId);

      // Overwrite/update Farcaster embed meta tags (fc:miniapp and fc:frame) with dynamic imageUrl
      const baseUrl = window.location.origin + window.location.pathname;
      const isPast = latestCanvasId && canvasId && canvasId < latestCanvasId;
      const buttonTitle = isPast ? "View BasePaint Artwork" : "🎨 Mint BasePaint Artwork";

      const embedJson = generateMiniappEmbed(baseUrl, {
        imageUrl, // Dynamic canvas artwork URL
        buttonTitle,
        buttonUrl: baseUrl,
        appName: "BasePaint Mint Hub"
      });
      // This function removes existing meta tags and injects new ones with dynamic imageUrl
      injectEmbedMeta(embedJson);
    }
  }, [canvasId, latestCanvasId]);

  // Generate a referral link when the user connects their wallet
  useEffect(() => {
    if (isConnected && address) {
      let link = `${window.location.origin}?referrer=${address}`;
      if (canvasId) {
        link += `&day=${canvasId}`;
      }
      setRefLink(link);

      // Overwrite meta tags with referral link and dynamic canvas artwork imageUrl
      // Always use dynamic imageUrl if canvasId is available, otherwise fallback
      const imageUrl = canvasId ? getArtworkUrl(canvasId) : `${window.location.origin}/og-image.png`;

      const isPast = latestCanvasId && canvasId && canvasId < latestCanvasId;
      const buttonTitle = isPast ? "View BasePaint Artwork" : "🎨 Mint BasePaint Artwork";

      const embedJson = generateMiniappEmbed(link, {
        imageUrl, // Dynamic canvas artwork URL when available
        buttonTitle,
        buttonUrl: link,
        appName: "BasePaint Mint Hub"
      });
      // This overwrites existing fc:miniapp and fc:frame meta tags with new dynamic imageUrl
      injectEmbedMeta(embedJson);
    } else {
      setRefLink(null);
      // When wallet disconnects, restore base page embed with dynamic canvas image
      if (canvasId) {
        const imageUrl = getArtworkUrl(canvasId);
        const baseUrl = window.location.origin + window.location.pathname;

        const isPast = latestCanvasId && canvasId && canvasId < latestCanvasId;
        const buttonTitle = isPast ? "View BasePaint Artwork" : "🎨 Mint BasePaint Artwork";

        const embedJson = generateMiniappEmbed(baseUrl, {
          imageUrl,
          buttonTitle,
          buttonUrl: baseUrl,
          appName: "BasePaint Mint Hub"
        });
        injectEmbedMeta(embedJson);
      }
    }
  }, [isConnected, address, canvasId, latestCanvasId]);



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

  const shareToFarcaster = async () => {
    if (!refLink || !canvasData || !startedAt || !epochDuration) return;

    try {
      // Initialize SDK if not already initialized
      await initializeFarcasterSDK();

      const isPast = latestCanvasId && canvasId && canvasId < latestCanvasId;

      let text = '';

      if (isPast) {
        text = `Check out Canvas #${canvasData.id}${canvasData.name ? ` - ${canvasData.name}` : ''} on BasePaint!
      
View this canvas or share to earn rewards!
${refLink}
`;
      } else {
        const timestamp = BigInt(Math.floor(Date.now() / 1000));
        const secondsLeft = getSecondsLeft({ timestamp, startedAt, epochDuration });
        const hoursLeft = Math.floor(secondsLeft / 3600);
        const countdownText = hoursLeft > 0 ? `${hoursLeft} hours left!` : `${Math.floor(secondsLeft / 60)} minutes left!`;

        text = `🎨 New Day New Art,
      
Canvas #${canvasData.id}${canvasData.name ? ` - ${canvasData.name}` : ''} on BasePaint!
      
🔥 ${countdownText}

Mint this collaborative artwork or share to earn rewards! 
${refLink}
`;
      }


      // Use the Farcaster Mini App SDK to compose a cast
      const result = await sdk.actions.composeCast({
        text,
        embeds: [refLink], // Include the referral link as an embed
      }) as { cast: { hash: string; channelKey?: string } | null } | undefined;

      // result can be undefined if close is set to true, or cast can be null if user cancels
      if (result?.cast) {
        toast.success('Cast posted successfully!');
      } else if (result && result.cast === null) {
        // User cancelled - no need to show error
        console.log('User cancelled cast composition');
      }
    } catch (err) {
      console.error('Failed to compose cast:', err);
      toast.error('Failed to share to Farcaster. Please try again.');
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
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Header: logo left, connections right (compact, single row) */}
        <Header />

        {/* Sub Header Navigation */}
        <SubHeader />

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
              <div className="absolute top-3 left-3 bg-background/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50">
                <span className="text-xs font-bold text-foreground">
                  Canvas #{canvasData.id}
                  {canvasData.name && ` • ${canvasData.name}`}
                </span>
              </div>
              {epochDuration && startedAt && (
                <div className="absolute bottom-3 left-3 bg-background/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono font-bold text-foreground">
                    <Countdown startedAt={startedAt} epochDuration={epochDuration} />
                  </span>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Mint Button or Buy Link */}
            {latestCanvasId && canvasId && canvasId < latestCanvasId ? (
              <Button
                asChild
                size="lg"
                className="w-full bg-[#2081E2] hover:bg-[#1868B7] text-white font-bold text-lg py-6 shadow-lg hover:scale-105 transition-all duration-300"
              >
                <a
                  href={`https://opensea.io/item/base/0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83/${canvasId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Buy on OpenSea
                </a>
              </Button>
            ) : (
              <MintWithWallet price={2600000000000000n} canvasId={canvasId} referralId={referralId} />
            )}

            {/* Referral / Share UI (shows when wallet connected). Moved below the mint button */}
            {refLink && (
              <div className="mt-4 p-3 md:p-4 border border-border/50 rounded-lg bg-background/60 backdrop-blur-sm flex flex-col gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">Your referral link</div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={refLink}
                      className="flex-1 font-mono text-xs md:text-sm bg-transparent border border-border/30 px-2 md:px-3 py-1.5 md:py-2 rounded-md truncate"
                      title="Share this link with others - you earn 10% of protocol fees for mints that use it"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Share this link — you earn 10% of protocol fees for mints that use it.
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <Button onClick={copyRef} variant="outline" size="sm" className="flex-1 min-w-0 text-xs h-8 md:h-9 flex items-center justify-center gap-1.5 md:gap-2">
                    <Copy className="w-3 h-3" />
                    Copy
                  </Button>
                  <Button onClick={shareToFarcaster} variant="outline" size="sm" className="flex-1 min-w-0 text-xs h-8 md:h-9 flex items-center justify-center gap-1.5 md:gap-2">
                    <Share2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Share to Farcaster</span>
                    <span className="sm:hidden">Share to Farcaster</span>
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

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

import { useQuery } from "@tanstack/react-query";
import { getCurrentCanvasId, getCanvasData, getArtworkUrl, formatEth } from "@/lib/basepaint";
import { StatCard } from "@/components/StatCard";
import { ContributorsList } from "@/components/ContributorsList";
import { MintButton } from "@/components/MintButton";
import { FarcasterAuth } from "@/components/FarcasterAuth";
import { Palette, Coins, Grid3x3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";

const Index = () => {
  const [referralId, setReferralId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralId(ref);
      console.log('Referral ID detected from URL:', ref);
    }
  }, []);

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
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Basepaint
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Collaborative On-Chain Canvas
          </p>
          {referralId && (
            <p className="text-xs text-accent mt-2">
              Referred by: {referralId}
            </p>
          )}
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
            {/* Farcaster Authentication */}
            <FarcasterAuth />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            {/* Contributors */}
            {canvasData.contributions?.items && canvasData.contributions.items.length > 0 && (
              <ContributorsList contributions={canvasData.contributions.items} />
            )}

            {/* Mint Button */}
            <MintButton canvasId={canvasId} referralId={referralId} />

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

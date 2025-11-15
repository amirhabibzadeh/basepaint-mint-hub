import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface MintButtonProps {
  canvasId: number;
  referralId?: string | null;
}

export function MintButton({ canvasId, referralId }: MintButtonProps) {
  const handleMint = () => {
    console.log('Mint initiated for canvas:', canvasId);
    if (referralId) {
      console.log('Referral ID detected:', referralId);
    }
    
    toast.success(
      referralId 
        ? `Mint action triggered! Canvas #${canvasId} | Referral: ${referralId}`
        : `Mint action triggered! Canvas #${canvasId}`,
      {
        description: "This would open the mint transaction in a real implementation",
      }
    );
  };

  return (
    <Button
      onClick={handleMint}
      size="lg"
      className="w-full bg-gradient-primary text-primary-foreground font-bold text-lg py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all duration-300 animate-pulse-glow"
    >
      <Sparkles className="w-5 h-5 mr-2" />
      Mint BasePaint Artwork #{canvasId}
      {referralId && (
        <span className="ml-2 text-xs opacity-80">
          (ref: {referralId.slice(0, 8)}...)
        </span>
      )}
    </Button>
  );
}

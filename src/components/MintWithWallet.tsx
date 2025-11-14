import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

interface MintWithWalletProps {
  canvasId: number;
  referralId?: string | null;
}

export function MintWithWallet({ canvasId, referralId }: MintWithWalletProps) {
  const { address, isConnected } = useAccount();
  const { sendTransaction, isPending } = useSendTransaction();

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    console.log('Mint initiated for canvas:', canvasId);
    if (referralId) {
      console.log('Referral ID:', referralId);
    }

    try {
      // This is a simulated mint - replace with actual Basepaint contract call
      const contractAddress = '0xba5e05cb26b78eda3a2f8e3b3814726305dcac83';
      
      // Note: You'll need to use the actual mint function and ABI from Basepaint
      // For now, this demonstrates the transaction flow
      toast.info("Preparing mint transaction...", {
        description: `Canvas #${canvasId}${referralId ? ` with referral ${referralId.slice(0, 8)}...` : ''}`,
      });

      // In a real implementation, you would:
      // 1. Get the mint price from the contract
      // 2. Encode the function call with encodeFunctionData
      // 3. Send the transaction with the correct value
      
      // Example placeholder:
      // sendTransaction({
      //   to: contractAddress,
      //   value: parseEther('0.001'), // Adjust based on actual mint price
      //   data: encodeFunctionData({
      //     abi: basepaintAbi,
      //     functionName: 'mint',
      //     args: [canvasId, referralId]
      //   })
      // });

      toast.success("Transaction prepared!", {
        description: "In production, this would trigger the actual mint",
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error("Mint failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Button
      onClick={handleMint}
      disabled={!isConnected || isPending}
      size="lg"
      className="w-full bg-gradient-primary text-primary-foreground font-bold text-lg py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all duration-300 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Sparkles className="w-5 h-5 mr-2" />
      {isPending ? "Minting..." : `Mint Canvas #${canvasId}`}
      {referralId && (
        <span className="ml-2 text-xs opacity-80">
          (ref: {referralId.slice(0, 8)}...)
        </span>
      )}
    </Button>
  );
}

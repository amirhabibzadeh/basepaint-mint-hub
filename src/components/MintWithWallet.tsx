import { Button } from "@/components/ui/button";
import { Sparkles, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useSendTransaction } from "wagmi";
import { parseAbi, encodeFunctionData } from "viem";
import { base } from "wagmi/chains";
import { useState, useEffect } from "react";

// Helper to format wei to ETH
function formatWeiToEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const BASEPAINT_ADDRESS = "0xba5e05cb26b78eda3a2f8e3b3814726305dcac83";
const MINT_ABI = parseAbi([
  "function mint(uint256 day, uint256 count) public payable",
]);

// Wrapper contract that handles mint + rewards minting
const WRAPPER_ADDRESS = "0xaff1a9e200000061fc3283455d8b0c7e3e728161";
const WRAPPER_MINT_ABI = parseAbi([
  "function mint(uint256 tokenId, address sendMintsTo, uint256 count, address sendRewardsTo) public payable",
]);

// Default referrer to use when none is provided
const DEFAULT_REFERRER = "0xe679D21696F2D833e1d92cF44F88A78e796756a3";

interface MintWithWalletProps {
  canvasId: number;
  referralId?: string | null;
  price?: bigint;
  count?: number;
}

export function MintWithWallet({ canvasId, referralId, price = BigInt(0), count: initialCount = 1 }: MintWithWalletProps) {
  const [count, setCount] = useState(initialCount);
  const { address, isConnected, chainId } = useAccount();
  const { sendTransaction, isPending: isSubmitting, data: txHash, error: txError, isSuccess, isError } = useSendTransaction();

  // Handle transaction success/error
  useEffect(() => {
    if (isSuccess && txHash) {
      toast.success('Transaction submitted', { description: txHash });
    }
    if (isError && txError) {
      console.error('Mint error:', txError);
      toast.error("Mint failed", {
        description: txError.message || "Unknown error",
      });
    }
  }, [isSuccess, isError, txHash, txError]);

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const refToSend = referralId || DEFAULT_REFERRER;

      toast.info("Preparing mint transaction...", {
        description: `Canvas #${canvasId} with referral ${refToSend.slice(0, 8)}...`,
      });

      // Encode the wrapper mint calldata with the reward recipient as the last parameter
      const data = encodeFunctionData({
        abi: WRAPPER_MINT_ABI,
        functionName: "mint",
        args: [BigInt(canvasId), address as `0x${string}`, BigInt(count), refToSend as `0x${string}`],
      });

      // Send transaction using wagmi's sendTransaction hook
      sendTransaction({
        to: WRAPPER_ADDRESS as `0x${string}`,
        data,
        value: price * BigInt(count),
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast.error("Mint failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleIncrement = () => setCount(c => c + 1);
  const handleDecrement = () => setCount(c => Math.max(1, c - 1));

  return (
    <div className="space-y-4">
      {/* Count Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleDecrement}
    disabled={count <= 1 || !isConnected || isSubmitting}
          variant="outline"
          size="icon"
          className="h-10 w-10"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{count}</span>
          <span className="text-xs text-muted-foreground">quantity</span>
        </div>
        <Button
          onClick={handleIncrement}
          disabled={!isConnected || isSubmitting}
          variant="outline"
          size="icon"
          className="h-10 w-10"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Mint Button */}
      <Button
        onClick={handleMint}
  disabled={!isConnected || isSubmitting}
        size="lg"
        className="w-full bg-gradient-primary text-primary-foreground font-bold text-lg py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all duration-300 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        {isSubmitting
          ? "Minting..."
          : `Mint Canvas #${canvasId} (${formatWeiToEth(price * BigInt(count))} ETH)`}
        {referralId && (
          <span className="ml-2 text-xs opacity-80">
            (ref: {referralId.slice(0, 8)}...)
          </span>
        )}
      </Button>
    </div>
  );
}

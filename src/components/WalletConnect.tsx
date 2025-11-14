import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { formatAddress } from "@/lib/basepaint";
import { toast } from "sonner";
import { useEffect } from "react";
import { base } from "wagmi/chains";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  // Auto-switch to Base if connected to wrong chain
  useEffect(() => {
    const switchToBase = async () => {
      if (isConnected && chainId !== base.id) {
        try {
          await switchChainAsync({ chainId: base.id });
          toast.success("Switched to Base network");
        } catch (error) {
          console.error("Failed to switch to Base:", error);
          toast.error("Please switch to Base network manually");
        }
      }
    };
    switchToBase();
  }, [chainId, isConnected, switchChainAsync]);

  const handleConnect = async (connector: any) => {
    try {
      connect({ connector });
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
  };

  if (isConnected && address) {
    return (
      <Card className="border-border/50 bg-gradient-card backdrop-blur-xl">
        <div className="p-4">
          {chainId !== base.id && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please switch to Base network to mint
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Connected Wallet</div>
              <div className="font-mono text-sm font-bold text-foreground">
                {formatAddress(address)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {chainId === base.id ? "Base Network" : "Wrong Network"}
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-gradient-card backdrop-blur-xl">
      <div className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground mb-3">Connect your wallet to mint</div>
        {connectors
          .filter((connector) => connector.id !== 'injected' || connector.name !== 'Injected')
          .map((connector) => (
            <Button
              key={connector.id}
              onClick={() => handleConnect(connector)}
              disabled={isPending}
              variant="outline"
              className="w-full justify-start border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {connector.name === 'Injected' ? 'Browser Wallet' : connector.name}
            </Button>
          ))}
      </div>
    </Card>
  );
}

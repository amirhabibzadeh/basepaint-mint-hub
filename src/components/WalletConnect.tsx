import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import type { Connector } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { formatAddress } from "@/lib/basepaint";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { base } from "wagmi/chains";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function WalletConnect({ addressOverride }: { addressOverride?: string } = {}) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const address = addressOverride || wagmiAddress;
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Auto-connect to Farcaster wallet if available (inside miniapp)
  useEffect(() => {
    if (!isConnected && !autoConnectAttempted) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
      if (farcasterConnector) {
        setAutoConnectAttempted(true);
        connect({ connector: farcasterConnector });
      }
    }
  }, [isConnected, connectors, connect, autoConnectAttempted]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleConnect = async (connector: Connector) => {
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

  if ((isConnected && address) || addressOverride) {
    return (
      <Card className="border-border/50 bg-gradient-card backdrop-blur-xl">
        <div className="p-3">
          {chainId !== base.id && (
            <Alert variant="destructive" className="mb-3 py-2">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                Please switch to Base network
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Connected Wallet</div>
              <div className="font-mono text-xs font-bold text-foreground truncate">
                {formatAddress(address)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {chainId === base.id ? "Base Network" : "Wrong Network"}
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <div ref={ref} className="relative inline-block">
      <Button
        onClick={() => setOpen((s) => !s)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border/50 rounded-lg shadow-lg p-3 z-50">
          <div className="text-sm text-muted-foreground mb-2">Connect your wallet to mint</div>
          <div className="space-y-2">
            {[...connectors]
              // Sort to prioritize Farcaster connector
              .sort((a, b) => {
                if (a.id === 'farcasterMiniApp') return -1;
                if (b.id === 'farcasterMiniApp') return 1;
                return 0;
              })
              .filter((connector) => connector.id !== 'injected' || connector.name !== 'Injected')
              .map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => { setOpen(false); handleConnect(connector); }}
                  disabled={isPending}
                  variant={connector.id === 'farcasterMiniApp' ? 'default' : 'outline'}
                  className={connector.id === 'farcasterMiniApp' 
                    ? "w-full justify-start" 
                    : "w-full justify-start border-primary/30 hover:bg-primary/10 hover:border-primary/50"}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {connector.id === 'farcasterMiniApp' ? 'Farcaster Wallet' : connector.name}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

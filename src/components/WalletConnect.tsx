import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import type { Connector } from 'wagmi';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, LogOut, AlertCircle, User } from "lucide-react";
import { formatAddress } from "@/lib/basepaint";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { base } from "wagmi/chains";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { useInMiniApp } from "@/hooks/useInMiniApp";

export function WalletConnect({ 
  addressOverride
}: { 
  addressOverride?: string;
} = {}) {
  const farcasterUser = useFarcasterUser();
  const inMiniApp = useInMiniApp();
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
        <div className="p-1.5">
          {chainId !== base.id && (
            <Alert variant="destructive" className="mb-1.5 py-1">
              <AlertCircle className="h-2.5 w-2.5" />
              <AlertDescription className="text-[10px]">
                Please switch to Base network
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {inMiniApp && farcasterUser ? (
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5 ring-1 ring-primary/20 flex-shrink-0">
                    <AvatarImage src={farcasterUser.pfpUrl} alt={farcasterUser.username} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <User className="w-2.5 h-2.5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate leading-tight">
                      {farcasterUser.displayName || farcasterUser.username || 'Farcaster User'}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate leading-tight">
                      {formatAddress(address)}
                    </div>
                    {chainId !== base.id && (
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        Wrong Network
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Connected Wallet</div>
                  <div className="font-mono text-xs font-bold text-foreground truncate leading-tight">
                    {formatAddress(address)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {chainId === base.id ? "Base Network" : "Wrong Network"}
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={handleDisconnect}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10 flex-shrink-0"
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
        size="sm"
        className="flex items-center gap-1.5 h-8 text-xs"
      >
        <Wallet className="w-3.5 h-3.5" />
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

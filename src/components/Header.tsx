import { Palette, Info } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { useInMiniApp } from "@/hooks/useInMiniApp";

export const Header = () => {
    const farcasterUser = useFarcasterUser();
    const inMiniApp = useInMiniApp();
    return (
        <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Palette className="w-8 h-8 text-primary" />
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Basepaint
                    </h1>
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10"
                        >
                            <Info className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="sr-only">About BasePaint</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5 text-primary" />
                                About BasePaint Mint Hub
                            </DialogTitle>
                            <DialogDescription className="text-left space-y-3 pt-2">
                                <div>
                                    <p className="font-medium text-foreground mb-1">What is BasePaint?</p>
                                    <p className="text-sm text-muted-foreground">
                                        BasePaint is a daily collaborative art canvas on Farcaster where creators paint together.
                                        Each day's final artwork becomes a mintable piece.
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-foreground mb-1">About This Mint</p>
                                    <p className="text-sm text-muted-foreground">
                                        This mint hub provides an easy way to mint the daily collaborative artwork from BasePaint.xyz.
                                        Each canvas represents a day of collective creativity from the Farcaster community,
                                        transformed into a unique NFT on the Base network.
                                    </p>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                {/* Show wallet connect - Farcaster profile integrated when in mini app */}
                <div className="max-w-[180px]">
                    <WalletConnect
                        addressOverride={farcasterUser?.walletAddress}
                    />
                </div>
            </div>
        </div>
    );
};

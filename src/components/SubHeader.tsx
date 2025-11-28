import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export const SubHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address, isConnected } = useAccount();

    const handleGalleryClick = () => {
        if (!isConnected || !address) {
            toast.error("Please connect your wallet first");
            return;
        }
        navigate(`/gallery/${address}`);
    };

    const handleMintClick = () => {
        navigate("/");
    };

    const isGalleryActive = location.pathname.startsWith("/gallery");
    const isMintActive = location.pathname === "/";

    return (
        <div className="flex items-center gap-2 mb-4">
            <Button
                variant="ghost"
                onClick={handleMintClick}
                className={cn(
                    "text-sm font-medium transition-all duration-200",
                    isMintActive
                        ? "text-primary border-b-2 border-primary rounded-none"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Mint
            </Button>
            <Button
                variant="ghost"
                onClick={handleGalleryClick}
                className={cn(
                    "text-sm font-medium transition-all duration-200",
                    isGalleryActive
                        ? "text-primary border-b-2 border-primary rounded-none"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Gallery
            </Button>
        </div>
    );
};

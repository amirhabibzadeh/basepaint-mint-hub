import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { initializeFarcasterSDK } from "@/lib/farcaster";
import { sdk } from "@farcaster/miniapp-sdk";

interface ShareGalleryProps {
    wallet: string;
    ownedCount?: number;
}

export const ShareGallery = ({ wallet, ownedCount = 0 }: ShareGalleryProps) => {
    const [isSharing, setIsSharing] = useState(false);

    const galleryUrl = `${window.location.origin}/gallery/${wallet}`;

    const copyGalleryLink = async () => {
        try {
            await navigator.clipboard.writeText(galleryUrl);
            toast.success('Gallery link copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const shareToFarcaster = async () => {
        setIsSharing(true);
        try {
            await initializeFarcasterSDK();

            const text = ownedCount > 0
                ? `🎨 Check out my BasePaint gallery!\n\nI own ${ownedCount} canvas${ownedCount > 1 ? 'es' : ''} on BasePaint.\n\nView my collection:\n${galleryUrl}`
                : `🎨 Check out my BasePaint gallery!\n\nView my collection:\n${galleryUrl}`;

            const result = await sdk.actions.composeCast({
                text,
                embeds: [galleryUrl],
            }) as { cast: { hash: string; channelKey?: string } | null } | undefined;

            if (result?.cast) {
                toast.success('Shared to Farcaster!');
            }
        } catch (err) {
            if ((err as Error).message?.includes('close') || (err as Error).message?.includes('cancel')) {
                // User cancelled, do nothing
            } else {
                toast.error('Failed to share to Farcaster');
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="mb-6 p-4 bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-1">
                        {ownedCount > 0 
                            ? `Your Gallery (${ownedCount} owned)`
                            : 'Your Gallery'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Share your BasePaint collection with others
                    </div>
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2 w-full md:w-auto">
                    <Button
                        onClick={copyGalleryLink}
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0 text-xs h-8 md:h-9 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </Button>
                    <Button
                        onClick={shareToFarcaster}
                        variant="outline"
                        size="sm"
                        disabled={isSharing}
                        className="flex-1 min-w-0 text-xs h-8 md:h-9 flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4"
                    >
                        <Share2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Share to Farcaster</span>
                        <span className="sm:hidden">Share to Farcaster</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};


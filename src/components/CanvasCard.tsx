import { CanvasMetadata, getArtworkUrl, formatEth } from "@/lib/basepaint";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Users, Coins, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasCardProps {
    canvas: CanvasMetadata;
    ownedCount?: number;
    onClick?: () => void;
    isInProgress?: boolean;
}

export const CanvasCard = ({ canvas, ownedCount = 0, onClick, isInProgress = false }: CanvasCardProps) => {
    const hasOwned = ownedCount > 0;

    return (
        <div
            className="group relative cursor-pointer"
            onClick={onClick}
        >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-xl" />

            {/* Glass card */}
            <Card className="relative overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl hover:border-primary/50 transition-all duration-300">
                {/* Canvas Image */}
                <div className="relative aspect-square overflow-hidden">
                    <img
                        src={getArtworkUrl(canvas.id)}
                        alt={`Canvas #${canvas.id}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Canvas ID badge */}
                    <div className="absolute top-2 left-2 bg-background/20 backdrop-blur-md px-3 py-1 rounded-lg border border-border/30">
                        <span className="text-xs font-bold text-foreground">
                            Day {canvas.id}
                        </span>
                    </div>

                    {/* Status badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {isInProgress && (
                            <div className="bg-primary/20 backdrop-blur-md px-2 py-1 rounded-lg border border-primary/30">
                                <span className="text-xs font-medium text-primary">In progress...</span>
                            </div>
                        )}
                    </div>

                    {/* Owned count badge - bottom right */}
                    {ownedCount > 0 && (
                        <div className="absolute bottom-2 right-2 bg-accent/20 backdrop-blur-md px-2 py-1 rounded-lg border border-accent/30">
                            <span className="text-xs font-medium text-accent">Owned: {ownedCount}</span>
                        </div>
                    )}

                    {/* Action button on hover */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            className={cn(
                                "w-full backdrop-blur-md",
                                isInProgress
                                    ? "bg-primary/90 hover:bg-primary"
                                    : "bg-background/90 hover:bg-background"
                            )}
                            size="sm"
                        >
                            {isInProgress ? "MINT" : "VIEW"}
                        </Button>
                    </div>
                </div>

                {/* Canvas Info */}
                <div className="p-3 space-y-2">
                    {/* Canvas Name */}
                    {canvas.name && (
                        <h3 className="font-bold text-sm truncate">{canvas.name}</h3>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Coins className="w-3.5 h-3.5" />
                            <span>{canvas.totalMints}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{canvas.totalArtists || 0}</span>
                        </div>
                        {canvas.totalBurns > 0 && (
                            <div className="flex items-center gap-1.5 text-destructive">
                                <Flame className="w-3.5 h-3.5" />
                                <span>{canvas.totalBurns}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Palette className="w-3.5 h-3.5" />
                            <span>{formatEth(canvas.totalEarned)} ETH</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

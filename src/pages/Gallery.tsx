import { useQuery } from "@tanstack/react-query";
import { getCurrentCanvasId, getWalletBalances, getCanvassByIds, getPopularCanvass, getRareCanvass, CanvasMetadata } from "@/lib/basepaint";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { SubHeader } from "@/components/SubHeader";
import { Header } from "@/components/Header";
import { CanvasCard } from "@/components/CanvasCard";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type FilterOption = "LATEST" | "OLDEST" | "POPULAR" | "RARE" | "BURNED" | "OWNED" | "UNOWNED";

const Gallery = () => {
    const navigate = useNavigate();
    const { wallet } = useParams<{ wallet: string }>();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterOption, setFilterOption] = useState<FilterOption>("LATEST");
    const farcasterUser = useFarcasterUser();

    // Validate wallet parameter exists
    useEffect(() => {
        if (!wallet) {
            toast.error("Wallet address is required");
            navigate("/");
        }
    }, [wallet, navigate]);

    // Fetch current canvas ID to determine range
    const { data: currentCanvasId } = useQuery({
        queryKey: ['canvasId'],
        queryFn: getCurrentCanvasId,
    });

    // Fetch wallet balances
    const { data: balances, isLoading: isLoadingBalances } = useQuery({
        queryKey: ['walletBalances', wallet],
        queryFn: () => getWalletBalances(wallet!),
        enabled: !!wallet,
    });

    // Get canvas IDs to fetch based on filter option
    const canvasIdsToFetch = useMemo(() => {
        if (!currentCanvasId) return [];
        
        switch (filterOption) {
            case "LATEST":
            case "OWNED":
            case "UNOWNED":
            case "BURNED":
                // Fetch recent 100 canvases
                const count = Math.min(currentCanvasId, 100);
                return Array.from({ length: count }, (_, i) => currentCanvasId - i);
            case "OLDEST":
                // Fetch first 100 canvases
                return Array.from({ length: Math.min(currentCanvasId, 100) }, (_, i) => i + 1);
            default:
                return [];
        }
    }, [currentCanvasId, filterOption]);

    // Determine query function and parameters based on filter option
    const queryConfig = useMemo(() => {
        switch (filterOption) {
            case "LATEST":
            case "OLDEST":
            case "OWNED":
            case "UNOWNED":
            case "BURNED":
                return {
                    queryFn: () => getCanvassByIds(canvasIdsToFetch),
                    enabled: canvasIdsToFetch.length > 0,
                };
            case "POPULAR":
                return {
                    queryFn: () => getPopularCanvass(60),
                    enabled: true,
                };
            case "RARE":
                return {
                    queryFn: () => getRareCanvass(60),
                    enabled: true,
                };
            default:
                return {
                    queryFn: () => Promise.resolve([]),
                    enabled: false,
                };
        }
    }, [filterOption, canvasIdsToFetch]);

    // Fetch canvas data
    const { data: canvases, isLoading: isLoadingCanvases } = useQuery({
        queryKey: ['canvases', filterOption, canvasIdsToFetch],
        ...queryConfig,
    });

    // Create a map of owned canvas counts
    const ownedCanvasMap = useMemo(() => {
        if (!balances) return new Map<number, number>();
        const map = new Map<number, number>();
        balances.forEach(balance => {
            const tokenId = parseInt(balance.tokenId);
            const count = parseInt(balance.value);
            map.set(tokenId, count);
        });
        return map;
    }, [balances]);

    // Filter canvases (sorting is now done server-side for POPULAR and RARE)
    const filteredCanvases = useMemo(() => {
        if (!canvases) return [];

        let filtered = [...canvases];

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(canvas =>
                canvas.id.toString().includes(query) ||
                canvas.name?.toLowerCase().includes(query)
            );
        }

        // Apply ownership filter (client-side for OWNED, UNOWNED, BURNED)
        if (filterOption === "OWNED") {
            filtered = filtered.filter(canvas => ownedCanvasMap.has(canvas.id));
        } else if (filterOption === "UNOWNED") {
            filtered = filtered.filter(canvas => !ownedCanvasMap.has(canvas.id));
        } else if (filterOption === "BURNED") {
            filtered = filtered.filter(canvas => canvas.totalBurns > 0);
        }

        // Apply client-side sorting only for LATEST and OLDEST (POPULAR and RARE are sorted server-side)
        switch (filterOption) {
            case "LATEST":
                filtered.sort((a, b) => b.id - a.id);
                break;
            case "OLDEST":
                filtered.sort((a, b) => a.id - b.id);
                break;
            // POPULAR and RARE are already sorted by the server query
        }

        return filtered;
    }, [canvases, searchQuery, filterOption, ownedCanvasMap]);

    const isLoading = isLoadingBalances || isLoadingCanvases;

    const handleCanvasClick = (canvasId: number) => {
        navigate(`/?day=${canvasId}`);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container mx-auto px-4 py-4 max-w-6xl">
                {/* Header */}
                <Header />

                {/* Sub Header Navigation */}
                <SubHeader />

                {/* Wallet Address Display */}
                {wallet && (
                    <div className="mb-6 p-4 bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl">
                        <div className="text-sm text-muted-foreground mb-1">Gallery for wallet:</div>
                        <div className="font-mono text-sm md:text-base font-medium break-all">
                            {wallet}
                        </div>
                        {balances && (
                            <div className="text-xs text-muted-foreground mt-2">
                                Owns {balances.length} canvas{balances.length !== 1 ? 'es' : ''}
                            </div>
                        )}
                    </div>
                )}

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Theme Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-background/40 backdrop-blur-xl border-border/50 focus:border-primary/50"
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <Select value={filterOption} onValueChange={(value) => setFilterOption(value as FilterOption)}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background/40 backdrop-blur-xl border-border/50">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                            <SelectItem value="LATEST">LATEST</SelectItem>
                            <SelectItem value="OLDEST">OLDEST</SelectItem>
                            <SelectItem value="POPULAR">POPULAR</SelectItem>
                            <SelectItem value="RARE">RARE</SelectItem>
                            <SelectItem value="BURNED">BURNED</SelectItem>
                            <SelectItem value="OWNED">OWNED</SelectItem>
                            <SelectItem value="UNOWNED">UNOWNED</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search Button */}
                    <Button className="bg-primary/90 backdrop-blur-xl hover:bg-primary">
                        Search
                    </Button>
                </div>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                        {filteredCanvases.map((canvas) => (
                            <CanvasCard
                                key={canvas.id}
                                canvas={canvas}
                                ownedCount={ownedCanvasMap.get(canvas.id) || 0}
                                onClick={() => handleCanvasClick(canvas.id)}
                                isInProgress={canvas.id === currentCanvasId}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && filteredCanvases.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "No canvases found matching your search."
                                : "No canvases available."}
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default Gallery;

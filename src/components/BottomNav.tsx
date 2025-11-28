import { Image, Palette, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface BottomNavProps {
    activeTab?: "gallery" | "mint" | "subscribe";
    onTabChange?: (tab: "gallery" | "mint" | "subscribe") => void;
}

export const BottomNav = ({ activeTab: controlledActiveTab, onTabChange }: BottomNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<"gallery" | "mint" | "subscribe">(controlledActiveTab || "mint");

    // Update active tab based on current route
    useEffect(() => {
        if (location.pathname.startsWith("/gallery") || location.pathname.startsWith("/wallet")) {
            setActiveTab("gallery");
        } else if (location.pathname === "/") {
            setActiveTab("mint");
        }
    }, [location.pathname]);

    // Sync with controlled prop if provided
    useEffect(() => {
        if (controlledActiveTab) {
            setActiveTab(controlledActiveTab);
        }
    }, [controlledActiveTab]);

    const handleTabClick = (tab: "gallery" | "mint" | "subscribe") => {
        setActiveTab(tab);
        onTabChange?.(tab);

        if (tab === "gallery") {
            if (!isConnected || !address) {
                toast.error("Please connect your wallet first");
                return;
            }
            navigate(`/gallery/${address}`);
        } else if (tab === "mint") {
            navigate("/");
        } else if (tab === "subscribe") {
            toast.info("Coming Soon!", {
                description: "Subscription feature will be available soon. Stay tuned!",
            });
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
            <div className="mx-auto max-w-md px-4 pb-4">
                <nav className="relative backdrop-blur-xl bg-background/30 border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Glass effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

                    {/* Navigation buttons */}
                    <div className="relative grid grid-cols-3 gap-1 p-2">
                        {/* Gallery Button */}
                        <Button
                            variant="ghost"
                            onClick={() => handleTabClick("gallery")}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl transition-all duration-300",
                                activeTab === "gallery"
                                    ? "bg-primary/20 text-primary shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                            )}
                        >
                            <Image className="w-5 h-5" />
                            <span className="text-xs font-medium">Gallery</span>
                        </Button>

                        {/* Mint Button (Default) */}
                        <Button
                            variant="ghost"
                            onClick={() => handleTabClick("mint")}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl transition-all duration-300",
                                activeTab === "mint"
                                    ? "bg-gradient-primary text-white shadow-lg shadow-primary/30 scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                            )}
                        >
                            <Palette className="w-5 h-5" />
                            <span className="text-xs font-medium">Mint</span>
                        </Button>

                        {/* Subscribe Button */}
                        <Button
                            variant="ghost"
                            onClick={() => handleTabClick("subscribe")}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl transition-all duration-300",
                                activeTab === "subscribe"
                                    ? "bg-accent/20 text-accent shadow-lg shadow-accent/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                            )}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="text-xs font-medium">Subscribe</span>
                        </Button>
                    </div>
                </nav>
            </div>
        </div>
    );
};

import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, className = "" }: StatCardProps) {
  return (
    <Card className={`relative overflow-hidden border-border/50 bg-gradient-card backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-glow ${className}`}>
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      <div className="relative p-4 md:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-1 md:p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <span className="text-xs md:text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="text-xl md:text-2xl font-bold text-foreground">{value}</div>
      </div>
    </Card>
  );
}

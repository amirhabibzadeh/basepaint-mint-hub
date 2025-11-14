import { Card } from "@/components/ui/card";
import { Contribution, formatAddress } from "@/lib/basepaint";
import { Trophy, Award, Medal } from "lucide-react";

interface ContributorsListProps {
  contributions: Contribution[];
}

export function ContributorsList({ contributions }: ContributorsListProps) {
  const topContributors = contributions.slice(0, 10);

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-card backdrop-blur-xl">
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Top Contributors
        </h3>
        <div className="space-y-2">
          {topContributors.map((contribution, index) => (
            <div
              key={contribution.account.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 transition-all duration-200 hover:bg-background/70"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getMedalIcon(index) || `#${index + 1}`}
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatAddress(contribution.account.id)}
                </span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {contribution.pixelsCount.toLocaleString()} pixels
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

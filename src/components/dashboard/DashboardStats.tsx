import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, Calendar, Sprout } from "lucide-react";

interface DashboardStatsProps {
  totalInvested: number;
  activeAssets: number;
  pendingROI: number;
  nextVisit?: string;
}

export default function DashboardStats({ totalInvested, activeAssets, pendingROI, nextVisit }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Invested",
      value: `GHS ${totalInvested.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Active Assets",
      value: activeAssets,
      icon: Sprout,
      color: "text-gold",
      bg: "bg-gold/10",
    },
    {
      title: "Pending ROI",
      value: `GHS ${pendingROI.toLocaleString()}`,
      icon: Target,
      color: "text-earth",
      bg: "bg-earth/10",
    },
    {
      title: "Next Visit",
      value: nextVisit || "Not scheduled",
      icon: Calendar,
      color: "text-sky",
      bg: "bg-sky/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

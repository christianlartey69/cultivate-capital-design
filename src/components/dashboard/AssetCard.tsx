import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, MessageSquare, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssetCardProps {
  tagId: string;
  assetName: string;
  assetType: string;
  purchaseAmount: number;
  purchaseDate: string;
  startDate: string;
  expectedEndDate: string;
  currentPhase: string;
  status: string;
  thumbnailUrl?: string;
  progress: number;
}

export default function AssetCard({
  tagId,
  assetName,
  assetType,
  purchaseAmount,
  purchaseDate,
  startDate,
  expectedEndDate,
  currentPhase,
  status,
  thumbnailUrl,
  progress,
}: AssetCardProps) {
  const { toast } = useToast();

  const copyTagId = () => {
    navigator.clipboard.writeText(tagId);
    toast({
      title: "Copied!",
      description: "Tag ID copied to clipboard",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{assetName}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {tagId}
              </Badge>
              <Button variant="ghost" size="sm" onClick={copyTagId} className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {thumbnailUrl && (
            <img src={thumbnailUrl} alt={assetName} className="w-16 h-16 rounded-lg object-cover" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{assetType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Amount</p>
            <p className="font-medium">GHS {purchaseAmount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Start Date</p>
            <p className="font-medium">{new Date(startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">End Date</p>
            <p className="font-medium">{new Date(expectedEndDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Farm Cycle</span>
            <span className="font-medium">{currentPhase}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Video className="w-4 h-4 mr-2" />
            View Video
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Book Visit
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

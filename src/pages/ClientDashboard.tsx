import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AssetCard from "@/components/dashboard/AssetCard";
import { Calendar, MessageSquare, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ChatBot from "@/components/ChatBot";

interface Investment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  maturity_date: string;
  start_date: string;
  actual_roi: number | null;
  investment_packages: {
    name: string;
    expected_roi_min: number;
    expected_roi_max: number;
    duration_months: number;
  };
}

interface Asset {
  id: string;
  unique_tag_id: string;
  asset_name: string;
  asset_type: string;
  purchase_amount: number;
  purchase_date: string;
  start_date: string;
  expected_end_date: string;
  current_phase: string;
  status: string;
  thumbnail_url?: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select(`
            *,
            investment_packages (
              name,
              expected_roi_min,
              expected_roi_max,
              duration_months
            )
          `)
          .eq("investor_id", user.id)
          .order("created_at", { ascending: false });

        if (investmentsError) throw investmentsError;
        setInvestments(investmentsData || []);

        // Fetch assets
        const { data: assetsData, error: assetsError } = await supabase
          .from("assets")
          .select("*")
          .eq("investor_id", user.id)
          .order("created_at", { ascending: false });

        if (assetsError) throw assetsError;
        setAssets(assetsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const activeAssets = assets.filter((asset) => asset.status === "active").length;
  
  // Calculate pending ROI (15% of total invested for active investments)
  const pendingROI = investments
    .filter((inv) => inv.status === "active")
    .reduce((sum, inv) => sum + (Number(inv.amount) * 0.15), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Investor Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back! Track your farm investments</p>
            </div>
            <Button onClick={() => navigate("/invest")}>
              New Investment
            </Button>
          </div>

          {/* Stats Cards */}
          <DashboardStats
            totalInvested={totalInvested}
            activeAssets={activeAssets}
            pendingROI={pendingROI}
            nextVisit="Oct 5, 2025"
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Assets */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Assets</CardTitle>
                  <CardDescription>Your livestock and farm investments</CardDescription>
                </CardHeader>
                <CardContent>
                  {assets.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No assets yet. Start your first investment!</p>
                      <Button onClick={() => navigate("/invest")}>Browse Packages</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {assets.map((asset) => {
                        const startDate = new Date(asset.start_date);
                        const endDate = new Date(asset.expected_end_date);
                        const now = new Date();
                        const totalDuration = endDate.getTime() - startDate.getTime();
                        const elapsed = now.getTime() - startDate.getTime();
                        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

                        return (
                          <AssetCard
                            key={asset.id}
                            tagId={asset.unique_tag_id}
                            assetName={asset.asset_name}
                            assetType={asset.asset_type}
                            purchaseAmount={asset.purchase_amount}
                            purchaseDate={asset.purchase_date}
                            startDate={asset.start_date}
                            expectedEndDate={asset.expected_end_date}
                            currentPhase={asset.current_phase}
                            status={asset.status}
                            thumbnailUrl={asset.thumbnail_url}
                            progress={progress}
                          />
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              {/* ROI Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>ROI Progress</CardTitle>
                  <CardDescription>Expected returns timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-3" />
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Expected ROI</p>
                      <p className="text-2xl font-bold text-primary">GHS {pendingROI.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Due: Mar 12, 2026</p>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Withdraw Returns
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Farm Visit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Raise Enquiry
                  </Button>
                </CardContent>
              </Card>

              {/* Legacy Investments */}
              {investments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Legacy Investments</CardTitle>
                    <CardDescription>Previous investment records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {investments.slice(0, 3).map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between">
                          <span className="text-muted-foreground truncate">
                            {inv.investment_packages.name}
                          </span>
                          <span className="font-medium">GHS {Number(inv.amount).toLocaleString()}</span>
                        </div>
                      ))}
                      {investments.length > 3 && (
                        <Button variant="link" className="w-full text-xs p-0 h-auto">
                          View all {investments.length} investments
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* AI Support Chatbot */}
      <ChatBot
        type="client"
        userContext={{
          name: user?.email || "Investor",
          totalInvested,
          activeAssets,
          pendingROI,
        }}
      />
    </div>
  );
};

export default ClientDashboard;

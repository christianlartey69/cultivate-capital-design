import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, TrendingUp, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Investment {
  id: string;
  amount: number;
  status: string;
  start_date: string;
  maturity_date: string;
  actual_roi: number | null;
  package_id: string;
  investment_packages: {
    name: string;
    expected_roi_min: number;
    expected_roi_max: number;
  };
}

export default function ClientDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from("investments")
        .select(`
          *,
          investment_packages (
            name,
            expected_roi_min,
            expected_roi_max
          )
        `)
        .eq("investor_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load investments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const activeInvestments = investments.filter(inv => inv.status === "active");

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-heading font-bold text-foreground">My Investments</h2>
          <Button onClick={() => navigate("/invest")}>
            New Investment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {investments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">You don't have any investments yet</p>
                <Button onClick={() => navigate("/invest")}>Make Your First Investment</Button>
              </CardContent>
            </Card>
          ) : (
            investments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{investment.investment_packages.name}</CardTitle>
                      <CardDescription>
                        Started: {new Date(investment.start_date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      investment.status === "active" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Amount</p>
                        <p className="text-xl font-bold">${Number(investment.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected ROI</p>
                        <p className="text-xl font-bold text-primary">
                          {investment.investment_packages.expected_roi_min}%-{investment.investment_packages.expected_roi_max}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Maturity Date</span>
                        <span>{new Date(investment.maturity_date).toLocaleDateString()}</span>
                      </div>
                      <Progress 
                        value={
                          ((new Date().getTime() - new Date(investment.start_date).getTime()) / 
                          (new Date(investment.maturity_date).getTime() - new Date(investment.start_date).getTime())) * 100
                        } 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

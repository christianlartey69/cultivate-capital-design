import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, TrendingUp, Users, DollarSign } from "lucide-react";
import ChatBot from "@/components/ChatBot";

interface Investment {
  id: string;
  amount: number;
  status: string;
  start_date: string;
  maturity_date: string;
  profiles: {
    full_name: string;
    email: string;
  };
  investment_packages: {
    name: string;
  };
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .eq("role", "admin")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      fetchInvestments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin access",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from("investments")
        .select(`
          *,
          profiles!investments_investor_id_fkey (
            full_name,
            email
          ),
          investment_packages (
            name
          )
        `)
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

  const updateInvestmentStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("investments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Investment status updated",
      });
      fetchInvestments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update investment status",
        variant: "destructive",
      });
    }
  };

  const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const activeInvestments = investments.filter(inv => inv.status === "active").length;
  const totalUsers = new Set(investments.map(i => i.profiles.email)).size;

  if (loading || isLoading || !isAdmin) {
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
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage investments and packages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvestments.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeInvestments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Count</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(investments.map(i => i.profiles.email)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Investments</CardTitle>
            <CardDescription>Manage and track all client investments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Maturity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{investment.profiles.full_name}</p>
                        <p className="text-sm text-muted-foreground">{investment.profiles.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{investment.investment_packages.name}</TableCell>
                    <TableCell>${Number(investment.amount).toLocaleString()}</TableCell>
                    <TableCell>{new Date(investment.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(investment.maturity_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={investment.status === "active" ? "default" : "secondary"}>
                        {investment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <select
                        value={investment.status}
                        onChange={(e) => updateInvestmentStatus(investment.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="matured">Matured</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Admin Assistant */}
      <ChatBot
        type="admin"
        adminContext={{
          totalInvestments,
          activeInvestments,
          totalUsers,
          pendingVerifications: 0, // TODO: fetch from profiles where verification_status = 'pending'
        }}
      />
    </div>
  );
}

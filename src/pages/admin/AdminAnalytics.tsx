import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Users, Wallet, Package, Calendar, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalInvestments: number;
  totalUsers: number;
  totalFarmers: number;
  totalAssets: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  monthlyInvestments: { month: string; amount: number }[];
  investmentsByPackage: { name: string; value: number }[];
  userGrowth: { month: string; users: number }[];
}

const COLORS = ["#1F7A3A", "#D4A017", "#8B5E3C", "#6AB1E7", "#8FD19A"];

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalInvestments: 0,
    totalUsers: 0,
    totalFarmers: 0,
    totalAssets: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    monthlyInvestments: [],
    investmentsByPackage: [],
    userGrowth: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch investments
      const { data: investments, error: invError } = await supabase
        .from("investments")
        .select("amount, created_at, investment_packages(name)");
      if (invError) throw invError;

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("created_at");
      if (usersError) throw usersError;

      // Fetch farmers
      const { data: farmers, error: farmersError } = await supabase
        .from("farmers")
        .select("id");
      if (farmersError) throw farmersError;

      // Fetch assets
      const { data: assets, error: assetsError } = await supabase
        .from("assets")
        .select("id");
      if (assetsError) throw assetsError;

      // Fetch withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from("withdrawal_requests")
        .select("amount, status, created_at");
      if (withdrawalsError) throw withdrawalsError;

      // Calculate monthly investments
      const monthlyMap = new Map<string, number>();
      investments?.forEach((inv) => {
        const month = new Date(inv.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + Number(inv.amount));
      });
      const monthlyInvestments = Array.from(monthlyMap.entries()).map(([month, amount]) => ({ month, amount }));

      // Calculate investments by package
      const packageMap = new Map<string, number>();
      investments?.forEach((inv: any) => {
        const name = inv.investment_packages?.name || "Unknown";
        packageMap.set(name, (packageMap.get(name) || 0) + Number(inv.amount));
      });
      const investmentsByPackage = Array.from(packageMap.entries()).map(([name, value]) => ({ name, value }));

      // Calculate user growth
      const userMonthMap = new Map<string, number>();
      users?.forEach((u) => {
        const month = new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        userMonthMap.set(month, (userMonthMap.get(month) || 0) + 1);
      });
      const userGrowth = Array.from(userMonthMap.entries()).map(([month, users]) => ({ month, users }));

      // Calculate totals
      const totalInvestments = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.filter(w => w.status === "paid").reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const pendingWithdrawals = withdrawals?.filter(w => w.status === "pending").reduce((sum, w) => sum + Number(w.amount), 0) || 0;

      setData({
        totalInvestments,
        totalUsers: users?.length || 0,
        totalFarmers: farmers?.length || 0,
        totalAssets: assets?.length || 0,
        totalWithdrawals,
        pendingWithdrawals,
        monthlyInvestments,
        investmentsByPackage,
        userGrowth,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Platform performance and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GHS {data.totalInvestments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFarmers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAssets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">GHS {data.totalWithdrawals.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">GHS {data.pendingWithdrawals.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Investments
            </CardTitle>
            <CardDescription>Investment amounts over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyInvestments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Amount"]} />
                <Bar dataKey="amount" fill="#1F7A3A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#D4A017" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Investments by Package
            </CardTitle>
            <CardDescription>Distribution of investments across packages</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.investmentsByPackage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.investmentsByPackage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

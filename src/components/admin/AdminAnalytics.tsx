import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AnalyticsProps {
  investmentData: { month: string; amount: number }[];
  userGrowth: { month: string; users: number }[];
  packageDistribution: { name: string; value: number }[];
}

const COLORS = ["#4A6B3F", "#D3A95C", "#C46A2B", "#7DAFCC", "#A9B9A3"];

export default function AdminAnalytics({ investmentData, userGrowth, packageDistribution }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Investment Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Investment Trends</CardTitle>
          <CardDescription>Monthly investment amounts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={investmentData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A6B3F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4A6B3F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `GHS ${v / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Investment"]}
                  contentStyle={{ borderRadius: "8px" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4A6B3F"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "8px" }} />
                <Bar dataKey="users" fill="#D3A95C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Package Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Package Distribution</CardTitle>
          <CardDescription>Investment by package type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={packageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {packageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Amount"]}
                  contentStyle={{ borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

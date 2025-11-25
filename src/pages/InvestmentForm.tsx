import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  expected_roi_min: number;
  expected_roi_max: number;
  duration_months: number;
  business_type: string;
}

const investmentSchema = z.object({
  package_id: z.string().min(1, "Please select a package"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

export default function InvestmentForm() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from("investment_packages")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPkg = packages.find(p => p.id === selectedPackage);
      if (!selectedPkg) throw new Error("Package not found");

      const numAmount = parseFloat(amount);

      const validation = investmentSchema.safeParse({
        package_id: selectedPackage,
        amount: numAmount,
      });

      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      if (numAmount < selectedPkg.min_investment) {
        toast({
          title: "Invalid Amount",
          description: `Minimum investment for this package is $${selectedPkg.min_investment.toLocaleString()}`,
          variant: "destructive",
        });
        return;
      }

      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + selectedPkg.duration_months);

      const { error } = await supabase.from("investments").insert({
        investor_id: user?.id,
        package_id: selectedPackage,
        amount: numAmount,
        start_date: startDate.toISOString(),
        maturity_date: maturityDate.toISOString(),
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your investment has been created successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create investment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  if (loading) {
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
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">New Investment</h1>
          <p className="text-muted-foreground">Choose a package and start investing</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Investment Details</CardTitle>
              <CardDescription>Select a package and enter your investment amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="package">Investment Package</Label>
                <select
                  id="package"
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} - {pkg.business_type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPkg && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{selectedPkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedPkg.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Minimum Investment</p>
                        <p className="font-bold">${selectedPkg.min_investment.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected ROI</p>
                        <p className="font-bold text-primary">
                          {selectedPkg.expected_roi_min}%-{selectedPkg.expected_roi_max}%
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-bold">{selectedPkg.duration_months} months</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Business Type</p>
                        <p className="font-bold">{selectedPkg.business_type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                {selectedPkg && (
                  <p className="text-sm text-muted-foreground">
                    Minimum: ${selectedPkg.min_investment.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !selectedPackage || !amount}
                >
                  {isSubmitting ? "Creating..." : "Create Investment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ChatBot from "@/components/ChatBot";
import {
  Tractor, MapPin, Loader2, AlertCircle, CheckCircle2,
  FileText, Video, Calendar, TrendingUp, Plus, Upload
} from "lucide-react";

interface Farmer {
  id: string;
  business_name: string | null;
  verification_status: string;
  is_certified: boolean;
  certification_number: string | null;
  identity_verified: boolean;
  farm_verified: boolean;
  compliance_verified: boolean;
  admin_approved: boolean;
}

interface Farm {
  id: string;
  farm_name: string;
  farm_type: string;
  farm_size: number | null;
  location_city: string | null;
  location_region: string | null;
  is_verified: boolean;
  is_certified: boolean;
  status: string;
}

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch farmer profile
      const { data: farmerData, error: farmerError } = await supabase
        .from("farmers")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (farmerError && farmerError.code !== "PGRST116") throw farmerError;
      setFarmer(farmerData);

      if (farmerData) {
        // Fetch farms
        const { data: farmsData, error: farmsError } = await supabase
          .from("farms")
          .select("*")
          .eq("farmer_id", farmerData.id);

        if (farmsError) throw farmsError;
        setFarms(farmsData || []);
      }
    } catch (error) {
      console.error("Error fetching farmer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationProgress = () => {
    if (!farmer) return 0;
    let steps = 0;
    if (farmer.identity_verified) steps++;
    if (farmer.farm_verified) steps++;
    if (farmer.compliance_verified) steps++;
    if (farmer.admin_approved) steps++;
    return (steps / 4) * 100;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      unverified: "secondary",
      pending: "outline",
      partially_verified: "outline",
      fully_verified: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tractor className="w-5 h-5" />
                Become a CES Farmer
              </CardTitle>
              <CardDescription>Register your farm to receive investments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join CES as a certified farmer. Get verified, create farm assets, and receive investments from our community.
              </p>
              <Button onClick={() => navigate("/farmer-onboarding")} className="w-full">
                Start Registration
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
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
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Tractor className="w-8 h-8" />
                Farmer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {farmer.business_name || "Farm Management"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {farmer.is_certified && (
                <Badge className="bg-harvest text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  CES Certified
                </Badge>
              )}
              {getStatusBadge(farmer.verification_status)}
            </div>
          </div>

          {/* Verification Progress */}
          {!farmer.is_certified && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  Verification Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={getVerificationProgress()} className="h-3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className={`flex items-center gap-2 ${farmer.identity_verified ? "text-primary" : "text-muted-foreground"}`}>
                    {farmer.identity_verified ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2" />}
                    Identity Verified
                  </div>
                  <div className={`flex items-center gap-2 ${farmer.farm_verified ? "text-primary" : "text-muted-foreground"}`}>
                    {farmer.farm_verified ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2" />}
                    Farm Verified
                  </div>
                  <div className={`flex items-center gap-2 ${farmer.compliance_verified ? "text-primary" : "text-muted-foreground"}`}>
                    {farmer.compliance_verified ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2" />}
                    Compliance Review
                  </div>
                  <div className={`flex items-center gap-2 ${farmer.admin_approved ? "text-primary" : "text-muted-foreground"}`}>
                    {farmer.admin_approved ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2" />}
                    Admin Approved
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farms.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Verified Farms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farms.filter(f => f.is_verified).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Raised</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS 0</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="farms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="farms">My Farms</TabsTrigger>
              <TabsTrigger value="assets">Farm Assets</TabsTrigger>
              <TabsTrigger value="media">Media & Updates</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>

            <TabsContent value="farms" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Registered Farms</h2>
                {farmer.is_certified && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Farm
                  </Button>
                )}
              </div>

              {farms.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No farms registered yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {farms.map((farm) => (
                    <Card key={farm.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{farm.farm_name}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {farm.location_city}, {farm.location_region}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {farm.is_certified && (
                              <Badge className="bg-harvest text-white">Certified</Badge>
                            )}
                            {farm.is_verified ? (
                              <Badge variant="default">Verified</Badge>
                            ) : (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{farm.farm_type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <span className="ml-2">{farm.farm_size || "—"} acres</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Upload className="w-4 h-4 mr-1" />
                            Upload Media
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <FileText className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="assets">
              <Card>
                <CardContent className="py-12 text-center">
                  {farmer.is_certified ? (
                    <>
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">Create farm assets to receive investments</p>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Asset
                      </Button>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Complete verification to create farm assets</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Upload progress photos and videos for investors</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Media
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments">
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No investments to display yet</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />

      <ChatBot
        type="client"
        userContext={{
          name: farmer.business_name || "Farmer",
          totalInvested: 0,
          activeAssets: farms.length,
          pendingROI: 0,
        }}
      />
    </div>
  );
}

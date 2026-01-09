import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";
import { 
  Tractor, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  Eye, 
  TrendingUp,
  MapPin,
  Leaf,
  Video,
  FileText,
  Award
} from "lucide-react";

interface Farmer {
  id: string;
  business_name: string;
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
  farm_size: number;
  farm_size_unit: string;
  location_region: string;
  is_verified: boolean;
  is_certified: boolean;
  status: string;
}

export default function FarmerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchFarmerData();
    }
  }, [user]);

  const fetchFarmerData = async () => {
    try {
      // Fetch farmer profile
      const { data: farmerData, error: farmerError } = await supabase
        .from("farmers")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (farmerError && farmerError.code !== "PGRST116") {
        throw farmerError;
      }

      if (!farmerData) {
        navigate("/farmer-onboarding");
        return;
      }

      setFarmer(farmerData);

      // Fetch farms
      const { data: farmsData, error: farmsError } = await supabase
        .from("farms")
        .select("*")
        .eq("farmer_id", farmerData.id);

      if (farmsError) throw farmsError;
      setFarms(farmsData || []);
    } catch (error: any) {
      console.error("Error fetching farmer data:", error);
      toast({
        title: "Error",
        description: "Failed to load farmer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationProgress = () => {
    if (!farmer) return 0;
    let progress = 0;
    if (farmer.identity_verified) progress += 25;
    if (farmer.farm_verified) progress += 25;
    if (farmer.compliance_verified) progress += 25;
    if (farmer.admin_approved) progress += 25;
    return progress;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      verified: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
      rejected: { variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
      unverified: { variant: "outline", icon: <AlertCircle className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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

  const isCertified = farmer?.is_certified && farmer?.admin_approved;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
                {isCertified && (
                  <Badge className="bg-gold text-gold-foreground flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    CES Certified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {farmer?.business_name || "Welcome, Farmer!"}
              </p>
            </div>
            {isCertified && (
              <Button onClick={() => navigate("/farmer/create-asset")}>
                <Leaf className="w-4 h-4 mr-2" />
                Create New Asset
              </Button>
            )}
          </div>

          {/* Verification Progress */}
          {!isCertified && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verification Progress
                </CardTitle>
                <CardDescription>
                  Complete all verification steps to become a CES Certified Farmer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={getVerificationProgress()} className="h-3 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-3 rounded-lg border ${farmer?.identity_verified ? 'bg-primary/10 border-primary' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {farmer?.identity_verified ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Identity</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ID verification</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${farmer?.farm_verified ? 'bg-primary/10 border-primary' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {farmer?.farm_verified ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Farm</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Documents & GPS</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${farmer?.compliance_verified ? 'bg-primary/10 border-primary' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {farmer?.compliance_verified ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Compliance</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Quality review</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${farmer?.admin_approved ? 'bg-primary/10 border-primary' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {farmer?.admin_approved ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">Approval</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Final admin approval</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Farms</CardTitle>
                <Tractor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{farms.length}</div>
                <p className="text-xs text-muted-foreground">Registered farms</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(farmer?.verification_status || "pending")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Area</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {farms.reduce((sum, f) => sum + (f.farm_size || 0), 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">Acres</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS 0</div>
                <p className="text-xs text-muted-foreground">Total received</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="farms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="farms">My Farms</TabsTrigger>
              <TabsTrigger value="media">Farm Media</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
            </TabsList>

            <TabsContent value="farms" className="space-y-4">
              {farms.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Tractor className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No farms registered yet.</p>
                    <Button onClick={() => navigate("/farmer-onboarding")}>
                      Add Your First Farm
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {farms.map((farm) => (
                    <Card key={farm.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {farm.farm_name}
                              {farm.is_certified && (
                                <Badge className="bg-gold text-gold-foreground">
                                  <Award className="w-3 h-3 mr-1" />
                                  Certified
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {farm.location_region}
                            </CardDescription>
                          </div>
                          {getStatusBadge(farm.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="font-medium capitalize">{farm.farm_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Size</p>
                            <p className="font-medium">{farm.farm_size} {farm.farm_size_unit}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {isCertified && (
                            <Button variant="outline" size="sm" className="flex-1">
                              <Upload className="w-4 h-4 mr-1" />
                              Upload Media
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Farm Progress Media
                  </CardTitle>
                  <CardDescription>
                    Photos and videos from your farms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isCertified ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Complete verification to upload farm media
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Only CES Certified Farmers can upload farm progress updates
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No media uploaded yet</p>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First Media
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Investment Activity
                  </CardTitle>
                  <CardDescription>
                    Investments received for your farm assets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No investments received yet</p>
                  </div>
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
          name: farmer?.business_name || "Farmer",
          totalInvested: 0,
          activeAssets: farms.length,
          pendingROI: 0,
        }}
      />
    </div>
  );
}

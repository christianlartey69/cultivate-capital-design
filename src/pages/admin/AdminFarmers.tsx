import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, CheckCircle2, XCircle, Shield, Award, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Farmer {
  id: string;
  user_id: string;
  business_name: string | null;
  verification_status: string | null;
  is_certified: boolean | null;
  certification_number: string | null;
  identity_verified: boolean | null;
  farm_verified: boolean | null;
  compliance_verified: boolean | null;
  admin_approved: boolean | null;
  years_of_experience: number | null;
  created_at: string | null;
  verification_notes: string | null;
}

export default function AdminFarmers() {
  const { toast } = useToast();
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from("farmers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFarmers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load farmers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStep = async (farmerId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from("farmers")
        .update({ [field]: value })
        .eq("id", farmerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Verification step updated`,
      });
      fetchFarmers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update verification",
        variant: "destructive",
      });
    }
  };

  const approveFarmer = async (farmerId: string) => {
    try {
      const certNumber = `CES-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase
        .from("farmers")
        .update({
          admin_approved: true,
          is_certified: true,
          certification_number: certNumber,
          certification_issued_at: new Date().toISOString(),
          verification_status: "verified",
          verification_notes: verificationNotes,
        })
        .eq("id", farmerId);

      if (error) throw error;

      toast({
        title: "Farmer Certified!",
        description: `Certification number: ${certNumber}`,
      });
      setDetailsOpen(false);
      fetchFarmers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to certify farmer",
        variant: "destructive",
      });
    }
  };

  const rejectFarmer = async (farmerId: string) => {
    try {
      const { error } = await supabase
        .from("farmers")
        .update({
          verification_status: "rejected",
          verification_notes: verificationNotes,
        })
        .eq("id", farmerId);

      if (error) throw error;

      toast({
        title: "Farmer Rejected",
        description: "The farmer application has been rejected",
      });
      setDetailsOpen(false);
      fetchFarmers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject farmer",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      verified: "default",
      pending: "secondary",
      rejected: "destructive",
      unverified: "outline",
    };
    return (
      <Badge variant={variants[status || "pending"] || "secondary"}>
        {status || "pending"}
      </Badge>
    );
  };

  const filteredFarmers = farmers.filter(
    (farmer) =>
      farmer.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Farmer Management</h1>
        <p className="text-muted-foreground">Review and verify farmer applications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{farmers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {farmers.filter(f => f.verification_status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Certified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {farmers.filter(f => f.is_certified).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {farmers.filter(f => f.verification_status === "rejected").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Farmers</CardTitle>
              <CardDescription>Click to review and verify applications</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Identity</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Certified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id}>
                  <TableCell className="font-medium">{farmer.business_name || "—"}</TableCell>
                  <TableCell>{getStatusBadge(farmer.verification_status)}</TableCell>
                  <TableCell>
                    {farmer.identity_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {farmer.farm_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {farmer.compliance_verified ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    {farmer.is_certified ? (
                      <Badge className="bg-gold text-gold-foreground">
                        <Award className="w-3 h-3 mr-1" />
                        Certified
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFarmer(farmer);
                        setVerificationNotes(farmer.verification_notes || "");
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Farmer Verification Review</DialogTitle>
            <DialogDescription>
              Review and approve farmer application for {selectedFarmer?.business_name}
            </DialogDescription>
          </DialogHeader>
          {selectedFarmer && (
            <Tabs defaultValue="verification" className="space-y-4">
              <TabsList>
                <TabsTrigger value="verification">Verification Steps</TabsTrigger>
                <TabsTrigger value="details">Farmer Details</TabsTrigger>
              </TabsList>

              <TabsContent value="verification" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Identity Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={selectedFarmer.identity_verified ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => updateVerificationStep(selectedFarmer.id, "identity_verified", !selectedFarmer.identity_verified)}
                      >
                        {selectedFarmer.identity_verified ? "✓ Verified" : "Mark as Verified"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Farm Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={selectedFarmer.farm_verified ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => updateVerificationStep(selectedFarmer.id, "farm_verified", !selectedFarmer.farm_verified)}
                      >
                        {selectedFarmer.farm_verified ? "✓ Verified" : "Mark as Verified"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Compliance Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant={selectedFarmer.compliance_verified ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => updateVerificationStep(selectedFarmer.id, "compliance_verified", !selectedFarmer.compliance_verified)}
                      >
                        {selectedFarmer.compliance_verified ? "✓ Verified" : "Mark as Verified"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        CES Certification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedFarmer.is_certified ? (
                        <Badge className="bg-gold text-gold-foreground">
                          {selectedFarmer.certification_number}
                        </Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not yet certified</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <label className="text-sm font-medium">Verification Notes</label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about this farmer's verification..."
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium">{selectedFarmer.business_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="font-medium">{selectedFarmer.years_of_experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="font-medium">
                      {selectedFarmer.created_at
                        ? new Date(selectedFarmer.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedFarmer.verification_status)}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => selectedFarmer && rejectFarmer(selectedFarmer.id)}>
              Reject Application
            </Button>
            <Button
              onClick={() => selectedFarmer && approveFarmer(selectedFarmer.id)}
              disabled={
                !selectedFarmer?.identity_verified ||
                !selectedFarmer?.farm_verified ||
                !selectedFarmer?.compliance_verified
              }
            >
              <Award className="w-4 h-4 mr-2" />
              Approve & Certify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

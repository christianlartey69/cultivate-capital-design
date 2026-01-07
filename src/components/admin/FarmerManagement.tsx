import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Eye, Award } from "lucide-react";

interface Farmer {
  id: string;
  user_id: string;
  business_name: string | null;
  verification_status: string;
  is_certified: boolean;
  certification_number: string | null;
  identity_verified: boolean;
  farm_verified: boolean;
  compliance_verified: boolean;
  admin_approved: boolean;
  verification_notes: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    id_type: string | null;
    id_number: string | null;
  };
}

interface FarmerManagementProps {
  farmers: Farmer[];
  onRefresh: () => void;
}

export default function FarmerManagement({ farmers, onRefresh }: FarmerManagementProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const updateVerification = async (
    farmerId: string,
    field: string,
    value: boolean,
    additionalNotes?: string
  ) => {
    setProcessing(farmerId);
    try {
      const updateData: Record<string, any> = { [field]: value };
      
      if (additionalNotes) {
        updateData.verification_notes = additionalNotes;
      }

      // Calculate new status
      const farmer = farmers.find(f => f.id === farmerId);
      if (farmer) {
        const newState = { ...farmer, [field]: value };
        
        if (newState.identity_verified && newState.farm_verified && newState.compliance_verified && newState.admin_approved) {
          updateData.verification_status = "fully_verified";
        } else if (newState.identity_verified || newState.farm_verified) {
          updateData.verification_status = "partially_verified";
        }
      }

      const { error } = await supabase
        .from("farmers")
        .update(updateData)
        .eq("id", farmerId);

      if (error) throw error;

      toast({ title: "Verification updated" });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const certifyFarmer = async (farmerId: string) => {
    setProcessing(farmerId);
    try {
      const certNumber = `CES-F-${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase
        .from("farmers")
        .update({
          is_certified: true,
          certification_number: certNumber,
          certification_issued_at: new Date().toISOString(),
          certification_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          verification_status: "fully_verified",
        })
        .eq("id", farmerId);

      if (error) throw error;

      toast({ title: "Farmer Certified!", description: `Certification: ${certNumber}` });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  };

  const rejectFarmer = async (farmerId: string, reason: string) => {
    setProcessing(farmerId);
    try {
      const { error } = await supabase
        .from("farmers")
        .update({
          verification_status: "rejected",
          verification_notes: reason,
        })
        .eq("id", farmerId);

      if (error) throw error;

      toast({ title: "Farmer application rejected" });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(null);
      setNotes("");
    }
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

  const pendingFarmers = farmers.filter(f => ["pending", "unverified", "partially_verified"].includes(f.verification_status));
  const verifiedFarmers = farmers.filter(f => f.verification_status === "fully_verified");
  const rejectedFarmers = farmers.filter(f => f.verification_status === "rejected");

  return (
    <Tabs defaultValue="pending" className="space-y-4">
      <TabsList>
        <TabsTrigger value="pending">Pending ({pendingFarmers.length})</TabsTrigger>
        <TabsTrigger value="verified">Verified ({verifiedFarmers.length})</TabsTrigger>
        <TabsTrigger value="rejected">Rejected ({rejectedFarmers.length})</TabsTrigger>
      </TabsList>

      {["pending", "verified", "rejected"].map((tab) => (
        <TabsContent key={tab} value={tab}>
          <Card>
            <CardHeader>
              <CardTitle className="capitalize">{tab} Farmers</CardTitle>
              <CardDescription>
                {tab === "pending" && "Review and verify farmer applications"}
                {tab === "verified" && "Certified CES farmers"}
                {tab === "rejected" && "Rejected farmer applications"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>ID Verified</TableHead>
                    <TableHead>Farm Verified</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tab === "pending" ? pendingFarmers : tab === "verified" ? verifiedFarmers : rejectedFarmers).map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{farmer.profiles?.full_name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{farmer.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{farmer.business_name || "—"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={farmer.identity_verified ? "default" : "outline"}
                          onClick={() => updateVerification(farmer.id, "identity_verified", !farmer.identity_verified)}
                          disabled={processing === farmer.id}
                        >
                          {farmer.identity_verified ? <CheckCircle2 className="w-4 h-4" /> : "Verify"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={farmer.farm_verified ? "default" : "outline"}
                          onClick={() => updateVerification(farmer.id, "farm_verified", !farmer.farm_verified)}
                          disabled={processing === farmer.id}
                        >
                          {farmer.farm_verified ? <CheckCircle2 className="w-4 h-4" /> : "Verify"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={farmer.compliance_verified ? "default" : "outline"}
                          onClick={() => updateVerification(farmer.id, "compliance_verified", !farmer.compliance_verified)}
                          disabled={processing === farmer.id}
                        >
                          {farmer.compliance_verified ? <CheckCircle2 className="w-4 h-4" /> : "Verify"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {farmer.is_certified ? (
                          <Badge className="bg-harvest text-white">
                            <Award className="w-3 h-3 mr-1" />
                            Certified
                          </Badge>
                        ) : (
                          getStatusBadge(farmer.verification_status)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {farmer.identity_verified && farmer.farm_verified && farmer.compliance_verified && !farmer.is_certified && (
                            <Button
                              size="sm"
                              onClick={() => certifyFarmer(farmer.id)}
                              disabled={processing === farmer.id}
                              className="bg-harvest hover:bg-harvest/90"
                            >
                              {processing === farmer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Award className="w-3 h-3 mr-1" />}
                              Certify
                            </Button>
                          )}
                          
                          {!farmer.is_certified && farmer.verification_status !== "rejected" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Farmer Application</DialogTitle>
                                  <DialogDescription>
                                    Provide a reason for rejection
                                  </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Enter rejection reason..."
                                />
                                <Button
                                  variant="destructive"
                                  onClick={() => rejectFarmer(farmer.id, notes)}
                                  disabled={!notes}
                                >
                                  Reject Application
                                </Button>
                              </DialogContent>
                            </Dialog>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Farmer Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {farmer.profiles?.full_name}</p>
                                <p><strong>Email:</strong> {farmer.profiles?.email}</p>
                                <p><strong>Business:</strong> {farmer.business_name || "—"}</p>
                                <p><strong>ID Type:</strong> {farmer.profiles?.id_type}</p>
                                <p><strong>ID Number:</strong> {farmer.profiles?.id_number}</p>
                                <p><strong>Status:</strong> {farmer.verification_status}</p>
                                {farmer.certification_number && (
                                  <p><strong>Certification:</strong> {farmer.certification_number}</p>
                                )}
                                {farmer.verification_notes && (
                                  <p><strong>Notes:</strong> {farmer.verification_notes}</p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(tab === "pending" ? pendingFarmers : tab === "verified" ? verifiedFarmers : rejectedFarmers).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No {tab} farmers
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

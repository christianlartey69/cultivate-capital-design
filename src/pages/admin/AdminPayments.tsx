import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Search, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard,
  Smartphone,
  Building2,
  MapPin,
  DollarSign,
  Users,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  investor_id: string;
  package_id: string | null;
  amount: number;
  method: string;
  status: string;
  currency: string;
  momo_number: string | null;
  momo_provider: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  transaction_reference: string | null;
  admin_notes: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  profiles?: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
  investment_packages?: {
    name: string;
  };
}

const AdminPayments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles:investor_id (
            full_name,
            email,
            phone
          ),
          investment_packages:package_id (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes || selectedPayment?.admin_notes,
      };

      if (newStatus === "verified") {
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.id;
      }

      const { error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Payment ${newStatus === "verified" ? "approved" : "rejected"} successfully`,
      });

      setIsDialogOpen(false);
      setSelectedPayment(null);
      setAdminNotes("");
      fetchPayments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "momo":
        return <Smartphone className="w-4 h-4 text-gold" />;
      case "bank":
        return <Building2 className="w-4 h-4 text-sky" />;
      case "in_person":
        return <MapPin className="w-4 h-4 text-earth" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "momo":
        return "Mobile Money";
      case "bank":
        return "Bank Transfer";
      case "in_person":
        return "In-Person";
      default:
        return method;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      payment.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      payment.profiles?.email?.toLowerCase().includes(searchLower) ||
      payment.transaction_reference?.toLowerCase().includes(searchLower) ||
      payment.investment_packages?.name?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === "pending").length,
    pendingAmount: payments
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    approvedAmount: payments
      .filter(p => p.status === "verified")
      .reduce((sum, p) => sum + Number(p.amount), 0),
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Payment Management</h1>
            <p className="text-muted-foreground mt-1">Review and process investor payments</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-warning/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Amount</p>
                    <p className="text-2xl font-bold">GHS {stats.pendingAmount.toLocaleString()}</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved Total</p>
                    <p className="text-2xl font-bold text-primary">GHS {stats.approvedAmount.toLocaleString()}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="momo">Mobile Money</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                {filteredPayments.length} payment(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.profiles?.full_name || "N/A"}</p>
                            <p className="text-sm text-muted-foreground">{payment.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{payment.investment_packages?.name || "N/A"}</TableCell>
                        <TableCell className="font-bold">
                          GHS {Number(payment.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(payment.method)}
                            <span className="text-sm">{getMethodLabel(payment.method)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {payment.transaction_reference || "N/A"}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setAdminNotes(payment.admin_notes || "");
                              setIsDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Payment Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Review and process this payment
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-6">
                {/* Investor Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Investor Name</Label>
                    <p className="font-medium">{selectedPayment.profiles?.full_name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedPayment.profiles?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Package</Label>
                    <p className="font-medium">{selectedPayment.investment_packages?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-bold text-lg text-primary">
                      GHS {Number(selectedPayment.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Method Details */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 font-medium">
                    {getMethodIcon(selectedPayment.method)}
                    {getMethodLabel(selectedPayment.method)}
                  </div>
                  
                  {selectedPayment.method === "momo" && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Network</Label>
                          <p>{selectedPayment.momo_provider || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Mobile Number</Label>
                          <p>{selectedPayment.momo_number || "N/A"}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {selectedPayment.method === "bank" && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Bank Name</Label>
                          <p>{selectedPayment.bank_name || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Account Number</Label>
                          <p>{selectedPayment.bank_account_number || "N/A"}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="text-sm">
                    <Label className="text-muted-foreground">Transaction Reference</Label>
                    <p className="font-mono">{selectedPayment.transaction_reference || "N/A"}</p>
                  </div>
                  
                  <div className="text-sm">
                    <Label className="text-muted-foreground">Submitted</Label>
                    <p>{format(new Date(selectedPayment.created_at), "MMMM dd, yyyy 'at' hh:mm a")}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="admin-notes">Admin Notes</Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add notes about this payment (optional)..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Current Status */}
                <div className="flex items-center gap-2">
                  <Label>Current Status:</Label>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              {selectedPayment?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updatePaymentStatus(selectedPayment.id, "rejected")}
                    disabled={isProcessing}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                    Reject
                  </Button>
                  <Button
                    onClick={() => updatePaymentStatus(selectedPayment.id, "verified")}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Approve Payment
                  </Button>
                </>
              )}
              {selectedPayment?.status !== "pending" && (
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminPayments;

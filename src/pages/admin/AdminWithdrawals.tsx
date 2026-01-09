import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Search, CheckCircle2, XCircle, Wallet, Loader2, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  currency: string | null;
  payout_method: string;
  momo_provider: string | null;
  momo_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  status: string | null;
  admin_notes: string | null;
  transaction_reference: string | null;
  created_at: string | null;
  paid_at: string | null;
}

export default function AdminWithdrawals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string) => {
    setProcessing(true);
    try {
      const updateData: any = {
        status,
        admin_notes: adminNotes,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

      if (status === "paid") {
        updateData.transaction_reference = transactionRef;
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Withdrawal ${status === "paid" ? "marked as paid" : status}`,
      });
      setDialogOpen(false);
      fetchWithdrawals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update withdrawal",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      approved: { variant: "outline", icon: <CheckCircle2 className="w-3 h-3" /> },
      paid: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
      failed: { variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
    };
    const statusConfig = config[status || "pending"] || config.pending;
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        {statusConfig.icon}
        {status || "pending"}
      </Badge>
    );
  };

  const totalPending = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const totalPaid = withdrawals.filter(w => w.status === "paid").reduce((sum, w) => sum + w.amount, 0);

  const filteredWithdrawals = withdrawals.filter(
    (w) =>
      w.momo_number?.includes(searchTerm) ||
      w.bank_account_number?.includes(searchTerm) ||
      w.transaction_reference?.includes(searchTerm)
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
        <h1 className="text-3xl font-bold">Withdrawal Management</h1>
        <p className="text-muted-foreground">Process and track ROI withdrawal requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{withdrawals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {withdrawals.filter(w => w.status === "pending").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">GHS {totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">GHS {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Review and process payment requests</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by number or ref..."
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
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {withdrawal.created_at
                      ? new Date(withdrawal.created_at).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {withdrawal.currency || "GHS"} {withdrawal.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {withdrawal.payout_method === "momo" ? "Mobile Money" : "Bank Transfer"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {withdrawal.payout_method === "momo" ? (
                      <div>
                        <p className="text-sm">{withdrawal.momo_provider}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.momo_number}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm">{withdrawal.bank_name}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.bank_account_number}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {withdrawal.transaction_reference || "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedWithdrawal(withdrawal);
                        setAdminNotes(withdrawal.admin_notes || "");
                        setTransactionRef(withdrawal.transaction_reference || "");
                        setDialogOpen(true);
                      }}
                    >
                      <Wallet className="w-4 h-4 mr-1" />
                      Process
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Withdrawal</DialogTitle>
            <DialogDescription>
              Review and approve payment for this withdrawal request
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold">
                      {selectedWithdrawal.currency || "GHS"} {selectedWithdrawal.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <p className="font-medium">
                      {selectedWithdrawal.payout_method === "momo" ? "Mobile Money" : "Bank Transfer"}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Payment Details</p>
                  {selectedWithdrawal.payout_method === "momo" ? (
                    <p className="font-medium">
                      {selectedWithdrawal.momo_provider} - {selectedWithdrawal.momo_number}
                    </p>
                  ) : (
                    <p className="font-medium">
                      {selectedWithdrawal.bank_name} - {selectedWithdrawal.bank_account_number} ({selectedWithdrawal.bank_account_name})
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Transaction Reference</label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter payment reference..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedWithdrawal && updateWithdrawalStatus(selectedWithdrawal.id, "rejected")}
              disabled={processing}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedWithdrawal && updateWithdrawalStatus(selectedWithdrawal.id, "failed")}
              disabled={processing}
            >
              Mark Failed
            </Button>
            <Button
              onClick={() => selectedWithdrawal && updateWithdrawalStatus(selectedWithdrawal.id, "paid")}
              disabled={processing || !transactionRef}
            >
              {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

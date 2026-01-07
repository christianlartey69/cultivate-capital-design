import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Eye } from "lucide-react";

interface Withdrawal {
  id: string;
  amount: number;
  payout_method: string;
  momo_provider: string | null;
  momo_number: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  transaction_reference: string | null;
  profiles?: {
    full_name: string | null;
    email: string;
  };
}

interface WithdrawalManagementProps {
  withdrawals: Withdrawal[];
  onRefresh: () => void;
}

export default function WithdrawalManagement({ withdrawals, onRefresh }: WithdrawalManagementProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [transactionRef, setTransactionRef] = useState("");

  const updateStatus = async (id: string, status: string, notes?: string, txRef?: string) => {
    setProcessing(id);
    try {
      const updateData: Record<string, any> = {
        status,
        reviewed_at: new Date().toISOString(),
      };

      if (notes) updateData.admin_notes = notes;
      if (txRef) updateData.transaction_reference = txRef;
      if (status === "paid") updateData.paid_at = new Date().toISOString();

      const { error } = await supabase
        .from("withdrawal_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Withdrawal marked as ${status}`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
      setSelectedWithdrawal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "outline",
      processing: "outline",
      paid: "default",
      failed: "destructive",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
        <CardDescription>Manage user withdrawal requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{w.profiles?.full_name || "—"}</p>
                    <p className="text-sm text-muted-foreground">{w.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="font-medium">GHS {w.amount.toLocaleString()}</TableCell>
                <TableCell className="capitalize">{w.payout_method}</TableCell>
                <TableCell>
                  {w.payout_method === "momo" ? (
                    <span>{w.momo_provider} - {w.momo_number}</span>
                  ) : (
                    <span>{w.bank_name} - ****{w.bank_account_number?.slice(-4)}</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(w.status)}</TableCell>
                <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {w.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(w.id, "approved")}
                          disabled={processing === w.id}
                        >
                          {processing === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(w.id, "cancelled")}
                          disabled={processing === w.id}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {w.status === "approved" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedWithdrawal(w)}>
                            Mark Paid
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Payment</DialogTitle>
                            <DialogDescription>
                              Mark withdrawal of GHS {w.amount.toLocaleString()} as paid
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Transaction Reference</label>
                              <Input
                                value={transactionRef}
                                onChange={(e) => setTransactionRef(e.target.value)}
                                placeholder="Enter transaction ID"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Notes</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Optional notes"
                              />
                            </div>
                            <Button
                              onClick={() => updateStatus(w.id, "paid", adminNotes, transactionRef)}
                              disabled={!transactionRef}
                              className="w-full"
                            >
                              Confirm Payment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Withdrawal Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 text-sm">
                          <p><strong>Amount:</strong> GHS {w.amount.toLocaleString()}</p>
                          <p><strong>Method:</strong> {w.payout_method}</p>
                          {w.payout_method === "momo" ? (
                            <>
                              <p><strong>Provider:</strong> {w.momo_provider}</p>
                              <p><strong>Number:</strong> {w.momo_number}</p>
                            </>
                          ) : (
                            <>
                              <p><strong>Bank:</strong> {w.bank_name}</p>
                              <p><strong>Account:</strong> {w.bank_account_number}</p>
                            </>
                          )}
                          <p><strong>Status:</strong> {w.status}</p>
                          {w.transaction_reference && (
                            <p><strong>Tx Ref:</strong> {w.transaction_reference}</p>
                          )}
                          {w.admin_notes && (
                            <p><strong>Notes:</strong> {w.admin_notes}</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {withdrawals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No withdrawal requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

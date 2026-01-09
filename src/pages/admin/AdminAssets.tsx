import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Edit, Loader2, Copy } from "lucide-react";
import { format } from "date-fns";

const AdminAssets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    asset_name: "",
    asset_type: "",
    investor_id: "",
    package_id: "",
    purchase_amount: 0,
    farm_location: "",
    expected_end_date: "",
    status: "active",
    current_phase: "initial",
  });

  const { data: assets, isLoading } = useQuery({
    queryKey: ["admin-assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select(`
          *,
          profiles:investor_id (full_name, email),
          investment_packages:package_id (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: investors } = useQuery({
    queryKey: ["investors-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: packages } = useQuery({
    queryKey: ["packages-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_packages")
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const generateTagId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CES-${year}-${random}`;
  };

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("assets").insert({
        ...data,
        unique_tag_id: generateTagId(),
        expected_end_date: new Date(data.expected_end_date).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      toast({ title: "Asset created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating asset", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const updateData = {
        ...data,
        expected_end_date: data.expected_end_date ? new Date(data.expected_end_date).toISOString() : undefined,
      };
      const { error } = await supabase.from("assets").update(updateData).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      toast({ title: "Asset updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating asset", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      asset_name: "",
      asset_type: "",
      investor_id: "",
      package_id: "",
      purchase_amount: 0,
      farm_location: "",
      expected_end_date: "",
      status: "active",
      current_phase: "initial",
    });
    setEditingId(null);
  };

  const handleEdit = (asset: NonNullable<typeof assets>[0]) => {
    setFormData({
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      investor_id: asset.investor_id,
      package_id: asset.package_id,
      purchase_amount: asset.purchase_amount,
      farm_location: asset.farm_location || "",
      expected_end_date: asset.expected_end_date ? format(new Date(asset.expected_end_date), "yyyy-MM-dd") : "",
      status: asset.status || "active",
      current_phase: asset.current_phase || "initial",
    });
    setEditingId(asset.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const copyTagId = (tagId: string) => {
    navigator.clipboard.writeText(tagId);
    toast({ title: "Copied!", description: tagId });
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "pending": return "outline";
      default: return "secondary";
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold">Assets Management</h1>
              <p className="text-muted-foreground">Manage investor assets and assign Tag IDs</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Asset" : "Create New Asset"}</DialogTitle>
                  <DialogDescription>
                    {editingId ? "Update asset details" : "Assign a new asset to an investor"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="asset_name">Asset Name</Label>
                        <Input
                          id="asset_name"
                          value={formData.asset_name}
                          onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                          placeholder="e.g., Maize Plot A-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="asset_type">Asset Type</Label>
                        <Input
                          id="asset_type"
                          value={formData.asset_type}
                          onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                          placeholder="e.g., Maize, Poultry, Pig"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="investor_id">Investor</Label>
                        <Select
                          value={formData.investor_id}
                          onValueChange={(value) => setFormData({ ...formData, investor_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select investor" />
                          </SelectTrigger>
                          <SelectContent>
                            {investors?.map((inv) => (
                              <SelectItem key={inv.id} value={inv.id}>
                                {inv.full_name || inv.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="package_id">Package</Label>
                        <Select
                          value={formData.package_id}
                          onValueChange={(value) => setFormData({ ...formData, package_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages?.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchase_amount">Amount (GHS)</Label>
                        <Input
                          id="purchase_amount"
                          type="number"
                          value={formData.purchase_amount}
                          onChange={(e) => setFormData({ ...formData, purchase_amount: Number(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="farm_location">Farm Location</Label>
                        <Input
                          id="farm_location"
                          value={formData.farm_location}
                          onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                          placeholder="e.g., Kumasi, Ashanti Region"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expected_end_date">Expected End Date</Label>
                        <Input
                          id="expected_end_date"
                          type="date"
                          value={formData.expected_end_date}
                          onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_phase">Current Phase</Label>
                        <Select
                          value={formData.current_phase}
                          onValueChange={(value) => setFormData({ ...formData, current_phase: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="initial">Initial</SelectItem>
                            <SelectItem value="planting">Planting</SelectItem>
                            <SelectItem value="growing">Growing</SelectItem>
                            <SelectItem value="harvest">Harvest</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingId ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                All Assets
              </CardTitle>
              <CardDescription>
                {assets?.length || 0} assets in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag ID</TableHead>
                      <TableHead>Asset Name</TableHead>
                      <TableHead>Investor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets?.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell>
                          <button
                            onClick={() => copyTagId(asset.unique_tag_id)}
                            className="flex items-center gap-1 text-sm font-mono hover:text-primary"
                          >
                            {asset.unique_tag_id}
                            <Copy className="h-3 w-3" />
                          </button>
                        </TableCell>
                        <TableCell className="font-medium">{asset.asset_name}</TableCell>
                        <TableCell>{asset.profiles?.full_name || asset.profiles?.email}</TableCell>
                        <TableCell>GHS {asset.purchase_amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{asset.current_phase}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminAssets;

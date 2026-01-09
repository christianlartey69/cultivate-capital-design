import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface PackageFormData {
  name: string;
  description: string;
  business_type: string;
  min_investment: number;
  duration_months: number;
  expected_roi_min: number;
  expected_roi_max: number;
  is_active: boolean;
  image_url: string;
}

const emptyPackage: PackageFormData = {
  name: "",
  description: "",
  business_type: "",
  min_investment: 0,
  duration_months: 12,
  expected_roi_min: 0,
  expected_roi_max: 0,
  is_active: true,
  image_url: "",
};

const AdminPackages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(emptyPackage);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investment_packages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PackageFormData) => {
      const { error } = await supabase.from("investment_packages").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({ title: "Package created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating package", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PackageFormData }) => {
      const { error } = await supabase.from("investment_packages").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({ title: "Package updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating package", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("investment_packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({ title: "Package deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting package", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(emptyPackage);
    setEditingId(null);
  };

  const handleEdit = (pkg: typeof packages extends (infer T)[] ? T : never) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      business_type: pkg.business_type,
      min_investment: pkg.min_investment,
      duration_months: pkg.duration_months,
      expected_roi_min: pkg.expected_roi_min,
      expected_roi_max: pkg.expected_roi_max,
      is_active: pkg.is_active ?? true,
      image_url: pkg.image_url || "",
    });
    setEditingId(pkg.id);
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-heading font-bold">Investment Packages</h1>
              <p className="text-muted-foreground">Manage farm investment packages (GHS)</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Package" : "Create New Package"}</DialogTitle>
                  <DialogDescription>
                    {editingId ? "Update the investment package details" : "Add a new investment package to the platform"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Package Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Premium Maize Farm"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business_type">Business Type</Label>
                        <Input
                          id="business_type"
                          value={formData.business_type}
                          onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                          placeholder="e.g., Maize Farming"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the investment opportunity..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_investment">Min. Investment (GHS)</Label>
                        <Input
                          id="min_investment"
                          type="number"
                          value={formData.min_investment}
                          onChange={(e) => setFormData({ ...formData, min_investment: Number(e.target.value) })}
                          min={0}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration_months">Duration (Months)</Label>
                        <Input
                          id="duration_months"
                          type="number"
                          value={formData.duration_months}
                          onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
                          min={1}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expected_roi_min">Min ROI (%)</Label>
                        <Input
                          id="expected_roi_min"
                          type="number"
                          value={formData.expected_roi_min}
                          onChange={(e) => setFormData({ ...formData, expected_roi_min: Number(e.target.value) })}
                          min={0}
                          step={0.1}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expected_roi_max">Max ROI (%)</Label>
                        <Input
                          id="expected_roi_max"
                          type="number"
                          value={formData.expected_roi_max}
                          onChange={(e) => setFormData({ ...formData, expected_roi_max: Number(e.target.value) })}
                          min={0}
                          step={0.1}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active (visible to investors)</Label>
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
                <Package className="h-5 w-5" />
                All Packages
              </CardTitle>
              <CardDescription>
                {packages?.length || 0} investment packages configured
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
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Min. Investment</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>ROI Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages?.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.name}</TableCell>
                        <TableCell>{pkg.business_type}</TableCell>
                        <TableCell>GHS {pkg.min_investment.toLocaleString()}</TableCell>
                        <TableCell>{pkg.duration_months} months</TableCell>
                        <TableCell>{pkg.expected_roi_min}% - {pkg.expected_roi_max}%</TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(pkg)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this package?")) {
                                deleteMutation.mutate(pkg.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

export default AdminPackages;

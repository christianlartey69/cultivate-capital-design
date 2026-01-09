import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle2, XCircle, Calendar, Loader2, Clock, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FarmVisit {
  id: string;
  investor_id: string;
  asset_id: string | null;
  visit_date: string;
  visit_time: string;
  number_of_guests: number | null;
  special_requests: string | null;
  status: string | null;
  confirmation_sent: boolean | null;
  created_at: string | null;
}

export default function AdminVisits() {
  const { toast } = useToast();
  const [visits, setVisits] = useState<FarmVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisit, setSelectedVisit] = useState<FarmVisit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from("farm_visits")
        .select("*")
        .order("visit_date", { ascending: true });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load farm visits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("farm_visits")
        .update({ 
          status,
          confirmation_sent: status === "approved" ? true : false 
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Visit ${status}`,
      });
      setDialogOpen(false);
      fetchVisits();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update visit",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="w-3 h-3" /> },
      approved: { variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="w-3 h-3" /> },
      completed: { variant: "outline", icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const statusConfig = config[status || "pending"] || config.pending;
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        {statusConfig.icon}
        {status || "pending"}
      </Badge>
    );
  };

  const upcomingVisits = visits.filter(v => v.status === "approved" && new Date(v.visit_date) >= new Date());
  const pendingVisits = visits.filter(v => v.status === "pending");

  const filteredVisits = visits.filter(
    (v) => v.visit_date.includes(searchTerm)
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
        <h1 className="text-3xl font-bold">Farm Visit Management</h1>
        <p className="text-muted-foreground">Manage and approve farm visit requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{visits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{pendingVisits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{upcomingVisits.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {upcomingVisits.reduce((sum, v) => sum + (v.number_of_guests || 1), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Visit Requests</CardTitle>
              <CardDescription>Review and manage farm visit bookings</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by date..."
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
                <TableHead>Time</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confirmed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell className="font-medium">
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{visit.visit_time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {visit.number_of_guests || 1}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(visit.status)}</TableCell>
                  <TableCell>
                    {visit.confirmation_sent ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedVisit(visit);
                        setDialogOpen(true);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      Manage
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
            <DialogTitle>Manage Farm Visit</DialogTitle>
            <DialogDescription>
              Review and respond to this visit request
            </DialogDescription>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Date</p>
                    <p className="font-medium">
                      {new Date(selectedVisit.visit_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{selectedVisit.visit_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Number of Guests</p>
                    <p className="font-medium">{selectedVisit.number_of_guests || 1}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedVisit.status)}
                  </div>
                </div>
                {selectedVisit.special_requests && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                    <p className="text-sm">{selectedVisit.special_requests}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={() => selectedVisit && updateVisitStatus(selectedVisit.id, "rejected")}
            >
              Reject
            </Button>
            <Button
              onClick={() => selectedVisit && updateVisitStatus(selectedVisit.id, "approved")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve & Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Video, Trash2, Play, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FarmMedia {
  id: string;
  farm_id: string;
  media_type: string;
  media_url: string;
  title: string | null;
  description: string | null;
  is_progress_update: boolean | null;
  release_date: string | null;
  created_at: string | null;
}

interface Farm {
  id: string;
  farm_name: string;
}

export default function AdminMedia() {
  const { toast } = useToast();
  const [media, setMedia] = useState<FarmMedia[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Upload form state
  const [selectedFarm, setSelectedFarm] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mediaRes, farmsRes] = await Promise.all([
        supabase.from("farm_media").select("*").order("created_at", { ascending: false }),
        supabase.from("farms").select("id, farm_name"),
      ]);

      if (mediaRes.error) throw mediaRes.error;
      if (farmsRes.error) throw farmsRes.error;

      setMedia(mediaRes.data || []);
      setFarms(farmsRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedFarm) {
      toast({
        title: "Error",
        description: "Please select a farm and file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `farm-media/${selectedFarm}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Create media record
      const { error: insertError } = await supabase
        .from("farm_media")
        .insert({
          farm_id: selectedFarm,
          media_type: mediaType,
          media_url: urlData.publicUrl,
          title,
          description,
          is_progress_update: true,
          release_date: releaseDate || null,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setReleaseDate("");
      setSelectedFarm("");
      setFile(null);
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const { error } = await supabase
        .from("farm_media")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Media removed successfully",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const getFarmName = (farmId: string) => {
    return farms.find(f => f.id === farmId)?.farm_name || "Unknown Farm";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Farm Media</h1>
          <p className="text-muted-foreground">Upload and manage farm progress videos and photos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Farm Media</DialogTitle>
              <DialogDescription>
                Upload progress videos or photos for farm assets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Farm *</Label>
                <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.farm_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Media Type</Label>
                <Select value={mediaType} onValueChange={setMediaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 12 Progress Update"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the update..."
                />
              </div>

              <div>
                <Label>Release Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Schedule release for a future date, or leave empty for immediate release
                </p>
              </div>

              <div>
                <Label>File *</Label>
                <Input
                  type="file"
                  accept={mediaType === "video" ? "video/*" : "image/*"}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button onClick={handleUpload} className="w-full" disabled={uploading}>
                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No media uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          media.map((item) => (
            <Card key={item.id}>
              <div className="aspect-video bg-muted relative">
                {item.media_type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white bg-black/50 rounded-full p-3" />
                  </div>
                ) : (
                  <img
                    src={item.media_url}
                    alt={item.title || "Farm media"}
                    className="w-full h-full object-cover"
                  />
                )}
                {item.media_type === "video" && (
                  <video src={item.media_url} className="w-full h-full object-cover" />
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.title || "Untitled"}</CardTitle>
                <CardDescription>{getFarmName(item.farm_id)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {item.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteMedia(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

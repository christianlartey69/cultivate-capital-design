import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CalendarDays, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft,
  Leaf,
  Sun
} from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";

interface Asset {
  id: string;
  asset_name: string;
  unique_tag_id: string;
  farm_location: string | null;
}

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export default function FarmVisitBooking() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [guestCount, setGuestCount] = useState<string>("1");
  const [location, setLocation] = useState("Kade, Eastern Region");
  const [specialRequests, setSpecialRequests] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    date: string;
    time: string;
    guests: number;
    location: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/investor/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("assets")
          .select("id, asset_name, unique_tag_id, farm_location")
          .eq("investor_id", user.id)
          .eq("status", "active");

        if (error) throw error;
        setAssets(data || []);
        
        // Set default location if asset has one
        if (data && data.length > 0 && data[0].farm_location) {
          setLocation(data[0].farm_location);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [user]);

  const handleAssetChange = (assetId: string) => {
    setSelectedAsset(assetId);
    const asset = assets.find(a => a.id === assetId);
    if (asset?.farm_location) {
      setLocation(asset.farm_location);
    }
  };

  const handleBookingSubmit = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both a date and time for your visit",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setBookingDetails({
      date: format(selectedDate, "EEEE, MMMM dd, yyyy"),
      time: selectedTime,
      guests: parseInt(guestCount),
      location,
    });
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    if (!user || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("farm_visits").insert({
        investor_id: user.id,
        asset_id: selectedAsset || null,
        visit_date: format(selectedDate, "yyyy-MM-dd"),
        visit_time: selectedTime,
        number_of_guests: parseInt(guestCount),
        special_requests: specialRequests || null,
        status: "pending",
        confirmation_sent: false,
      });

      if (error) throw error;

      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to book farm visit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const disabledDays = (date: Date) => {
    // Disable past dates and dates within 2 days from today
    const minDate = addDays(startOfToday(), 2);
    return isBefore(date, minDate);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Card className="border-primary/20">
            <CardContent className="pt-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Visit Booked!
                </h2>
                <p className="text-muted-foreground">
                  Your farm visit has been scheduled successfully.
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-left space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{bookingDetails?.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{bookingDetails?.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <p className="font-medium">{bookingDetails?.guests} guest(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{bookingDetails?.location}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gold/10 p-4 rounded-lg text-sm">
                <p className="text-earth font-medium">What happens next?</p>
                <p className="text-muted-foreground mt-1">
                  You'll receive a confirmation email within 24 hours. Our team will reach out to finalize the visit details.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowSuccess(false);
                    setSelectedDate(undefined);
                    setSelectedTime("");
                    setGuestCount("1");
                    setSpecialRequests("");
                  }}
                >
                  Book Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
            <Leaf className="w-8 h-8 text-primary" />
            Book a Farm Visit
          </h1>
          <p className="text-muted-foreground">
            Experience your investment firsthand. Visit our farms and see your assets in action.
          </p>
        </div>

        {/* Farm Visit Banner Image */}
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8">
          <img
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=400&fit=crop"
            alt="African farmers in field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-foreground font-heading text-lg md:text-xl">
              Visit our farms in Kade, Eastern Region
            </p>
            <p className="text-muted-foreground text-sm">
              Meet our farmers and witness sustainable agriculture
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Select a Date
              </CardTitle>
              <CardDescription>
                Choose your preferred visit date (at least 2 days in advance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={disabledDays}
                className="rounded-md border pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-gold" />
                Visit Details
              </CardTitle>
              <CardDescription>
                Complete your booking information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Asset Selection (Optional) */}
              {assets.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Asset to Visit (Optional)</Label>
                  <Select value={selectedAsset} onValueChange={handleAssetChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">General Farm Tour</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.asset_name} ({asset.unique_tag_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select Time *
                </Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} {parseInt(time) < 12 ? "AM" : "PM"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Guest Count */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Number of Guests *
                </Label>
                <Select value={guestCount} onValueChange={setGuestCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest (Just me)</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5 Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Farm Location
                </Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kade, Eastern Region"
                />
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label>Special Requests (Optional)</Label>
                <Textarea
                  placeholder="Any special requirements or requests..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Date</p>
                  <p className="font-bold text-lg">{format(selectedDate, "EEEE, MMMM dd, yyyy")}</p>
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBookingSubmit}
                disabled={!selectedDate || !selectedTime}
              >
                <CalendarDays className="w-5 h-5 mr-2" />
                Book Farm Visit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Farm Visit Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Farm Tour</h4>
                  <p className="text-sm text-muted-foreground">
                    Walk through the farm and see your investment growing in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-medium">Meet the Farmers</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with the hardworking farmers managing your assets
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-earth/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sun className="w-5 h-5 text-earth" />
                </div>
                <div>
                  <h4 className="font-medium">Progress Updates</h4>
                  <p className="text-sm text-muted-foreground">
                    Get firsthand updates on growth progress and expected yields
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Please review your farm visit details before confirming
            </DialogDescription>
          </DialogHeader>
          
          {bookingDetails && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{bookingDetails.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{bookingDetails.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{bookingDetails.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{bookingDetails.location}</span>
                </div>
              </div>

              {specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Special Requests:</p>
                  <p className="text-sm bg-muted p-2 rounded">{specialRequests}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Go Back
            </Button>
            <Button onClick={confirmBooking} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

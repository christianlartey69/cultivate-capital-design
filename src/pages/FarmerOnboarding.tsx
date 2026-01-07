import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Upload, Shield, User, Phone, MapPin, Tractor, FileText, CheckCircle } from "lucide-react";

const farmerSchema = z.object({
  // Personal
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  primary_phone: z.string().min(10, "Valid phone number required"),
  
  // Business
  business_name: z.string().optional(),
  business_registration_number: z.string().optional(),
  years_of_experience: z.string().optional(),
  
  // ID
  id_type: z.string().min(1, "ID type is required"),
  id_number: z.string().min(5, "ID number is required"),
  
  // Farm Details
  farm_name: z.string().min(2, "Farm name is required"),
  farm_type: z.string().min(1, "Farm type is required"),
  farm_size: z.string().optional(),
  location_address: z.string().min(10, "Farm address required"),
  location_city: z.string().min(2, "City is required"),
  location_region: z.string().min(2, "Region is required"),
  gps_latitude: z.string().optional(),
  gps_longitude: z.string().optional(),
  main_crops: z.string().optional(),
  livestock_types: z.string().optional(),
  
  // Terms
  terms_accepted: z.boolean().refine((val) => val === true, "You must accept the terms"),
});

type FarmerForm = z.infer<typeof farmerSchema>;

export default function FarmerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FarmerForm>({
    resolver: zodResolver(farmerSchema),
  });

  const progress = (currentStep / totalSteps) * 100;

  const onSubmit = async (data: FarmerForm) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      await supabase.from("profiles").update({
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        primary_phone: data.primary_phone,
        id_type: data.id_type,
        id_number: data.id_number,
        onboarding_completed: true,
      }).eq("id", user.id);

      // Create farmer profile
      const { data: farmerData, error: farmerError } = await supabase
        .from("farmers")
        .insert({
          user_id: user.id,
          business_name: data.business_name,
          business_registration_number: data.business_registration_number,
          years_of_experience: data.years_of_experience ? parseInt(data.years_of_experience) : null,
          verification_status: "pending",
        })
        .select()
        .single();

      if (farmerError) throw farmerError;

      // Create farm
      const { error: farmError } = await supabase.from("farms").insert({
        farmer_id: farmerData.id,
        farm_name: data.farm_name,
        farm_type: data.farm_type,
        farm_size: data.farm_size ? parseFloat(data.farm_size) : null,
        location_address: data.location_address,
        location_city: data.location_city,
        location_region: data.location_region,
        gps_latitude: data.gps_latitude ? parseFloat(data.gps_latitude) : null,
        gps_longitude: data.gps_longitude ? parseFloat(data.gps_longitude) : null,
        main_crops: data.main_crops ? data.main_crops.split(",").map(c => c.trim()) : [],
        livestock_types: data.livestock_types ? data.livestock_types.split(",").map(l => l.trim()) : [],
      });

      if (farmError) throw farmError;

      // Add farmer role
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role: "farmer" as any,
      });

      toast({
        title: "Registration submitted!",
        description: "Your farmer profile is pending verification.",
      });

      navigate("/farmer-dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Farmer Registration</h1>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Tractor className="w-4 h-4" />
              Join CES as a Certified Farmer
            </p>
          </div>

          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Details
                  </CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input id="first_name" {...register("first_name")} />
                      {errors.first_name && <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input id="last_name" {...register("last_name")} />
                      {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                      {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="primary_phone">Phone Number *</Label>
                      <Input id="primary_phone" placeholder="+233..." {...register("primary_phone")} />
                      {errors.primary_phone && <p className="text-sm text-destructive mt-1">{errors.primary_phone.message}</p>}
                    </div>
                  </div>

                  <Button type="button" onClick={nextStep} className="w-full">
                    Continue
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Business Details
                  </CardTitle>
                  <CardDescription>Your farming business information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="business_name">Business/Farm Name</Label>
                    <Input id="business_name" {...register("business_name")} />
                  </div>

                  <div>
                    <Label htmlFor="business_registration_number">Business Registration Number</Label>
                    <Input id="business_registration_number" {...register("business_registration_number")} />
                  </div>

                  <div>
                    <Label htmlFor="years_of_experience">Years of Farming Experience</Label>
                    <Input id="years_of_experience" type="number" {...register("years_of_experience")} />
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Identity Verification */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Identity Verification
                  </CardTitle>
                  <CardDescription>Upload your ID for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="id_type">ID Type *</Label>
                    <Select onValueChange={(value) => setValue("id_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ghana Card">Ghana Card</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                        <SelectItem value="Voter ID">Voter ID</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.id_type && <p className="text-sm text-destructive mt-1">{errors.id_type.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="id_number">ID Number *</Label>
                    <Input id="id_number" {...register("id_number")} />
                    {errors.id_number && <p className="text-sm text-destructive mt-1">{errors.id_number.message}</p>}
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload ID Photo (Front & Back)</p>
                    <p className="text-xs text-muted-foreground">JPG or PDF, max 5MB</p>
                    <Button type="button" variant="outline" size="sm" className="mt-3">
                      Choose Files
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Farm Details */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Farm Details
                  </CardTitle>
                  <CardDescription>Tell us about your farm</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="farm_name">Farm Name *</Label>
                    <Input id="farm_name" {...register("farm_name")} />
                    {errors.farm_name && <p className="text-sm text-destructive mt-1">{errors.farm_name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="farm_type">Farm Type *</Label>
                      <Select onValueChange={(value) => setValue("farm_type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crops">Crops</SelectItem>
                          <SelectItem value="livestock">Livestock</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.farm_type && <p className="text-sm text-destructive mt-1">{errors.farm_type.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="farm_size">Farm Size (acres)</Label>
                      <Input id="farm_size" type="number" {...register("farm_size")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location_address">Farm Address *</Label>
                    <Textarea id="location_address" {...register("location_address")} />
                    {errors.location_address && <p className="text-sm text-destructive mt-1">{errors.location_address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location_city">City *</Label>
                      <Input id="location_city" {...register("location_city")} />
                      {errors.location_city && <p className="text-sm text-destructive mt-1">{errors.location_city.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="location_region">Region *</Label>
                      <Input id="location_region" {...register("location_region")} />
                      {errors.location_region && <p className="text-sm text-destructive mt-1">{errors.location_region.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gps_latitude">GPS Latitude</Label>
                      <Input id="gps_latitude" placeholder="5.6037" {...register("gps_latitude")} />
                    </div>
                    <div>
                      <Label htmlFor="gps_longitude">GPS Longitude</Label>
                      <Input id="gps_longitude" placeholder="-0.1870" {...register("gps_longitude")} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="main_crops">Main Crops (comma separated)</Label>
                    <Input id="main_crops" placeholder="Maize, Cassava, Rice" {...register("main_crops")} />
                  </div>

                  <div>
                    <Label htmlFor="livestock_types">Livestock Types (comma separated)</Label>
                    <Input id="livestock_types" placeholder="Goats, Chickens, Cattle" {...register("livestock_types")} />
                  </div>

                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload Farm Photos</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG, max 5MB each</p>
                    <Button type="button" variant="outline" size="sm" className="mt-3">
                      Choose Files
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Review & Submit
                  </CardTitle>
                  <CardDescription>Confirm your details and submit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your application will be reviewed within 3-5 business days</li>
                      <li>• We may contact you for additional verification</li>
                      <li>• Once verified, you'll receive CES Certification</li>
                      <li>• You can then create farm assets for investment</li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms_accepted"
                      onCheckedChange={(checked) => setValue("terms_accepted", checked as boolean)}
                    />
                    <Label htmlFor="terms_accepted" className="text-sm">
                      I accept the <a href="/terms" className="text-primary underline">Terms & Conditions</a> and <a href="/terms" className="text-primary underline">Privacy Policy</a> *
                    </Label>
                  </div>
                  {errors.terms_accepted && <p className="text-sm text-destructive">{errors.terms_accepted.message}</p>}

                  <div className="flex gap-2">
                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Submit Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

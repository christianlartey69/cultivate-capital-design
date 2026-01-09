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
import { Loader2, Upload, Shield, User, Phone, MapPin, Tractor, FileCheck, Building } from "lucide-react";

const farmerSchema = z.object({
  // Personal/Business Details
  business_name: z.string().min(2, "Business name is required"),
  business_registration_number: z.string().optional(),
  years_of_experience: z.number().min(0).optional(),
  
  // Personal Info (from profiles)
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  primary_phone: z.string().min(10, "Valid phone number required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  
  // ID Verification
  id_type: z.string().min(1, "ID type is required"),
  id_number: z.string().min(5, "ID number is required"),
  
  // Farm Details
  farm_name: z.string().min(2, "Farm name is required"),
  farm_type: z.string().min(1, "Farm type is required"),
  farm_size: z.number().min(0.1, "Farm size is required"),
  farm_size_unit: z.string().default("acres"),
  location_address: z.string().min(10, "Address is required"),
  location_city: z.string().min(2, "City is required"),
  location_region: z.string().min(2, "Region is required"),
  gps_latitude: z.number().optional(),
  gps_longitude: z.number().optional(),
  main_crops: z.string().optional(),
  livestock_types: z.string().optional(),
  irrigation_type: z.string().optional(),
  soil_type: z.string().optional(),
  
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
    defaultValues: {
      farm_size_unit: "acres",
      years_of_experience: 0,
    },
  });

  const progress = (currentStep / totalSteps) * 100;

  const onSubmit = async (data: FarmerForm) => {
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          primary_phone: data.primary_phone,
          date_of_birth: data.date_of_birth,
          id_type: data.id_type,
          id_number: data.id_number,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Create farmer record
      const { data: farmerData, error: farmerError } = await supabase
        .from("farmers")
        .insert({
          user_id: user.id,
          business_name: data.business_name,
          business_registration_number: data.business_registration_number,
          years_of_experience: data.years_of_experience,
          verification_status: "pending",
        })
        .select()
        .single();

      if (farmerError) throw farmerError;

      // Create farm record
      const { error: farmError } = await supabase
        .from("farms")
        .insert({
          farmer_id: farmerData.id,
          farm_name: data.farm_name,
          farm_type: data.farm_type,
          farm_size: data.farm_size,
          farm_size_unit: data.farm_size_unit,
          location_address: data.location_address,
          location_city: data.location_city,
          location_region: data.location_region,
          gps_latitude: data.gps_latitude,
          gps_longitude: data.gps_longitude,
          main_crops: data.main_crops ? data.main_crops.split(",").map(s => s.trim()) : [],
          livestock_types: data.livestock_types ? data.livestock_types.split(",").map(s => s.trim()) : [],
          irrigation_type: data.irrigation_type,
          soil_type: data.soil_type,
          status: "pending_verification",
        });

      if (farmError) throw farmError;

      // Add farmer role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "farmer",
        });

      if (roleError && !roleError.message.includes("duplicate")) {
        console.warn("Role assignment warning:", roleError);
      }

      toast({
        title: "Registration submitted!",
        description: "Your farmer application is pending verification. We'll notify you once approved.",
      });

      navigate("/farmer-dashboard");
    } catch (error: any) {
      console.error("Farmer registration error:", error);
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("gps_latitude", position.coords.latitude);
          setValue("gps_longitude", position.coords.longitude);
          toast({
            title: "Location captured",
            description: "GPS coordinates have been saved.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Could not get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Farmer Registration</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Join CES as a certified farmer partner
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
                    <Label htmlFor="primary_phone">Phone Number *</Label>
                    <Input id="primary_phone" placeholder="+233..." {...register("primary_phone")} />
                    {errors.primary_phone && <p className="text-sm text-destructive mt-1">{errors.primary_phone.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                    {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
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
                  <Building className="w-5 h-5" />
                  Business Details
                </CardTitle>
                <CardDescription>Your farming business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="business_name">Business/Farm Name *</Label>
                  <Input id="business_name" {...register("business_name")} />
                  {errors.business_name && <p className="text-sm text-destructive mt-1">{errors.business_name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="business_registration_number">Business Registration Number</Label>
                  <Input id="business_registration_number" {...register("business_registration_number")} />
                </div>

                <div>
                  <Label htmlFor="years_of_experience">Years of Farming Experience</Label>
                  <Input 
                    id="years_of_experience" 
                    type="number" 
                    min="0"
                    {...register("years_of_experience", { valueAsNumber: true })} 
                  />
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

          {/* Step 3: ID Verification */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
                <CardDescription>Upload your national ID for verification</CardDescription>
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
                      <SelectItem value="Driver License">Driver License</SelectItem>
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
                  <Tractor className="w-5 h-5" />
                  Farm Details
                </CardTitle>
                <CardDescription>Information about your farm</CardDescription>
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
                        <SelectItem value="crops">Crop Farming</SelectItem>
                        <SelectItem value="livestock">Livestock Farming</SelectItem>
                        <SelectItem value="mixed">Mixed Farming</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
                        <SelectItem value="aquaculture">Aquaculture</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.farm_type && <p className="text-sm text-destructive mt-1">{errors.farm_type.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="farm_size">Farm Size *</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="farm_size" 
                        type="number" 
                        step="0.1"
                        className="flex-1"
                        {...register("farm_size", { valueAsNumber: true })} 
                      />
                      <Select onValueChange={(value) => setValue("farm_size_unit", value)} defaultValue="acres">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acres">Acres</SelectItem>
                          <SelectItem value="hectares">Hectares</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.farm_size && <p className="text-sm text-destructive mt-1">{errors.farm_size.message}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="main_crops">Main Crops (comma-separated)</Label>
                  <Input id="main_crops" placeholder="e.g., Maize, Cassava, Yam" {...register("main_crops")} />
                </div>

                <div>
                  <Label htmlFor="livestock_types">Livestock Types (comma-separated)</Label>
                  <Input id="livestock_types" placeholder="e.g., Goats, Cattle, Poultry" {...register("livestock_types")} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="irrigation_type">Irrigation Type</Label>
                    <Select onValueChange={(value) => setValue("irrigation_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rainfed">Rain-fed</SelectItem>
                        <SelectItem value="drip">Drip Irrigation</SelectItem>
                        <SelectItem value="sprinkler">Sprinkler</SelectItem>
                        <SelectItem value="canal">Canal/River</SelectItem>
                        <SelectItem value="borehole">Borehole</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="soil_type">Soil Type</Label>
                    <Select onValueChange={(value) => setValue("soil_type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="silty">Silty</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

          {/* Step 5: Location & Submit */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Farm Location
                </CardTitle>
                <CardDescription>Where is your farm located?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location_address">Full Address *</Label>
                  <Textarea id="location_address" {...register("location_address")} />
                  {errors.location_address && <p className="text-sm text-destructive mt-1">{errors.location_address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location_city">City/Town *</Label>
                    <Input id="location_city" {...register("location_city")} />
                    {errors.location_city && <p className="text-sm text-destructive mt-1">{errors.location_city.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="location_region">Region *</Label>
                    <Select onValueChange={(value) => setValue("location_region", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                        <SelectItem value="Ashanti">Ashanti</SelectItem>
                        <SelectItem value="Western">Western</SelectItem>
                        <SelectItem value="Eastern">Eastern</SelectItem>
                        <SelectItem value="Central">Central</SelectItem>
                        <SelectItem value="Northern">Northern</SelectItem>
                        <SelectItem value="Volta">Volta</SelectItem>
                        <SelectItem value="Upper East">Upper East</SelectItem>
                        <SelectItem value="Upper West">Upper West</SelectItem>
                        <SelectItem value="Brong Ahafo">Brong Ahafo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.location_region && <p className="text-sm text-destructive mt-1">{errors.location_region.message}</p>}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>GPS Coordinates</Label>
                    <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Capture Location
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gps_latitude" className="text-xs">Latitude</Label>
                      <Input 
                        id="gps_latitude" 
                        type="number" 
                        step="any"
                        readOnly
                        {...register("gps_latitude", { valueAsNumber: true })} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="gps_longitude" className="text-xs">Longitude</Label>
                      <Input 
                        id="gps_longitude" 
                        type="number" 
                        step="any"
                        readOnly
                        {...register("gps_longitude", { valueAsNumber: true })} 
                      />
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Upload Farm Photos/Videos & Documents</p>
                  <p className="text-xs text-muted-foreground">Ownership/Lease documents, farm photos</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3">
                    Choose Files
                  </Button>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="terms_accepted" 
                    onCheckedChange={(checked) => setValue("terms_accepted", checked === true)}
                  />
                  <Label htmlFor="terms_accepted" className="text-sm leading-relaxed">
                    I accept the <a href="/terms" className="text-primary underline">Terms & Conditions</a> and 
                    agree to CES verification process and partnership guidelines.
                  </Label>
                </div>
                {errors.terms_accepted && <p className="text-sm text-destructive">{errors.terms_accepted.message}</p>}

                <div className="flex gap-2">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}

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
import { Loader2, Upload, Shield, User, Phone, IdCard, Wallet, AlertCircle } from "lucide-react";

const onboardingSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(2, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  primary_phone: z.string().min(10, "Valid phone number required (e.g., +233...)"),
  preferred_contact_method: z.string(),
  residential_address: z.string().min(10, "Full address required"),
  city: z.string().min(2, "City is required"),
  region: z.string().min(2, "Region is required"),
  postal_code: z.string().optional(),
  id_type: z.string().min(1, "ID type is required"),
  id_number: z.string().min(5, "ID number is required"),
  mobile_money_provider: z.string().min(1, "MoMo provider is required"),
  mobile_money_number: z.string().min(10, "MoMo number is required"),
  alternate_payout_method: z.string(),
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  terms_accepted: z.boolean().refine((val) => val === true, "You must accept the terms"),
  marketing_consent: z.boolean().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function InvestorOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 6;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      preferred_contact_method: "Call",
      alternate_payout_method: "MoMo",
      marketing_consent: false,
    },
  });

  const progress = (currentStep / totalSteps) * 100;

  const onSubmit = async (data: OnboardingForm) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          primary_phone: data.primary_phone,
          preferred_contact_method: data.preferred_contact_method,
          residential_address: data.residential_address,
          city: data.city,
          region: data.region,
          postal_code: data.postal_code,
          id_type: data.id_type,
          id_number: data.id_number,
          mobile_money_provider: data.mobile_money_provider,
          mobile_money_number: data.mobile_money_number,
          alternate_payout_method: data.alternate_payout_method,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          bank_account_name: data.bank_account_name,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          marketing_consent: data.marketing_consent,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile completed!",
        description: "Your investor profile has been set up successfully.",
      });

      navigate("/dashboard");
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
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Investor Onboarding</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Securely stored — used only for purchases & verification
          </p>
        </div>

        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section A: Personal Details */}
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
                    <Label htmlFor="middle_name">Middle Name</Label>
                    <Input id="middle_name" {...register("middle_name")} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" {...register("last_name")} />
                  {errors.last_name && <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                    {errors.date_of_birth && <p className="text-sm text-destructive mt-1">{errors.date_of_birth.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="button" onClick={nextStep} className="w-full">
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Section B: Contact & Address */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact & Address
                </CardTitle>
                <CardDescription>How can we reach you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary_phone">Primary Phone Number *</Label>
                  <Input id="primary_phone" placeholder="+233..." {...register("primary_phone")} />
                  {errors.primary_phone && <p className="text-sm text-destructive mt-1">{errors.primary_phone.message}</p>}
                </div>

                <div>
                  <Label htmlFor="preferred_contact_method">Preferred Contact Method *</Label>
                  <Select onValueChange={(value) => setValue("preferred_contact_method", value)} defaultValue="Call">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Call">Call</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="residential_address">Residential Address *</Label>
                  <Textarea id="residential_address" {...register("residential_address")} placeholder="Street, house number..." />
                  {errors.residential_address && <p className="text-sm text-destructive mt-1">{errors.residential_address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} />
                    {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Input id="region" {...register("region")} />
                    {errors.region && <p className="text-sm text-destructive mt-1">{errors.region.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" {...register("postal_code")} />
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

          {/* Section C: Identity Verification */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
                <CardDescription>Required for purchases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-primary">Verification Status: Pending</p>
                      <p className="text-muted-foreground mt-1">Your ID will be reviewed within 24 hours</p>
                    </div>
                  </div>
                </div>

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
                      <SelectItem value="Other">Other</SelectItem>
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

          {/* Section D: Payment & Payout */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Payment & Payout
                </CardTitle>
                <CardDescription>How you pay and receive returns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mobile_money_provider">Mobile Money Provider *</Label>
                  <Select onValueChange={(value) => setValue("mobile_money_provider", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                      <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                      <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.mobile_money_provider && <p className="text-sm text-destructive mt-1">{errors.mobile_money_provider.message}</p>}
                </div>

                <div>
                  <Label htmlFor="mobile_money_number">Mobile Money Number *</Label>
                  <Input id="mobile_money_number" placeholder="+233..." {...register("mobile_money_number")} />
                  {errors.mobile_money_number && <p className="text-sm text-destructive mt-1">{errors.mobile_money_number.message}</p>}
                </div>

                <div>
                  <Label htmlFor="alternate_payout_method">Alternate Payout Method</Label>
                  <Select onValueChange={(value) => setValue("alternate_payout_method", value)} defaultValue="MoMo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MoMo">Mobile Money</SelectItem>
                      <SelectItem value="Bank">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {watch("alternate_payout_method") === "Bank" && (
                  <div className="space-y-4 border-l-4 border-primary pl-4">
                    <div>
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input id="bank_name" {...register("bank_name")} />
                    </div>
                    <div>
                      <Label htmlFor="bank_account_number">Account Number</Label>
                      <Input id="bank_account_number" {...register("bank_account_number")} />
                    </div>
                    <div>
                      <Label htmlFor="bank_account_name">Account Name</Label>
                      <Input id="bank_account_name" {...register("bank_account_name")} />
                    </div>
                  </div>
                )}

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

          {/* Section E: Emergency & Consent */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact & Consent</CardTitle>
                <CardDescription>Final details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input id="emergency_contact_name" {...register("emergency_contact_name")} />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input id="emergency_contact_phone" placeholder="+233..." {...register("emergency_contact_phone")} />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      onCheckedChange={(checked) => setValue("terms_accepted", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I accept the <a href="/terms" className="text-primary underline">Terms & Conditions</a> and <a href="/terms" className="text-primary underline">Privacy Policy</a> *
                    </Label>
                  </div>
                  {errors.terms_accepted && <p className="text-sm text-destructive">{errors.terms_accepted.message}</p>}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="marketing"
                      onCheckedChange={(checked) => setValue("marketing_consent", checked as boolean)}
                    />
                    <Label htmlFor="marketing" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I consent to receiving marketing communications and farm updates
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} className="flex-1">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section F: Review & Submit */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Please review your information before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Name:</strong> {watch("first_name")} {watch("middle_name")} {watch("last_name")}</p>
                  <p><strong>Phone:</strong> {watch("primary_phone")}</p>
                  <p><strong>City:</strong> {watch("city")}, {watch("region")}</p>
                  <p><strong>ID Type:</strong> {watch("id_type")}</p>
                  <p><strong>MoMo Provider:</strong> {watch("mobile_money_provider")}</p>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Complete Onboarding"
                    )}
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

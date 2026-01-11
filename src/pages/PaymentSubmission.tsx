import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, Building2, MapPin, CheckCircle2, ArrowLeft, TrendingUp, Clock, Leaf } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  expected_roi_min: number;
  expected_roi_max: number;
  duration_months: number;
  business_type: string;
  image_url: string | null;
}

const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CES-${timestamp}-${random}`;
};

export default function PaymentSubmission() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const packageId = searchParams.get("package");
  
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  
  // MoMo form state
  const [momoNetwork, setMomoNetwork] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoAmount, setMomoAmount] = useState("");
  const [momoTransactionId, setMomoTransactionId] = useState("");
  
  // Bank form state
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [bankReference, setBankReference] = useState("");
  
  // In-person form state
  const [paymentLocation, setPaymentLocation] = useState("");
  const [inPersonAmount, setInPersonAmount] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/investor/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) {
        navigate("/invest");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("investment_packages")
          .select("*")
          .eq("id", packageId)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        setSelectedPackage(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Package not found",
          variant: "destructive",
        });
        navigate("/invest");
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, navigate, toast]);

  const validateAmount = (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return false;
    }
    if (selectedPackage && numAmount < selectedPackage.min_investment) {
      toast({
        title: "Minimum Investment",
        description: `Minimum investment is GHS ${selectedPackage.min_investment.toLocaleString()}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleMomoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAmount(momoAmount)) return;
    if (!momoNetwork || !momoNumber || !momoTransactionId) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await submitPayment("momo", parseFloat(momoAmount), {
      momo_provider: momoNetwork,
      momo_number: momoNumber,
      transaction_reference: momoTransactionId,
    });
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAmount(bankAmount)) return;
    if (!bankName || !bankAccountNumber || !bankReference) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await submitPayment("bank", parseFloat(bankAmount), {
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      transaction_reference: bankReference,
    });
  };

  const handleInPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAmount(inPersonAmount)) return;
    if (!paymentLocation) {
      toast({
        title: "Missing Fields",
        description: "Please enter the payment location",
        variant: "destructive",
      });
      return;
    }

    // Generate a unique reference for in-person payments
    const inPersonRef = generateTransactionRef();
    
    await submitPayment("in_person", parseFloat(inPersonAmount), {
      transaction_reference: inPersonRef,
      admin_notes: `Payment Location: ${paymentLocation}${receiptFile ? ` | Receipt uploaded: ${receiptFile.name}` : ''}`,
    });
  };

  const submitPayment = async (
    method: string,
    amount: number,
    additionalData: Record<string, string | null>
  ) => {
    if (!user || !selectedPackage) return;
    setIsSubmitting(true);

    try {
      const uniqueRef = generateTransactionRef();
      
      const { error } = await supabase.from("payments").insert({
        investor_id: user.id,
        package_id: selectedPackage.id,
        amount,
        method,
        status: "pending",
        currency: "GHS",
        ...additionalData,
        transaction_reference: additionalData.transaction_reference || uniqueRef,
      });

      if (error) throw error;

      setTransactionRef(additionalData.transaction_reference || uniqueRef);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  Payment Submitted!
                </h2>
                <p className="text-muted-foreground">
                  Your payment has been submitted for verification.
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Transaction Reference</p>
                <p className="font-mono font-bold text-lg">{transactionRef}</p>
              </div>
              <div className="bg-gold/10 p-4 rounded-lg text-sm">
                <p className="text-earth font-medium">What happens next?</p>
                <p className="text-muted-foreground mt-1">
                  Our team will verify your payment within 24-48 hours. You'll receive a confirmation once approved.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate("/invest")}
                >
                  New Investment
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/invest")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Package Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Selected Package
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPackage?.image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedPackage.image_url}
                      alt={selectedPackage.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-xl">{selectedPackage?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedPackage?.description}</p>
                </div>
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      Min. Investment
                    </span>
                    <span className="font-bold text-primary">
                      GHS {selectedPackage?.min_investment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold" />
                      Expected ROI
                    </span>
                    <span className="font-bold text-gold">
                      {selectedPackage?.expected_roi_min}% - {selectedPackage?.expected_roi_max}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky" />
                      Duration
                    </span>
                    <span className="font-bold">
                      {selectedPackage?.duration_months} months
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Payment</CardTitle>
                <CardDescription>
                  Choose your preferred payment method and enter the details below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="momo" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="momo" className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="hidden sm:inline">Mobile Money</span>
                      <span className="sm:hidden">MoMo</span>
                    </TabsTrigger>
                    <TabsTrigger value="bank" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Bank Transfer</span>
                      <span className="sm:hidden">Bank</span>
                    </TabsTrigger>
                    <TabsTrigger value="in_person" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">In-Person</span>
                      <span className="sm:hidden">Cash</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Mobile Money Tab */}
                  <TabsContent value="momo">
                    <form onSubmit={handleMomoSubmit} className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
                        <p className="font-medium">Send payment to:</p>
                        <p className="text-muted-foreground">MTN Mobile Money: <strong>0244000000</strong></p>
                        <p className="text-muted-foreground">Name: <strong>CES Platform Ltd</strong></p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="momo-network">Network Provider *</Label>
                        <Select value={momoNetwork} onValueChange={setMomoNetwork}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                            <SelectItem value="Vodafone">Vodafone Cash</SelectItem>
                            <SelectItem value="AirtelTigo">AirtelTigo Money</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="momo-number">Mobile Number *</Label>
                        <Input
                          id="momo-number"
                          type="tel"
                          placeholder="e.g. 0244123456"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="momo-amount">Amount (GHS) *</Label>
                        <Input
                          id="momo-amount"
                          type="number"
                          min={selectedPackage?.min_investment || 0}
                          step="0.01"
                          placeholder={`Min. GHS ${selectedPackage?.min_investment.toLocaleString()}`}
                          value={momoAmount}
                          onChange={(e) => setMomoAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="momo-transaction-id">Transaction ID / Reference *</Label>
                        <Input
                          id="momo-transaction-id"
                          placeholder="e.g. MP240112.1234.A12345"
                          value={momoTransactionId}
                          onChange={(e) => setMomoTransactionId(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          You'll receive this ID in the MoMo confirmation SMS
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit MoMo Payment"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Bank Transfer Tab */}
                  <TabsContent value="bank">
                    <form onSubmit={handleBankSubmit} className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
                        <p className="font-medium">Bank Details:</p>
                        <p className="text-muted-foreground">Bank: <strong>GCB Bank</strong></p>
                        <p className="text-muted-foreground">Account Number: <strong>1234567890</strong></p>
                        <p className="text-muted-foreground">Account Name: <strong>CES Platform Ltd</strong></p>
                        <p className="text-muted-foreground">Branch: <strong>Accra Main</strong></p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Your Bank Name *</Label>
                        <Select value={bankName} onValueChange={setBankName}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GCB">GCB Bank</SelectItem>
                            <SelectItem value="Ecobank">Ecobank</SelectItem>
                            <SelectItem value="Stanbic">Stanbic Bank</SelectItem>
                            <SelectItem value="Fidelity">Fidelity Bank</SelectItem>
                            <SelectItem value="CalBank">CalBank</SelectItem>
                            <SelectItem value="Access">Access Bank</SelectItem>
                            <SelectItem value="Zenith">Zenith Bank</SelectItem>
                            <SelectItem value="UBA">UBA Ghana</SelectItem>
                            <SelectItem value="Absa">Absa Bank</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-account">Your Account Number *</Label>
                        <Input
                          id="bank-account"
                          placeholder="Enter your account number"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-amount">Amount (GHS) *</Label>
                        <Input
                          id="bank-amount"
                          type="number"
                          min={selectedPackage?.min_investment || 0}
                          step="0.01"
                          placeholder={`Min. GHS ${selectedPackage?.min_investment.toLocaleString()}`}
                          value={bankAmount}
                          onChange={(e) => setBankAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bank-reference">Transaction Reference *</Label>
                        <Input
                          id="bank-reference"
                          placeholder="e.g. TRF/2024/0112/12345"
                          value={bankReference}
                          onChange={(e) => setBankReference(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          This is shown on your bank receipt/statement
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Bank Transfer"
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* In-Person Tab */}
                  <TabsContent value="in_person">
                    <form onSubmit={handleInPersonSubmit} className="space-y-4">
                      <div className="bg-muted/50 p-4 rounded-lg space-y-1 text-sm">
                        <p className="font-medium">In-Person Payment Locations:</p>
                        <p className="text-muted-foreground">📍 <strong>Kade Office</strong> - CES Farms, Kade, Eastern Region</p>
                        <p className="text-muted-foreground">📍 <strong>Accra Office</strong> - Ring Road Central, Accra</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment-location">Payment Location *</Label>
                        <Select value={paymentLocation} onValueChange={setPaymentLocation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kade Office - Eastern Region">Kade Office - Eastern Region</SelectItem>
                            <SelectItem value="Accra Office - Ring Road Central">Accra Office - Ring Road Central</SelectItem>
                            <SelectItem value="Field Agent Visit">Field Agent Visit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="in-person-amount">Amount (GHS) *</Label>
                        <Input
                          id="in-person-amount"
                          type="number"
                          min={selectedPackage?.min_investment || 0}
                          step="0.01"
                          placeholder={`Min. GHS ${selectedPackage?.min_investment.toLocaleString()}`}
                          value={inPersonAmount}
                          onChange={(e) => setInPersonAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Upload a photo of your payment receipt (image or PDF)
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit In-Person Payment"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

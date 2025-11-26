import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  const terms = [
    "All investments are used for agricultural operations.",
    "Returns are estimates, not guarantees.",
    "Agriculture has risks; CES minimizes them through insurance & management.",
    "Insurance covers livestock mortality and crop failure.",
    "Early withdrawal attracts operational charges.",
    "Investments become non-refundable once a cycle begins.",
    "CES communicates regularly through digital updates.",
    "Investors agree to the platform's policies by signing up."
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center animate-fade-in-up">
            <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Terms & Conditions</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Please read these terms carefully before investing with CES Crowdfarming
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-info/10 border-l-4 border-info p-6 rounded-r-lg mb-8 animate-fade-in-up">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-info mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2 text-foreground">Important Notice</h3>
                  <p className="text-muted-foreground">
                    By using the CES Crowdfarming platform and making any investment, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Key Terms */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg mb-8 animate-fade-in-up">
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-foreground">Key Terms</h2>
              </div>
              <ul className="space-y-4">
                {terms.map((term, index) => (
                  <li key={index} className="flex items-start text-muted-foreground">
                    <span className="text-primary font-bold mr-3 flex-shrink-0">{index + 1}.</span>
                    <span className="leading-relaxed">{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Information */}
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
              <div className="bg-card border border-border rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-foreground">Investment Risk</h3>
                <p className="text-muted-foreground leading-relaxed">
                  While CES takes extensive measures to protect your investment through insurance and professional management, agricultural investments carry inherent risks due to weather, market conditions, and other factors beyond our control.
                </p>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold mb-4 text-foreground">Transparency Commitment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  CES is committed to providing regular updates, photos, and detailed reports on your investments. You'll always know how your farm assets are performing throughout the investment cycle.
                </p>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="bg-warning/10 border border-warning rounded-lg p-6 mt-8 animate-fade-in-up">
              <p className="text-center font-semibold text-foreground">
                <span className="text-warning">Note:</span> Full Terms & Conditions Apply. For detailed legal information, please contact our team.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Invest Responsibly?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your agricultural investment journey with full transparency
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/invest")}>
                Start Investing
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;

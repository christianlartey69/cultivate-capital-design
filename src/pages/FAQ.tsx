import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is Crowdfarming?",
      answer: "Crowdfarming allows many investors to fund a farm project together and earn returns after harvest or livestock growth. It's a collaborative approach to agricultural investment that makes farming accessible to everyone."
    },
    {
      question: "How secure are CES investments?",
      answer: "CES investments are backed by agricultural insurance and managed by professional farm teams. We prioritize transparency, regular updates, and professional management to ensure your investment is protected."
    },
    {
      question: "What happens if my goat dies?",
      answer: "CES replaces it at no extra cost through insurance and our livestock replacement policy. Your investment is protected against livestock mortality through our comprehensive insurance coverage."
    },
    {
      question: "Can I invest in multiple goats or farm packages?",
      answer: "Yes. There is no limit as long as stock is available. You can diversify your portfolio across different farm packages and livestock to maximize your returns."
    },
    {
      question: "How do I receive updates?",
      answer: "Through our digital platform, messages, photos, and optional farm visits. We provide regular updates on your investment's progress so you always know how your assets are performing."
    },
    {
      question: "Can I withdraw early?",
      answer: "Early withdrawal may attract up to a 30% deduction due to operational costs. We recommend completing the full investment cycle for optimal returns."
    },
    {
      question: "Can diaspora investors join?",
      answer: "Yes — CES accepts international investors. Whether you're in Ghana or abroad, you can invest in agricultural opportunities and build wealth through farming."
    },
    {
      question: "How do returns work?",
      answer: "Returns are paid at the end of each farm cycle, after sale of crops or livestock. Expected returns are typically around 15% ROI, depending on the package and market conditions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center animate-fade-in-up">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about CES Crowdfarming
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4 animate-fade-in-up">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our team is ready to help you understand how Crowdfarming works
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/contact")}>
                Contact Us
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/invest")}>
                Start Investing
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InvestmentForm from "./pages/InvestmentForm";
import InvestorOnboarding from "./pages/InvestorOnboarding";
import FarmerOnboarding from "./pages/FarmerOnboarding";
import FarmerDashboard from "./pages/FarmerDashboard";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFarmers from "./pages/admin/AdminFarmers";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminVisits from "./pages/admin/AdminVisits";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/dashboard" element={<ClientDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/farmers" element={<AdminFarmers />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          <Route path="/admin/visits" element={<AdminVisits />} />
          <Route path="/invest" element={<InvestmentForm />} />
          <Route path="/onboarding" element={<InvestorOnboarding />} />
          <Route path="/farmer-onboarding" element={<FarmerOnboarding />} />
          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

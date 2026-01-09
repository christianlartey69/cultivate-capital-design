-- Create payments table for tracking payment verification
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES public.farmers(id),
  farm_id UUID REFERENCES public.farms(id),
  package_id UUID REFERENCES public.investment_packages(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  method TEXT NOT NULL CHECK (method IN ('momo', 'bank', 'in_person')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'refunded')),
  momo_number TEXT,
  momo_provider TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  transaction_reference TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Investors can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = investor_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Investors can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin notification trigger for new payments
CREATE OR REPLACE FUNCTION public.notify_admin_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_type, reference_id)
  VALUES (
    'payment',
    'New Payment Submitted',
    'A payment of ' || NEW.currency || ' ' || NEW.amount || ' has been submitted via ' || NEW.method,
    'payment',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_payment_created
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_on_payment();
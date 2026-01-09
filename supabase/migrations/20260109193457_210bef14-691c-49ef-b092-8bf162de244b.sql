-- Fix function search path for existing functions that may be mutable
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
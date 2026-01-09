-- Add posts table for farm updates/announcements if not exists
-- (already exists per schema)

-- Create withdrawal_requests table for ROI withdrawals (already exists per schema)
-- Just need to verify and add any missing columns

-- Add investment_packages table updates
ALTER TABLE public.investment_packages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create posts table for admin announcements (already exists)

-- Add farm_media release_date for scheduled releases (already exists)

-- Add admin_notifications table for alerts
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Admin notifications policies
DROP POLICY IF EXISTS "Only admins can view notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can view notifications" 
ON public.admin_notifications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can manage notifications" ON public.admin_notifications;
CREATE POLICY "Only admins can manage notifications" 
ON public.admin_notifications 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Create trigger function for withdrawal notifications
CREATE OR REPLACE FUNCTION public.notify_admin_on_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_type, reference_id)
  VALUES (
    'withdrawal_request',
    'New Withdrawal Request',
    'A user has requested a withdrawal of ' || NEW.currency || ' ' || NEW.amount,
    'withdrawal',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for withdrawal notifications
DROP TRIGGER IF EXISTS trigger_notify_admin_withdrawal ON public.withdrawal_requests;
CREATE TRIGGER trigger_notify_admin_withdrawal
AFTER INSERT ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_withdrawal();

-- Create trigger function for farmer verification notifications
CREATE OR REPLACE FUNCTION public.notify_admin_on_farmer_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_type, reference_id)
  VALUES (
    'farmer_registration',
    'New Farmer Registration',
    'A new farmer has registered and requires verification',
    'farmer',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for farmer registration notifications
DROP TRIGGER IF EXISTS trigger_notify_admin_farmer ON public.farmers;
CREATE TRIGGER trigger_notify_admin_farmer
AFTER INSERT ON public.farmers
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_farmer_registration();

-- Create trigger function for farm visit notifications
CREATE OR REPLACE FUNCTION public.notify_admin_on_farm_visit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_type, reference_id)
  VALUES (
    'farm_visit',
    'New Farm Visit Request',
    'A user has requested a farm visit on ' || NEW.visit_date,
    'farm_visit',
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for farm visit notifications
DROP TRIGGER IF EXISTS trigger_notify_admin_visit ON public.farm_visits;
CREATE TRIGGER trigger_notify_admin_visit
AFTER INSERT ON public.farm_visits
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_farm_visit();
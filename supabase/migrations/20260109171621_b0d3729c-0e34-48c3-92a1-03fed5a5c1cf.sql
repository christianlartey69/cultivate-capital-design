-- Fix function search path for notify_admin_on_farm_visit
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

-- Fix function search path for notify_admin_on_farmer_registration
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
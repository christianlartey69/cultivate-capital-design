-- Enhanced profiles table with investor details
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS primary_phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'Call',
ADD COLUMN IF NOT EXISTS residential_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS id_photo_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_photo_back_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_with_id_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS mobile_money_provider TEXT,
ADD COLUMN IF NOT EXISTS mobile_money_number TEXT,
ADD COLUMN IF NOT EXISTS alternate_payout_method TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS billing_address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Assets table (goats, pigs, crops)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.investment_packages(id),
  unique_tag_id TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  purchase_amount NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  current_phase TEXT DEFAULT 'initial',
  status TEXT DEFAULT 'active',
  farm_location TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Asset media (videos, photos, reports)
CREATE TABLE IF NOT EXISTS public.asset_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Farm visit bookings
CREATE TABLE IF NOT EXISTS public.farm_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id),
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  number_of_guests INTEGER DEFAULT 1,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  confirmation_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enquiries/Support tickets
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assets
CREATE POLICY "Users can view their own assets" ON public.assets
  FOR SELECT USING (auth.uid() = investor_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all assets" ON public.assets
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for asset_media
CREATE POLICY "Users can view media for their assets" ON public.asset_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets 
      WHERE assets.id = asset_media.asset_id 
      AND assets.investor_id = auth.uid()
    ) OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all media" ON public.asset_media
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for farm_visits
CREATE POLICY "Users can view their own visits" ON public.farm_visits
  FOR SELECT USING (auth.uid() = investor_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own visits" ON public.farm_visits
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Users can update their own visits" ON public.farm_visits
  FOR UPDATE USING (auth.uid() = investor_id);

CREATE POLICY "Admins can manage all visits" ON public.farm_visits
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for enquiries
CREATE POLICY "Users can view their own enquiries" ON public.enquiries
  FOR SELECT USING (auth.uid() = investor_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own enquiries" ON public.enquiries
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Admins can manage all enquiries" ON public.enquiries
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farm_visits_updated_at BEFORE UPDATE ON public.farm_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
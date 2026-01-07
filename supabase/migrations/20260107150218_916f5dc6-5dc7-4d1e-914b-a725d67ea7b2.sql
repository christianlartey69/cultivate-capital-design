-- Add 'farmer' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'farmer';

-- Create farmers table for farmer-specific data
CREATE TABLE public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_registration_number TEXT,
  years_of_experience INTEGER,
  
  -- Verification stages
  identity_verified BOOLEAN DEFAULT FALSE,
  farm_verified BOOLEAN DEFAULT FALSE,
  compliance_verified BOOLEAN DEFAULT FALSE,
  admin_approved BOOLEAN DEFAULT FALSE,
  
  -- Verification status: unverified, pending, partially_verified, fully_verified, rejected
  verification_status TEXT DEFAULT 'unverified',
  verification_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Certification
  is_certified BOOLEAN DEFAULT FALSE,
  certification_number TEXT,
  certification_issued_at TIMESTAMP WITH TIME ZONE,
  certification_expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  farm_type TEXT NOT NULL, -- crops, livestock, mixed
  farm_size NUMERIC, -- in acres
  farm_size_unit TEXT DEFAULT 'acres',
  
  -- Location
  location_address TEXT,
  location_city TEXT,
  location_region TEXT,
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  
  -- Details
  main_crops TEXT[], -- array of crops
  livestock_types TEXT[], -- array of livestock types
  irrigation_type TEXT,
  soil_type TEXT,
  
  -- Documents
  ownership_document_url TEXT,
  lease_document_url TEXT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  is_certified BOOLEAN DEFAULT FALSE,
  certification_number TEXT,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farm_media table for farm photos/videos
CREATE TABLE public.farm_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- photo, video, document
  media_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  is_progress_update BOOLEAN DEFAULT FALSE,
  release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES public.investments(id),
  asset_id UUID REFERENCES public.assets(id),
  
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'GHS',
  
  -- Payout method
  payout_method TEXT NOT NULL, -- momo, bank
  momo_provider TEXT,
  momo_number TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  
  -- Status: pending, approved, processing, paid, failed, cancelled
  status TEXT DEFAULT 'pending',
  
  -- Admin handling
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Payment verification
  transaction_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- withdrawal, verification, cycle_ending, new_investment
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_type TEXT, -- withdrawal_request, farmer, investment, etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farmers
CREATE POLICY "Users can view their own farmer profile"
  ON public.farmers FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own farmer profile"
  ON public.farmers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmer profile"
  ON public.farmers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all farmers"
  ON public.farmers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for farms
CREATE POLICY "Users can view their own farms"
  ON public.farms FOR SELECT
  USING (
    farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert their own farms"
  ON public.farms FOR INSERT
  WITH CHECK (
    farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  USING (
    farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all farms"
  ON public.farms FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for farm_media
CREATE POLICY "Users can view media for their farms or released progress"
  ON public.farm_media FOR SELECT
  USING (
    farm_id IN (SELECT id FROM public.farms WHERE farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()))
    OR has_role(auth.uid(), 'admin')
    OR (is_progress_update = TRUE AND (release_date IS NULL OR release_date <= NOW()))
  );

CREATE POLICY "Users can upload to their own farms"
  ON public.farm_media FOR INSERT
  WITH CHECK (
    farm_id IN (SELECT id FROM public.farms WHERE farmer_id IN (SELECT id FROM public.farmers WHERE user_id = auth.uid()))
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all media"
  ON public.farm_media FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawal_requests
CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own withdrawals"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawals"
  ON public.withdrawal_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Only admins can view notifications"
  ON public.admin_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage notifications"
  ON public.admin_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawal_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;
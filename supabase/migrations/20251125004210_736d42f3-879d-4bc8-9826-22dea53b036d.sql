-- Add foreign key relationship between investments and profiles
ALTER TABLE public.investments
DROP CONSTRAINT IF EXISTS investments_investor_id_fkey;

ALTER TABLE public.investments
ADD CONSTRAINT investments_investor_id_fkey 
FOREIGN KEY (investor_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;
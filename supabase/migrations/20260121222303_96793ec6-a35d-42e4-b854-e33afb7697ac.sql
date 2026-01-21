-- Explicitly deny anonymous access to profiles table
-- First, drop the policy if it already exists to avoid conflicts
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Create policy to explicitly deny anonymous access
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Verify RLS is enabled (idempotent operation)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (prevents bypassing RLS as superuser in application context)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
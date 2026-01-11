-- Add UPDATE policy for users to modify their own enquiries while in 'open' status
CREATE POLICY "Users can update their own open enquiries" 
ON public.enquiries 
FOR UPDATE 
USING (auth.uid() = investor_id AND status = 'open')
WITH CHECK (auth.uid() = investor_id AND status = 'open');
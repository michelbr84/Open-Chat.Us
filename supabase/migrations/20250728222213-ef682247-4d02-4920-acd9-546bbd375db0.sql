-- Create contact submissions table to store form submissions
CREATE TABLE public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all submissions
CREATE POLICY "Admins can view all contact submissions" ON public.contact_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'::user_role
    )
  );

-- Create policy for inserting submissions (public access for the contact form)
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at DESC);
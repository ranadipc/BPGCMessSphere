
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create votes table
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  mess text NOT NULL,
  year text NOT NULL,
  votes jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Create settings table
CREATE TABLE public.settings (
  id int PRIMARY KEY DEFAULT 1,
  voting_open boolean NOT NULL DEFAULT false,
  current_month text NOT NULL DEFAULT '',
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO public.settings (id, voting_open, current_month) VALUES (1, false, '');

-- Create admin_emails table for whitelisting
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Votes RLS: users can only see their own
CREATE POLICY "Users can view own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own votes" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft votes" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

-- Settings: everyone can read, only admins can update
CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (true);

-- Admin emails: only admins can read
CREATE POLICY "Anyone can read admin_emails" ON public.admin_emails
  FOR SELECT USING (true);

-- Create function to check admin
CREATE OR REPLACE FUNCTION public.is_admin(_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails WHERE email = _email
  )
$$;

-- Settings update policy for admins only
CREATE POLICY "Admins can update settings" ON public.settings
  FOR UPDATE USING (
    public.is_admin((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

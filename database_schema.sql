-- DeepGuard Database Schema
-- Run this in your Supabase SQL Editor to set up the required tables

-- Create user profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('image', 'video', 'audio')),
    file_size BIGINT,
    is_deepfake BOOLEAN,
    confidence DECIMAL(5,4),
    analysis_time INTEGER, -- milliseconds
    api_provider TEXT CHECK (api_provider IN ('sightengine', 'resemble', 'demo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subscription limits table
CREATE TABLE IF NOT EXISTS public.subscription_limits (
    tier TEXT PRIMARY KEY,
    monthly_analyses INTEGER NOT NULL,
    max_file_size_mb INTEGER NOT NULL,
    features TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Insert default subscription tiers
INSERT INTO public.subscription_limits (tier, monthly_analyses, max_file_size_mb, features) VALUES
('free', 10, 10, ARRAY['basic_analysis']),
('pro', 500, 50, ARRAY['basic_analysis', 'batch_processing', 'api_access']),
('enterprise', -1, 100, ARRAY['basic_analysis', 'batch_processing', 'api_access', 'priority_support', 'custom_models'])
ON CONFLICT (tier) DO NOTHING;

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_usage
DROP POLICY IF EXISTS "Users can view their own usage." ON public.user_usage;
CREATE POLICY "Users can view their own usage." ON public.user_usage
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage." ON public.user_usage;
CREATE POLICY "Users can insert their own usage." ON public.user_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for subscription_limits (public read access)
DROP POLICY IF EXISTS "Subscription limits are viewable by everyone." ON public.subscription_limits;
CREATE POLICY "Subscription limits are viewable by everyone." ON public.subscription_limits
    FOR SELECT USING (true);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get monthly usage count
CREATE OR REPLACE FUNCTION public.get_monthly_usage(user_uuid UUID)
RETURNS INTEGER
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.user_usage
        WHERE user_id = user_uuid
        AND created_at >= date_trunc('month', now())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can perform analysis
CREATE OR REPLACE FUNCTION public.can_user_analyze(user_uuid UUID)
RETURNS BOOLEAN
AS $$
DECLARE
    user_tier TEXT;
    tier_limit INTEGER;
    current_usage INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier
    FROM public.profiles
    WHERE id = user_uuid;
    
    -- Default to free if no tier found
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;
    
    -- Get tier limit
    SELECT monthly_analyses INTO tier_limit
    FROM public.subscription_limits
    WHERE tier = user_tier;
    
    -- Default to free tier limit if not found
    IF tier_limit IS NULL THEN
        tier_limit := 10;
    END IF;
    
    -- Get current month usage
    SELECT public.get_monthly_usage(user_uuid) INTO current_usage;
    
    -- Return true if unlimited (-1) or under limit
    RETURN (tier_limit = -1 OR current_usage < tier_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_created_at ON public.user_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.user_usage TO anon, authenticated;
GRANT SELECT ON public.subscription_limits TO anon, authenticated;

-- Enable realtime for tables (optional, for real-time subscriptions)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_usage;

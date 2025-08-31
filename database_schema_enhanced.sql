-- Enhanced DeepGuard Database Schema
-- This adds comprehensive analysis history storage

-- Create comprehensive analysis history table
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('image', 'video', 'audio')),
    file_name TEXT,
    file_size BIGINT,
    file_type TEXT,
    
    -- Analysis Results
    is_deepfake BOOLEAN NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    confidence_category TEXT CHECK (confidence_category IN ('VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH')),
    analysis_quality TEXT CHECK (analysis_quality IN ('DEMO', 'API', 'ENHANCED')),
    
    -- Processing Details
    analysis_time INTEGER, -- milliseconds
    api_provider TEXT CHECK (api_provider IN ('sightengine', 'resemble', 'demo')),
    models_used TEXT[],
    quality_score DECIMAL(3,2),
    
    -- Detailed Analysis Data (JSON)
    processing_details JSONB,
    recommendations TEXT[],
    limitations TEXT[],
    metadata JSONB,
    
    -- Image-specific data
    image_analysis JSONB,
    
    -- Video-specific data
    video_analysis JSONB,
    
    -- Audio-specific data
    audio_analysis JSONB,
    
    -- Raw API response
    raw_response JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON public.analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_history_type ON public.analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_history_is_deepfake ON public.analysis_history(is_deepfake);
CREATE INDEX IF NOT EXISTS idx_analysis_history_risk_level ON public.analysis_history(risk_level);

-- Enable Row Level Security
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analysis_history
DROP POLICY IF EXISTS "Users can view their own analysis history." ON public.analysis_history;
CREATE POLICY "Users can view their own analysis history." ON public.analysis_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analysis history." ON public.analysis_history;
CREATE POLICY "Users can insert their own analysis history." ON public.analysis_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analysis history." ON public.analysis_history;
CREATE POLICY "Users can update their own analysis history." ON public.analysis_history
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own analysis history." ON public.analysis_history;
CREATE POLICY "Users can delete their own analysis history." ON public.analysis_history
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to get user's analysis statistics
CREATE OR REPLACE FUNCTION public.get_user_analysis_stats(user_uuid UUID)
RETURNS TABLE(
    total_analyses BIGINT,
    deepfake_count BIGINT,
    authentic_count BIGINT,
    avg_confidence DECIMAL(5,4),
    image_count BIGINT,
    video_count BIGINT,
    audio_count BIGINT,
    high_risk_count BIGINT,
    medium_risk_count BIGINT,
    low_risk_count BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analyses,
        COUNT(*) FILTER (WHERE is_deepfake = true) as deepfake_count,
        COUNT(*) FILTER (WHERE is_deepfake = false) as authentic_count,
        AVG(confidence) as avg_confidence,
        COUNT(*) FILTER (WHERE analysis_type = 'image') as image_count,
        COUNT(*) FILTER (WHERE analysis_type = 'video') as video_count,
        COUNT(*) FILTER (WHERE analysis_type = 'audio') as audio_count,
        COUNT(*) FILTER (WHERE risk_level = 'HIGH' OR risk_level = 'CRITICAL') as high_risk_count,
        COUNT(*) FILTER (WHERE risk_level = 'MEDIUM') as medium_risk_count,
        COUNT(*) FILTER (WHERE risk_level = 'LOW') as low_risk_count
    FROM public.analysis_history
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recent analyses
CREATE OR REPLACE FUNCTION public.get_recent_analyses(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    analysis_type TEXT,
    file_name TEXT,
    is_deepfake BOOLEAN,
    confidence DECIMAL(5,4),
    risk_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ah.id,
        ah.analysis_type,
        ah.file_name,
        ah.is_deepfake,
        ah.confidence,
        ah.risk_level,
        ah.created_at
    FROM public.analysis_history ah
    WHERE ah.user_id = user_uuid
    ORDER BY ah.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get analyses by date range
CREATE OR REPLACE FUNCTION public.get_analyses_by_date_range(
    user_uuid UUID, 
    start_date TIMESTAMP WITH TIME ZONE, 
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
    id UUID,
    analysis_type TEXT,
    file_name TEXT,
    is_deepfake BOOLEAN,
    confidence DECIMAL(5,4),
    risk_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ah.id,
        ah.analysis_type,
        ah.file_name,
        ah.is_deepfake,
        ah.confidence,
        ah.risk_level,
        ah.created_at
    FROM public.analysis_history ah
    WHERE ah.user_id = user_uuid
    AND ah.created_at >= start_date
    AND ah.created_at <= end_date
    ORDER BY ah.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.analysis_history TO anon, authenticated;

-- Enable realtime for analysis_history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'analysis_history'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_history;
  END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analysis_history_updated_at
    BEFORE UPDATE ON public.analysis_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client with error handling
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : createClient('https://demo.supabase.co', 'demo-key')

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      console.warn('Supabase connection test failed:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

// Database types
export interface Profile {
  id: string
  updated_at?: string
  username?: string
  full_name?: string
  avatar_url?: string
  email?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface UserUsage {
  id: string
  user_id: string
  analysis_type: 'image' | 'video' | 'audio'
  file_size?: number
  is_deepfake?: boolean
  confidence?: number
  analysis_time?: number
  api_provider?: 'sightengine' | 'resemble' | 'demo'
  created_at: string
}

export interface SubscriptionLimit {
  tier: 'free' | 'pro' | 'enterprise'
  monthly_analyses: number
  max_file_size_mb: number
  features: string[]
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { data, error }
}

// Usage tracking functions
export const trackAnalysis = async (analysisData: {
  analysis_type: 'image' | 'video' | 'audio'
  file_size?: number
  is_deepfake?: boolean
  confidence?: number
  analysis_time?: number
  api_provider?: 'sightengine' | 'resemble' | 'demo'
}) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Auth error in trackAnalysis:', authError)
      return { data: null, error: authError }
    }
    
    if (!user) {
      console.warn('User not authenticated for tracking analysis')
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('user_usage')
      .insert({
        user_id: user.id,
        ...analysisData,
      })
    return { data, error }
  } catch (error) {
    console.error('Error in trackAnalysis:', error)
    return { data: null, error }
  }
}

export const getMonthlyUsage = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  return { data: data || [], error }
}

export const getUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

export const updateUserProfile = async (updates: Partial<Profile>) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  return { data, error }
}

export const getSubscriptionLimits = async (tier: string) => {
  const { data, error } = await supabase
    .from('subscription_limits')
    .select('*')
    .eq('tier', tier)
    .single()

  return { data, error }
}

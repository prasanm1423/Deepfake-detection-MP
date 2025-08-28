import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, getUserProfile, getMonthlyUsage, getSubscriptionLimits, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  monthlyUsage: number
  usageLimit: number
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshUsage: () => Promise<void>
  canAnalyze: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [monthlyUsage, setMonthlyUsage] = useState(0)
  const [usageLimit, setUsageLimit] = useState(10)
  const [loading, setLoading] = useState(true)

  // Calculate if user can perform analysis
  const canAnalyze = usageLimit === -1 || monthlyUsage < usageLimit

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await getUserProfile()
      if (error) throw error
      setProfile(data)

      // Get subscription limits
      if (data?.subscription_tier) {
        const { data: limits } = await getSubscriptionLimits(data.subscription_tier)
        if (limits) {
          setUsageLimit(limits.monthly_analyses)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const refreshUsage = async () => {
    if (!user) return
    
    try {
      const { data, error } = await getMonthlyUsage()
      if (error) throw error
      setMonthlyUsage(data.length)
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - Supabase not configured
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        // User signed in, fetch profile and usage
        await refreshProfile()
        await refreshUsage()
      } else {
        // User signed out, clear data
        setProfile(null)
        setMonthlyUsage(0)
        setUsageLimit(10)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Refresh profile and usage when user changes
  useEffect(() => {
    if (user) {
      refreshProfile()
      refreshUsage()
    }
  }, [user])

  const value = {
    user,
    session,
    profile,
    monthlyUsage,
    usageLimit,
    loading,
    signOut: handleSignOut,
    refreshProfile,
    refreshUsage,
    canAnalyze,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

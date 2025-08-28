import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function Pricing() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)
    }
    fetchUser()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const requestAccess = async (plan: 'pro' | 'enterprise') => {
    if (!isSupabaseConfigured) {
      toast({ title: 'Setup required', description: 'Supabase is not configured. See the setup guide.' })
      return
    }
    setLoading(true)
    try {
      if (!userId) {
        toast({ title: 'Sign in required', description: 'Please sign in to request access.' })
        navigate('/login')
        return
      }
      const { error } = await supabase
        .from('subscription_requests')
        .insert({ user_id: userId, plan, message })
      if (error) throw error
      toast({ title: 'Request submitted', description: 'We will review your request shortly.' })
      setMessage('')
    } catch (e: any) {
      toast({ title: 'Failed to submit request', description: e.message || 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    { name: 'Free', price: '$0', features: ['10 analyses/month', 'Image & video detection', '10MB file size'], action: null as any },
    { name: 'Pro', price: '$0 (simulated)', features: ['500 analyses/month', 'All models', 'API access', 'Priority support'], action: () => requestAccess('pro') },
    { name: 'Enterprise', price: 'Custom', features: ['Unlimited', 'Custom models', 'SLA'], action: () => requestAccess('enterprise') },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b border-border/20 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                ← Back
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              {userId && (
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              )}
              <Link to="/">
                <Button variant="ghost" size="sm">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Simulation • No real payments</Badge>
            <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Request access to Pro or Enterprise. We’ll approve in Supabase.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`relative h-full ${tier.name === 'Pro' ? 'border-primary shadow-lg' : ''}`}>
                {tier.name === 'Pro' && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="text-sm text-foreground">• {f}</li>
                    ))}
                  </ul>
                  {tier.action ? (
                    <Button disabled={loading} onClick={tier.action} className="w-full">
                      {userId ? `Request ${tier.name} Access` : 'Sign in to Request Access'}
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => navigate('/signup')}>Get Started Free</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-2xl mx-auto mt-12">
            <Card>
              <CardHeader>
                <CardTitle>Optional Message</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Tell us about your project or needs" value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-2">This note will be attached to your next request.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}



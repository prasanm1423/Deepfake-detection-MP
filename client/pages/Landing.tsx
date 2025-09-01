import { Link } from 'react-router-dom'
import { Shield, Zap, Eye, Camera, Upload, BarChart3, CheckCircle, ArrowRight, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { Text, Caption } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: <Eye className="h-8 w-8 text-primary" />,
      title: "Advanced AI Detection",
      description: "State-of-the-art algorithms from Sightengine and Resemble AI for comprehensive deepfake detection across images, videos, and audio."
    },
    {
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: "Real-time Analysis",
      description: "Upload files or capture content live with your camera for instant deepfake analysis with detailed confidence scores."
    },
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Multi-format Support",
              description: "Support for images (JPEG, PNG, WebP), videos (MP4, WebM, MOV), and audio files (WAV, MP3, M4A, OGG) up to 10MB."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Detailed Analytics",
      description: "Get comprehensive analysis reports with confidence scores, technical metadata, and usage tracking."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Enterprise Security",
      description: "Your data is processed securely with automatic cleanup. No permanent storage of your sensitive content."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Fast & Reliable",
      description: "Get results in seconds with 99.9% uptime. Professional-grade infrastructure for critical use cases."
    }
  ]

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "10 analyses per month",
        "Basic image & video detection",
        "10MB file size limit",
        "Community support"
      ],
      buttonText: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For professionals and small teams",
      features: [
        "500 analyses per month",
        "All detection models",
        "10MB file size limit",
        "API access",
        "Priority support",
        "Batch processing"
      ],
      buttonText: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For organizations and high-volume usage",
      features: [
        "Unlimited analyses",
        "Custom model training",
        "10MB file size limit",
        "Dedicated support",
        "SLA guarantees",
        "On-premise deployment"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ]

  const useCases = [
    {
      title: 'Social Media Moderation',
      description: 'Flag and review potentially manipulated images, videos, and audio before they reach your audience.'
    },
    {
      title: 'Corporate Security',
      description: 'Protect your brand from impersonation and misinformation with real-time content analysis.'
    },
    {
      title: 'Journalism & Fact-Checking',
      description: 'Verify source media quickly with confidence scores and technical signals for editorial workflows.'
    }
  ]

  const stats = [
    { label: "Analyses Completed", value: "50K+", trend: 15, isPositive: true },
    { label: "Accuracy Rate", value: "99.2%", trend: 2.1, isPositive: true },
    { label: "Response Time", value: "<2s", trend: -0.5, isPositive: true },
    { label: "Customer Satisfaction", value: "4.9/5", trend: 0.1, isPositive: true }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/20 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DeepGuard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Deepfake Detection</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Live Demo</Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">DeepGuard</h2>
                        <p className="text-sm text-muted-foreground">AI-Powered Deepfake Detection</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="py-6 space-y-4">
                    <a 
                      href="#features" 
                      className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Features
                    </a>
                    <a 
                      href="#pricing" 
                      className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Pricing
                    </a>
                    <a 
                      href="#faq" 
                      className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </a>
                    <Link 
                      to="/dashboard" 
                      className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Live Demo
                    </Link>
                    <div className="pt-4 border-t space-y-3">
                      <Link 
                        to="/login" 
                        className="block p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🚀 Now with Advanced AI Detection Models
          </Badge>
          
          <h1 className="text-3xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Detect Deepfakes with
            <span className="text-primary block">AI-Powered Precision</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
            Protect your organization from manipulated media with our advanced deepfake detection system. 
            Analyze images, videos, and audio in real-time with industry-leading accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
            <Link to="/signup">
              <Button size="lg" className="min-w-[200px] w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="min-w-[200px] w-full sm:w-auto">
                Try Live Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="max-w-4xl mx-auto px-4">
            <img
              src="/Gemini_Generated_Image_4ljay34ljay34lja.png"
              alt="DeepGuard deepfake detection illustration"
              className="w-full rounded-lg border border-border/20 shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-effect text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <span className={cn(
                          'text-xs font-medium',
                          stat.isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                          {stat.isPositive ? '+' : ''}{stat.trend}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">from last month</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Every Use Case
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              From content moderation to forensic analysis, DeepGuard provides the tools you need to detect manipulated media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                  <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Built for Real-World Workflows</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">Practical applications to help teams detect and prevent manipulated media across the content lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mt-16">
            {useCases.map((c, i) => (
              <Card key={i} className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Text size="sm" color="muted">{c.description}</Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-20 px-4" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto mt-16">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative h-full transition-all duration-300 hover:scale-105 ${
                tier.popular ? 'border-primary shadow-lg scale-105 md:scale-110' : 'hover:shadow-lg'
              }`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl md:text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl md:text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <Text size="sm" color="muted" className="mt-2">{tier.description}</Text>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary mr-3 flex-shrink-0" />
                        <Text size="sm">{feature}</Text>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pricing" className="block">
                    <Button className={`w-full ${tier.popular ? '' : 'variant-outline'}`}>
                      {tier.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg md:text-xl text-muted-foreground px-4">Quick answers to common questions about DeepGuard.</p>
          </div>
          <Accordion type="single" collapsible className="w-full mt-16">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">Is my uploaded content stored permanently?</AccordionTrigger>
              <AccordionContent>
                No. Files are processed for analysis and cleaned up automatically. We do not keep permanent copies.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">Do I need API keys to try the demo?</AccordionTrigger>
              <AccordionContent>
                No. The live demo works without keys. For production accuracy, configure service keys in your server environment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">What file types and sizes are supported?</AccordionTrigger>
              <AccordionContent>
                Images (JPEG, PNG, WebP), videos (MP4, WebM, MOV), and audio (WAV, MP3, M4A, OGG). All tiers up to 10MB.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">DeepGuard</h3>
                  <p className="text-sm text-muted-foreground">AI-Powered Deepfake Detection</p>
                </div>
              </div>
              <Text size="sm" color="muted" className="max-w-xs">
                Detect manipulated media across images, videos, and audio with fast, accurate AI.
              </Text>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Live Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://sightengine.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Sightengine</a></li>
                <li><a href="https://www.resemble.ai" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Resemble AI</a></li>
                <li><a href="/" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><a href="mailto:support@deepguard.app" className="hover:text-foreground transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p className="mb-4 md:mb-0">&copy; 2024 DeepGuard. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="/" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

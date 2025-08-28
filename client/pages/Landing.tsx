import { Link } from 'react-router-dom'
import { Shield, Zap, Eye, Camera, Upload, BarChart3, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default function Landing() {

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
      description: "Support for images (JPEG, PNG, WebP), videos (MP4, WebM, MOV), and audio files (WAV, MP3, M4A, OGG) up to 50MB."
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
        "50MB file size limit",
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
        "100MB file size limit",
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
                <p className="text-xs text-muted-foreground">AI-Powered Deepfake Detection</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">Pricing</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">FAQ</a>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">Live Demo</Link>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🚀 Now with Advanced AI Detection Models
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Detect Deepfakes with
            <span className="text-primary block">AI-Powered Precision</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Protect your organization from manipulated media with our advanced deepfake detection system. 
            Analyze images, videos, and audio in real-time with industry-leading accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button size="lg" className="min-w-[200px]">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Try Live Demo
              </Button>
            </Link>
          </div>

          {/* Hero Image */}
          <div className="max-w-4xl mx-auto">
            <img
              src="/Gemini_Generated_Image_4ljay34ljay34lja.png"
              alt="DeepGuard deepfake detection illustration"
              className="w-full rounded-lg border border-border/20 shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Every Use Case
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From content moderation to forensic analysis, DeepGuard provides the tools you need to detect manipulated media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section (replaces Testimonials) */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built for Real-World Workflows</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Practical applications to help teams detect and prevent manipulated media across the content lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {useCases.map((c, i) => (
              <Card key={i} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section moved below Use Cases */}
      <section className="py-20 px-4" id="pricing">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative h-full ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{tier.description}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
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

      {/* Testimonials removed */}

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">Quick answers to common questions about DeepGuard.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is my uploaded content stored permanently?</AccordionTrigger>
              <AccordionContent>
                No. Files are processed for analysis and cleaned up automatically. We do not keep permanent copies.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do I need API keys to try the demo?</AccordionTrigger>
              <AccordionContent>
                No. The live demo works without keys. For production accuracy, configure service keys in your server environment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What file types and sizes are supported?</AccordionTrigger>
              <AccordionContent>
                Images (JPEG, PNG, WebP), videos (MP4, WebM, MOV), and audio (WAV, MP3, M4A, OGG). Free tier up to 10MB; Pro up to 50MB.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section removed per request */}

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
              <p className="text-sm text-muted-foreground max-w-xs">
                Detect manipulated media across images, videos, and audio with fast, accurate AI.
              </p>
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

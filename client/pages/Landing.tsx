import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Zap, Eye, Camera, Upload, BarChart3, CheckCircle, ArrowRight, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function Landing() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Security Analyst, TechCorp",
      content: "DeepGuard has been instrumental in helping us verify the authenticity of media content. The accuracy is impressive and the API is easy to integrate.",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Digital Forensics Expert",
      content: "As a forensics investigator, I rely on DeepGuard daily. The detailed analysis reports and high confidence scores make it indispensable for our work.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Content Moderator, MediaFlow",
      content: "The real-time detection capabilities have streamlined our content moderation process. We can now identify manipulated media instantly.",
      rating: 5
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
            
            <div className="flex items-center space-x-4">
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
            <Button 
              size="lg" 
              variant="outline" 
              className="min-w-[200px]"
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Demo Video Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative aspect-video bg-secondary/20 rounded-lg border-2 border-border/20 overflow-hidden">
              {!isVideoPlaying ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <Button 
                    size="lg" 
                    className="rounded-full w-20 h-20"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <Play className="h-8 w-8" />
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/20">
                  <p className="text-muted-foreground">Demo video would play here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/5">
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

      {/* Pricing Section */}
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
                  
                  <Link to="/signup" className="block">
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

      {/* Testimonials */}
      <section className="py-20 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Security Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about DeepGuard's accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-4xl mx-auto glass-effect border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Protect Against Deepfakes?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of security professionals who trust DeepGuard to detect manipulated media and protect their organizations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button size="lg" className="min-w-[200px]">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button size="lg" variant="outline" className="min-w-[200px]">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">DeepGuard</h3>
                <p className="text-sm text-muted-foreground">AI-Powered Deepfake Detection</p>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DeepGuard. All rights reserved. Built with security and privacy in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

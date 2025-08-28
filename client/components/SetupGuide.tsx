import { Shield, Database, Key, ExternalLink, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const envTemplate = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: API Keys for real deepfake detection
SIGHTENGINE_USER=your_sightengine_user_id
SIGHTENGINE_SECRET=your_sightengine_secret_key
RESEMBLE_API_KEY=your_resemble_api_key`

  const sqlSchema = `-- Run this in your Supabase SQL Editor
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

-- Continue with the rest of database_schema.sql...`

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-primary rounded-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">DeepGuard Setup</h1>
              <p className="text-muted-foreground">Complete the setup to start detecting deepfakes</p>
            </div>
          </div>
          
          <Alert className="max-w-2xl mx-auto border-warning/50 bg-warning/10">
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> Supabase environment variables are missing. 
              Follow the steps below to complete your DeepGuard setup.
            </AlertDescription>
          </Alert>
        </div>

        {/* Setup Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Step 1: Create Supabase Project */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className="bg-primary text-primary-foreground">1</Badge>
                <span>Create Supabase Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                First, create a new Supabase project to handle authentication and database.
              </p>
              <div className="flex space-x-4">
                <Button asChild>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create Supabase Project
                  </a>
                </Button>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Sign up or log in to Supabase</li>
                <li>Click "New Project" and enter your details</li>
                <li>Wait for the database to be created</li>
                <li>Go to Settings → API to get your credentials</li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 2: Configure Environment */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className="bg-primary text-primary-foreground">2</Badge>
                <span>Configure Environment Variables</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create a <code className="bg-secondary px-2 py-1 rounded">.env</code> file in your project root with your Supabase credentials:
              </p>
              
              <div className="relative">
                <pre className="bg-secondary/20 p-4 rounded-lg text-sm overflow-x-auto border">
                  <code>{envTemplate}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(envTemplate, 2)}
                >
                  {copiedStep === 2 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Alert className="border-primary/50 bg-primary/10">
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Find your credentials:</strong> Go to your Supabase project dashboard → 
                  Settings → API. Copy the "Project URL" and "anon public" key.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3: Database Setup */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className="bg-primary text-primary-foreground">3</Badge>
                <span>Setup Database Schema</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Run the database migration in your Supabase SQL Editor:
              </p>
              
              <div className="relative">
                <pre className="bg-secondary/20 p-4 rounded-lg text-sm overflow-x-auto border max-h-48">
                  <code>{sqlSchema}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(sqlSchema, 3)}
                >
                  {copiedStep === 3 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" asChild>
                  <a href="/database_schema.sql" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Complete Schema
                  </a>
                </Button>
              </div>

              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Go to your Supabase dashboard → SQL Editor</li>
                <li>Copy the complete schema from <code>database_schema.sql</code></li>
                <li>Paste and run the SQL to create tables and policies</li>
              </ul>
            </CardContent>
          </Card>

          {/* Step 4: Restart App */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Badge className="bg-primary text-primary-foreground">4</Badge>
                <span>Restart Development Server</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                After configuring your environment variables, restart the development server:
              </p>
              
              <div className="bg-secondary/20 p-4 rounded-lg border">
                <code className="text-sm">pnpm dev</code>
              </div>

              <p className="text-sm text-muted-foreground">
                The app will automatically detect your Supabase configuration and show the landing page.
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Check out our comprehensive setup guide for detailed instructions.
            </p>
            <Button variant="outline" asChild>
              <a href="/SETUP_GUIDE.md" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Setup Guide
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

# DeepGuard Setup Guide 🛡️

This guide will help you set up the complete DeepGuard authentication and landing page system with Supabase integration.

## 🚀 Quick Start

### Step 1: Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:

#### Supabase Configuration (Required)
Get these from your Supabase project dashboard:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### API Keys (Optional - for real deepfake detection)
```bash
# Sightengine (for images/videos)
SIGHTENGINE_USER=your_sightengine_user_id
SIGHTENGINE_SECRET=your_sightengine_secret_key

# Resemble AI (for audio)
RESEMBLE_API_KEY=your_resemble_api_key
```

### Step 2: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database_schema.sql` and run it

This will create:
- User profiles table with subscription tiers
- Usage tracking table  
- Subscription limits table
- Row Level Security policies
- Automatic triggers for new user signup

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:8080` to see your landing page!

## 📊 Features Included

### 🎨 Landing Page
- Professional hero section with call-to-action
- Feature highlights and benefits
- Pricing tiers (Free, Pro, Enterprise)
- Customer testimonials
- Responsive design with dark theme

### 🔐 Authentication System
- User registration and login
- Email verification with Supabase Auth
- Password reset functionality
- Protected routes with automatic redirects

### 📈 User Dashboard
- Usage tracking and limits
- Real-time quota monitoring
- Subscription tier management
- Analysis history and statistics
- File upload and camera capture integration

### 💾 Database Schema
- **Profiles**: User information and subscription tiers
- **Usage Tracking**: Analysis history and quotas
- **Subscription Limits**: Tier configurations and features
- **Row Level Security**: Data protection and privacy

## 🎯 Subscription Tiers

| Tier | Monthly Analyses | File Size Limit | Features |
|------|-----------------|-----------------|----------|
| **Free** | 10 | 10MB | Basic analysis, Community support |
| **Pro** | 500 | 50MB | All models, API access, Priority support |
| **Enterprise** | Unlimited | 100MB | Custom models, SLA, On-premise |

## 🔧 Detailed Setup Instructions

### Supabase Project Setup

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key
3. **Configure authentication**:
   - Go to Authentication → Settings
   - Enable email confirmations (optional)
   - Configure redirect URLs if needed

### API Keys Setup (Optional)

#### Sightengine API (Images & Videos)
1. Sign up at [sightengine.com](https://sightengine.com)
2. Navigate to your dashboard → API section
3. Copy your User ID and Secret Key

#### Resemble AI (Audio Detection)
1. Sign up at [resemble.ai/detect](https://www.resemble.ai/detect/)
2. Generate an API key from your dashboard
3. Copy the API key

### Database Migration

Run the SQL migration in your Supabase dashboard:

1. Open the SQL Editor in your Supabase dashboard
2. Paste the contents of `database_schema.sql`
3. Click "Run" to execute the migration

The migration will:
- ✅ Create user profiles table
- ✅ Set up usage tracking
- ✅ Configure subscription tiers
- ✅ Enable Row Level Security
- ✅ Create automatic triggers
- ✅ Set up performance indexes

## 🎨 Customization Guide

### Branding
Update the logo and colors in:
- `client/global.css` - CSS custom properties
- `tailwind.config.ts` - Theme configuration
- Landing page components for text content

### Subscription Tiers
Modify subscription limits in:
- `database_schema.sql` - Update the INSERT statements
- `client/pages/Dashboard.tsx` - Update tier descriptions
- `client/pages/Landing.tsx` - Update pricing display

### Features
Add new features by:
1. Adding database fields to the schema
2. Updating the UI components
3. Modifying the subscription limits

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Subscription limits are publicly readable
- Automatic policy enforcement

### Authentication
- Secure email/password authentication
- JWT token management
- Automatic session handling

### Data Protection
- No permanent file storage
- Automatic temporary file cleanup
- Secure API key handling

## 🧪 Testing the Setup

### Test Authentication
1. Visit the landing page at `http://localhost:8080`
2. Click "Get Started" to sign up
3. Create a new account
4. Verify you're redirected to the dashboard

### Test Usage Tracking
1. Upload a test image in the dashboard
2. Check that usage count increases
3. Verify quota limits are enforced

### Test Database
1. Check the Supabase dashboard
2. Verify new user appears in `auth.users`
3. Confirm profile created in `public.profiles`
4. Check usage recorded in `public.user_usage`

## 🚨 Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env` file is in the project root
- Restart the development server after changes
- Check for typos in variable names

**Database Connection Issues**
- Verify Supabase URL and anon key are correct
- Check if RLS policies are properly set up
- Ensure database migration was successful

**Authentication Not Working**
- Check Supabase auth settings
- Verify redirect URLs are configured
- Check browser console for errors

**Usage Tracking Not Working**
- Verify database schema was applied correctly
- Check if RLS policies allow data insertion
- Look for errors in browser console

### Error Messages

**"Missing Supabase environment variables"**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`

**"User not authenticated"**
- Sign out and sign back in
- Check if session is valid in browser storage

**"Usage limit reached"**
- Verify usage tracking is working correctly
- Check subscription tier in database

## 📝 Next Steps

After setup is complete, you can:

1. **Customize the branding** and content for your use case
2. **Set up payment processing** for subscription upgrades
3. **Add email notifications** for usage limits
4. **Implement API endpoints** for external integrations
5. **Deploy to production** using Vercel or Netlify

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Sightengine API Docs](https://sightengine.com/docs)
- [Resemble AI Docs](https://docs.resemble.ai/)

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review the Supabase dashboard logs
3. Verify all environment variables are set
4. Ensure database migration was successful
5. Check the troubleshooting section above

**Happy building! 🚀**

# Quick Start Setup Guide

Complete setup instructions to get your Admin Asset Health System running in minutes.

## ✅ Pre-Flight Checklist

Before you begin, ensure you have:
- [ ] GitHub account created
- [ ] Supabase account (free tier works)
- [ ] Vercel account (free tier works)
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Your asset data (500 items) ready

## 🚀 Setup Steps

### Step 1: Local Development Setup (5 minutes)

#### 1.1 Install Dependencies
```bash
cd "C:\Sustaiable Assets\admin-asset-health-app"
npm install
```

#### 1.2 Create Environment File
```bash
cp .env.example .env.local
```

### Step 2: Setup Supabase Project (10 minutes)

#### 2.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: admin-asset-health-prod
   - **Password**: Generate strong password and save it
   - **Region**: Choose closest to your location

#### 2.2 Get Your API Keys
1. After project is created, go to **Settings → API**
2. Copy these values:
   - `Project URL` → Copy to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → Copy to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2.3 Update .env.local
Edit `C:\Sustaiable Assets\admin-asset-health-app\.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

#### 2.4 Run Database Migrations
1. Go to Supabase SQL Editor (left sidebar → SQL Editor)
2. Click "New Query"
3. Copy entire content from `database/migrations/001_create_tables.sql`
4. Paste into the query editor
5. Click "Run"
6. Verify all tables created (check left sidebar → Tables)

### Step 3: Test Local Development (5 minutes)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**You should see:**
- Dashboard with mock data
- Navigation sidebar
- Professional Tailwind UI
- 4 chart types (pie, bar, area, line)
- Health status indicators

### Step 4: Import Your Asset Data (10-15 minutes)

#### 4.1 Prepare CSV File
Create a CSV with columns:
```
Asset Type,Product Name,Manufacturer,Asset ID,Barcode,Date of Manufacture,End of Sale,Last Date of Support,Replacement Product,Product Parts,Potential Health Impact
```

#### 4.2 Import via Supabase
1. Go to Supabase → Table Editor
2. Click on "assets" table
3. Click "Insert → New row"
4. Bulk insert from CSV (if available) or use API

#### 4.3 Verify Data
```bash
# Run this in Supabase SQL Editor to check
SELECT COUNT(*) as total_assets FROM assets;
```

Should return: `500`

### Step 5: Push to GitHub (5 minutes)

#### 5.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `admin-asset-health-app`
3. Choose **Private** (recommended)
4. Do NOT add README (we have one)
5. Click "Create repository"

#### 5.2 Push Your Code
```bash
cd "C:\Sustaiable Assets\admin-asset-health-app"
git remote add origin https://github.com/YOUR_USERNAME/admin-asset-health-app.git
git branch -M main
git push -u origin main
```

### Step 6: Deploy to Vercel (5 minutes)

#### 6.1 Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

#### 6.2 Add Environment Variables
1. In Vercel, go to Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGc...`
3. Click "Save"

#### 6.3 Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Once complete, click the deployment URL

#### 6.4 Update Supabase URL Config
1. In Supabase, go to Authentication → URL Configuration
2. Under "Redirect URLs", add your Vercel URL
3. Example: `https://your-app.vercel.app`

## 📊 What's Included

### Dashboard Pages
- **Home** (`/`): Executive overview with 6 KPI cards and 2 charts
- **Assets** (`/assets`): Searchable asset inventory with 50 fields
- **Alerts** (`/alerts`): Alert management with severity levels
- **Reports** (`/reports`): Advanced analytics with 4 visualization types
- **Settings** (`/settings`): User preferences and configuration

### Database Schema
- **assets**: 500+ item inventory
- **manufacturers**: 7 equipment manufacturers
- **health_metrics**: Real-time health tracking
- **alerts**: Alert system with escalation
- **compliance_metrics**: Compliance scoring
- **users**: User access control
- **audit_log**: Activity tracking

### UI Components
- Professional Tailwind CSS design system
- Responsive grid/flex layouts
- Status indicators with pulse animation
- Interactive charts with Recharts
- Badge components with 4 variants
- Card components with semantic sections
- Sidebar navigation with mobile menu
- Dark mode support ready

## 🔧 Configuration Options

### Tailwind Theme Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: { ... },    // Blue - change to your brand color
  success: { ... },    // Green - healthy status
  warning: { ... },    // Amber - at-risk status
  danger: { ... },     // Red - critical status
}
```

### Alert Thresholds
Edit `src/lib/api/assets.ts`:
```typescript
// Change these days to adjust alert levels
if (daysUntilEnd < 0) return 'end-of-life'        // Support ended
if (daysUntilEnd < 30) return 'critical'          // Critical: 30 days
if (daysUntilEnd < 90) return 'at-risk'           // At risk: 90 days
return 'healthy'                                   // Healthy: 90+ days
```

### Compliance Scoring
Edit `src/lib/api/assets.ts`:
```typescript
const scores = {
  healthy: 100,
  'at-risk': 70,
  critical: 40,
  'end-of-life': 0,
}
```

## 🧪 Testing

### Test Dashboard
1. Open http://localhost:3000
2. Verify all KPI cards show numbers
3. Check charts render properly
4. Test sidebar navigation
5. Test mobile responsiveness

### Test Alerts Page
1. Navigate to `/alerts`
2. Click filter buttons
3. Test resolve/delete actions
4. Verify alert counts update

### Test Assets Page
1. Navigate to `/assets`
2. Test search functionality
3. Test health status filter
4. Verify table sorting

## 🚨 Common Issues & Solutions

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "ENOENT: DEPLOYMENT.md not found"
Ensure all files are committed to Git before deploying to Vercel

### Environment variables not loading
1. Check `.env.local` has correct keys
2. Restart dev server: `npm run dev`
3. Verify Vercel environment variables in dashboard

### Database connection error
1. Check Supabase project status (ensure it's not paused)
2. Verify project URL is correct
3. Check anon key hasn't expired
4. Verify network connectivity

## 📈 Performance Optimization

### Production Builds
```bash
npm run build
npm run start
```

### Analytics
Vercel automatically provides:
- Build time metrics
- Core Web Vitals
- Function execution times
- Error rates

### Monitoring
Setup monitoring (recommended):
- Sentry for error tracking
- LogRocket for session replay
- DataDog for infrastructure monitoring

## 🔐 Security Best Practices

✓ **Environment Variables**: Never commit `.env.local` to Git
✓ **Authentication**: Configure Supabase Auth providers
✓ **RLS Policies**: Enable Row Level Security
✓ **HTTPS**: Always use HTTPS in production
✓ **Backups**: Enable automatic backups in Supabase
✓ **Monitoring**: Setup error tracking and logging

## 📞 Support

### Getting Help
1. **Documentation**: Check README.md
2. **Deployment**: Check DEPLOYMENT.md
3. **GitHub Issues**: Create issue in your repo
4. **Supabase Docs**: https://supabase.com/docs
5. **Next.js Docs**: https://nextjs.org/docs

### Contact
Email: shjsmith27@gmail.com

## 🎯 Next Steps After Setup

1. ✅ Import all 500 assets
2. ✅ Setup user accounts in Supabase Auth
3. ✅ Configure alert notification preferences
4. ✅ Customize colors to match your brand
5. ✅ Setup email notifications
6. ✅ Generate initial reports
7. ✅ Train team on usage
8. ✅ Monitor dashboard metrics

## 📋 Post-Deployment Checklist

- [ ] Assets loaded (500 total)
- [ ] Dashboard showing correct data
- [ ] Alerts generating properly
- [ ] User login works
- [ ] Email notifications configured
- [ ] Backups enabled
- [ ] SSL certificate installed
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Team trained on usage

## 🎉 Congratulations!

Your professional Admin Asset Health System is now live!

**You now have:**
- Real-time asset health monitoring
- Automated alert system
- Professional executive dashboards
- Compliance tracking
- Advanced analytics
- Cost projections
- Mobile-responsive interface

**Ready to demonstrate the benefits of holistic asset management to your team!**

# Deployment Guide

Complete step-by-step guide to deploy the Admin Asset Health System to production.

## Prerequisites

- GitHub account with repository access
- Supabase account
- Vercel account
- Domain name (optional)

## Step 1: Prepare GitHub Repository

### 1.1 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create new repository: `admin-asset-health-app`
3. Choose **Public** or **Private** (recommended: Private for security)
4. Skip "Add README" (we have one)

### 1.2 Push Code to GitHub

```bash
cd admin-asset-health-app
git remote add origin https://github.com/yourusername/admin-asset-health-app.git
git branch -M main
git push -u origin main
```

## Step 2: Setup Supabase Project

### 2.1 Create Supabase Project

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: `admin-asset-health`
   - **Password**: Generate strong password
   - **Region**: Choose closest to your location
4. Wait for project to initialize (5-10 minutes)

### 2.2 Run Database Migrations

1. Go to Supabase SQL Editor
2. Copy entire content from `database/migrations/001_create_tables.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify all tables created successfully

### 2.3 Get Connection Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Save these credentials (needed for Vercel)

### 2.4 Setup Authentication

1. Go to Authentication → Providers
2. Enable Email/Password provider
3. Configure email templates (optional)
4. Go to URL Configuration
5. Add your Vercel project URL

### 2.5 Setup Row Level Security (RLS)

1. Go to Authentication → Policies
2. Create policies for:
   - Users can view their own data
   - Admins can view/edit all data
   - Managers can view data for their team

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Click "Import"

### 3.2 Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3.3 Configure Build Settings

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Verify deployment success
4. Visit your Vercel URL

## Step 4: Post-Deployment Configuration

### 4.1 Update Supabase URL Configuration

1. Go to Supabase → Authentication → URL Configuration
2. Add your Vercel production URL
3. Example: `https://your-app.vercel.app`

### 4.2 Setup Custom Domain (Optional)

1. In Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (24-48 hours)

### 4.3 Enable Production Features

1. Setup monitoring and logging
2. Enable real-time subscriptions in Supabase
3. Configure email notifications
4. Setup backup policies

### 4.4 Import Asset Data

1. Prepare CSV with your asset data
2. Use Supabase data import or API
3. Verify data appears in dashboard

## Step 5: Continuous Deployment

### 5.1 Setup Auto-Deploy

1. Vercel automatically deploys on push to main
2. Each push triggers build and deployment
3. Check deployment status in Vercel dashboard

### 5.2 Setup Preview Deployments

1. Vercel creates preview deploys for PRs
2. Share preview URLs for testing
3. Deploy to production when approved

## Step 6: Monitoring & Maintenance

### 6.1 Monitor Application

- Check Vercel analytics and logs
- Monitor Supabase performance metrics
- Setup error tracking (Sentry recommended)
- Monitor uptime and response times

### 6.2 Regular Backups

1. Enable Supabase automated backups
2. Set backup frequency to daily
3. Test restore process regularly

### 6.3 Security Updates

1. Keep dependencies updated
2. Run `npm audit` regularly
3. Update Next.js and other packages
4. Monitor security advisories

## Troubleshooting

### Build Fails

**Error**: `ENOENT: no such file or directory`
- **Solution**: Ensure all files are committed to Git
- Run: `git add . && git commit -m "Fix"`

**Error**: `Module not found`
- **Solution**: Check `tsconfig.json` paths
- Run: `npm install` locally first

### Database Connection Issues

**Error**: `Connection refused`
- **Solution**: Check Supabase project is active
- Verify connection string in environment variables
- Check firewall/network settings

**Error**: `RLS violation`
- **Solution**: Check RLS policies are configured
- Verify user permissions
- Check JWT token validity

### Performance Issues

**Slow dashboard load**:
- Enable database query caching
- Optimize Recharts rendering
- Use React.memo for components
- Check Supabase query performance

## Rollback Procedures

### Rollback Vercel Deployment

1. Go to Vercel Deployments
2. Find previous successful deployment
3. Click "Promote to Production"
4. Verify rollback successful

### Rollback Database Changes

1. Supabase → Backups
2. Restore from backup point
3. Verify data integrity
4. Update application if needed

## Performance Optimization

### Frontend Optimization

```bash
# Analyze bundle size
npm run build
npx next/bundle-analyzer
```

### Database Optimization

1. Create indexes on frequently queried columns
2. Enable query result caching
3. Use read replicas for analytics queries

### Caching Strategy

- Implement Redis caching (optional)
- Cache dashboard metrics (5 minutes)
- Cache asset list (10 minutes)
- Cache alerts (1 minute)

## Security Checklist

- [ ] Environment variables set correctly
- [ ] RLS policies configured
- [ ] Email verification enabled
- [ ] Rate limiting configured
- [ ] CORS configured properly
- [ ] Sensitive data not logged
- [ ] SSL/TLS enabled
- [ ] Regular security audits scheduled
- [ ] Backup strategy in place
- [ ] Incident response plan documented

## Support & Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Issues](https://github.com/yourusername/admin-asset-health-app/issues)

## Next Steps

1. **Configure Analytics**: Setup Supabase Analytics
2. **Setup Alerts**: Configure email/Slack notifications
3. **Import Data**: Load your 500 assets
4. **User Access**: Setup team members
5. **Customization**: Brand colors and configurations

## Contact Support

For deployment issues:
- Email: shjsmith27@gmail.com
- GitHub Issues: Create a detailed issue

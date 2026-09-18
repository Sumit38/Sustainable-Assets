# Asset Health System

A professional web application for monitoring asset health, managing compliance, and generating real-time alerts for office furniture and equipment lifecycle management.

## 🚀 Features

### Core Functionality
- **Real-time Dashboard**: At-a-glance health status overview with interactive charts
- **Asset Inventory**: Comprehensive asset database with 500+ items tracked
- **Health Monitoring**: Automatic health status calculation based on support lifecycle
- **Alert System**: Intelligent alerts for critical events (support ending, health risks, compliance issues)
- **Compliance Tracking**: Track ergonomic compliance and health impact metrics
- **Advanced Analytics**: 6 professional dashboards with trends and projections
- **Export & Reports**: Generate PDF/CSV reports with insights and recommendations

### Dashboard Pages
1. **Holistic View**: Executive-level health overview with key metrics
2. **Asset Inventory**: Searchable, filterable asset list with detailed information
3. **Alert Management**: Monitor and manage real-time system alerts
4. **Lifecycle Dashboard**: Track asset lifecycle from manufacture to end-of-life
5. **Health Impact**: Visualize health risks and impact assessment
6. **Compliance Scoring**: Compliance metrics and violation tracking
7. **Reports & Analytics**: Advanced analytics with trends and cost projections

## 📊 Asset Categories

The system manages three main asset types:
- **Chairs**: 250+ units (50% of inventory)
- **Tables**: 150+ units (30% of inventory)
- **Cubicle Equipment**: 100+ units (20% of inventory)

### Manufacturers Tracked
- Godrej Interio
- IKEA
- Herman Miller
- Durian
- Featherlite
- Zuari
- Nilkamal

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.3
- **Charts**: Recharts 2.10
- **Icons**: Lucide React
- **State**: Zustand + SWR for data fetching

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js API routes

### Deployment
- **Hosting**: Vercel (Frontend)
- **Database**: Supabase Cloud
- **Version Control**: GitHub

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- Supabase account
- Vercel account

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/admin-asset-health-app.git
cd admin-asset-health-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Setup Database
1. Go to [Supabase Console](https://supabase.com)
2. Create a new project
3. Run the migration SQL from `database/migrations/001_create_tables.sql`
4. Copy your project URL and anon key to `.env.local`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄 Database Schema

### Core Tables
- **assets**: Main asset inventory (500+ records)
- **manufacturers**: Manufacturer information (7 manufacturers)
- **replacement_products**: Recommended replacements
- **health_metrics**: Health status and compliance scores
- **alerts**: Real-time alert system
- **compliance_metrics**: Detailed compliance tracking
- **users**: User access control
- **audit_log**: Activity tracking

### Key Relationships
- Assets → Manufacturers (N:1)
- Assets → Replacement Products (N:1)
- Assets → Health Metrics (1:1)
- Alerts → Assets (N:1)
- Compliance Metrics → Assets (1:1)

## 🔒 Security Features

- Row-level security (RLS) policies in Supabase
- JWT-based authentication
- HTTPS required for production
- Environment variable protection
- Audit logging for all changes

## 📈 Health Status Calculation

Assets are classified into health statuses based on support lifecycle:

```
- Healthy: Support ends > 90 days from now
- At Risk: Support ends 30-90 days from now
- Critical: Support ends < 30 days from now
- End of Life: Support already ended
```

## 🔔 Alert Types

1. **Support Ending**: Asset support approaching or ended
2. **Health Risk**: Potential ergonomic or health issues
3. **Compliance Violation**: Asset doesn't meet compliance standards
4. **Maintenance**: Scheduled maintenance or inspection needed

## 📊 Compliance Scoring

Compliance score (0-100) based on:
- Support lifecycle status
- Ergonomic compliance standards
- Health risk assessment
- Age of asset

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Connect to Vercel
- Go to [Vercel Dashboard](https://vercel.com)
- Click "New Project"
- Import from GitHub
- Add environment variables
- Deploy

### Deploy Database Migrations

```bash
# Using Supabase CLI (install first)
supabase link --project-ref your_project_ref
supabase db push
```

Or manually run SQL from Supabase Console.

## 📱 Responsive Design

The application is fully responsive:
- **Mobile**: 375px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up

All charts and tables adapt to screen size.

## 🎨 Color Scheme

- **Primary**: Blue (#0ea5e9)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#eab308)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray scale

## 📝 Data Import

To import your asset data:

1. Prepare CSV with columns:
   - Asset Type
   - Product Name
   - Manufacturer
   - Asset ID
   - Barcode
   - Date of Manufacture
   - End of Sale
   - Last Date of Support
   - Replacement Product
   - Product Parts
   - Potential Health Impact

2. Use Supabase data import tool or API

## 🐛 Troubleshooting

### Connection Issues
- Check Supabase URL and key in `.env.local`
- Verify RLS policies are correctly configured
- Check network connectivity

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear npm cache: `npm cache clean --force`

### Database Issues
- Check Supabase project is active
- Verify migrations ran successfully
- Check connection limits in Supabase dashboard

## 📚 API Documentation

### Assets API
- `GET /api/assets` - List all assets
- `GET /api/assets/:id` - Get asset details
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Alerts API
- `GET /api/alerts` - List pending alerts
- `POST /api/alerts/:id/resolve` - Resolve alert
- `DELETE /api/alerts/:id` - Delete alert

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📄 License

This project is proprietary and confidential.

## 📧 Support

For support, email shjsmith27@gmail.com or create an issue in GitHub.

## 🙏 Acknowledgments

- Built with Next.js and React
- Powered by Supabase
- Deployed on Vercel
- Icons from Lucide React
- Charts from Recharts

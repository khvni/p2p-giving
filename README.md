# MyFundAction - Peer-to-Peer Giving Platform

A gamified peer-to-peer fundraising platform for Islamic charity and humanitarian causes, built with Next.js 15, Prisma, Stripe, and modern web technologies.

## Features

### Core Fundraising
- ✅ Create P2P campaigns with rich text editor
- ✅ Upload campaign images and media
- ✅ Set fundraising goals and deadlines
- ✅ Campaign categories (Education, Healthcare, Zakat, Sadaqah, etc.)
- ✅ Real-time progress tracking
- ✅ Campaign updates and impact stories

### Gamification
- 🏆 Points system for donations, campaigns, and shares
- 🎖️ Badge system with multiple rarities (Common, Rare, Epic, Legendary)
- 📊 User levels based on total points
- 🎉 Confetti animations on achievement unlock
- 🏅 Milestone tracking

### Leaderboards
- 👑 Top Fundraisers
- 💝 Top Donors
- 👥 Top Teams
- 📅 Time period filters (All Time, Monthly, Weekly, Daily)

### Team Fundraising
- 👫 Create and join fundraising teams
- 🎯 Team goals and progress tracking
- 📈 Team leaderboards and competitions
- 🤝 Team member management

### Social Sharing
- 📱 Facebook Share Dialog integration
- 🐦 Twitter Web Intents
- 💬 WhatsApp deep linking
- 📋 Copy-to-clipboard share links
- 🔗 Referral code tracking

### Payment Processing
- 💳 Stripe checkout integration
- 💰 One-time and recurring donations
- 🧾 Donation receipts
- 🔒 PCI-compliant payment handling
- 🌍 Multi-currency support (MYR primary)

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Modern component library
- **React Hook Form + Zod** - Form validation
- **React Rewards** - Confetti animations
- **Chart.js** - Data visualization
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database
- **NextAuth v5** - Authentication
- **bcryptjs** - Password hashing

### Payments
- **Stripe** - Payment processing
- **Stripe Webhooks** - Real-time updates

### State Management
- **Zustand** - Global UI state
- **React Query** - Server state

### Internationalization
- **next-intl** - i18n support (English + Bahasa Malaysia)

## Getting Started

### Prerequisites
- Node.js 18.x or later
- PostgreSQL database
- Stripe account
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd p2p-giving
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/p2p_giving_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/p2p_giving_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Other services (optional)
RESEND_API_KEY="re_..."
NEXT_PUBLIC_FACEBOOK_APP_ID="..."
```

4. Set up the database:
```bash
# Push Prisma schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
p2p-giving/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── campaigns/            # Campaign pages
│   ├── leaderboard/          # Leaderboard page
│   ├── teams/                # Team pages
│   ├── badges/               # Badges page
│   ├── impact/               # Impact dashboard
│   ├── profile/              # User profile
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   ├── layout/               # Layout components
│   ├── campaign/             # Campaign components
│   ├── donation/             # Donation components
│   ├── team/                 # Team components
│   └── gamification/         # Gamification components
├── lib/                      # Utility functions
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
├── prisma/                   # Prisma schema and migrations
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script
├── public/                   # Static assets
├── .env.example              # Environment variables template
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## Database Schema

The application uses a comprehensive Prisma schema with the following models:

- **User** - User accounts with roles and gamification stats
- **Campaign** - Fundraising campaigns
- **Donation** - Donation records and payment tracking
- **Team** - Fundraising teams
- **TeamMember** - Team membership
- **Badge** - Achievement badges
- **UserBadge** - User badge unlocks
- **Milestone** - Gamification milestones
- **FundraiserStats** - User fundraising statistics
- **Leaderboard** - Cached leaderboard data
- **ShareTracking** - Social share tracking
- **Challenge** - Team challenges
- **CampaignUpdate** - Campaign updates

## API Routes

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[slug]` - Get campaign
- `PATCH /api/campaigns/[slug]` - Update campaign
- `DELETE /api/campaigns/[slug]` - Delete campaign

### Donations
- `POST /api/campaigns/[slug]/donate` - Create donation
- `POST /api/donations/webhook` - Stripe webhook handler

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/[slug]` - Get team
- `POST /api/teams/[slug]/join` - Join team

### Leaderboards
- `GET /api/leaderboards` - Get leaderboards

### Badges
- `GET /api/badges` - List badges
- `GET /api/users/[id]/badges` - Get user badges

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:push          # Push Prisma schema
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run postinstall      # Generate Prisma Client
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel Dashboard
4. Configure Stripe webhook URL in Stripe Dashboard

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- Database connection (Supabase or Vercel Postgres)
- NextAuth configuration
- Stripe keys (production)
- Cloudinary (for image storage)
- Optional: Analytics, monitoring services

## Features Roadmap

### MVP (Phase 1) ✅
- Campaign management
- Donation processing
- Gamification core
- Leaderboards
- Social sharing
- Team fundraising
- Impact visualization

### Phase 2 (Post-MVP)
- Recurring donations
- Payment Gateway Malaysia (FPX)
- Campaign analytics
- Email notifications
- WhatsApp notifications
- Advanced filtering

### Phase 3 (Future)
- Mobile app
- Live streaming events
- NFT badges
- Cryptocurrency donations
- AI-powered recommendations

## Malaysian Context

### Islamic Giving Categories
- **Zakat** - Obligatory charity (2.5% of wealth)
- **Sadaqah** - Voluntary charity
- **Qurbani** - Animal sacrifice
- **Wakaf** - Endowment

### Localization
- English and Bahasa Malaysia support
- Malaysian phone number validation
- MYR currency formatting
- WhatsApp integration (popular in Malaysia)

## Testing

```bash
# Unit tests (to be added)
npm run test

# E2E tests with Playwright
npm run test:e2e
```

## Security

- NextAuth for authentication
- Role-based access control (RBAC)
- PCI-compliant payment handling (Stripe)
- HTTPS enforced
- Database encryption at rest
- Rate limiting on API routes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

ISC

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## Acknowledgments

- MyFundAction (Yayasan Kebajikan Muslim)
- Built with Next.js, Prisma, Stripe, and modern web technologies
- Inspired by platforms like GoFundMe, JustGiving, and Tiltify

---

**Built with ❤️ for MyFundAction**

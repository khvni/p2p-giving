# Peer-to-Peer Giving Platform - MyFundAction

## 1. PROJECT CONTEXT

### About MyFundAction
MyFundAction (Yayasan Kebajikan Muslim) is a youth-driven Malaysian NGO established in 2014, dedicated to helping low-income groups, underprivileged communities, and senior citizens. The organization operates globally across 5 countries with:
- **18,000+ active volunteers** (90% youth)
- **180 full-time staff members**
- **Global operations** in Malaysia, New Zealand, Egypt, Indonesia, Africa, and Japan
- **Islamic charity focus** including Sadaqah, Zakat, and various humanitarian programs

### Problem Statement
MyFundAction needs to **amplify donor engagement and expand fundraising reach** through peer-to-peer (P2P) campaigns. Current challenges include:
- **Limited reach**: Relying solely on direct donations and centralized campaigns
- **Low engagement**: Donors give once but don't become ongoing advocates
- **Missed viral potential**: No social sharing or gamification to encourage peer fundraising
- **Lack of community**: No competitive elements or team challenges to foster connection
- **Manual tracking**: Difficult to measure individual fundraiser impact and celebrate milestones

The organization needs a **gamified P2P fundraising platform** where individuals and teams can create campaigns, compete on leaderboards, earn badges, and share impact on social media, turning donors into active fundraisers.

### Current State & Pain Points
- No peer-to-peer fundraising capability
- Donors are passive recipients of fundraising asks
- No gamification or incentives for recurring giving
- Limited social sharing tools
- No way to track individual fundraiser performance
- Missing community engagement features
- No team-based challenges or competitions
- Difficult to showcase collective impact

### Success Metrics for MVP
- **Campaign creation**: 100+ P2P campaigns created in first 3 months
- **Fundraiser activation**: 30%+ of donors become active fundraisers
- **Social shares**: Average 5+ shares per campaign
- **Team participation**: 20+ teams created with 5+ members each
- **Gamification engagement**: 60%+ of users earn at least one badge
- **Repeat donations**: 40%+ of donors give to multiple campaigns
- **Mobile usage**: 70%+ of campaign creation from mobile devices
- **Impact visibility**: 90%+ of campaigns display real-time impact updates

---

## 2. TECHNICAL ARCHITECTURE

### Tech Stack

**Frontend:**
- Next.js 15 (App Router) with React 19
- TypeScript (strict mode)
- Shadcn UI + Tailwind CSS + Radix UI
- React Hook Form + Zod validation
- react-rewards (confetti animations for achievements)
- Chart.js / Recharts (impact visualization)
- next-intl (English + Bahasa Malaysia)

**Backend:**
- Next.js API Routes (serverless)
- Prisma ORM
- Vercel Postgres (development)
- Supabase PostgreSQL (production)

**Authentication:**
- NextAuth v5 (Auth.js)
- Role-based access control (RBAC)
- Roles: Super Admin, Admin, Fundraiser, Donor, Team Leader

**Payment Processing:**
- Stripe (primary - international payments)
- Payment Gateway Malaysia integration (local payments)
- Webhook handling for real-time updates

**Gamification:**
- Oasis-inspired framework (points, badges, milestones, leaderboards)
- Custom gamification engine for donation tracking
- Real-time leaderboard updates

**Social Sharing:**
- Facebook Share Dialog API
- Twitter Web Intents
- WhatsApp deep links
- Instagram sharing (via QR codes and shareable images)
- Open Graph meta tags for rich previews

**File Storage:**
- Vercel Blob (development)
- Cloudinary (production - campaign images, impact visuals)

**Email/Notifications:**
- Resend for transactional emails
- Web Push API for browser notifications
- WhatsApp Business API (future enhancement)

**State Management:**
- Zustand for global UI state
- React Query for server state management
- Real-time updates via Server-Sent Events (SSE)

**Testing:**
- Vitest for unit/integration tests
- Playwright MCP for E2E testing

**Analytics & Monitoring:**
- Vercel Analytics
- Sentry for error tracking
- Posthog for user behavior analytics
- Mixpanel for funnel analysis (campaign creation → donation)

### Suggested Prisma Schema

```prisma
// schema.prisma

model User {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Personal Information
  email         String   @unique
  name          String
  phone         String?
  avatar        String?
  bio           String?  @db.Text

  // Authentication
  emailVerified DateTime?
  password      String   // Hashed

  // Role
  role          UserRole @default(DONOR)

  // Gamification
  totalPoints   Int      @default(0)
  level         Int      @default(1)
  badges        UserBadge[]

  // Relationships
  campaigns     Campaign[]
  donations     Donation[]
  fundraiserStats FundraiserStats?
  teamMemberships TeamMember[]
  createdTeams  Team[]   @relation("TeamCreator")

  // Settings
  preferredCurrency String @default("MYR")
  language      String   @default("en")
  notifications Json?    // Notification preferences

  @@index([email])
  @@index([totalPoints])
}

model Campaign {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Basic Information
  title         String
  slug          String   @unique
  description   String   @db.Text
  story         String?  @db.Text // Rich text story

  // Campaign Details
  goalAmount    Decimal  @db.Decimal(12, 2)
  raisedAmount  Decimal  @default(0) @db.Decimal(12, 2)
  currency      String   @default("MYR")

  // Images & Media
  coverImage    String?
  videoUrl      String?
  images        String[] // Additional images

  // Dates
  startDate     DateTime @default(now())
  endDate       DateTime?

  // Status
  status        CampaignStatus @default(DRAFT)
  visibility    CampaignVisibility @default(PUBLIC)

  // Categorization
  category      CampaignCategory
  tags          String[] // ["education", "refugee", "urgent"]

  // Creator
  creator       User     @relation(fields: [creatorId], references: [id])
  creatorId     String

  // Beneficiary Link (optional - link to beneficiary system)
  beneficiaryId String?

  // Team (if part of team challenge)
  team          Team?    @relation(fields: [teamId], references: [id])
  teamId        String?

  // Social Sharing
  shareCount    Int      @default(0)
  viewCount     Int      @default(0)

  // Donations
  donations     Donation[]
  donationCount Int      @default(0)

  // Impact Tracking
  impactMetrics Json?    // Custom metrics per campaign type
  updates       CampaignUpdate[]

  // Settings
  allowRecurring Boolean  @default(true)
  allowAnonymous Boolean  @default(true)
  minDonation   Decimal? @db.Decimal(10, 2)
  maxDonation   Decimal? @db.Decimal(10, 2)

  @@index([status])
  @@index([category])
  @@index([creatorId])
  @@index([teamId])
  @@index([endDate])
  @@index([slug])
}

model Donation {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Donation Details
  amount        Decimal  @db.Decimal(12, 2)
  currency      String   @default("MYR")

  // Donor Information
  donor         User?    @relation(fields: [donorId], references: [id])
  donorId       String?
  donorName     String?  // For anonymous/guest donations
  donorEmail    String?
  isAnonymous   Boolean  @default(false)

  // Campaign
  campaign      Campaign @relation(fields: [campaignId], references: [id])
  campaignId    String

  // Payment
  paymentStatus PaymentStatus @default(PENDING)
  paymentMethod String   // "stripe", "fpx", "card"
  paymentIntentId String? @unique // Stripe payment intent ID
  transactionId String?  @unique // Local payment gateway transaction ID
  receiptUrl    String?

  // Message & Visibility
  message       String?  @db.Text
  isPublic      Boolean  @default(true)

  // Recurring
  isRecurring   Boolean  @default(false)
  recurringFrequency String? // "monthly", "weekly"

  // Impact (optional - for specific cause tracking)
  impactData    Json?

  // Refund
  refundedAt    DateTime?
  refundReason  String?

  @@index([campaignId])
  @@index([donorId])
  @@index([paymentStatus])
  @@index([createdAt])
  @@index([paymentIntentId])
}

model Team {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Team Information
  name          String
  slug          String   @unique
  description   String?  @db.Text
  avatar        String?

  // Team Goal
  goalAmount    Decimal  @db.Decimal(12, 2)
  raisedAmount  Decimal  @default(0) @db.Decimal(12, 2)
  currency      String   @default("MYR")

  // Team Leader
  creator       User     @relation("TeamCreator", fields: [creatorId], references: [id])
  creatorId     String

  // Members
  members       TeamMember[]
  memberCount   Int      @default(0)
  maxMembers    Int?     // Optional limit

  // Campaigns
  campaigns     Campaign[]
  campaignCount Int      @default(0)

  // Status
  status        TeamStatus @default(ACTIVE)

  // Challenge (if part of competition)
  challengeId   String?
  challenge     Challenge? @relation(fields: [challengeId], references: [id])

  @@index([slug])
  @@index([creatorId])
  @@index([status])
  @@index([challengeId])
}

model TeamMember {
  id            String   @id @default(cuid())
  joinedAt      DateTime @default(now())

  team          Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId        String

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  role          TeamMemberRole @default(MEMBER)

  // Individual stats within team
  raisedAmount  Decimal  @default(0) @db.Decimal(12, 2)
  campaignCount Int      @default(0)

  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

model Challenge {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Challenge Information
  name          String
  description   String   @db.Text

  // Challenge Period
  startDate     DateTime
  endDate       DateTime

  // Prize/Reward
  prize         String?  @db.Text

  // Challenge Type
  type          ChallengeType // "most_raised", "most_donors", "most_campaigns"

  // Status
  status        ChallengeStatus @default(UPCOMING)

  // Teams
  teams         Team[]

  // Rules
  rules         Json?

  @@index([startDate])
  @@index([endDate])
  @@index([status])
}

model CampaignUpdate {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  campaign      Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  campaignId    String

  title         String
  content       String   @db.Text
  images        String[] // Update images

  // Engagement
  likeCount     Int      @default(0)

  @@index([campaignId])
  @@index([createdAt])
}

model Badge {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Badge Information
  name          String   @unique
  description   String
  icon          String   // URL or icon identifier

  // Requirements
  category      BadgeCategory
  requirement   Json     // Flexible requirements

  // Rarity
  rarity        BadgeRarity @default(COMMON)

  // Points
  pointsReward  Int      @default(0)

  // Users who earned this badge
  users         UserBadge[]

  @@index([category])
  @@index([rarity])
}

model UserBadge {
  id            String   @id @default(cuid())
  earnedAt      DateTime @default(now())

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String

  badge         Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  badgeId       String

  @@unique([userId, badgeId])
  @@index([userId])
  @@index([earnedAt])
}

model Milestone {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Milestone Information
  name          String
  description   String
  type          MilestoneType

  // Threshold
  threshold     Int      // e.g., 100 for "100 donations", 10000 for "RM 10,000 raised"

  // Reward
  pointsReward  Int      @default(0)
  badgeReward   String?  // Badge name to award

  @@index([type])
}

model FundraiserStats {
  id            String   @id @default(cuid())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        String   @unique

  // Campaign Stats
  totalCampaigns Int     @default(0)
  activeCampaigns Int    @default(0)

  // Fundraising Stats
  totalRaised   Decimal  @default(0) @db.Decimal(12, 2)
  totalDonations Int     @default(0)
  averageDonation Decimal @default(0) @db.Decimal(10, 2)

  // Social Stats
  totalShares   Int      @default(0)
  totalViews    Int      @default(0)

  // Engagement
  rank          Int?     // Overall leaderboard rank
  lastActive    DateTime @default(now())

  @@index([totalRaised])
  @@index([rank])
}

model Leaderboard {
  id            String   @id @default(cuid())
  updatedAt     DateTime @updatedAt

  // Leaderboard Type
  type          LeaderboardType // "top_fundraisers", "top_donors", "top_teams"
  period        LeaderboardPeriod // "all_time", "monthly", "weekly"

  // Data (cached JSON)
  data          Json     // Array of { userId/teamId, name, amount, rank }

  // Period dates (for time-based leaderboards)
  startDate     DateTime?
  endDate       DateTime?

  @@unique([type, period, startDate])
  @@index([type])
  @@index([updatedAt])
}

model ShareTracking {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())

  // Campaign being shared
  campaignId    String

  // User who shared (if logged in)
  userId        String?

  // Platform
  platform      SocialPlatform

  // Click tracking
  clickCount    Int      @default(0)

  // Referral code (for tracking conversions)
  referralCode  String   @unique

  @@index([campaignId])
  @@index([userId])
  @@index([referralCode])
}

// Enums

enum UserRole {
  SUPER_ADMIN
  ADMIN
  FUNDRAISER
  DONOR
  TEAM_LEADER
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  COMPLETED
  PAUSED
  CANCELLED
}

enum CampaignVisibility {
  PUBLIC
  UNLISTED
  PRIVATE
}

enum CampaignCategory {
  EDUCATION
  HEALTHCARE
  FOOD_RELIEF
  SHELTER
  DISASTER_RELIEF
  ORPHAN_CARE
  ELDERLY_CARE
  ZAKAT
  SADAQAH
  QURBANI
  WAKAF
  OTHER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum TeamStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum TeamMemberRole {
  LEADER
  CO_LEADER
  MEMBER
}

enum ChallengeType {
  MOST_RAISED
  MOST_DONORS
  MOST_CAMPAIGNS
  FASTEST_GOAL
}

enum ChallengeStatus {
  UPCOMING
  ACTIVE
  COMPLETED
}

enum BadgeCategory {
  FUNDRAISING
  DONATION
  SOCIAL_SHARING
  MILESTONE
  SPECIAL_EVENT
}

enum BadgeRarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
}

enum MilestoneType {
  TOTAL_RAISED
  DONATION_COUNT
  CAMPAIGN_COUNT
  SHARE_COUNT
  DAYS_ACTIVE
}

enum LeaderboardType {
  TOP_FUNDRAISERS
  TOP_DONORS
  TOP_TEAMS
  TOP_CAMPAIGNS
}

enum LeaderboardPeriod {
  ALL_TIME
  MONTHLY
  WEEKLY
  DAILY
}

enum SocialPlatform {
  FACEBOOK
  TWITTER
  WHATSAPP
  INSTAGRAM
  TELEGRAM
  EMAIL
}
```

### Authentication & Authorization Strategy

**Roles & Permissions:**
- **Super Admin**: Full system access, platform settings, challenge creation
- **Admin**: Manage campaigns, approve featured campaigns, view all analytics
- **Fundraiser**: Create campaigns, manage own campaigns, view own stats
- **Team Leader**: Create teams, invite members, manage team campaigns
- **Donor**: Make donations, view donation history, earn badges

**Row-Level Security:**
- Users can only edit their own campaigns
- Team leaders can manage team settings and approve members
- Admins can moderate any campaign
- Public campaigns visible to all; private campaigns visible to creator only

### API Design Patterns

**RESTful API Routes:**
```
/api/campaigns
  GET    - List campaigns (paginated, filtered)
  POST   - Create campaign

/api/campaigns/[slug]
  GET    - Get single campaign
  PATCH  - Update campaign
  DELETE - Soft delete (archive)

/api/campaigns/[slug]/donate
  POST   - Create donation intent

/api/campaigns/[slug]/share
  POST   - Track social share

/api/campaigns/[slug]/updates
  GET    - List campaign updates
  POST   - Post update (creator only)

/api/donations
  GET    - List donations (filtered by campaign/user)
  POST   - Process donation

/api/donations/webhook
  POST   - Stripe webhook handler

/api/teams
  GET    - List teams
  POST   - Create team

/api/teams/[slug]
  GET    - Get team details
  PATCH  - Update team
  DELETE - Delete team

/api/teams/[slug]/join
  POST   - Join team

/api/teams/[slug]/leave
  POST   - Leave team

/api/leaderboards
  GET    - Get leaderboards (query: type, period)

/api/badges
  GET    - List all badges

/api/users/[id]/badges
  GET    - Get user badges

/api/users/[id]/stats
  GET    - Get fundraiser stats

/api/share/[referralCode]
  GET    - Track share click

/api/challenges
  GET    - List challenges
  POST   - Create challenge (admin only)
```

---

## 3. MVP FEATURE SPECIFICATION

### Must-Have (Phase 1 - MVP Demo)

**Campaign Management:**
- ✅ Create P2P campaign with rich text editor (WYSIWYG)
- ✅ Upload campaign images (cover + gallery)
- ✅ Set fundraising goal and deadline
- ✅ Choose campaign category (Education, Healthcare, etc.)
- ✅ View campaign list (grid/list view with filters)
- ✅ View campaign detail page (progress bar, donors, updates)
- ✅ Edit/pause/complete campaigns
- ✅ Campaign slug generation (SEO-friendly URLs)

**Donation Processing:**
- ✅ Stripe checkout integration
- ✅ Support one-time donations
- ✅ Anonymous donation option
- ✅ Donation with message
- ✅ Donation receipt generation
- ✅ Real-time campaign progress updates
- ✅ Minimum/maximum donation limits

**Gamification Core:**
- ✅ Points system (earn points for donations, campaigns, shares)
- ✅ Badge system with 10+ badges (First Donation, RM 1000 Raised, etc.)
- ✅ Milestone tracking (100 donations, RM 10,000 raised)
- ✅ User levels (1-10 based on points)
- ✅ Confetti animations on achievement unlock
- ✅ Badge showcase on profile

**Leaderboards:**
- ✅ Top Fundraisers (by amount raised)
- ✅ Top Donors (by total donated)
- ✅ Top Teams (by team total)
- ✅ Time period filters (All Time, Monthly, Weekly)
- ✅ Real-time rank updates

**Social Sharing:**
- ✅ Facebook Share Dialog integration
- ✅ Twitter Web Intents
- ✅ WhatsApp deep linking
- ✅ Copy-to-clipboard share link
- ✅ Open Graph meta tags for rich previews
- ✅ Share tracking (count shares per campaign)
- ✅ Referral code generation for tracking conversions

**Team Fundraising:**
- ✅ Create fundraising team
- ✅ Invite members via email/link
- ✅ Team dashboard (total raised, member stats)
- ✅ Team leaderboard
- ✅ Link campaigns to teams

**Impact Visualization:**
- ✅ Campaign progress bar
- ✅ Total platform impact (total raised, beneficiaries helped)
- ✅ Campaign-specific impact metrics (e.g., "10 meals provided")
- ✅ Simple charts (Chart.js - bar/line charts)
- ✅ Real-time donation feed

**User Profile:**
- ✅ Fundraiser profile page
- ✅ Display badges, points, level
- ✅ Campaign history
- ✅ Donation history
- ✅ Public/private profile toggle

**Authentication:**
- ✅ Email/password registration and login
- ✅ Email verification
- ✅ Password reset
- ✅ OAuth (Google, Facebook) - optional

**Mobile-Friendly:**
- ✅ Responsive design (mobile-first)
- ✅ Touch-friendly campaign creation
- ✅ Mobile payment optimization

### Should-Have (Phase 2 - Post-Demo)

- Recurring donations (monthly, weekly)
- Payment Gateway Malaysia integration (FPX, online banking)
- Campaign categories customization
- Advanced campaign analytics (conversion rates, traffic sources)
- Team challenges (create competitions between teams)
- Challenge leaderboards
- Instagram story sharing templates
- Email campaign updates to donors
- WhatsApp notifications for donations
- Campaign comments/reactions
- Fundraiser certification program
- Tax receipt generation (for tax-deductible donations)
- Multi-currency support
- Advanced filtering and search
- Campaign recommendations (AI-based)

### Could-Have (Future Enhancements)

- Video testimonials on campaigns
- Live streaming fundraising events
- NFT badges for top fundraisers
- Cryptocurrency donations
- Augmented reality (AR) impact visualization
- Mobile app (React Native)
- AI-powered campaign optimization suggestions
- Matching donation campaigns (employer matching)
- Peer-to-peer lending (Qard Hasan)
- Integration with Islamic giving calculators (Zakat, Nisab)
- Gamification leaderboard tournaments
- Virtual fundraising events
- SMS donation shortcodes
- Voice-activated donations (Alexa, Google Home)

### Out of Scope

- Beneficiary management (handled by beneficiary system)
- Volunteer management (handled by volunteer-mgmt system)
- Inventory management
- Project tracking (handled by projs-dashboard system)
- CRM functionality (handled by CRM system)
- Accounting/bookkeeping (handled by finance system)

---

## 4. MCP SERVER UTILIZATION GUIDE

### sequential-thinking
**Use for:**
- Complex gamification logic design (e.g., "How should badge unlock criteria scale with user growth?")
- Payment webhook handling strategy
- Leaderboard ranking algorithm optimization
- Campaign recommendation engine design
- Fraud detection patterns for donations

**Example:**
```
Use sequential-thinking to analyze: "What's the best approach to handle Stripe webhook retries and prevent duplicate donation records?"
```

### filesystem
**Use for:**
- Reading multiple component files simultaneously
- Batch file operations (creating components, utilities)
- Project structure analysis
- Finding specific code patterns across files

### fetch (imageFetch MCP)
**Use for:**
- Researching Stripe payment integration best practices
- Finding social sharing API documentation
- Studying gamification patterns
- Looking up Chart.js examples
- Researching Facebook Share Dialog implementation

### deepwiki
**Use for:**
- Exploring reference repos (Houdini, Oasis, Giver)
- Studying P2P fundraising best practices
- Understanding gamification frameworks
- Learning from open-source fundraising platforms

**Example repos to explore:**
- houdiniproject/houdini - P2P fundraising features
- isuru89/oasis - Gamification framework (points, badges, leaderboards)
- giverio/giver - Open source fundraising platform
- ngageoint/gamification-server - Gamification backend

### allpepper-memory-bank
**Use for:**
- Storing gamification rules and badge definitions
- Documenting payment integration decisions
- Recording social sharing implementation patterns
- Tracking campaign optimization strategies

**Files to create:**
- `gamification-rules.md` - Badge/point/milestone definitions
- `payment-integration.md` - Stripe setup and webhook handling
- `social-sharing-strategy.md` - Platform-specific sharing implementations
- `campaign-categories.md` - Islamic giving categories (Zakat, Sadaqah, etc.)

### playwright (MCP)
**Use for:**
- E2E testing critical user flows:
  - Campaign creation workflow
  - Donation checkout process
  - Social sharing functionality
  - Team creation and member invitation
  - Badge unlock scenarios
- Visual regression testing for campaign pages
- Screenshot generation for documentation

**Example test:**
```typescript
// Test campaign creation and donation flow
test('complete P2P campaign flow', async ({ page }) => {
  await page.goto('/campaigns/new');
  await page.fill('[name="title"]', 'Help Build a School');
  await page.fill('[name="goalAmount"]', '50000');
  await page.click('button[type="submit"]');

  // Navigate to campaign page
  await expect(page).toHaveURL(/\/campaigns\/.+/);

  // Make a donation
  await page.click('button:has-text("Donate Now")');
  await page.fill('[name="amount"]', '100');
  // ... Stripe checkout flow
});
```

### puppeteer
**Use for:**
- Browser automation for testing payment flows
- Generating social sharing preview images
- PDF receipt generation

---

## 5. REFERENCE IMPLEMENTATIONS

### GitHub Repositories to Clone/Reference

**Primary References:**
1. **Houdini** - https://github.com/houdiniproject/houdini
   - Ruby/Rails-based nonprofit fundraising platform
   - P2P campaign features, donation processing
   - Study campaign management and donor tracking
   - **Note**: Rails framework, adapt concepts to Next.js

2. **Oasis** - https://github.com/isuru89/oasis
   - Java-based gamification framework
   - Points, badges, milestones, leaderboards
   - Study gamification rule engine
   - Adapt logic to TypeScript/Prisma

3. **Giver** - https://github.com/giverio/giver
   - Open-source fundraising platform
   - Campaign creation, donation processing
   - Social sharing features

4. **Gamification Server** - https://github.com/ngageoint/gamification-server
   - Backend gamification system
   - Badge/achievement tracking
   - Leaderboard implementations

**Next.js Templates:**
5. **TailAdmin Next.js** - https://github.com/TailAdmin/free-nextjs-admin-dashboard
   - Use for dashboard UI
   - Charts, analytics visualization

6. **Next Shadcn Dashboard Starter** - https://github.com/Kiranism/next-shadcn-dashboard-starter
   - Modern Next.js 15 + Shadcn UI
   - Clean architecture patterns

**Payment Integration:**
7. **Next.js Stripe Examples** - https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript
   - Official Next.js + Stripe integration
   - Webhook handling patterns

**Gamification UI:**
8. **react-rewards** - https://github.com/thedevelobear/react-rewards
   - Confetti/emoji animations for achievements
   - Use for badge unlock celebrations

### Similar Projects to Study

- **GoFundMe** - P2P campaign UX and social sharing
- **JustGiving** - Team fundraising features
- **Donorbox** - Embedded donation forms
- **Tiltify** - Gamified fundraising for streamers
- **Charitybuzz** - Auction-based fundraising (inspiration for challenges)

### Recommended Tutorials/Docs

- **Stripe Payment Intents**: https://stripe.com/docs/payments/payment-intents
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Facebook Share Dialog**: https://developers.facebook.com/docs/sharing/reference/share-dialog
- **Twitter Web Intents**: https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
- **Chart.js**: https://www.chartjs.org/docs/latest/
- **react-rewards**: https://github.com/thedevelobear/react-rewards#readme
- **Next.js 15 App Router**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

---

## 6. DATA MIGRATION & INTEGRATION

### Integration with CRM System

**Donor Data Sync:**
- Link donations to CRM contacts
- Sync donor information (name, email, phone)
- Track donor journey (first donation → recurring donor → fundraiser)
- Share donor preferences and communication history

**API Endpoints:**
```typescript
// Sync donation to CRM
POST /api/crm/sync-donation
{
  donationId: "donation_123",
  crmContactId: "contact_456"
}

// Get donor profile from CRM
GET /api/crm/contacts/[email]
```

### Integration with Beneficiary System

**Impact Story Linking:**
- Link campaigns to specific beneficiaries
- Pull real-time impact updates from beneficiary system
- Display beneficiary photos/stories on campaigns
- Track services funded by campaign donations

**API Endpoints:**
```typescript
// Link campaign to beneficiary
PATCH /api/campaigns/[slug]/beneficiary
{
  beneficiaryId: "beneficiary_789"
}

// Get beneficiary impact data
GET /api/beneficiaries/[id]/impact
```

### Integration with Project Dashboard

**Project Funding:**
- Link campaigns to organization projects
- Track project funding milestones
- Display project progress on campaigns

### Stripe Integration Setup

**Webhook Configuration:**
```typescript
// app/api/donations/webhook/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Update donation status
  await prisma.donation.update({
    where: { paymentIntentId: paymentIntent.id },
    data: {
      paymentStatus: 'COMPLETED',
      // Update campaign raised amount
      campaign: {
        update: {
          raisedAmount: { increment: paymentIntent.amount / 100 },
          donationCount: { increment: 1 }
        }
      }
    }
  });

  // Award points and check for badge unlocks
  await awardDonationPoints(donation.donorId, paymentIntent.amount / 100);
  await checkBadgeUnlocks(donation.donorId);

  // Send confirmation email
  await sendDonationConfirmation(donation);

  // Update leaderboards
  await updateLeaderboards();
}
```

**Payment Intent Creation:**
```typescript
// app/api/campaigns/[slug]/donate/route.ts
export async function POST(req: Request, { params }) {
  const { amount, currency, donorEmail, message, isAnonymous } = await req.json();

  // Create donation record
  const donation = await prisma.donation.create({
    data: {
      amount,
      currency,
      donorEmail,
      message,
      isAnonymous,
      campaignId: campaign.id,
      paymentStatus: 'PENDING',
    }
  });

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      donationId: donation.id,
      campaignId: campaign.id,
    },
  });

  // Update donation with payment intent ID
  await prisma.donation.update({
    where: { id: donation.id },
    data: { paymentIntentId: paymentIntent.id }
  });

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    donationId: donation.id,
  });
}
```

### Malaysian Payment Gateway Integration

**FPX (Financial Process Exchange) Setup:**
```typescript
// lib/payment-gateway.ts
import axios from 'axios';

export async function createFPXPayment(donation: Donation) {
  const response = await axios.post(
    process.env.PAYMENT_GATEWAY_API_URL!,
    {
      merchant_id: process.env.MERCHANT_ID,
      amount: donation.amount,
      currency: 'MYR',
      order_id: donation.id,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/donations/callback`,
      // ... other FPX parameters
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}`,
      }
    }
  );

  return response.data.payment_url;
}
```

---

## 7. GIT WORKTREE WORKFLOW

### Setting Up Worktree for Isolated Development

**Why Worktrees?**
- Develop all 6 projects simultaneously with separate Claude Code instances
- Keep main repository clean
- Switch between projects without stashing changes
- Easy testing of cross-project integrations

**Create Worktree:**
```bash
# From main repository root: /Users/khani/Desktop/projs/myfundaction-protos

# Create worktree for P2P giving platform
git worktree add -b p2p-giving/main ../myfundaction-worktrees/p2p-giving p2p-giving

# Navigate to worktree
cd ../myfundaction-worktrees/p2p-giving

# Open in VS Code (or your editor)
code .

# Start Claude Code in this directory
claude-code
```

**Worktree Structure:**
```
myfundaction-protos/          (main repo)
├── beneficiary/
├── volunteer-mgmt/
├── p2p-giving/               (this project)
├── projs-dashboard/
├── crm/
└── finance/

myfundaction-worktrees/       (worktrees)
├── beneficiary/
├── volunteer-mgmt/
├── p2p-giving/               (isolated working tree)
├── projs-dashboard/
├── crm/
└── finance/
```

### Branch Naming Conventions

**Main branch per project:**
- `p2p-giving/main`

**Feature branches:**
- `p2p-giving/feat/stripe-integration`
- `p2p-giving/feat/gamification-engine`
- `p2p-giving/feat/social-sharing`
- `p2p-giving/feat/team-challenges`
- `p2p-giving/fix/payment-webhook-retry`
- `p2p-giving/chore/update-deps`

**Conventional Commits:**
```bash
git commit -m "feat(p2p): add Stripe payment integration with webhooks"
git commit -m "feat(p2p): implement badge unlock system with confetti"
git commit -m "feat(p2p): add Facebook and Twitter sharing"
git commit -m "fix(p2p): prevent duplicate donations on webhook retry"
git commit -m "test(p2p): add E2E tests for donation flow"
```

### Commit Strategy

**IMPORTANT: Commit frequently as you build!**

**After each significant change:**
```bash
# Add files
git add .

# Commit with descriptive message
git commit -m "feat(p2p): implement campaign creation with rich text editor"

# Push to remote (for backup and collaboration)
git push origin p2p-giving/main
```

**Commit Checklist:**
- ✅ After creating new components
- ✅ After implementing new features
- ✅ After writing tests
- ✅ After fixing bugs
- ✅ Before switching to another task
- ✅ At least 3-5 times per hour during active development

**Good commit messages:**
```
✅ "feat(p2p): add Prisma schema for campaigns, donations, teams, badges"
✅ "feat(p2p): implement campaign creation form with image upload"
✅ "feat(p2p): add Stripe checkout integration"
✅ "feat(p2p): implement badge unlock logic and confetti animation"
✅ "feat(p2p): add Facebook Share Dialog and Twitter Web Intents"
✅ "feat(p2p): create leaderboard component with real-time updates"
✅ "fix(p2p): handle Stripe webhook idempotency"
✅ "test(p2p): add E2E tests for campaign creation and donation"
```

**Bad commit messages:**
```
❌ "update"
❌ "wip"
❌ "changes"
❌ "fix stuff"
❌ "stripe"
```

### TodoWrite Tool Usage

**Use TodoWrite throughout development:**

```typescript
// Example: Breaking down P2P platform implementation
TodoWrite([
  { content: "Create Prisma schema for Campaign, Donation, Team, Badge", status: "completed", activeForm: "Creating Prisma schema" },
  { content: "Set up Stripe integration with payment intents", status: "completed", activeForm: "Setting up Stripe integration" },
  { content: "Build campaign creation form with WYSIWYG editor", status: "in_progress", activeForm: "Building campaign creation form" },
  { content: "Implement donation checkout flow", status: "pending", activeForm: "Implementing donation checkout flow" },
  { content: "Create gamification engine (points, badges, levels)", status: "pending", activeForm: "Creating gamification engine" },
  { content: "Add social sharing (Facebook, Twitter, WhatsApp)", status: "pending", activeForm: "Adding social sharing" },
  { content: "Build leaderboard components", status: "pending", activeForm: "Building leaderboard components" },
  { content: "Implement team creation and management", status: "pending", activeForm: "Implementing team creation" },
  { content: "Add impact visualization with Chart.js", status: "pending", activeForm: "Adding impact visualization" },
  { content: "Write E2E tests for critical flows", status: "pending", activeForm: "Writing E2E tests" },
]);
```

**Update todos as you progress** - mark completed, add new ones as discovered.

---

## 8. DEPLOYMENT STRATEGY

### Vercel Project Setup

**Create New Vercel Project:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from p2p-giving directory
cd /path/to/worktree/p2p-giving
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: myfundaction-p2p-giving
# - Directory: ./
# - Build command: next build
# - Output directory: .next
# - Development command: next dev
```

**Vercel Project Settings:**
- **Framework Preset**: Next.js
- **Node Version**: 18.x or 20.x
- **Build Command**: `next build`
- **Install Command**: `npm install` or `yarn install`
- **Root Directory**: `./` (or `p2p-giving/` if deploying from main repo)

### Environment Variables

**Required for Development (.env.local):**
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/p2p_giving_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/p2p_giving_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_your_key_here"
STRIPE_SECRET_KEY="sk_test_your_secret_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"

# Email (Resend)
RESEND_API_KEY="re_your_key_here"

# Social Sharing
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FACEBOOK_APP_ID="your_facebook_app_id"

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

**Required for Production (Vercel Dashboard):**
```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://giving.myfundaction.org"
NEXTAUTH_SECRET="strong-production-secret-here"

# Stripe (Production Keys)
STRIPE_PUBLIC_KEY="pk_live_your_key_here"
STRIPE_SECRET_KEY="sk_live_your_secret_here"
STRIPE_WEBHOOK_SECRET="whsec_production_webhook_secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Resend
RESEND_API_KEY="re_production_key"

# Social Sharing
NEXT_PUBLIC_APP_URL="https://giving.myfundaction.org"
NEXT_PUBLIC_FACEBOOK_APP_ID="production_facebook_app_id"

# Sentry
SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="production_key"

# CRM Integration
CRM_API_URL="https://crm.myfundaction.org/api"
CRM_API_KEY="crm_api_key"

# Beneficiary System Integration
BENEFICIARY_API_URL="https://beneficiary.myfundaction.org/api"
BENEFICIARY_API_KEY="beneficiary_api_key"
```

### Database Migrations

**Local Development:**
```bash
# Create migration
npx prisma migrate dev --name add_campaign_model

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database with sample campaigns and badges
npx prisma db seed
```

**Seed Script (prisma/seed.ts):**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'First Donation',
        description: 'Made your first donation',
        icon: '/badges/first-donation.svg',
        category: 'DONATION',
        rarity: 'COMMON',
        pointsReward: 10,
        requirement: { type: 'donation_count', value: 1 }
      },
      {
        name: 'Generous Giver',
        description: 'Donated RM 1000 or more',
        icon: '/badges/generous-giver.svg',
        category: 'DONATION',
        rarity: 'RARE',
        pointsReward: 50,
        requirement: { type: 'single_donation', value: 1000 }
      },
      {
        name: 'Campaign Creator',
        description: 'Created your first campaign',
        icon: '/badges/campaign-creator.svg',
        category: 'FUNDRAISING',
        rarity: 'COMMON',
        pointsReward: 20,
        requirement: { type: 'campaign_count', value: 1 }
      },
      {
        name: 'Fundraising Hero',
        description: 'Raised RM 10,000',
        icon: '/badges/fundraising-hero.svg',
        category: 'FUNDRAISING',
        rarity: 'EPIC',
        pointsReward: 100,
        requirement: { type: 'total_raised', value: 10000 }
      },
      {
        name: 'Social Butterfly',
        description: 'Shared campaigns 10 times',
        icon: '/badges/social-butterfly.svg',
        category: 'SOCIAL_SHARING',
        rarity: 'COMMON',
        pointsReward: 15,
        requirement: { type: 'share_count', value: 10 }
      }
    ]
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Production (Vercel):**
```bash
# Add to package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma migrate deploy && next build",
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Performance Optimization

**Next.js Configuration:**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // For placeholder images
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For campaign image uploads
    },
  },
};

module.exports = nextConfig;
```

**ISR (Incremental Static Regeneration):**
```typescript
// app/campaigns/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return <CampaignGrid campaigns={campaigns} />;
}
```

**Edge Functions for API Routes:**
```typescript
// app/api/leaderboards/route.ts
export const runtime = 'edge'; // Deploy to edge for low latency

export async function GET(request: Request) {
  // Return cached leaderboard data
  const leaderboard = await getLeaderboard('top_fundraisers', 'all_time');
  return Response.json(leaderboard);
}
```

**Image Optimization:**
```typescript
import Image from 'next/image';

<Image
  src={campaign.coverImage}
  alt={campaign.title}
  width={600}
  height={400}
  className="rounded-lg"
  priority={false} // Lazy load
  placeholder="blur" // Blur-up effect
  blurDataURL="/placeholder.jpg"
/>
```

### Custom Domain Configuration

**Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add custom domain: `giving.myfundaction.org` or `p2p.myfundaction.org`
3. Configure DNS (CNAME or A record)
4. Automatic HTTPS via Let's Encrypt

**DNS Records (Cloudflare/Route53/etc.):**
```
Type: CNAME
Name: giving
Value: cname.vercel-dns.com
```

---

## 9. SECURITY & COMPLIANCE

### Payment Security

**PCI Compliance:**
- Use Stripe.js (no card data touches your server)
- Stripe Elements for secure card input
- Never log payment card details
- Use Stripe webhooks for payment confirmation (not client-side)

**Stripe Best Practices:**
```typescript
// Client-side: Use Stripe Elements (PCI-compliant)
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

function CheckoutForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      // Handle error
    } else if (paymentIntent.status === 'succeeded') {
      // Payment successful - but WAIT for webhook to update DB
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  );
}
```

**Webhook Idempotency:**
```typescript
// Prevent duplicate processing of webhook events
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  // Check if already processed
  const existingDonation = await prisma.donation.findUnique({
    where: { paymentIntentId: paymentIntent.id }
  });

  if (existingDonation.paymentStatus === 'COMPLETED') {
    console.log('Webhook already processed, skipping');
    return;
  }

  // Process payment...
}
```

### Data Encryption

**At Rest:**
- Vercel Postgres: Encrypted by default
- Supabase: AES-256 encryption
- Cloudinary: Encrypted storage

**In Transit:**
- HTTPS enforced (Vercel automatic)
- TLS 1.3 for database connections

**Sensitive Fields:**
```typescript
// Encrypt sensitive donor information (if storing)
import { encrypt, decrypt } from '@/lib/crypto';

// Only if storing card details for recurring (use Stripe payment methods instead)
const encryptedCard = await encrypt(cardNumber); // DON'T DO THIS - use Stripe!
```

### Role-Based Access Control (RBAC)

**Middleware Protection:**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      if (path.startsWith('/admin')) {
        return token?.role === 'SUPER_ADMIN' || token?.role === 'ADMIN';
      }

      if (path.startsWith('/campaigns/new')) {
        return !!token; // Any authenticated user
      }

      if (path.startsWith('/campaigns/[slug]/edit')) {
        // Check if user is campaign creator (done in page)
        return !!token;
      }

      return !!token; // Authenticated
    },
  },
});

export const config = {
  matcher: ['/campaigns/new', '/campaigns/:path*/edit', '/admin/:path*', '/api/campaigns/:path*'],
};
```

**API Route Protection:**
```typescript
// app/api/campaigns/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Any authenticated user can create campaign
  const data = await req.json();
  const campaign = await createCampaign({ ...data, creatorId: session.user.id });

  return Response.json(campaign);
}
```

### Fraud Prevention

**Donation Limits:**
```typescript
// Prevent excessively large donations (potential fraud)
const MAX_DONATION = 100000; // RM 100,000
const MIN_DONATION = 1; // RM 1

if (amount < MIN_DONATION || amount > MAX_DONATION) {
  return new Response('Invalid donation amount', { status: 400 });
}
```

**Rate Limiting:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 donations per minute per IP
});

// Usage in donation route
export async function POST(req: Request) {
  const identifier = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return new Response('Too many donation attempts', { status: 429 });
  }

  // Process donation
}
```

**Campaign Moderation:**
```typescript
// Flag suspicious campaigns for admin review
async function flagCampaignForReview(campaignId: string, reason: string) {
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'PAUSED',
      moderationFlag: reason,
    }
  });

  // Notify admins
  await notifyAdmins(`Campaign ${campaignId} flagged: ${reason}`);
}

// Auto-flag campaigns with certain keywords
const suspiciousKeywords = ['guaranteed profit', 'double your money', 'urgent wire transfer'];
if (suspiciousKeywords.some(keyword => campaign.description.toLowerCase().includes(keyword))) {
  await flagCampaignForReview(campaign.id, 'Suspicious keywords detected');
}
```

### GDPR/Data Privacy Compliance

**Right to be Forgotten:**
```typescript
// app/api/users/[id]/anonymize/route.ts
export async function POST(req: Request, { params }) {
  // Anonymize user data but keep donation records for accounting
  await prisma.user.update({
    where: { id: params.id },
    data: {
      name: 'ANONYMIZED',
      email: `deleted_${Date.now()}@anonymized.com`,
      phone: null,
      avatar: null,
      bio: null,
    },
  });

  // Anonymize donations
  await prisma.donation.updateMany({
    where: { donorId: params.id },
    data: {
      donorName: 'Anonymous',
      donorEmail: null,
      isAnonymous: true,
    },
  });
}
```

**Data Export:**
```typescript
// app/api/users/[id]/export/route.ts
export async function GET(req: Request, { params }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      campaigns: true,
      donations: true,
      badges: { include: { badge: true } },
      fundraiserStats: true,
    },
  });

  return new Response(JSON.stringify(user, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="user-data-${params.id}.json"`,
    },
  });
}
```

---

## 10. TESTING APPROACH

### Unit Testing (Vitest)

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example Tests:**
```typescript
// __tests__/lib/gamification.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePoints, checkBadgeUnlock } from '@/lib/gamification';

describe('Gamification Engine', () => {
  it('should calculate donation points correctly', () => {
    const points = calculatePoints('donation', 100);
    expect(points).toBe(10); // 10% of donation = 10 points
  });

  it('should unlock "First Donation" badge', () => {
    const donations = [{ amount: 50 }];
    const badges = checkBadgeUnlock(donations);
    expect(badges).toContain('first-donation');
  });

  it('should unlock "Generous Giver" for RM 1000+ donation', () => {
    const donations = [{ amount: 1500 }];
    const badges = checkBadgeUnlock(donations);
    expect(badges).toContain('generous-giver');
  });
});
```

**Component Tests:**
```typescript
// __tests__/components/CampaignForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignForm } from '@/components/CampaignForm';

describe('CampaignForm', () => {
  it('should render form fields', () => {
    render(<CampaignForm />);
    expect(screen.getByLabelText('Campaign Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Amount')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<CampaignForm />);
    fireEvent.click(screen.getByRole('button', { name: /create campaign/i }));
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });

  it('should validate goal amount is positive', async () => {
    render(<CampaignForm />);
    fireEvent.change(screen.getByLabelText('Goal Amount'), { target: { value: '-100' } });
    fireEvent.click(screen.getByRole('button', { name: /create campaign/i }));
    expect(await screen.findByText('Goal must be positive')).toBeInTheDocument();
  });
});
```

### Integration Testing

**API Route Tests:**
```typescript
// __tests__/api/campaigns.test.ts
import { POST } from '@/app/api/campaigns/route';

describe('POST /api/campaigns', () => {
  it('should create a campaign', async () => {
    const req = new Request('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Build a School',
        description: 'Help us build a school',
        goalAmount: 50000,
        category: 'EDUCATION',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.title).toBe('Build a School');
    expect(data.slug).toBeTruthy();
  });
});
```

**Payment Integration Tests:**
```typescript
// __tests__/integration/stripe.test.ts
import { createPaymentIntent } from '@/lib/stripe';

describe('Stripe Payment Integration', () => {
  it('should create payment intent', async () => {
    const paymentIntent = await createPaymentIntent(100, 'MYR');
    expect(paymentIntent.amount).toBe(10000); // 100 * 100 cents
    expect(paymentIntent.currency).toBe('myr');
    expect(paymentIntent.client_secret).toBeTruthy();
  });
});
```

### E2E Testing with Playwright MCP

**Use the Playwright MCP server for E2E tests:**

```typescript
// tests/e2e/campaign-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('P2P Campaign Flow', () => {
  test('complete campaign creation and donation', async ({ page }) => {
    // Register/Login
    await page.goto('/register');
    await page.fill('[name="name"]', 'Test Fundraiser');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Create campaign
    await page.goto('/campaigns/new');
    await page.fill('[name="title"]', 'Help Build a School');
    await page.fill('[name="description"]', 'We need your help...');
    await page.fill('[name="goalAmount"]', '50000');
    await page.selectOption('[name="category"]', 'EDUCATION');

    // Upload image
    await page.setInputFiles('[name="coverImage"]', 'tests/fixtures/school.jpg');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to campaign page
    await expect(page).toHaveURL(/\/campaigns\/.+/);
    await expect(page.locator('h1')).toContainText('Help Build a School');
    await expect(page.locator('.progress-bar')).toBeVisible();

    // Make a donation (as different user)
    await page.click('button:has-text("Donate Now")');

    // Fill donation form
    await page.fill('[name="amount"]', '100');
    await page.fill('[name="donorEmail"]', 'donor@example.com');
    await page.fill('[name="message"]', 'Great cause!');

    // Stripe checkout (test mode)
    await page.click('button:has-text("Continue to Payment")');

    // Fill test card
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="cardnumber"]').fill('4242424242424242');
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="exp-date"]').fill('12/34');
    await page.frameLocator('iframe[name*="stripe"]').locator('[name="cvc"]').fill('123');

    // Submit payment
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toContainText('Thank you for your donation!');
  });

  test('social sharing flow', async ({ page, context }) => {
    await page.goto('/campaigns/test-campaign');

    // Click Facebook share
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button[data-platform="facebook"]'),
    ]);

    // Verify Facebook share dialog opened
    await expect(popup).toHaveURL(/facebook\.com\/sharer/);
  });

  test('badge unlock with confetti', async ({ page }) => {
    // Make first donation
    await page.goto('/campaigns/test-campaign/donate');
    // ... complete donation

    // Navigate to profile
    await page.goto('/profile');

    // Verify badge unlocked
    await expect(page.locator('.badge[data-name="first-donation"]')).toBeVisible();

    // Verify confetti animation played (check for confetti elements)
    await expect(page.locator('.confetti')).toBeVisible();
  });
});
```

**Leaderboard E2E Test:**
```typescript
test('leaderboard updates in real-time', async ({ page }) => {
  await page.goto('/leaderboards');

  // Get initial rank
  const initialRank = await page.locator('[data-user-id="user123"] .rank').textContent();

  // Make a donation (in another tab or simulate webhook)
  // ...

  // Wait for real-time update
  await page.waitForTimeout(2000);

  // Verify rank changed
  const newRank = await page.locator('[data-user-id="user123"] .rank').textContent();
  expect(newRank).not.toBe(initialRank);
});
```

### Load Testing

**Considerations:**
- Simulate 1000+ concurrent campaign views
- Test donation checkout under load
- Leaderboard query performance with 10,000+ users

**Example Load Test (k6):**
```javascript
// tests/load/campaigns.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  // View campaign page
  const campaignRes = http.get('https://giving.myfundaction.org/campaigns/test-campaign');
  check(campaignRes, {
    'campaign page loaded': (r) => r.status === 200,
    'campaign page fast': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // View leaderboard
  const leaderboardRes = http.get('https://giving.myfundaction.org/api/leaderboards?type=top_fundraisers&period=all_time');
  check(leaderboardRes, {
    'leaderboard loaded': (r) => r.status === 200,
    'leaderboard fast': (r) => r.timings.duration < 300,
  });

  sleep(2);
}
```

---

## 11. MALAYSIAN CONTEXT

### i18n Setup (Bahasa Malaysia + English)

**Install next-intl:**
```bash
npm install next-intl
```

**Configuration:**
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

**Messages:**
```json
// messages/en.json
{
  "campaign": {
    "title": "Campaigns",
    "create": "Create Campaign",
    "goal": "Goal Amount",
    "raised": "Raised",
    "donate": "Donate Now",
    "share": "Share Campaign",
    "categories": {
      "education": "Education",
      "healthcare": "Healthcare",
      "food_relief": "Food Relief",
      "zakat": "Zakat",
      "sadaqah": "Sadaqah",
      "qurbani": "Qurbani"
    }
  },
  "donation": {
    "amount": "Donation Amount",
    "message": "Leave a Message",
    "anonymous": "Donate Anonymously",
    "recurring": "Make this recurring"
  },
  "gamification": {
    "points": "Points",
    "level": "Level",
    "badges": "Badges",
    "leaderboard": "Leaderboard"
  }
}

// messages/ms.json
{
  "campaign": {
    "title": "Kempen",
    "create": "Cipta Kempen",
    "goal": "Sasaran Kutipan",
    "raised": "Terkumpul",
    "donate": "Derma Sekarang",
    "share": "Kongsi Kempen",
    "categories": {
      "education": "Pendidikan",
      "healthcare": "Kesihatan",
      "food_relief": "Bantuan Makanan",
      "zakat": "Zakat",
      "sadaqah": "Sedekah",
      "qurbani": "Korban"
    }
  },
  "donation": {
    "amount": "Jumlah Derma",
    "message": "Tinggalkan Mesej",
    "anonymous": "Derma Tanpa Nama",
    "recurring": "Jadikan derma berulang"
  },
  "gamification": {
    "points": "Mata",
    "level": "Tahap",
    "badges": "Lencana",
    "leaderboard": "Papan Pendahulu"
  }
}
```

**Usage:**
```typescript
import { useTranslations } from 'next-intl';

export default function CampaignPage() {
  const t = useTranslations('campaign');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('create')}</button>
    </div>
  );
}
```

### Islamic Giving Context

**Campaign Categories for Malaysia:**
```typescript
// Islamic giving types
export const islamicCategories = [
  {
    value: 'ZAKAT',
    label: 'Zakat',
    description: 'Obligatory charity (2.5% of wealth)',
    icon: '/icons/zakat.svg',
  },
  {
    value: 'SADAQAH',
    label: 'Sadaqah',
    description: 'Voluntary charity',
    icon: '/icons/sadaqah.svg',
  },
  {
    value: 'QURBANI',
    label: 'Qurbani',
    description: 'Animal sacrifice during Eid al-Adha',
    icon: '/icons/qurbani.svg',
  },
  {
    value: 'WAKAF',
    label: 'Wakaf',
    description: 'Endowment for perpetual benefit',
    icon: '/icons/wakaf.svg',
  },
];
```

**Zakat Calculator Integration:**
```typescript
// lib/zakat-calculator.ts
export function calculateZakat(totalWealth: number, nisab: number = 15000): number {
  // Nisab = RM 15,000 (approximate, based on gold prices)
  if (totalWealth < nisab) {
    return 0;
  }

  return totalWealth * 0.025; // 2.5% of wealth
}

// Usage in campaign
export function ZakatCalculator() {
  const [wealth, setWealth] = useState(0);
  const zakatAmount = calculateZakat(wealth);

  return (
    <div>
      <input
        type="number"
        value={wealth}
        onChange={(e) => setWealth(Number(e.target.value))}
        placeholder="Total wealth (RM)"
      />
      <p>Zakat due: RM {zakatAmount.toFixed(2)}</p>
      <button onClick={() => donateZakat(zakatAmount)}>Donate Zakat</button>
    </div>
  );
}
```

### Malaysian Phone Number & Currency Format

**Validation:**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const malaysianPhoneSchema = z
  .string()
  .regex(/^\+60\d{9,10}$/, 'Invalid Malaysian phone number. Format: +60123456789');

export const malaysianCurrencySchema = z
  .number()
  .positive()
  .transform((val) => Math.round(val * 100) / 100); // Round to 2 decimals
```

**Formatting:**
```typescript
// lib/format.ts
export function formatMalaysianCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(amount);
}

// Usage: formatMalaysianCurrency(12345.67) → "RM 12,345.67"

export function formatMalaysianPhone(phone: string): string {
  // +60123456789 → +60 12-345 6789
  return phone.replace(/(\+60)(\d{2})(\d{3})(\d{4})/, '$1 $2-$3 $4');
}
```

### WhatsApp Sharing Integration

**Deep Links:**
```typescript
// lib/whatsapp.ts
export function shareToWhatsApp(campaignTitle: string, campaignUrl: string, phone?: string) {
  const message = `Check out this campaign: ${campaignTitle}\n\n${campaignUrl}\n\nLet's make a difference together!`;
  const encoded = encodeURIComponent(message);

  const url = phone
    ? `https://wa.me/${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  window.open(url, '_blank');
}

// Usage: Share campaign to WhatsApp
shareToWhatsApp(
  'Help Build a School',
  'https://giving.myfundaction.org/campaigns/build-school'
);
```

**WhatsApp Share Button:**
```tsx
// components/ShareButtons.tsx
export function ShareButtons({ campaign }: { campaign: Campaign }) {
  const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaign.slug}`;

  return (
    <div className="flex gap-2">
      {/* WhatsApp */}
      <button
        onClick={() => shareToWhatsApp(campaign.title, campaignUrl)}
        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded"
      >
        <WhatsAppIcon />
        Share
      </button>

      {/* Facebook */}
      <button
        onClick={() => {
          window.FB.ui({
            method: 'share',
            href: campaignUrl,
          });
        }}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        <FacebookIcon />
        Share
      </button>

      {/* Twitter */}
      <button
        onClick={() => {
          const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(campaign.title)}&url=${encodeURIComponent(campaignUrl)}`;
          window.open(tweetUrl, '_blank', 'width=550,height=420');
        }}
        className="flex items-center gap-2 bg-sky-500 text-white px-4 py-2 rounded"
      >
        <TwitterIcon />
        Tweet
      </button>
    </div>
  );
}
```

### Islamic Calendar Integration

**For Ramadan/Qurbani timing:**
```bash
npm install moment-hijri
```

**Example:**
```typescript
import moment from 'moment-hijri';

// Check if currently Ramadan
const islamicDate = moment();
const islamicMonth = islamicDate.iMonth(); // 0-indexed (8 = Ramadan)

if (islamicMonth === 8) {
  // Show Ramadan campaigns prominently
}

// Dhul Hijjah (month of Qurbani)
if (islamicMonth === 11) {
  // Promote Qurbani campaigns
}
```

---

## 12. MONITORING & ANALYTICS

### Vercel Analytics

**Install:**
```bash
npm install @vercel/analytics
```

**Setup:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Track Custom Events:**
```typescript
import { track } from '@vercel/analytics';

// Track campaign creation
track('campaign_created', {
  category: campaign.category,
  goalAmount: campaign.goalAmount,
});

// Track donation
track('donation_completed', {
  amount: donation.amount,
  campaignId: campaign.id,
  isAnonymous: donation.isAnonymous,
});

// Track social share
track('campaign_shared', {
  platform: 'facebook',
  campaignId: campaign.id,
});

// Track badge unlock
track('badge_unlocked', {
  badgeName: badge.name,
  userId: user.id,
});
```

### Sentry Error Tracking

**Install:**
```bash
npm install @sentry/nextjs
```

**Setup:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Custom Error Logging:**
```typescript
try {
  await processPayment(paymentIntent);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payment_processing' },
    user: { id: session.user.id },
    contexts: {
      payment: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    },
  });
  throw error;
}
```

### Posthog User Behavior Analytics

**Install:**
```bash
npm install posthog-js
```

**Setup:**
```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export { posthog };
```

**Track Events:**
```typescript
import { posthog } from '@/lib/posthog';

// Track feature usage
posthog.capture('campaign_viewed', {
  campaign_id: campaign.id,
  campaign_category: campaign.category,
});

// Track donation funnel
posthog.capture('donation_started', { campaign_id: campaign.id });
posthog.capture('donation_completed', {
  campaign_id: campaign.id,
  amount: donation.amount,
});

// Identify user
posthog.identify(session.user.id, {
  email: session.user.email,
  role: session.user.role,
  total_raised: user.fundraiserStats.totalRaised,
});
```

### Custom Dashboards for P2P Metrics

**Key Metrics to Track:**
- Total campaigns created
- Total donations received
- Average donation amount
- Campaign conversion rate (views → donations)
- Social sharing effectiveness (shares → donations)
- Badge unlock frequency
- Leaderboard competition engagement
- Team participation rate
- Recurring donation conversion

**Implementation:**
```typescript
// app/api/metrics/route.ts
export async function GET(req: Request) {
  const [
    totalCampaigns,
    activeCampaigns,
    totalRaised,
    totalDonations,
    topFundraisers,
    badgeUnlocks,
  ] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.donation.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.donation.count({ where: { paymentStatus: 'COMPLETED' } }),
    prisma.fundraiserStats.findMany({
      take: 10,
      orderBy: { totalRaised: 'desc' },
      include: { user: true },
    }),
    prisma.userBadge.count(),
  ]);

  return Response.json({
    totalCampaigns,
    activeCampaigns,
    totalRaised: totalRaised._sum.amount || 0,
    totalDonations,
    averageDonation: totalRaised._sum.amount / totalDonations || 0,
    topFundraisers,
    badgeUnlocks,
  });
}
```

**Admin Dashboard:**
```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  const metrics = await fetch('/api/metrics').then(r => r.json());

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        title="Total Campaigns"
        value={metrics.totalCampaigns}
        icon={<CampaignIcon />}
      />
      <MetricCard
        title="Total Raised"
        value={formatMalaysianCurrency(metrics.totalRaised)}
        icon={<MoneyIcon />}
      />
      <MetricCard
        title="Total Donations"
        value={metrics.totalDonations}
        icon={<HeartIcon />}
      />
      <MetricCard
        title="Average Donation"
        value={formatMalaysianCurrency(metrics.averageDonation)}
        icon={<ChartIcon />}
      />
    </div>
  );
}
```

### Uptime Monitoring

**Use UptimeRobot or Better Uptime:**
- Monitor `https://giving.myfundaction.org/api/health`
- Alert via Email, SMS, Slack if downtime

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Stripe connectivity
    const stripeHealth = await stripe.balance.retrieve();

    return Response.json({
      status: 'healthy',
      database: 'ok',
      stripe: 'ok',
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
```

---

## FINAL INSTRUCTIONS

### Development Checklist

- [ ] Clone reference repos (Houdini, Oasis, Giver) for inspiration
- [ ] Start with Next.js 15 template: `npx create-next-app@latest`
- [ ] Set up Prisma with the suggested schema
- [ ] Implement NextAuth with RBAC
- [ ] Build campaign CRUD operations
- [ ] Integrate Stripe with payment intents and webhooks
- [ ] Create donation checkout flow
- [ ] Implement gamification engine (points, badges, levels)
- [ ] Build leaderboard components with real-time updates
- [ ] Add social sharing (Facebook, Twitter, WhatsApp)
- [ ] Create team fundraising features
- [ ] Build impact visualization dashboard (Chart.js)
- [ ] Implement campaign updates functionality
- [ ] Add rich text editor (WYSIWYG) for campaign stories
- [ ] Set up file uploads (campaign images)
- [ ] Create user profile pages with badges
- [ ] Write unit tests for gamification logic
- [ ] Write E2E tests with Playwright MCP (campaign creation, donation flow)
- [ ] Set up i18n (English + Bahasa Malaysia)
- [ ] Deploy to Vercel
- [ ] Configure production database (Supabase)
- [ ] Set up Stripe production keys and webhooks
- [ ] Configure Cloudinary for image storage
- [ ] Set up monitoring (Sentry, Posthog, Vercel Analytics)
- [ ] Test with real donations (use Stripe test mode)
- [ ] Create seed data (badges, sample campaigns)

### Remember:

1. **Commit frequently** - at least 3-5 times per hour
2. **Use TodoWrite** to track your progress
3. **Use MCP tools**:
   - sequential-thinking for complex decisions (gamification rules, payment logic)
   - filesystem for multi-file operations
   - fetch/deepwiki for research (Stripe docs, social sharing APIs)
   - allpepper-memory-bank to document decisions (gamification rules, badge definitions)
   - playwright for E2E testing (critical donation flows)
4. **Mobile-first design** - most donors will use mobile
5. **Security first** - payment data is extremely sensitive (use Stripe.js, never touch card data)
6. **Test payment flows thoroughly** - use Stripe test cards
7. **Gamification should be fun** - use animations (react-rewards) for achievements
8. **Social sharing is key** - make it easy to share campaigns
9. **Islamic context matters** - respect Malaysian giving practices (Zakat, Sadaqah)

Good luck building the P2P Giving Platform! Let's amplify generosity through gamification and social engagement!

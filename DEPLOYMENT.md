# Deployment Guide - P2P Giving Platform

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Stripe account
- Vercel account (for deployment)

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database (Supabase or Vercel Postgres for production)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe (Production keys)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Configure environment variables
4. Deploy

### Post-Deployment Setup

1. **Configure Stripe Webhook**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

2. **Run Database Migrations**:
```bash
# If using Vercel Postgres
npx prisma migrate deploy

# Seed production database (optional)
npm run db:seed
```

3. **Test the Application**:
   - Create a test campaign
   - Make a test donation (use Stripe test card: 4242 4242 4242 4242)
   - Verify webhook is working
   - Check leaderboards update

## Database Setup

### Supabase (Recommended for Production)

1. Create a Supabase project
2. Get connection string from Settings → Database
3. Set `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables
4. Run migrations:
```bash
npx prisma migrate deploy
```

### Vercel Postgres

1. Create Vercel Postgres database in Vercel project
2. Environment variables are auto-configured
3. Run migrations:
```bash
npx prisma migrate deploy
```

## Testing

### Stripe Test Mode

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

### Test Accounts (from seed)

- **Admin**: admin@myfundaction.org / password123
- **Fundraiser**: ahmad@example.com / password123
- **Donor**: donor1@example.com / password123

## Monitoring

### Error Tracking

Install Sentry:
```bash
npm install @sentry/nextjs
```

Configure in `.env`:
```
SENTRY_DSN="https://..."
```

### Analytics

Vercel Analytics is automatically enabled.

For PostHog:
```bash
npm install posthog-js
```

Configure in `.env`:
```
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

## Performance Optimization

1. **Enable ISR (Incremental Static Regeneration)**:
   - Campaign pages revalidate every 60 seconds
   - Leaderboards cache for 5 minutes

2. **Use Edge Functions** for API routes where possible

3. **Enable Image Optimization**:
   - Use Next.js Image component
   - Configure Cloudinary for production images

## Security Checklist

- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database encryption at rest enabled
- [ ] Stripe webhooks verified
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Authentication working
- [ ] Role-based access control tested

## Troubleshooting

### Stripe Webhook Not Working

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Check Vercel logs for errors
4. Test webhook with Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check connection pooling settings
3. Ensure database is accessible from Vercel

### Build Failures

1. Check TypeScript errors: `npm run lint`
2. Verify all dependencies installed
3. Check Prisma schema is valid: `npx prisma validate`

## Support

For issues and questions:
- Check documentation
- Review logs in Vercel Dashboard
- Contact development team

## License

ISC

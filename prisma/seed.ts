import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const password = await hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@myfundaction.org' },
    update: {},
    create: {
      email: 'admin@myfundaction.org',
      name: 'Admin User',
      password,
      role: 'SUPER_ADMIN',
      phone: '+60123456789',
      bio: 'Platform administrator',
      totalPoints: 1000,
      level: 5,
    },
  });

  const fundraiser1 = await prisma.user.upsert({
    where: { email: 'ahmad@example.com' },
    update: {},
    create: {
      email: 'ahmad@example.com',
      name: 'Ahmad Ibrahim',
      password,
      role: 'FUNDRAISER',
      phone: '+60129876543',
      bio: 'Passionate about helping communities',
      totalPoints: 250,
      level: 3,
    },
  });

  const fundraiser2 = await prisma.user.upsert({
    where: { email: 'siti@example.com' },
    update: {},
    create: {
      email: 'siti@example.com',
      name: 'Siti Nurhaliza',
      password,
      role: 'FUNDRAISER',
      phone: '+60138765432',
      bio: 'Building schools in rural areas',
      totalPoints: 180,
      level: 2,
    },
  });

  const donor1 = await prisma.user.upsert({
    where: { email: 'donor1@example.com' },
    update: {},
    create: {
      email: 'donor1@example.com',
      name: 'Muhammad Ali',
      password,
      role: 'DONOR',
      totalPoints: 50,
      level: 1,
    },
  });

  console.log('✅ Users created');

  // Create badges
  const badges = [
    {
      name: 'First Donation',
      description: 'Made your first donation',
      icon: '🎁',
      category: 'DONATION' as const,
      rarity: 'COMMON' as const,
      pointsReward: 10,
      requirement: { type: 'donation_count', value: 1 },
    },
    {
      name: 'Generous Giver',
      description: 'Donated RM 1000 or more in a single donation',
      icon: '💎',
      category: 'DONATION' as const,
      rarity: 'RARE' as const,
      pointsReward: 50,
      requirement: { type: 'single_donation', value: 1000 },
    },
    {
      name: 'Philanthropist',
      description: 'Total donations exceed RM 10,000',
      icon: '👑',
      category: 'DONATION' as const,
      rarity: 'EPIC' as const,
      pointsReward: 200,
      requirement: { type: 'total_donated', value: 10000 },
    },
    {
      name: 'Campaign Creator',
      description: 'Created your first campaign',
      icon: '🚀',
      category: 'FUNDRAISING' as const,
      rarity: 'COMMON' as const,
      pointsReward: 20,
      requirement: { type: 'campaign_count', value: 1 },
    },
    {
      name: 'Fundraising Hero',
      description: 'Raised RM 10,000 total',
      icon: '🦸',
      category: 'FUNDRAISING' as const,
      rarity: 'EPIC' as const,
      pointsReward: 100,
      requirement: { type: 'total_raised', value: 10000 },
    },
    {
      name: 'Fundraising Legend',
      description: 'Raised RM 100,000 total',
      icon: '⭐',
      category: 'FUNDRAISING' as const,
      rarity: 'LEGENDARY' as const,
      pointsReward: 500,
      requirement: { type: 'total_raised', value: 100000 },
    },
    {
      name: 'Social Butterfly',
      description: 'Shared campaigns 10 times',
      icon: '🦋',
      category: 'SOCIAL_SHARING' as const,
      rarity: 'COMMON' as const,
      pointsReward: 15,
      requirement: { type: 'share_count', value: 10 },
    },
    {
      name: 'Influencer',
      description: 'Shared campaigns 100 times',
      icon: '📱',
      category: 'SOCIAL_SHARING' as const,
      rarity: 'RARE' as const,
      pointsReward: 75,
      requirement: { type: 'share_count', value: 100 },
    },
    {
      name: 'Serial Fundraiser',
      description: 'Created 5 campaigns',
      icon: '🎯',
      category: 'FUNDRAISING' as const,
      rarity: 'RARE' as const,
      pointsReward: 60,
      requirement: { type: 'campaign_count', value: 5 },
    },
    {
      name: 'Community Builder',
      description: 'Created 10 campaigns',
      icon: '🏗️',
      category: 'FUNDRAISING' as const,
      rarity: 'EPIC' as const,
      pointsReward: 150,
      requirement: { type: 'campaign_count', value: 10 },
    },
  ];

  for (const badgeData of badges) {
    await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {},
      create: badgeData,
    });
  }

  console.log('✅ Badges created');

  // Create sample team
  const team = await prisma.team.upsert({
    where: { slug: 'youth-volunteers' },
    update: {},
    create: {
      name: 'Youth Volunteers',
      slug: 'youth-volunteers',
      description: 'Young volunteers making a difference',
      goalAmount: 50000,
      currency: 'MYR',
      creatorId: fundraiser1.id,
      memberCount: 2,
    },
  });

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: fundraiser1.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: fundraiser1.id,
      role: 'LEADER',
    },
  });

  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: fundraiser2.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: fundraiser2.id,
      role: 'MEMBER',
    },
  });

  console.log('✅ Team created');

  // Create sample campaigns
  const campaign1 = await prisma.campaign.upsert({
    where: { slug: 'build-school-sabah' },
    update: {},
    create: {
      title: 'Build a School in Rural Sabah',
      slug: 'build-school-sabah',
      description:
        'Help us build a primary school for 200 children in rural Sabah. Many children currently walk 5km daily to reach the nearest school.',
      story: 'In the heart of Sabah, there are children who dream of education but lack the facilities. This campaign aims to change that.',
      goalAmount: 150000,
      raisedAmount: 45000,
      currency: 'MYR',
      category: 'EDUCATION',
      status: 'ACTIVE',
      creatorId: fundraiser1.id,
      teamId: team.id,
      tags: ['education', 'rural', 'children'],
      donationCount: 12,
      viewCount: 245,
      shareCount: 18,
    },
  });

  const campaign2 = await prisma.campaign.upsert({
    where: { slug: 'medical-aid-refugees' },
    update: {},
    create: {
      title: 'Medical Aid for Refugees',
      slug: 'medical-aid-refugees',
      description:
        'Provide essential medical supplies and healthcare services to refugee families in need.',
      story: 'Thousands of refugee families lack access to basic healthcare. Your donation can save lives.',
      goalAmount: 80000,
      raisedAmount: 22000,
      currency: 'MYR',
      category: 'HEALTHCARE',
      status: 'ACTIVE',
      creatorId: fundraiser2.id,
      tags: ['healthcare', 'refugees', 'urgent'],
      donationCount: 8,
      viewCount: 156,
      shareCount: 12,
    },
  });

  const campaign3 = await prisma.campaign.upsert({
    where: { slug: 'ramadan-food-packs' },
    update: {},
    create: {
      title: 'Ramadan Food Packs for 500 Families',
      slug: 'ramadan-food-packs',
      description:
        'Distribute food packs to 500 low-income families during Ramadan.',
      story: 'During the blessed month of Ramadan, let us help those who struggle to put food on their tables.',
      goalAmount: 50000,
      raisedAmount: 38000,
      currency: 'MYR',
      category: 'SADAQAH',
      status: 'ACTIVE',
      creatorId: fundraiser1.id,
      teamId: team.id,
      tags: ['food', 'ramadan', 'sadaqah'],
      donationCount: 15,
      viewCount: 412,
      shareCount: 34,
      endDate: new Date('2025-04-30'),
    },
  });

  console.log('✅ Campaigns created');

  // Create fundraiser stats
  await prisma.fundraiserStats.upsert({
    where: { userId: fundraiser1.id },
    update: {},
    create: {
      userId: fundraiser1.id,
      totalCampaigns: 2,
      activeCampaigns: 2,
      totalRaised: 83000,
      totalDonations: 27,
      averageDonation: 3074,
      totalShares: 52,
      totalViews: 657,
    },
  });

  await prisma.fundraiserStats.upsert({
    where: { userId: fundraiser2.id },
    update: {},
    create: {
      userId: fundraiser2.id,
      totalCampaigns: 1,
      activeCampaigns: 1,
      totalRaised: 22000,
      totalDonations: 8,
      averageDonation: 2750,
      totalShares: 12,
      totalViews: 156,
    },
  });

  console.log('✅ Fundraiser stats created');

  // Award some badges to users
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: fundraiser1.id,
        badgeId: (await prisma.badge.findUnique({ where: { name: 'Campaign Creator' } }))!.id,
      },
    },
    update: {},
    create: {
      userId: fundraiser1.id,
      badgeId: (await prisma.badge.findUnique({ where: { name: 'Campaign Creator' } }))!.id,
    },
  });

  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: fundraiser1.id,
        badgeId: (await prisma.badge.findUnique({ where: { name: 'Fundraising Hero' } }))!.id,
      },
    },
    update: {},
    create: {
      userId: fundraiser1.id,
      badgeId: (await prisma.badge.findUnique({ where: { name: 'Fundraising Hero' } }))!.id,
    },
  });

  console.log('✅ Badges awarded');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Sample credentials:');
  console.log('Admin: admin@myfundaction.org / password123');
  console.log('Fundraiser 1: ahmad@example.com / password123');
  console.log('Fundraiser 2: siti@example.com / password123');
  console.log('Donor: donor1@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

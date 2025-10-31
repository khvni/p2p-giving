import { prisma } from '@/lib/prisma';
import { BadgeCategory, BadgeRarity } from '@prisma/client';

// Points calculation
export function calculateDonationPoints(amount: number): number {
  // 10% of donation amount as points (e.g., RM 100 = 10 points)
  return Math.floor(amount * 0.1);
}

export function calculateCampaignPoints(goalAmount: number, raisedAmount: number): number {
  // 5 points for creating campaign + bonus based on success
  const basePoints = 5;
  const progressBonus = Math.floor((raisedAmount / goalAmount) * 20); // Up to 20 points for 100% completion
  return basePoints + progressBonus;
}

export function calculateSharePoints(platform: string): number {
  // Points for sharing on different platforms
  const sharePoints: Record<string, number> = {
    FACEBOOK: 2,
    TWITTER: 2,
    WHATSAPP: 2,
    INSTAGRAM: 3,
    TELEGRAM: 2,
    EMAIL: 1,
  };
  return sharePoints[platform] || 1;
}

// Level calculation
export function calculateLevel(totalPoints: number): number {
  // Level formula: Level = floor(sqrt(totalPoints / 100)) + 1
  // Level 1: 0-99 points
  // Level 2: 100-399 points
  // Level 3: 400-899 points
  // etc.
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
}

// Badge checking
export interface BadgeRequirement {
  type: 'donation_count' | 'single_donation' | 'total_raised' | 'campaign_count' | 'share_count' | 'total_donated';
  value: number;
}

export async function checkBadgeUnlocks(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donations: {
        where: { paymentStatus: 'COMPLETED' },
      },
      campaigns: true,
      badges: {
        include: { badge: true },
      },
      fundraiserStats: true,
    },
  });

  if (!user) return [];

  // Get all badges
  const allBadges = await prisma.badge.findMany();

  // Get badges user already has
  const userBadgeIds = user.badges.map(ub => ub.badgeId);

  // Check which new badges can be unlocked
  const newBadges: string[] = [];

  for (const badge of allBadges) {
    // Skip if user already has this badge
    if (userBadgeIds.includes(badge.id)) continue;

    const requirement = badge.requirement as BadgeRequirement;
    let unlocked = false;

    switch (requirement.type) {
      case 'donation_count':
        unlocked = user.donations.length >= requirement.value;
        break;

      case 'single_donation':
        unlocked = user.donations.some(d => Number(d.amount) >= requirement.value);
        break;

      case 'total_donated':
        const totalDonated = user.donations.reduce((sum, d) => sum + Number(d.amount), 0);
        unlocked = totalDonated >= requirement.value;
        break;

      case 'total_raised':
        const totalRaised = user.fundraiserStats?.totalRaised ? Number(user.fundraiserStats.totalRaised) : 0;
        unlocked = totalRaised >= requirement.value;
        break;

      case 'campaign_count':
        unlocked = user.campaigns.length >= requirement.value;
        break;

      case 'share_count':
        const totalShares = user.fundraiserStats?.totalShares || 0;
        unlocked = totalShares >= requirement.value;
        break;
    }

    if (unlocked) {
      // Award badge
      await prisma.userBadge.create({
        data: {
          userId: user.id,
          badgeId: badge.id,
        },
      });

      // Award points
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalPoints: { increment: badge.pointsReward },
        },
      });

      newBadges.push(badge.id);
    }
  }

  return newBadges;
}

// Award points for various actions
export async function awardPoints(userId: string, points: number, action: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const newTotalPoints = user.totalPoints + points;
  const newLevel = calculateLevel(newTotalPoints);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalPoints: newTotalPoints,
      level: newLevel,
    },
  });
}

export async function awardDonationPoints(userId: string, donationAmount: number): Promise<void> {
  const points = calculateDonationPoints(donationAmount);
  await awardPoints(userId, points, 'donation');
}

export async function awardSharePoints(userId: string, platform: string): Promise<void> {
  const points = calculateSharePoints(platform);
  await awardPoints(userId, points, 'share');
}

// Update leaderboards
export async function updateLeaderboards(): Promise<void> {
  // Update top fundraisers (all time)
  const topFundraisers = await prisma.fundraiserStats.findMany({
    take: 100,
    orderBy: { totalRaised: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  await prisma.leaderboard.upsert({
    where: {
      type_period_startDate: {
        type: 'TOP_FUNDRAISERS',
        period: 'ALL_TIME',
        startDate: null,
      },
    },
    create: {
      type: 'TOP_FUNDRAISERS',
      period: 'ALL_TIME',
      data: topFundraisers.map((stat, index) => ({
        rank: index + 1,
        userId: stat.userId,
        name: stat.user.name,
        avatar: stat.user.avatar,
        amount: Number(stat.totalRaised),
        totalDonations: stat.totalDonations,
      })),
    },
    update: {
      data: topFundraisers.map((stat, index) => ({
        rank: index + 1,
        userId: stat.userId,
        name: stat.user.name,
        avatar: stat.user.avatar,
        amount: Number(stat.totalRaised),
        totalDonations: stat.totalDonations,
      })),
    },
  });

  // Update top donors (all time)
  const topDonors = await prisma.user.findMany({
    take: 100,
    where: {
      donations: {
        some: {
          paymentStatus: 'COMPLETED',
        },
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      donations: {
        where: { paymentStatus: 'COMPLETED' },
        select: { amount: true },
      },
    },
  });

  const topDonorsData = topDonors
    .map(user => ({
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      amount: user.donations.reduce((sum, d) => sum + Number(d.amount), 0),
      donationCount: user.donations.length,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 100)
    .map((donor, index) => ({
      rank: index + 1,
      ...donor,
    }));

  await prisma.leaderboard.upsert({
    where: {
      type_period_startDate: {
        type: 'TOP_DONORS',
        period: 'ALL_TIME',
        startDate: null,
      },
    },
    create: {
      type: 'TOP_DONORS',
      period: 'ALL_TIME',
      data: topDonorsData,
    },
    update: {
      data: topDonorsData,
    },
  });

  // Update top teams (all time)
  const topTeams = await prisma.team.findMany({
    take: 100,
    where: { status: 'ACTIVE' },
    orderBy: { raisedAmount: 'desc' },
    select: {
      id: true,
      name: true,
      avatar: true,
      raisedAmount: true,
      memberCount: true,
      campaignCount: true,
    },
  });

  await prisma.leaderboard.upsert({
    where: {
      type_period_startDate: {
        type: 'TOP_TEAMS',
        period: 'ALL_TIME',
        startDate: null,
      },
    },
    create: {
      type: 'TOP_TEAMS',
      period: 'ALL_TIME',
      data: topTeams.map((team, index) => ({
        rank: index + 1,
        teamId: team.id,
        name: team.name,
        avatar: team.avatar,
        amount: Number(team.raisedAmount),
        memberCount: team.memberCount,
        campaignCount: team.campaignCount,
      })),
    },
    update: {
      data: topTeams.map((team, index) => ({
        rank: index + 1,
        teamId: team.id,
        name: team.name,
        avatar: team.avatar,
        amount: Number(team.raisedAmount),
        memberCount: team.memberCount,
        campaignCount: team.campaignCount,
      })),
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboards - Get leaderboards
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'TOP_FUNDRAISERS';
    const period = searchParams.get('period') || 'ALL_TIME';

    // Try to get cached leaderboard first
    const cachedLeaderboard = await prisma.leaderboard.findFirst({
      where: {
        type: type as any,
        period: period as any,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // If cached and recent (less than 5 minutes old), return it
    if (cachedLeaderboard) {
      const cacheAge = Date.now() - cachedLeaderboard.updatedAt.getTime();
      if (cacheAge < 5 * 60 * 1000) {
        return NextResponse.json(cachedLeaderboard);
      }
    }

    // Otherwise, compute fresh leaderboard
    let leaderboardData;

    switch (type) {
      case 'TOP_FUNDRAISERS':
        leaderboardData = await getTopFundraisers(period);
        break;

      case 'TOP_DONORS':
        leaderboardData = await getTopDonors(period);
        break;

      case 'TOP_TEAMS':
        leaderboardData = await getTopTeams(period);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid leaderboard type' },
          { status: 400 }
        );
    }

    // Cache the leaderboard
    const leaderboard = await prisma.leaderboard.upsert({
      where: {
        type_period_startDate: {
          type: type as any,
          period: period as any,
          startDate: null,
        },
      },
      create: {
        type: type as any,
        period: period as any,
        data: leaderboardData,
      },
      update: {
        data: leaderboardData,
      },
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

async function getTopFundraisers(period: string) {
  const stats = await prisma.fundraiserStats.findMany({
    take: 100,
    where: {
      totalRaised: { gt: 0 },
    },
    orderBy: {
      totalRaised: 'desc',
    },
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

  return stats.map((stat, index) => ({
    rank: index + 1,
    userId: stat.userId,
    name: stat.user.name,
    avatar: stat.user.avatar,
    amount: Number(stat.totalRaised),
    campaigns: stat.totalCampaigns,
    donations: stat.totalDonations,
  }));
}

async function getTopDonors(period: string) {
  const users = await prisma.user.findMany({
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

  const donorsData = users
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

  return donorsData;
}

async function getTopTeams(period: string) {
  const teams = await prisma.team.findMany({
    take: 100,
    where: {
      status: 'ACTIVE',
      raisedAmount: { gt: 0 },
    },
    orderBy: {
      raisedAmount: 'desc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      avatar: true,
      raisedAmount: true,
      memberCount: true,
      campaignCount: true,
    },
  });

  return teams.map((team, index) => ({
    rank: index + 1,
    teamId: team.id,
    name: team.name,
    slug: team.slug,
    avatar: team.avatar,
    amount: Number(team.raisedAmount),
    members: team.memberCount,
    campaigns: team.campaignCount,
  }));
}

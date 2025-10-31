import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCampaignSchema } from '@/lib/validations';
import { generateSlug } from '@/lib/utils';

// GET /api/campaigns - List campaigns with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (userId) {
      where.creatorId = userId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              donations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCampaignSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugExists = await prisma.campaign.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(validatedData.title)}-${counter}`;
      slugExists = await prisma.campaign.findUnique({ where: { slug } });
      counter++;
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        ...validatedData,
        slug,
        creatorId: session.user.id,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update fundraiser stats
    await prisma.fundraiserStats.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        totalCampaigns: 1,
        activeCampaigns: campaign.status === 'ACTIVE' ? 1 : 0,
      },
      update: {
        totalCampaigns: { increment: 1 },
        activeCampaigns:
          campaign.status === 'ACTIVE' ? { increment: 1 } : undefined,
        lastActive: new Date(),
      },
    });

    // Award points for creating campaign
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPoints: { increment: 5 },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

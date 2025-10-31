import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCampaignSchema } from '@/lib/validations';

// GET /api/campaigns/[slug] - Get single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
          },
        },
        donations: {
          where: {
            paymentStatus: 'COMPLETED',
            isPublic: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          select: {
            id: true,
            amount: true,
            donorName: true,
            message: true,
            isAnonymous: true,
            createdAt: true,
            donor: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        updates: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            donations: true,
            updates: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.campaign.update({
      where: { slug },
      data: {
        viewCount: { increment: 1 },
      },
    });

    // Update fundraiser stats
    await prisma.fundraiserStats.update({
      where: { userId: campaign.creatorId },
      data: {
        totalViews: { increment: 1 },
      },
    }).catch(() => {
      // Ignore if fundraiser stats don't exist yet
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[slug] - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if campaign exists and user owns it
    const existingCampaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { creatorId: true },
    });

    if (!existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCampaignSchema.parse(body);

    const campaign = await prisma.campaign.update({
      where: { slug },
      data: {
        ...validatedData,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
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

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[slug] - Delete (soft delete) campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { creatorId: true, status: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by setting status to CANCELLED
    await prisma.campaign.update({
      where: { slug },
      data: { status: 'CANCELLED' },
    });

    // Update fundraiser stats
    await prisma.fundraiserStats.update({
      where: { userId: campaign.creatorId },
      data: {
        activeCampaigns: campaign.status === 'ACTIVE' ? { decrement: 1 } : undefined,
      },
    }).catch(() => {});

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

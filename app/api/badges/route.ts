import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/badges - List all badges
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (rarity) {
      where.rarity = rarity;
    }

    const badges = await prisma.badge.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: [
        { rarity: 'asc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

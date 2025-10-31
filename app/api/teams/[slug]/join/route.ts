import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/teams/[slug]/join - Join a team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find team
    const team = await prisma.team.findUnique({
      where: { slug },
      include: {
        members: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Team is not accepting new members' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = team.members.find(m => m.userId === session.user.id);
    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this team' },
        { status: 400 }
      );
    }

    // Check max members limit
    if (team.maxMembers && team.memberCount >= team.maxMembers) {
      return NextResponse.json(
        { error: 'Team is full' },
        { status: 400 }
      );
    }

    // Add user to team
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.user.id,
        role: 'MEMBER',
      },
    });

    // Update team member count
    await prisma.team.update({
      where: { id: team.id },
      data: {
        memberCount: { increment: 1 },
      },
    });

    return NextResponse.json({ message: 'Successfully joined team' });
  } catch (error) {
    console.error('Error joining team:', error);
    return NextResponse.json(
      { error: 'Failed to join team' },
      { status: 500 }
    );
  }
}

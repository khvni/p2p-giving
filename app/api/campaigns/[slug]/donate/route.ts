import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createPaymentIntent } from '@/lib/stripe';
import { createDonationSchema } from '@/lib/validations';

// POST /api/campaigns/[slug]/donate - Create donation and payment intent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    // Find campaign
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        status: true,
        currency: true,
        minDonation: true,
        maxDonation: true,
        allowAnonymous: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createDonationSchema.parse(body);

    // Validate donation amount limits
    if (campaign.minDonation && validatedData.amount < Number(campaign.minDonation)) {
      return NextResponse.json(
        { error: `Minimum donation is ${campaign.minDonation} ${campaign.currency}` },
        { status: 400 }
      );
    }

    if (campaign.maxDonation && validatedData.amount > Number(campaign.maxDonation)) {
      return NextResponse.json(
        { error: `Maximum donation is ${campaign.maxDonation} ${campaign.currency}` },
        { status: 400 }
      );
    }

    // Check anonymous donation is allowed
    if (validatedData.isAnonymous && !campaign.allowAnonymous) {
      return NextResponse.json(
        { error: 'Anonymous donations are not allowed for this campaign' },
        { status: 400 }
      );
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        amount: validatedData.amount,
        currency: validatedData.currency,
        donorId: session?.user?.id,
        donorName: validatedData.donorName || session?.user?.name,
        donorEmail: validatedData.donorEmail || session?.user?.email,
        message: validatedData.message,
        isAnonymous: validatedData.isAnonymous,
        isRecurring: validatedData.isRecurring,
        recurringFrequency: validatedData.recurringFrequency,
        campaignId: campaign.id,
        paymentStatus: 'PENDING',
        paymentMethod: 'stripe',
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      validatedData.amount,
      campaign.currency,
      {
        donationId: donation.id,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
      }
    );

    // Update donation with payment intent ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      donationId: donation.id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

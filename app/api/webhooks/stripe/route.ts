import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { constructWebhookEvent } from '@/lib/stripe';
import { awardDonationPoints, checkBadgeUnlocks, updateLeaderboards } from '@/lib/gamification';
import type Stripe from 'stripe';

// Disable body parsing for webhook
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = constructWebhookEvent(body, signature);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const donationId = paymentIntent.metadata.donationId;

  if (!donationId) {
    console.error('No donationId in payment intent metadata');
    return;
  }

  // Check if already processed (idempotency)
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: {
      campaign: true,
      donor: true,
    },
  });

  if (!donation) {
    console.error(`Donation ${donationId} not found`);
    return;
  }

  if (donation.paymentStatus === 'COMPLETED') {
    console.log('Donation already processed, skipping');
    return;
  }

  // Update donation status
  await prisma.donation.update({
    where: { id: donationId },
    data: {
      paymentStatus: 'COMPLETED',
    },
  });

  // Update campaign raised amount and donation count
  await prisma.campaign.update({
    where: { id: donation.campaignId },
    data: {
      raisedAmount: { increment: donation.amount },
      donationCount: { increment: 1 },
    },
  });

  // Update team if campaign is part of a team
  if (donation.campaign.teamId) {
    await prisma.team.update({
      where: { id: donation.campaign.teamId },
      data: {
        raisedAmount: { increment: donation.amount },
      },
    });

    // Update team member stats
    if (donation.campaign.creatorId) {
      await prisma.teamMember.updateMany({
        where: {
          teamId: donation.campaign.teamId,
          userId: donation.campaign.creatorId,
        },
        data: {
          raisedAmount: { increment: donation.amount },
        },
      });
    }
  }

  // Update fundraiser stats
  await prisma.fundraiserStats.upsert({
    where: { userId: donation.campaign.creatorId },
    create: {
      userId: donation.campaign.creatorId,
      totalRaised: donation.amount,
      totalDonations: 1,
      averageDonation: donation.amount,
      lastActive: new Date(),
    },
    update: {
      totalRaised: { increment: donation.amount },
      totalDonations: { increment: 1 },
      lastActive: new Date(),
    },
  });

  // Also calculate and update average donation
  const stats = await prisma.fundraiserStats.findUnique({
    where: { userId: donation.campaign.creatorId },
  });

  if (stats) {
    const avgDonation = Number(stats.totalRaised) / stats.totalDonations;
    await prisma.fundraiserStats.update({
      where: { userId: donation.campaign.creatorId },
      data: { averageDonation: avgDonation },
    });
  }

  // Award points to donor (if logged in)
  if (donation.donorId) {
    await awardDonationPoints(donation.donorId, Number(donation.amount));

    // Check for badge unlocks
    const newBadges = await checkBadgeUnlocks(donation.donorId);

    if (newBadges.length > 0) {
      console.log(`User ${donation.donorId} unlocked ${newBadges.length} new badges`);
    }
  }

  // Update leaderboards
  await updateLeaderboards();

  console.log(`Payment succeeded for donation ${donationId}`);
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const donationId = paymentIntent.metadata.donationId;

  if (!donationId) {
    console.error('No donationId in payment intent metadata');
    return;
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      paymentStatus: 'FAILED',
    },
  });

  console.log(`Payment failed for donation ${donationId}`);
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const donationId = paymentIntent.metadata.donationId;

  if (!donationId) {
    console.error('No donationId in payment intent metadata');
    return;
  }

  await prisma.donation.update({
    where: { id: donationId },
    data: {
      paymentStatus: 'FAILED',
    },
  });

  console.log(`Payment canceled for donation ${donationId}`);
}

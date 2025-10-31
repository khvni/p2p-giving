import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DonationForm } from '@/components/donation/donation-form';
import { ShareButtons } from '@/components/social/share-buttons';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { Calendar, Target, Users } from 'lucide-react';
import { formatDistance } from 'date-fns';

async function getCampaign(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/campaigns/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return null;
  }
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  const progress = calculateProgress(
    Number(campaign.raisedAmount),
    Number(campaign.goalAmount)
  );

  const daysLeft = campaign.endDate
    ? Math.ceil(
        (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {campaign.coverImage && (
              <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{campaign.category}</Badge>
              {campaign.status === 'ACTIVE' && (
                <Badge variant="success">Active</Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {campaign.title}
            </h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{campaign.donationCount} donors</span>
              </div>
              {daysLeft !== null && daysLeft > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{daysLeft} days left</span>
                </div>
              )}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {campaign.story || campaign.description}
                </p>
              </CardContent>
            </Card>

            {campaign.donations && campaign.donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaign.donations.map((donation: any) => (
                      <div
                        key={donation.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {donation.isAnonymous ? (
                            <span className="text-xs font-semibold">?</span>
                          ) : (
                            <span className="text-xs font-semibold">
                              {(donation.donor?.name || donation.donorName || 'A').charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {donation.isAnonymous
                              ? 'Anonymous'
                              : donation.donor?.name || donation.donorName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(Number(donation.amount), campaign.currency)} •{' '}
                            {formatDistance(new Date(donation.createdAt), new Date(), {
                              addSuffix: true,
                            })}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-700 mt-2">{donation.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatCurrency(Number(campaign.raisedAmount), campaign.currency)}
                  </div>
                  <div className="text-gray-600 mb-4">
                    raised of {formatCurrency(Number(campaign.goalAmount), campaign.currency)}
                  </div>
                  <Progress value={progress} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{progress}% funded</span>
                    {daysLeft !== null && daysLeft > 0 && (
                      <span>{daysLeft} days left</span>
                    )}
                  </div>
                </div>

                <DonationForm
                  campaignSlug={campaign.slug}
                  campaignTitle={campaign.title}
                  currency={campaign.currency}
                  minDonation={campaign.minDonation ? Number(campaign.minDonation) : undefined}
                  maxDonation={campaign.maxDonation ? Number(campaign.maxDonation) : undefined}
                />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Share this campaign</h3>
                  <ShareButtons
                    campaignSlug={campaign.slug}
                    campaignTitle={campaign.title}
                    campaignDescription={campaign.description}
                  />
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    {campaign.creator.avatar ? (
                      <img
                        src={campaign.creator.avatar}
                        alt={campaign.creator.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {campaign.creator.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {campaign.creator.name}
                      </p>
                      <p className="text-sm text-gray-600">Campaign Organizer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

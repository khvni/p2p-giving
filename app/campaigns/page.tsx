import { CampaignList } from '@/components/campaign/campaign-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getCampaigns() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/campaigns?status=ACTIVE&limit=12`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch campaigns');
    }

    const data = await res.json();
    return data.campaigns || [];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Campaigns</h1>
            <p className="text-gray-600">
              Browse active fundraising campaigns and make a difference today.
            </p>
          </div>
          <Link href="/campaigns/new">
            <Button size="lg">Start a Campaign</Button>
          </Link>
        </div>

        <CampaignList campaigns={campaigns} />
      </div>
    </div>
  );
}

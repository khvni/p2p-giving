'use client';

import { CampaignCard } from './campaign-card';

interface Campaign {
  slug: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  category: string;
  status: string;
  coverImage?: string | null;
  endDate?: Date | null;
  donationCount: number;
  creator: {
    name: string;
    avatar?: string | null;
  };
}

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.slug} campaign={campaign} />
      ))}
    </div>
  );
}

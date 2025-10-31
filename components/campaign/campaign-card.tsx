'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, calculateProgress } from '@/lib/utils';
import { Calendar, Target, Users } from 'lucide-react';

interface CampaignCardProps {
  campaign: {
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
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
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
    <Link href={`/campaigns/${campaign.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {campaign.coverImage && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary">{campaign.category}</Badge>
            {campaign.status === 'ACTIVE' && (
              <Badge variant="success">Active</Badge>
            )}
          </div>
          <h3 className="text-xl font-semibold line-clamp-2">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">
                {formatCurrency(Number(campaign.raisedAmount), campaign.currency)}
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(Number(campaign.goalAmount), campaign.currency)}
              </span>
            </div>
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground">{progress}% funded</div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{campaign.donationCount} donors</span>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{daysLeft} days left</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex items-center gap-2">
            {campaign.creator.avatar ? (
              <img
                src={campaign.creator.avatar}
                alt={campaign.creator.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold">
                  {campaign.creator.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              by {campaign.creator.name}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<'TOP_FUNDRAISERS' | 'TOP_DONORS' | 'TOP_TEAMS'>('TOP_FUNDRAISERS');
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboards?type=${leaderboardType}&period=ALL_TIME`);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [leaderboardType]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-xl font-bold text-gray-700">{rank}</span>;
  };

  const leaderboardData = leaderboard?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600 mb-8">
          See who's making the biggest impact in our community.
        </p>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={leaderboardType === 'TOP_FUNDRAISERS' ? 'default' : 'outline'}
                onClick={() => setLeaderboardType('TOP_FUNDRAISERS')}
              >
                Top Fundraisers
              </Button>
              <Button
                variant={leaderboardType === 'TOP_DONORS' ? 'default' : 'outline'}
                onClick={() => setLeaderboardType('TOP_DONORS')}
              >
                Top Donors
              </Button>
              <Button
                variant={leaderboardType === 'TOP_TEAMS' ? 'default' : 'outline'}
                onClick={() => setLeaderboardType('TOP_TEAMS')}
              >
                Top Teams
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading leaderboard...
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No data available yet
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((entry: any) => (
                  <div
                    key={entry.userId || entry.teamId}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                          {entry.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(entry.amount, 'MYR')} •{' '}
                        {leaderboardType === 'TOP_FUNDRAISERS' && `${entry.campaigns || 0} campaigns`}
                        {leaderboardType === 'TOP_DONORS' && `${entry.donationCount || 0} donations`}
                        {leaderboardType === 'TOP_TEAMS' && `${entry.members || 0} members • ${entry.campaigns || 0} campaigns`}
                      </p>
                    </div>
                    {entry.rank <= 3 && (
                      <Badge variant={entry.rank === 1 ? 'default' : 'secondary'}>
                        #{entry.rank}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

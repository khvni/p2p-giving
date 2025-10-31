'use client';

import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Share2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  campaignSlug: string;
  campaignTitle: string;
  campaignDescription: string;
}

export function ShareButtons({ campaignSlug, campaignTitle, campaignDescription }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const campaignUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/campaigns/${campaignSlug}`
    : '';

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackShare('FACEBOOK');
  };

  const handleTwitterShare = () => {
    const text = `${campaignTitle} - ${campaignDescription}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(campaignUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackShare('TWITTER');
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this campaign: ${campaignTitle}\n\n${campaignUrl}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    trackShare('WHATSAPP');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('EMAIL');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const trackShare = async (platform: string) => {
    try {
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignSlug,
          platform,
        }),
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleFacebookShare}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Facebook className="w-4 h-4" />
        Share
      </Button>

      <Button
        onClick={handleTwitterShare}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Twitter className="w-4 h-4" />
        Tweet
      </Button>

      <Button
        onClick={handleWhatsAppShare}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        WhatsApp
      </Button>

      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
    </div>
  );
}

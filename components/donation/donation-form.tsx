'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface DonationFormProps {
  campaignSlug: string;
  campaignTitle: string;
  currency: string;
  minDonation?: number;
  maxDonation?: number;
}

export function DonationForm({ campaignSlug, campaignTitle, currency, minDonation, maxDonation }: DonationFormProps) {
  const [amount, setAmount] = useState<number>(100);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInitiateDonation = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/campaigns/${campaignSlug}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency,
          message,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create donation');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error initiating donation:', error);
      alert(error instanceof Error ? error.message : 'Failed to initiate donation');
    } finally {
      setLoading(false);
    }
  };

  const presetAmounts = [50, 100, 250, 500, 1000];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Support this campaign</h2>
        <p className="text-muted-foreground">
          Your donation will help make a difference
        </p>
      </div>

      {!clientSecret ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Donation Amount ({currency})</Label>
            <div className="grid grid-cols-5 gap-2 mt-2 mb-3">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? 'default' : 'outline'}
                  onClick={() => setAmount(preset)}
                  className="w-full"
                >
                  {preset}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={minDonation || 1}
              max={maxDonation}
              required
            />
            {minDonation && (
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: {formatCurrency(minDonation, currency)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message of support..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="anonymous" className="font-normal cursor-pointer">
              Donate anonymously
            </Label>
          </div>

          <Button
            onClick={handleInitiateDonation}
            disabled={loading || amount < (minDonation || 1)}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : `Donate ${formatCurrency(amount, currency)}`}
          </Button>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm campaignSlug={campaignSlug} />
        </Elements>
      )}
    </div>
  );
}

function CheckoutForm({ campaignSlug }: { campaignSlug: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/campaigns/${campaignSlug}?donation=success`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}
      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading ? 'Processing...' : 'Complete Donation'}
      </Button>
    </form>
  );
}

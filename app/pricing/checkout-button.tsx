'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CheckoutButtonProps {
  priceId: string;
  planName: string;
  mode?: 'payment' | 'subscription';
  className?: string;
}

interface CheckoutResponse {
  success: boolean;
  data?: {
    sessionId: string;
    url: string;
  };
  error?: {
    message: string;
  };
}

export function CheckoutButton({
  priceId,
  planName,
  mode = 'subscription',
  className,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const endpoint =
        mode === 'subscription' ? '/api/stripe/checkout/subscription' : '/api/stripe/checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data: CheckoutResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? 'Loading...' : `Get ${planName}`}
    </Button>
  );
}

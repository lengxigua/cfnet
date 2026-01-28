/**
 * Registration Page
 * Provides new user registration functionality
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, FormError } from '@/components/ui';
import { AuthLayout } from '@/components/layout';
import { AuthService } from '@/services';
import { ApiError } from '@/lib/http';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      await AuthService.register({ email, password, name });

      // Registration successful, redirect to login page
      router.push('/login?registered=true');
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Registration failed, please try again later');
      }
      console.error('Registration error:', e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign Up"
      description="Create a new account to get started"
      footer={
        <>
          <Button type="submit" form="register-form" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login now
            </Link>
          </div>
        </>
      }
    >
      <form id="register-form" onSubmit={onSubmit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-2">
          <Label htmlFor="name">Username</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            required
            disabled={isLoading}
          />
        </div>
      </form>
    </AuthLayout>
  );
}

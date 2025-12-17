import { NextRequest, NextResponse } from 'next/server';
import { createPrismaClient } from '@/lib/db/client';
import { createRepositories } from '@/repositories';
import { logger } from '@/lib/logger';
import { getStripeClient, getWebhookSecret } from '@/lib/stripe';
import {
  handleCheckoutSessionCompleted,
  handleCustomerCreated,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
} from '@/lib/stripe/webhook-handlers';
import type Stripe from 'stripe';

export const runtime = 'edge';

const log = logger.child('stripe-webhook');

/**
 * POST /api/stripe/webhook - Handle Stripe webhook events
 *
 * This endpoint receives webhook events from Stripe and processes them.
 * Signature verification ensures the request is from Stripe.
 */
export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  // Get raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    log.warn('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // Verify webhook signature
  try {
    const stripe = getStripeClient();
    const webhookSecret = getWebhookSecret();

    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (error) {
    log.error('Webhook signature verification failed', error as Error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  log.info('Received webhook event', {
    eventId: event.id,
    eventType: event.type,
  });

  // Initialize database connection
  const prisma = createPrismaClient();
  if (!prisma) {
    log.error('Database not available');
    return NextResponse.json({ error: 'Database not available' }, { status: 503 });
  }

  const repos = createRepositories(prisma);

  // Check idempotency - prevent duplicate processing
  const alreadyProcessed = await repos.webhookEvents.isProcessed(event.id);
  if (alreadyProcessed) {
    log.info('Event already processed, skipping', { eventId: event.id });
    return NextResponse.json({ received: true, status: 'already_processed' });
  }

  // Process event based on type
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event as Stripe.CheckoutSessionCompletedEvent, repos);
        break;

      case 'customer.created':
        await handleCustomerCreated(event as Stripe.CustomerCreatedEvent, repos);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event as Stripe.CustomerSubscriptionCreatedEvent, repos);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event as Stripe.CustomerSubscriptionUpdatedEvent, repos);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event as Stripe.CustomerSubscriptionDeletedEvent, repos);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event as Stripe.InvoicePaidEvent, repos);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event as Stripe.InvoicePaymentFailedEvent, repos);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event as Stripe.PaymentIntentSucceededEvent, repos);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event as Stripe.PaymentIntentPaymentFailedEvent, repos);
        break;

      default:
        log.info('Unhandled event type', { eventType: event.type });
    }

    // Mark event as processed
    await repos.webhookEvents.markProcessed(event.id, event.type);

    log.info('Webhook event processed successfully', {
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json({ received: true, status: 'processed' });
  } catch (error) {
    log.error('Failed to process webhook event', error as Error, {
      eventId: event.id,
      eventType: event.type,
    });

    // Return 200 to acknowledge receipt (Stripe will retry on 4xx/5xx)
    // But log the error for investigation
    return NextResponse.json(
      { received: true, status: 'error', message: 'Processing failed' },
      { status: 200 }
    );
  }
}

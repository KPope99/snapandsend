import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

export async function triggerWebhooks(event: string, data: any) {
  try {
    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        events: {
          contains: event
        }
      },
      include: {
        partner: true
      }
    });

    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString()
    };

    // Send webhook to each subscriber
    const results = await Promise.allSettled(
      webhooks.map(webhook => sendWebhook(webhook, payload))
    );

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Webhook delivery failed for ${webhooks[index].url}:`, result.reason);
      }
    });

    return results;
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

async function sendWebhook(webhook: any, payload: WebhookPayload) {
  const body = JSON.stringify(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': payload.event,
    'X-Webhook-Timestamp': payload.timestamp
  };

  // Add signature if secret is configured
  if (webhook.secret) {
    const signature = crypto
      .createHmac('sha256', webhook.secret)
      .update(body)
      .digest('hex');
    headers['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  const response = await fetch(webhook.url, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

// Helper to trigger specific events
export const webhookEvents = {
  incidentCreated: (incident: any) => triggerWebhooks('incident.created', {
    id: incident.id,
    title: incident.title,
    category: incident.category,
    location: {
      latitude: incident.latitude,
      longitude: incident.longitude,
      address: incident.address
    },
    createdAt: incident.createdAt
  }),

  incidentVerified: (incident: any) => triggerWebhooks('incident.verified', {
    id: incident.id,
    title: incident.title,
    verificationCount: incident.agreementCount,
    status: incident.status
  }),

  incidentStatusChanged: (incident: any, previousStatus: string, newStatus: string, changedBy: string) =>
    triggerWebhooks('incident.status_changed', {
      id: incident.id,
      title: incident.title,
      previousStatus,
      newStatus,
      changedBy
    }),

  incidentResolved: (incident: any) => triggerWebhooks('incident.resolved', {
    id: incident.id,
    title: incident.title,
    resolvedAt: new Date().toISOString()
  })
};

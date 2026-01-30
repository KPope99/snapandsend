# SnapAndSend External API Documentation

## Overview

The SnapAndSend External API allows authorized partners (police departments, local authorities, emergency services) to integrate with the incident reporting system. Partners can:

- Fetch reported incidents in real-time
- Update incident statuses
- Receive webhook notifications for new incidents
- Access statistics and analytics

## Base URL

```
https://your-domain.com/api/external
```

For local development:
```
http://localhost:5002/api/external
```

## Authentication

All API requests require an API key passed in the `X-API-Key` header.

```bash
curl -H "X-API-Key: sns_your_api_key_here" \
  https://your-domain.com/api/external/incidents
```

To obtain an API key, contact the SnapAndSend administrator.

---

## Endpoints

### Incidents

#### List Incidents

```
GET /incidents
```

Fetch all incidents with optional filters.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `verified`, `resolved`, `investigating` |
| `category` | string | Filter by category: `pothole`, `garbage`, `vandalism`, `streetlight`, `drainage`, `signage`, `robbery`, `other` |
| `since` | ISO date | Fetch incidents created after this date |
| `lat` | number | Latitude for location-based filtering |
| `lng` | number | Longitude for location-based filtering |
| `radius` | number | Radius in meters (requires lat/lng) |
| `limit` | number | Results per page (default: 50, max: 500) |
| `offset` | number | Pagination offset |

**Example Request:**

```bash
curl -H "X-API-Key: sns_your_api_key" \
  "http://localhost:5002/api/external/incidents?status=pending&category=robbery&limit=10"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx1234567890",
      "title": "Armed robbery on Main Street",
      "description": "Two armed men robbed a shop at approximately 8pm",
      "category": "robbery",
      "status": "pending",
      "location": {
        "latitude": 9.0579,
        "longitude": 7.4951,
        "address": "123 Main Street, Lagos"
      },
      "images": [
        {
          "id": "img123",
          "url": "/uploads/abc123.jpg",
          "createdAt": "2024-01-15T20:30:00.000Z"
        }
      ],
      "verificationCount": 5,
      "createdAt": "2024-01-15T20:15:00.000Z",
      "updatedAt": "2024-01-15T20:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

#### Get Single Incident

```
GET /incidents/:id
```

Fetch detailed information about a specific incident.

**Example Request:**

```bash
curl -H "X-API-Key: sns_your_api_key" \
  http://localhost:5002/api/external/incidents/clx1234567890
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "title": "Armed robbery on Main Street",
    "description": "Two armed men robbed a shop at approximately 8pm",
    "category": "robbery",
    "status": "investigating",
    "location": {
      "latitude": 9.0579,
      "longitude": 7.4951,
      "address": "123 Main Street, Lagos"
    },
    "images": [
      {
        "id": "img123",
        "url": "/uploads/abc123.jpg",
        "createdAt": "2024-01-15T20:30:00.000Z"
      }
    ],
    "verifications": [
      {
        "id": "ver123",
        "location": {
          "latitude": 9.0580,
          "longitude": 7.4952
        },
        "distanceFromIncident": 15.5,
        "createdAt": "2024-01-15T20:45:00.000Z"
      }
    ],
    "verificationCount": 5,
    "createdAt": "2024-01-15T20:15:00.000Z",
    "updatedAt": "2024-01-15T21:00:00.000Z"
  }
}
```

---

#### Update Incident Status

```
PATCH /incidents/:id/status
```

Update the status of an incident. Useful for marking incidents as under investigation or resolved.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status: `pending`, `verified`, `resolved`, `investigating` |
| `notes` | string | No | Notes about the status change |

**Example Request:**

```bash
curl -X PATCH \
  -H "X-API-Key: sns_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"status": "investigating", "notes": "Case assigned to Officer Adebayo"}' \
  http://localhost:5002/api/external/incidents/clx1234567890/status
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "status": "investigating",
    "updatedAt": "2024-01-15T21:30:00.000Z"
  },
  "message": "Incident status updated to 'investigating'"
}
```

---

#### Get Incident History

```
GET /incidents/:id/history
```

Get the status change history for an incident.

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "log123",
      "previousStatus": "pending",
      "newStatus": "investigating",
      "notes": "Case assigned to Officer Adebayo",
      "changedBy": "Nigeria Police",
      "createdAt": "2024-01-15T21:30:00.000Z"
    },
    {
      "id": "log124",
      "previousStatus": "investigating",
      "newStatus": "resolved",
      "notes": "Suspects apprehended",
      "changedBy": "Nigeria Police",
      "createdAt": "2024-01-16T14:00:00.000Z"
    }
  ]
}
```

---

### Statistics

#### Get Statistics

```
GET /stats
```

Get aggregate statistics about incidents.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `since` | ISO date | Only count incidents after this date |

**Example Response:**

```json
{
  "success": true,
  "data": {
    "total": 1250,
    "last24Hours": 45,
    "byStatus": {
      "pending": 320,
      "verified": 580,
      "investigating": 150,
      "resolved": 200
    },
    "byCategory": {
      "robbery": 180,
      "pothole": 450,
      "garbage": 280,
      "vandalism": 120,
      "streetlight": 95,
      "drainage": 75,
      "signage": 30,
      "other": 20
    }
  }
}
```

---

### Webhooks

Webhooks allow you to receive real-time notifications when incidents are created or updated.

#### Register Webhook

```
POST /webhooks
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | URL to receive webhook notifications |
| `events` | array | No | Events to subscribe to (default: all) |
| `secret` | string | No | Secret for signature verification |

**Available Events:**
- `incident.created` - New incident reported
- `incident.verified` - Incident reached verification threshold
- `incident.status_changed` - Incident status was updated
- `incident.resolved` - Incident was resolved

**Example Request:**

```bash
curl -X POST \
  -H "X-API-Key: sns_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://police-system.gov.ng/webhooks/snapandsend",
    "events": ["incident.created", "incident.status_changed"],
    "secret": "your_webhook_secret"
  }' \
  http://localhost:5002/api/external/webhooks
```

**Webhook Payload Example:**

```json
{
  "event": "incident.created",
  "data": {
    "id": "clx1234567890",
    "title": "Armed robbery on Main Street",
    "category": "robbery",
    "location": {
      "latitude": 9.0579,
      "longitude": 7.4951,
      "address": "123 Main Street, Lagos"
    },
    "createdAt": "2024-01-15T20:15:00.000Z"
  },
  "timestamp": "2024-01-15T20:15:05.000Z"
}
```

**Webhook Headers:**

| Header | Description |
|--------|-------------|
| `X-Webhook-Event` | The event type |
| `X-Webhook-Timestamp` | When the webhook was sent |
| `X-Webhook-Signature` | HMAC-SHA256 signature (if secret configured) |

**Verifying Webhook Signatures:**

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

#### List Webhooks

```
GET /webhooks
```

List all registered webhooks for your API key.

---

#### Delete Webhook

```
DELETE /webhooks/:id
```

Delete a registered webhook.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

**Common Error Codes:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid request | Missing or invalid parameters |
| 401 | API key required | No API key provided |
| 403 | Invalid API key | API key is invalid or deactivated |
| 404 | Not found | Resource not found |
| 500 | Internal server error | Server error |

---

## Rate Limiting

API requests are limited to:
- 1000 requests per hour per API key
- 100 requests per minute per API key

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705350000
```

---

## Partner Management

To create an API key for a new partner (admin only):

```bash
cd ~/snapandsend
npx tsx server/scripts/manage-partners.ts create "Nigeria Police" police@nigeria.gov.ng "Official police integration"
```

Other commands:
```bash
# List all partners
npx tsx server/scripts/manage-partners.ts list

# Deactivate a partner
npx tsx server/scripts/manage-partners.ts deactivate police@nigeria.gov.ng

# Regenerate API key
npx tsx server/scripts/manage-partners.ts regenerate police@nigeria.gov.ng
```

---

## Support

For API support or to request an API key, contact:
- Email: api-support@snapandsend.com
- Documentation: https://docs.snapandsend.com

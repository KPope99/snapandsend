# SnapAndSend

A community-powered incident reporting Progressive Web App (PWA) that enables citizens to report local issues with photos and location data.

**Snap. Send. Solve.**

## Overview

SnapAndSend empowers communities to report infrastructure issues, safety concerns, and other incidents directly to local authorities. With AI-powered image analysis, automatic duplicate detection, and real-time status tracking, it bridges the gap between citizens and the agencies responsible for resolving issues.

## Features

### For Citizens
- **Photo Capture** - Take photos or upload images of incidents
- **AI-Powered Analysis** - Automatic category detection and description generation using OpenAI Vision
- **GPS Location** - Automatic location tagging with manual override option
- **Community Verification** - Nearby users can verify reports (within 500m)
- **Duplicate Detection** - Similar incidents within 200m are automatically merged as verifications
- **Real-time Tracking** - Monitor the status of your reports from pending to resolved
- **PWA Support** - Install on any device, works offline

### For Authorities
- **External API** - RESTful API for integration with existing systems
- **Webhook Support** - Real-time notifications for incident events
- **Status Management** - Update incident status with evidence and notes
- **Statistics** - Analytics on incident types, counts, and trends

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Maps**: Leaflet with OpenStreetMap
- **AI**: OpenAI Vision API (GPT-4o-mini)
- **Auth**: JWT with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KPope99/snapandsend.git
   cd snapandsend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="your-openai-api-key"
   JWT_SECRET="your-jwt-secret"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5002

## Project Structure

```
snapandsend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── server/
│   ├── index.ts           # Express server entry
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── reports.ts     # Report CRUD operations
│   │   ├── images.ts      # Image upload & AI analysis
│   │   ├── external.ts    # External API for authorities
│   │   └── location.ts    # Geocoding services
│   └── services/
│       ├── vision.ts      # OpenAI Vision integration
│       └── geo.ts         # Geolocation utilities
├── src/
│   ├── components/        # React components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── services/          # API client services
│   └── types/             # TypeScript definitions
└── public/                # Static assets
```

## API Documentation

### External API (for Authorities)

All endpoints require `X-API-Key` header.

#### Get Incidents
```http
GET /api/external/incidents
```
Query params: `status`, `category`, `since`, `lat`, `lng`, `radius`, `limit`, `offset`

#### Get Single Incident
```http
GET /api/external/incidents/:id
```

#### Update Incident Status
```http
PATCH /api/external/incidents/:id/status
Content-Type: application/json

{
  "status": "investigating|resolved",
  "notes": "Resolution description",
  "evidenceUrl": "https://..."
}
```

#### Get Statistics
```http
GET /api/external/stats
```

#### Register Webhook
```http
POST /api/external/webhooks
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["incident.created", "incident.verified", "incident.resolved"]
}
```

## Incident Categories

- Pothole / Road Damage
- Garbage / Illegal Dumping
- Streetlight Outage
- Drainage Issues
- Vandalism
- Signage Damage
- Robbery
- Other
- AI-detected custom categories

## Related Projects

- **[Incident Response](https://github.com/KPope99/incident-response)** - Police/Authority dashboard for managing reported incidents

## Screenshots

*Coming soon*

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed by Tech84.

## Contact

**Tech84** - Building technology solutions for communities

---

© Tech84

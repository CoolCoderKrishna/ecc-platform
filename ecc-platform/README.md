# ECC Hub - Career Intelligence Platform for CS Students

A production-ready web platform that continuously tracks and aggregates internship opportunities, certifications, hackathons, coding competitions, research opportunities, open-source programs, scholarships, and career-development resources — with instant alerts via Email, Telegram, SMS, and WhatsApp.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  Landing · Dashboard · Opportunities · Portfolio · Goals     │
│  Certifications · Notifications · Profile · Settings · Admin │
├─────────────────────────────────────────────────────────────┤
│                      API Layer (Next.js Routes)              │
│  /api/auth · /api/opportunities · /api/notifications         │
│  /api/profile · /api/certifications · /api/portfolio         │
│  /api/goals · /api/achievements · /api/data-sources          │
├─────────────────────────────────────────────────────────────┤
│                    Services & Integrations                    │
│  Scraping Engine (RSS + HTML) · Notification Dispatch        │
│  Email (Resend) · Telegram · SMS (Twilio) · WhatsApp         │
├─────────────────────────────────────────────────────────────┤
│                      Database (PostgreSQL)                    │
│  Prisma ORM · 15+ models · Full relations & enums            │
├─────────────────────────────────────────────────────────────┤
│                    Cron Jobs (External)                       │
│  /api/cron/scrape · /api/cron/weekly-digest                  │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL + Prisma 7 ORM |
| **Auth** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Styling** | Tailwind CSS 4 + Radix UI |
| **Email** | Resend |
| **SMS/WhatsApp** | Twilio |
| **Telegram** | Telegram Bot API |
| **Scraping** | Cheerio (HTML) + rss-parser (RSS) |
| **Forms** | React Hook Form + Zod |

## Features

### 🎯 Real-Time Opportunity Tracking
- Monitors 100+ sources via RSS feeds and HTML scrapers
- Deduplication via content hashing
- Categorization: Internships, Certifications, Hackathons, Competitions, Research, Open Source, Scholarships
- Skill-based match scoring

### 🔔 Instant Alerts & Notifications
- **Email** — Beautiful HTML templates via Resend
- **Telegram** — Formatted bot messages with inline links
- **SMS** — Twilio-powered text alerts
- **WhatsApp** — Twilio WhatsApp messages
- **In-App** — Real-time notification center
- Customizable frequency: Instant, Hourly, Daily, Weekly
- Deadline reminders at 3-day and 7-day marks

### 📊 Portfolio & Resume Dashboard
- Track certifications with expiry warnings
- Manage projects, internships, and achievements
- Portfolio health score (projects, certs, experience, skills, achievements)
- Personalized improvement recommendations

### 🧭 Career Goals & Roadmap
- Goal CRUD with milestone tracking
- Server-side progress calculation
- Default goal templates for new users
- Visual progress bars and completion stats

### 👤 Profile & Personalization
- Academic year, skills, interests, career goals
- Preferred technologies
- Skill-based opportunity matching algorithm
- Profile completeness scoring

### 🛡️ Admin Dashboard
- Data source management (add, toggle, monitor)
- Scraping logs and health monitoring
- System health status
- Category breakdown analytics

## Database Schema

### Models (15+)
- **Auth**: User, Account, Session, VerificationToken
- **Opportunities**: Opportunity, SavedOpportunity, ViewedOpportunity
- **Notifications**: Notification, NotificationPreference
- **Portfolio**: Certification, Achievement, PortfolioItem
- **Goals**: Goal, Milestone
- **Scraping**: DataSource, ScrapeLog

### Enums
- Role (STUDENT, ADMIN)
- Category (10 types: INTERNSHIP, CERTIFICATION, HACKATHON, etc.)
- Difficulty (BEGINNER → EXPERT)
- NotificationType, NotificationFreq
- PortfolioType, SourceType, ScrapeStatus

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| GET/POST | `/api/opportunities` | List/create opportunities |
| GET/PATCH | `/api/notifications` | List/update notifications |
| POST | `/api/notifications/send` | Send notifications to users |
| GET/PATCH | `/api/profile` | Get/update user profile |
| GET/POST/DELETE | `/api/certifications` | Manage certifications |
| GET/POST/PATCH/DELETE | `/api/portfolio` | Manage portfolio items |
| GET/POST/PATCH/DELETE | `/api/goals` | Manage goals with milestones |
| GET/POST/DELETE | `/api/achievements` | Manage achievements |
| GET/PATCH | `/api/data-sources` | Admin: manage scrapers |
| GET | `/api/cron/scrape` | Cron: run all scrapers |
| GET | `/api/cron/weekly-digest` | Cron: send weekly digests |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/affaan-m/ECC.git
cd ECC/ecc-platform
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for NextAuth |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `RESEND_API_KEY` | Optional | Resend API key for email |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram bot token |
| `TWILIO_ACCOUNT_SID` | Optional | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Optional | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Optional | Twilio phone number |
| `TWILIO_WHATSAPP_NUMBER` | Optional | Twilio WhatsApp number |
| `CRON_SECRET` | Optional | Secret for cron endpoints |

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Seed Data Sources (Admin)

After creating an admin account, use the Admin Dashboard to add data sources, or call the API:

```bash
curl -X POST http://localhost:3000/api/data-sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub GSoC Feed",
    "url": "https://summerofcode.withgoogle.com/rss",
    "type": "RSS",
    "category": "OPEN_SOURCE"
  }'
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Cron Jobs

Set up external cron (e.g., [cron-job.org](https://cron-job.org)) to call:

- `GET /api/cron/scrape` — Every 30 minutes
- `GET /api/cron/weekly-digest` — Every Monday at 8 AM

Include header: `Authorization: Bearer YOUR_CRON_SECRET`

## Folder Structure

```
ecc-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (15+ models)
│   └── prisma.config.ts       # Prisma configuration
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, Register pages
│   │   ├── (dashboard)/       # All dashboard pages
│   │   │   ├── admin/
│   │   │   ├── certifications/
│   │   │   ├── dashboard/
│   │   │   ├── goals/
│   │   │   ├── notifications/
│   │   │   ├── opportunities/
│   │   │   ├── portfolio/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── api/               # API routes
│   │   │   ├── achievements/
│   │   │   ├── auth/
│   │   │   ├── certifications/
│   │   │   ├── cron/
│   │   │   ├── data-sources/
│   │   │   ├── goals/
│   │   │   ├── notifications/
│   │   │   ├── opportunities/
│   │   │   ├── portfolio/
│   │   │   └── profile/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   ├── providers/         # AuthProvider
│   │   └── ui/                # 12 Radix UI components
│   ├── hooks/
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── constants.ts       # Skills, categories, etc.
│   │   ├── db.ts              # Prisma client
│   │   ├── notifications/     # Email, Telegram, SMS dispatch
│   │   ├── scraping/          # RSS + HTML scraping engine
│   │   └── utils.ts           # Helpers + match scoring
│   └── middleware.ts          # Route protection
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## License

MIT

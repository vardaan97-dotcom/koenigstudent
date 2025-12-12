# Koenig Learning Portal - Developer Handover Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Architecture](#architecture)
6. [Feature Documentation](#feature-documentation)
7. [Multi-Tenancy & Customization](#multi-tenancy--customization)
8. [Authentication](#authentication)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

The Koenig Learning Portal is a white-label Learning Management System (LMS) built for IT certification training. It supports multi-tenant customization, allowing Koenig sales team to configure branded instances for enterprise clients like PWC, Deloitte, KPMG, etc.

### Key Features
- Video-based course content with YouTube integration
- Interactive quizzes and "Qubits" (quick knowledge checks)
- Gamification (XP, levels, achievements, streaks)
- AI Study Assistant
- Spaced repetition flashcards
- Exam simulator with weak area analysis
- Study groups and forum
- Focus mode (Pomodoro timer)
- Mind maps
- Progress analytics
- Certificates
- PWA support for offline access
- Onboarding tour for new users

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS 4 |
| State Management | React Context API |
| Authentication | WorkOS (OAuth), JWT |
| Video Player | YouTube IFrame API |
| PWA | Service Worker, Web App Manifest |
| Package Manager | npm |

---

## Project Structure

```
koenig-learner-portal/
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── offline.html       # Offline fallback
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── login/         # Auth pages
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── AdminCustomizer.tsx
│   │   ├── AIStudyAssistant.tsx
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── BookmarksNotesPanel.tsx
│   │   ├── CelebrationOverlay.tsx
│   │   ├── ExamPrep.tsx
│   │   ├── FocusMode.tsx
│   │   ├── GamificationWidget.tsx
│   │   ├── KeyboardShortcuts.tsx
│   │   ├── MindMap.tsx
│   │   ├── OnboardingTour.tsx
│   │   ├── SocialHub.tsx
│   │   ├── SpacedRepetition.tsx
│   │   ├── StudyCalendar.tsx
│   │   ├── VideoTranscript.tsx
│   │   └── WIPPopup.tsx
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── CompanyContext.tsx
│   │   ├── GamificationContext.tsx
│   │   ├── SocialContext.tsx
│   │   ├── StudyContext.tsx
│   │   └── ThemeContext.tsx
│   ├── lib/               # Utilities and backend logic
│   │   ├── api/
│   │   │   └── client.ts  # API client
│   │   ├── auth/
│   │   │   └── middleware.ts  # Auth utilities
│   │   ├── config/
│   │   │   └── company-presets.ts  # Company templates
│   │   └── db/
│   │       └── schema.ts  # Database models
│   └── data/              # Mock data and types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── DEVELOPER_HANDOVER.md  # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/vardaan97-dotcom/koenigstudent.git
cd koenigstudent

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=/api

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
WORKOS_API_KEY=your-workos-api-key
WORKOS_CLIENT_ID=your-workos-client-id

# YouTube API (optional, for custom player features)
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key
```

---

## Architecture

### Context Providers Hierarchy

```
AuthProvider                 # Authentication state
└── CompanyProvider          # Multi-tenant configuration
    └── ThemeProvider        # Light/dark mode
        └── GamificationProvider  # XP, achievements, streaks
            └── StudyProvider     # Bookmarks, notes, flashcards
                └── SocialProvider    # Groups, forum, sessions
                    └── TourProvider  # Onboarding tour
                        └── App       # Your components
```

### State Management

Each context manages a specific domain:

| Context | Purpose |
|---------|---------|
| AuthContext | User authentication, session, login/logout |
| CompanyContext | Company branding, features, customization |
| ThemeContext | Light/dark mode, user theme preferences |
| GamificationContext | XP, levels, achievements, daily challenges |
| StudyContext | Bookmarks, notes, flashcards, calendar |
| SocialContext | Study groups, forum posts, live sessions |

---

## Feature Documentation

### 1. Video Player Integration

The video player uses YouTube IFrame API:

```typescript
// src/components/VideoPlayer.tsx
// Supports:
// - Auto-save progress position
// - Playback speed control
// - Keyboard shortcuts (Space, J/L, etc.)
// - Quality selection
```

### 2. Qubits (Quick Knowledge Checks)

Located in `src/data/qubits.ts`. Format:

```typescript
interface Qubit {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### 3. Gamification System

```typescript
// Levels: 1-10
// XP Sources:
// - Complete lesson: 50 XP
// - Pass quiz: 100 XP
// - Daily streak: 25 XP
// - Achievement unlock: varies

// See src/context/GamificationContext.tsx
```

### 4. Spaced Repetition (SM-2 Algorithm)

Flashcards use the SM-2 algorithm for optimal review scheduling:

```typescript
// src/context/StudyContext.tsx
// Quality ratings: 0-5
// Interval calculation based on ease factor
// Reviews scheduled automatically
```

### 5. Onboarding Tour

```typescript
// src/components/OnboardingTour.tsx
// Steps defined in TOUR_STEPS array
// Supports demo mode for sales presentations
// Add data-tour="element-name" to highlight elements
```

---

## Multi-Tenancy & Customization

### Company Presets

Pre-configured templates in `src/lib/config/company-presets.ts`:

- PWC (default)
- Deloitte
- KPMG
- EY
- Generic templates for Finance, Healthcare, Tech, etc.

### Customizable Elements

| Element | Location |
|---------|----------|
| Logo | CompanyContext |
| Colors (6 properties) | CompanyBranding |
| Fonts | CompanyBranding |
| Button/Card styles | CompanyBranding |
| Welcome messages | CompanyBranding |
| Feature toggles (20+) | CompanyFeatures |

### Using the Admin Customizer

1. Navigate to `/admin/customize`
2. Select a preset or start fresh
3. Configure branding colors and fonts
4. Toggle features on/off
5. Export configuration as JSON

### Feature Gating

Use the `FeatureGate` component:

```tsx
import { FeatureGate } from '@/context/CompanyContext';

<FeatureGate feature="aiAssistant">
  <AIStudyAssistant />
</FeatureGate>
```

Or the hook:

```tsx
import { useFeature } from '@/context/CompanyContext';

const hasAI = useFeature('aiAssistant');
```

---

## Authentication

### Flow

1. User visits `/login`
2. Chooses email/password or SSO (WorkOS)
3. Server validates and returns JWT
4. JWT stored in httpOnly cookie
5. Subsequent requests include token

### Roles

| Role | Access Level |
|------|--------------|
| learner | View courses, take quizzes |
| team_lead | + View team progress |
| manager | + Manage team enrollments |
| company_admin | + Full company settings |
| koenig_sales | + Access any company |
| koenig_admin | Full system access |

### Middleware

```typescript
// src/lib/auth/middleware.ts
import { withAuth, withRole } from '@/lib/auth/middleware';

// Require authentication
export const GET = withAuth(async (request) => {
  const user = request.user;
  // ...
});

// Require specific role
export const POST = withRole('company_admin', async (request) => {
  // ...
});
```

---

## API Reference

### Client Usage

```typescript
import { apiClient, courseApi, userApi } from '@/lib/api/client';

// Generic requests
const response = await apiClient.get('/courses');
const data = await apiClient.post('/quizzes/submit', { answers });

// Typed endpoints
const courses = await courseApi.list();
const profile = await userApi.getProfile();
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Email/password login |
| POST | /api/auth/workos | SSO login |
| GET | /api/auth/me | Get current user |
| GET | /api/courses | List courses |
| GET | /api/courses/:id | Get course details |
| GET | /api/enrollments | User enrollments |
| POST | /api/enrollments | Enroll in course |
| PATCH | /api/progress/lessons/:id | Update lesson progress |
| POST | /api/quizzes/:id/submit | Submit quiz |
| GET | /api/companies/:slug | Get company config |

---

## Database Schema

See `src/lib/db/schema.ts` for complete type definitions.

### Core Models

```typescript
Company       // Organization using the portal
User          // Learner or admin
Course        // Certification course
Module        // Course section
Lesson        // Individual content piece
Enrollment    // User-course relationship
LessonProgress // Per-lesson tracking
QuizAttempt   // Quiz submission record
```

### Notes
- IDs are UUIDs (`crypto.randomUUID()`)
- Timestamps are ISO 8601 strings
- Currently using in-memory/localStorage for demo
- Production: migrate to PostgreSQL/MongoDB

---

## Deployment

### Build

```bash
npm run build
```

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Environment-Specific Settings

| Setting | Development | Production |
|---------|-------------|------------|
| JWT_SECRET | Any string | Strong random key |
| API_URL | /api | https://api.koenig.com |
| Debug mode | Enabled | Disabled |

---

## Troubleshooting

### Common Issues

**Build fails with type errors**
```bash
# Check for TypeScript errors
npm run type-check
```

**PWA not working**
- Clear browser cache
- Check service worker registration in console
- Verify manifest.json is accessible

**YouTube videos not loading**
- Check if videos are unlisted/private
- Verify YouTube API key
- Check browser console for errors

**Authentication issues**
- Clear localStorage
- Check JWT expiry
- Verify WorkOS configuration

### Debug Mode

Enable verbose logging:
```typescript
localStorage.setItem('debug', 'true');
```

### Contact

For issues or questions:
- GitHub Issues: [koenigstudent repo]
- Email: tech@koenig-solutions.com

---

## Changelog

### Version 1.0.0 (December 2025)
- Initial release
- All core features implemented
- PWC branding configured
- Multi-tenant support
- PWA enabled

---

*This documentation was generated for developer handover. Keep it updated as the codebase evolves.*

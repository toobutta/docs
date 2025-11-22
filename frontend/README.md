# Evoteli Frontend

**Market Intelligence Platform** - React frontend for Evoteli, fusing computer vision, satellite imagery, and geospatial data for decision-grade signals.

Built with Next.js 15, React 18, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Maps:** MapLibre GL JS, react-map-gl, Deck.gl
- **AI:** Vercel AI SDK, OpenAI GPT-4
- **State Management:** Zustand, TanStack Query
- **Forms:** React Hook Form, Zod
- **Charts:** Recharts
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- MapTiler API key (sign up at https://www.maptiler.com/)
- OpenAI API key (get from https://platform.openai.com/)

### Installation

1. Clone the repository and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
OPENAI_API_KEY=your_openai_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group (login, signup)
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── map/                 # Interactive map page
│   │   ├── audiences/           # Audience management
│   │   ├── alerts/              # Saved searches & alerts
│   │   ├── analytics/           # Usage analytics
│   │   └── settings/            # User settings
│   ├── api/                     # API routes
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles (Tailwind + design system)
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components (nav, shell)
│   ├── map/                     # Map components
│   ├── search/                  # Search & AI components
│   ├── property/                # Property detail components
│   ├── audience/                # Audience builder components
│   └── providers.tsx            # React Query & Theme providers
│
├── lib/
│   ├── api/                     # API client & functions
│   │   ├── client.ts           # Axios client with interceptors
│   │   ├── properties.ts       # Property API functions
│   │   └── audiences.ts        # Audience API functions
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   ├── utils/                   # Utility functions
│   └── constants/               # Constants & config
│
└── types/                       # TypeScript type definitions
    ├── property.ts
    ├── audience.ts
    ├── user.ts
    └── map.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

## Features

### Phase 1 (Satellite Products)

- **Interactive Map** - MapLibre GL-powered map with satellite imagery
- **AI-Powered Search** - Natural language property search with GPT-4
- **RoofIQ** - Roof condition analysis
- **SolarFit** - Solar potential assessment
- **DrivewayPro** - Driveway condition analysis
- **PermitScope** - Building permit tracking
- **Audience Builder** - Lead generation & export (Google Ads, CSV, PDF)
- **Saved Searches & Alerts** - Email notifications for new matches

### Phase 2 (Edge Analytics) - Coming Soon

- **LotWatch** - Real-time parking/drive-thru analytics
- **Live Camera Feeds** - Edge device integration

## Design System

Evoteli uses a custom design system based on Tailwind CSS:

- **Primary Color:** Green (#16a34a) - Trust, growth, sustainability
- **Typography:** Inter font family
- **Spacing:** 4px base unit
- **Border Radius:** 8px default

See `app/globals.css` for the complete design system implementation.

## Development

### Adding a New Component

1. Create the component in the appropriate directory
2. Use TypeScript for type safety
3. Follow the shadcn/ui patterns for consistency
4. Add to Storybook (if applicable)

### API Integration

All API calls go through the centralized API client in `lib/api/client.ts`, which handles:

- Authentication (Bearer token)
- Error handling (401 redirects to login)
- Request/response interceptors

### State Management

- **UI State:** Zustand stores (map viewport, filters, etc.)
- **Server State:** TanStack Query (properties, audiences)
- **Form State:** React Hook Form with Zod validation

## Deployment

This frontend is designed to deploy on Vercel:

```bash
npm run build
vercel deploy
```

Environment variables must be configured in the Vercel dashboard.

## Contributing

See the main repository README for contribution guidelines.

## License

See LICENSE file in the root of the repository.

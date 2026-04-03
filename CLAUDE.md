# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Open-Chat.Us is a real-time community chat platform built as a single-page application (SPA). It features public/private messaging, room management, AI bot integration, gamification (achievements, reputation, leaderboards), and moderation tools.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5 with SWC plugin
- **UI**: ShadCN UI (Radix UI primitives + Tailwind CSS 3)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **State**: React Query (TanStack) for server state, React Context for client state
- **Routing**: React Router DOM v6 with lazy-loaded pages
- **Forms**: React Hook Form + Zod validation
- **Sanitization**: DOMPurify for XSS protection

## Common Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build (output: dist/)
npm run build:dev    # Development mode build
npm run lint         # ESLint check
npm run preview      # Preview production build
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Testing

Vitest + React Testing Library + jsdom. Test files live in `__tests__/` directories next to the code they test. Setup file: `src/test/setup.ts`.

## Architecture

### Path Alias

`@/*` maps to `./src/*` (configured in vite.config.ts and tsconfig.json).

### Key Directories

- `src/pages/` — Route-level components, all lazy-loaded via `React.lazy()`
- `src/components/` — Feature-organized components (chat, admin, analytics, gamification, rooms, etc.)
- `src/components/ui/` — ShadCN UI primitives (60+ components, auto-generated via ShadCN CLI)
- `src/hooks/` — 35+ custom hooks encapsulating Supabase queries and business logic (including useChatState, useChatSubscriptions, useChatActions, useMessageComposition)
- `src/contexts/` — ThemeContext (neon/dark/light themes)
- `src/integrations/supabase/` — Supabase client (`client.ts`) and auto-generated types (`types.ts`)
- `src/utils/` — Utilities for emoji, sanitization, mention parsing, markdown formatting, structured logger, error handling, Zod validation schemas
- `src/components/chat/` — Extracted chat sub-components (ChatContainer, ChatMessageList, ChatSidebar, ChatToolbar, MessageComposer, AttachmentPreview, MentionOverlay, SlashCommandOverlay)
- `supabase/migrations/` — 19 SQL migration files defining the database schema

### Provider Hierarchy (App.tsx)

QueryClientProvider → AuthProvider → ThemeProvider → TooltipProvider → BrowserRouter → Suspense → Routes

### Real-Time Architecture

Supabase Realtime subscriptions power live messaging, presence tracking, reactions, and notifications. Tables use `REPLICA IDENTITY FULL` for complete change data. Hooks like `useChannels`, `useContacts`, `useThreadedMessages` manage subscriptions.

### Database

All data lives in Supabase PostgreSQL with Row Level Security (RLS) on every table. Key tables: `messages`, `private_messages`, `channels`, `channel_members`, `user_profiles`, `achievements`, `reputation_points`, `moderation_actions`, `audit_logs`. Types are auto-generated in `src/integrations/supabase/types.ts`.

### AI Bot Integration

Uses n8n webhooks (configured via `VITE_N8N_WEBHOOK_URL` env var). The `useBotIntegration` hook handles bot message routing.

### Code Splitting

Vite is configured with manual chunks: `vendor` (React), `router`, `supabase`, `radix-ui`, `ui`, `utils`. Chunk size warning at 600KB.

## Environment Variables

Defined in `.env` (see `.env.example`). All use `VITE_` prefix (exposed to frontend):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — Required
- `VITE_N8N_WEBHOOK_URL` — Optional, for AI bot
- `VITE_ANALYTICS_ENABLED` — Optional

### Logging

All logging goes through `src/utils/logger.ts` (structured logger). In production, only `warn` and `error` level logs are emitted. No direct `console.log` calls in source code.

### Error Handling

- `ErrorBoundary` component wraps routes for graceful error recovery
- `src/utils/errorHandler.ts` provides centralized error handling with toast integration
- Global unhandled promise rejection handler in `main.tsx`

## Security

- CSP headers are defined in `index.html` (not server-side)
- DOMPurify sanitization in `src/utils/sanitization.ts`
- Zod validation schemas in `src/utils/validation.ts` for message, channel, profile, and file upload data
- RLS policies enforce data access at the database level
- Guest users get secure random IDs via `src/utils/secureGuestId.ts` (uses `crypto.getRandomValues()`)
- No `Math.random()` used for security-sensitive operations

## Dev Server Proxy

In development, `/api` and `/functions/v1` are proxied to the Supabase project URL (configured in `vite.config.ts`).

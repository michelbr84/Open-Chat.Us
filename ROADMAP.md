# ROADMAP.md — Open-Chat.Us

> Tracks development progress across quality, performance, security, and features.

---

## Phase 0: Foundation ✅ COMPLETED

### 0.4 Session State ✅
- `.gitignore` updated with: `.estado.md`, `.claude/audit.log`, `coverage/`, `.eslintcache`

### 0.1-0.3, 0.5 — Deferred
- ClaudeMaxPower hook/agent/skill integration: requires manual setup of the ClaudeMaxPower repo. Not blocking other phases.

---

## Phase 1: Testing Infrastructure ✅ COMPLETED

### 1.1 Framework Setup ✅
- Vitest + React Testing Library + jsdom installed
- `vitest.config.ts` configured with `@/` path aliases matching `vite.config.ts`
- `src/test/setup.ts` with global mocks for Supabase client, `matchMedia`, and `localStorage`
- Scripts: `npm run test`, `npm run test:watch`, `npm run test:coverage`

### 1.2 Utility Tests ✅ — 180 tests passing
- `src/utils/__tests__/sanitization.test.ts` — XSS edge cases, DOMPurify behavior
- `src/utils/__tests__/mentionParser.test.ts` — mention detection and formatting
- `src/utils/__tests__/markdownFormatter.test.ts` — markdown rendering
- `src/utils/__tests__/emojiSystem.test.ts` — autocomplete, search, recent tracking
- `src/utils/__tests__/secureGuestId.test.ts` — uniqueness, format, session validation

### 1.3-1.5 — Future Work
- Hook tests (useAuth, useRooms, useMessageEditing, useBotIntegration)
- Component tests (ChatMessage, MessageInput, LoginModal, RoomSwitcher, NotificationCenter)
- Integration tests (message flows, room flows, auth flows)

---

## Phase 2: Code Quality & Architecture ✅ MOSTLY COMPLETED

### 2.1 Chat.tsx Decomposition ✅
- Reduced from **993 lines → 170 lines**
- Extracted hooks: `useChatState`, `useChatSubscriptions`, `useChatActions`
- Extracted components: `ChatContainer`, `ChatMessageList`, `ChatSidebar`, `ChatToolbar`

### 2.2 MessageInput.tsx Decomposition ✅
- Reduced from **529 lines → 128 lines**
- Extracted hook: `useMessageComposition`
- Extracted components: `MessageComposer`, `AttachmentPreview`, `MentionOverlay`, `SlashCommandOverlay`

### 2.3 Performance Optimization ✅ (Console Cleanup)
- Removed **153 console.log/error/warn statements** across **47 files**
- Created `src/utils/logger.ts` — structured logger (prod: warn/error only, dev: all levels)
- React.memo and useCallback optimizations applied to chat components

### 2.4 Error Handling Standardization ✅
- Created `ErrorBoundary.tsx` wrapping routes
- Created `src/utils/errorHandler.ts` with toast integration
- Added global unhandled promise rejection handler in `main.tsx`

### 2.5 React Query Optimization — N/A
- React Query provider exists but no hooks use `useQuery`/`useMutation` — all data fetching uses Supabase client directly
- Migrating to React Query patterns would be a separate initiative

---

## Phase 3: Security Hardening ✅ MOSTLY COMPLETED

### 3.2 Cryptographic Improvements ✅
- Replaced `Math.random()` with `crypto.getRandomValues()` in `secureGuestId.ts`
- Audited entire codebase — no remaining `Math.random()` in security contexts

### 3.3 Input Validation Hardening ✅
- Created `src/utils/validation.ts` with Zod schemas for messages, channels, user profiles, file uploads

### 3.5 Dependency Security ✅
- Ran `npm audit fix`

### 3.6 WebSocket Security ✅
- Added reconnection logic with error handling for Supabase Realtime subscriptions
- Proper subscription cleanup on component unmount

### 3.1 Server-Side Rate Limiting — Future Work
- Requires Supabase Edge Function deployment (backend work)

### 3.4 CSP Tightening — Future Work
- Removing `unsafe-inline`/`unsafe-eval` requires moving Google Analytics to a separate file and using nonces (hosting-level change)

---

## Phase 4: Accessibility & UX Polish ✅ PARTIALLY COMPLETED

### 4.1 Accessibility Fundamentals ✅
- `lang="en"` already set on `<html>`
- Skip-to-content link added to `App.tsx`
- `aria-live="polite"` added to message list for real-time updates
- Focus trapping handled by Radix UI (Dialog, Sheet, AlertDialog)

### 4.2 Screen Reader Support ✅
- `aria-label` added to icon-only buttons across components
- `role="log"` added to message list containers
- Improved semantic structure

### 4.3-4.5 — Future Work
- Full keyboard navigation audit
- Color contrast audit for neon theme
- Mobile UX improvements (swipe gestures, pull-to-refresh)

---

## Phase 5: Feature Completion ✅ PARTIALLY COMPLETED

### 5.1 Analytics Dashboard ✅
- Improved `ModerationOverview.tsx` and `ModerationQueue.tsx` content rendering

### 5.2-5.5 — Future Work
- Offline support (Service Worker, IndexedDB)
- File upload progress tracking
- Full-text search with Supabase `textsearch`
- Browser push notifications

---

## Phase 6: Public API — Future Work

Requires backend infrastructure (Supabase Edge Functions, API key management). Not started.

### 6.1-6.4
- API design (OpenAPI 3.0 spec)
- Supabase Edge Functions for REST endpoints
- WebSocket API for real-time streaming
- Developer portal with API key management

---

## Summary

| Phase | Status | Key Metric |
|-------|--------|------------|
| 0 - Foundation | ✅ Done | .gitignore, config updated |
| 1 - Testing | ✅ Done | 180 tests, 5 suites |
| 2 - Code Quality | ✅ Done | Chat.tsx: 993→170, MessageInput: 529→128, 153 console.logs removed |
| 3 - Security | ✅ Mostly Done | Math.random→crypto, Zod schemas, npm audit |
| 4 - Accessibility | ✅ Partial | Skip-to-content, aria-labels, role="log" |
| 5 - Features | ✅ Partial | Analytics fixes, a11y improvements |
| 6 - Public API | ⏳ Future | Requires backend infrastructure |

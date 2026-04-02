# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — run dev server at localhost:3000
- `npm run build` — production build to `build/`
- `npm test` — run tests (Jest, interactive watch mode)
- `npm test -- --watchAll=false` — run tests non-interactively
- `npm test -- --testPathPattern=App` — run a single test file

## Architecture

**Single-file React app** — the entire frontend lives in `src/App.js` (~1570 lines). There is no router, no component library, no state management library. All components, styles, icons, and logic are co-located in this one file.

**Key patterns in App.js:**
- `sb()` — custom fetch wrapper for Supabase REST API (no Supabase JS client). All DB access goes through raw REST calls using `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_KEY` env vars.
- `hashPassword()` — client-side SHA-256 hashing (not bcrypt). Auth is custom, not Supabase Auth.
- Session management via localStorage (`hiveboard_session`) with 30-day expiry. On resume, role is re-verified from DB.
- Two roles: `admin` (sees overview, manages members, resets passwords) and `member` (sees own tasks).
- Pages are toggled via `page` state variable, not a router: `overview`, `tasks`, `completed`, `attention`, `settings`.

**Supabase backend:**
- Tables: `users`, `tasks`, `comments`, `push_subscriptions`
- Tasks have: `title`, `description`, `status` ("not started"/"in progress"/"completed"), `assigned_to`, `deadline`, `track` (boolean), `needs_attention` (boolean)
- Comments are nested under tasks via `tasks?select=*,comments(...)`
- Edge function `supabase/functions/send-push-notification/` — Deno function using web-push for browser notifications

**Environment variables** (in `.env`):
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_KEY`
- `REACT_APP_VAPID_PUBLIC_KEY`

**PWA support:** Service worker at `public/sw.js` handles push notifications. VAPID keys configured for web-push.

## Style

- CSS is embedded as a template literal (`STYLES` constant) injected via `<style>` tag, not external CSS files (except minimal `App.css` and `index.css`)
- Design system uses CSS custom properties (e.g., `--bg`, `--surface`, `--accent`, `--text2`)
- Fonts: Cormorant Garamond (headings), Inter (body)
- All SVG icons are inline React components in the `Icon` object

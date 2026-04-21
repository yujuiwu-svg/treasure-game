# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev:all   # Start both frontend (port 3000) and backend (port 3001) concurrently
npm run dev       # Frontend only (Vite, hot reload)
npm run server    # Backend only (tsx watch)
npm run build     # Production build → ./build/
```

No lint or type-check scripts are configured. TypeScript is transpiled by SWC (frontend) and `tsx` (backend) with no separate `tsc` step.

## Architecture

Full-stack app: React 18 + TypeScript + Vite frontend proxied to an Express + SQLite backend.

```
frontend (Vite, port 3000)  ──proxy /api──►  backend (Express, port 3001)
                                                      │
                                               game.db (SQLite)
                                               ├── users
                                               └── scores
```

### Backend (`server/`)

- `server/index.ts` — Express app, mounts routes, listens on port 3001
- `server/db.ts` — Opens/creates `game.db` in the project root, runs table migrations on startup
- `server/routes/auth.ts` — `POST /api/auth/signup`, `POST /api/auth/signin`, `POST /api/auth/signout`, `GET /api/auth/me`
- `server/routes/scores.ts` — `POST /api/scores`, `GET /api/scores` (requires auth)

Auth uses bcryptjs for password hashing and a UUID session token stored in the `users.session_token` column. The client stores the token in `localStorage` and sends it as `Authorization: Bearer <token>`.

### Frontend (`src/`)

**App states** (`AppState = 'landing' | 'game' | 'scores'`):
- `landing` — sign in / sign up / play as guest buttons
- `game` — the box-opening game; score auto-saves on `gameEnded` for signed-in users (guarded by `scoreSavedRef` to prevent double-saves)
- `scores` — score history table fetched from the API

**Key files:**
- `src/App.tsx` — all game logic and app-state routing
- `src/context/AuthContext.tsx` — `user`, `loading`, `signin`, `signup`, `signout`; calls `getMe()` on mount to restore session from `localStorage`
- `src/lib/auth.ts` — `fetch` helpers for all `/api/*` endpoints; manages `auth_token` in `localStorage`
- `src/components/AuthModal.tsx` — sign-in/sign-up dialog using `react-hook-form` + Zod + shadcn `Dialog`/`Tabs`

**shadcn/ui quirk**: The `Input` component in `src/components/ui/input.tsx` does not use `React.forwardRef`, so `react-hook-form`'s `register()` ref never reaches the native `<input>`. Always use `Controller` from `react-hook-form` with a native `<input>` element for form fields instead of the shadcn `Input`.

**Zod v4**: This project uses Zod 4.x (`zod@^4.3.6`). Zod v4 rejects `undefined` for `z.string()`. Always provide `defaultValues` in `useForm` and call `form.reset({ field: '' })` explicitly — do not rely on empty `reset()`.

**Game logic** (`App.tsx`):
- `boxes`: array of 3 `Box` objects (`id`, `isOpen`, `hasTreasure`)
- `score`: +100 treasure, -50 skeleton
- `openBox(id)` reads `score` from the closure (stale-safe because only one box changes per click)
- Audio plays on box open (previously unused imports, now wired up)

## Path alias

`@` resolves to `./src`.

## Styling

`src/index.css` is the active stylesheet. `src/styles/globals.css` exists but is not imported — do not assume it is active.

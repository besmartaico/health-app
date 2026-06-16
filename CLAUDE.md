# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project: HealthEasy.co Admin App

BeSmart Health — a Next.js admin + public site backed by Google Sheets.
Repo: `besmartaico/health-app` (GitHub). Hosted on Vercel, auto-deploys from `main`.

## Stack
- Next.js 14.2 (App Router), React 18, TypeScript
  - Admin pages start with `// @ts-nocheck` on line 1, then `'use client';` on line 2
- Google Sheets as the database via `googleapis` + `google-auth-library`
- Inline `style={{}}` objects for all styling — no Tailwind in practice
  (tailwindcss/postcss/autoprefixer are in devDependencies but `globals.css` uses none)
- `@anthropic-ai/sdk` for AI features (calculator AI, peptide AI)
- Resend for transactional email
- `bcryptjs` for PIN/password hashing, `recharts` for charts, `lucide-react` icons, `date-fns` for dates

## Commands
- Install: `npm install`  (call `npm.cmd` directly on this machine — a stray empty `npm` shim in System32 shadows the real one)
- Dev server: `npm run dev`  → http://localhost:3000 (admin at /admin)
- Build: `npm run build`
- Lint: `npm run lint`

## Environment
- Secrets live in `.env.local` (gitignored). Template: `.env.local.example`.
- Pull real values from Vercel → health-app → Settings → Environment Variables.
- Required vars: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
  `GOOGLE_SHEETS_CRM_ID`, `GOOGLE_DRIVE_FOLDER_ID`, `ANTHROPIC_API_KEY`,
  `RESEND_API_KEY`, `ADMIN_PIN`, `SSO_SECRET`, `NEXT_PUBLIC_APP_URL`
- `GOOGLE_PRIVATE_KEY` must keep literal `\n` characters (not real newlines), wrapped in double quotes.

## Google Sheets structure
- `GOOGLE_SHEETS_CRM_ID` points to the master spreadsheet.
- Each entity is a separate tab: Customers, Sales, Inventory, InventoryLog,
  InventoryAudit, Instructions, Contacts, plus Purchases / Teams / Users as the app grew.
- Row 1 in every tab is a header row; data starts at row 2.
- `item.id` = the actual sheet row number (e.g. row 5 → id "5").
  CRITICAL: never use array index as id.

## Key rules
- `'use client';` must be the first directive (a leading `// @ts-nocheck` comment is fine).
- Deletes are SOFT deletes: mark col M = 'true', never physically remove the row.
- All inventory writes are audited to the InventoryAudit tab.
- Date inputs: parse with a `'T12:00:00'` suffix to dodge timezone shifts —
  `new Date(dateString + 'T12:00:00')`, not `new Date(dateString)`.
- Sales lines are stored as JSON in col C: `[{product, price, qty}]`.

## Color palette (Sapphire theme)
- Primary `#1a4fa8`, Dark `#0d2d6b`, Mid `#1a3a7a`
- Backgrounds: pages `#131313`, sidebar `#111`, cards `#1a1a1a`
- Success `#34d399`, Warning `#f87171`, Info `#6b9ee8`

## Layout
```
app/
  page.tsx                public homepage (healtheasy.co)
  layout.tsx, icon.tsx, manifest.ts, globals.css
  consult/page.tsx, posters/page.tsx, signup/page.tsx
  admin/
    layout.tsx            admin shell, login, sidebar nav
    page.tsx              admin dashboard
    sales/  inventory/  crm/  purchases/  profitability/
    calculator/  peptide-ai/  coa/  instructions/
    teams/  users/  signup/
  api/
    inventory/route.ts    inventory CRUD (real row numbers) + backfill/
    sales/route.ts        sales CRUD + inventory decrement
    crm/  purchases/  teams/  admin-users/  instructions/  alerts/  sync/
    auth/  login/  register/  signup/  sso/        auth
    calculator-ai/  peptide-ai/  consult/          AI
    coa/  posters/  poster-image/[id]/             docs/images (Google Drive)
    contact/  send-plan/                           email (Resend)
public/
  logo.png (light bg), logo-dark.png (dark bg)
```

## Deployment
- Push to `main` → Vercel auto-deploys in ~45s.
- Builds: vercel.com/jeff-weeks-projects/health-app/deployments
- Production: health.besmartai.co and admin.healtheasy.co

## Working conventions
- Use the `besmartaico` GitHub identity for all git/gh actions.
- Use PowerShell for shell commands on this machine.

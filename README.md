# create-githat-app

Scaffold enterprise-grade apps with [GitHat](https://githat.io) identity — for humans, AI agents, and MCP servers.

## Install & Launch

Run one command from anywhere:

```bash
npx create-githat-app
```

Or with a project name:

```bash
npx create-githat-app my-app
```

Or install globally:

```bash
npm i -g create-githat-app
create-githat-app my-app
```

The CLI launches an interactive wizard that walks you through every decision.

## How It Works

### Step 1 — Answer the prompts

The CLI asks you a series of questions:

```
◆  Project name?
│  my-saas-app
│
◆  Business name?
│  Acme Corp
│
◆  Framework?
│  ● Next.js 16 (App Router)
│  ○ React 19 + Vite 7
│
◆  Language?
│  ● TypeScript
│  ○ JavaScript
│
◆  Package manager?
│  ● npm
│  ○ yarn
│  ○ pnpm
│  ○ bun
│
◆  GitHat publishable key?
│  pk_live_abc123...
│
◆  Auth features to include?
│  ◻ Forgot password
│  ◻ Email verification
│  ◻ Organization management
│  ◻ MCP server identity
│  ◻ AI agent identity
│
◆  Database?
│  ● None
│  ○ Prisma + PostgreSQL
│  ○ Prisma + MySQL
│  ○ Drizzle + PostgreSQL
│  ○ Drizzle + SQLite
│
◆  Include Tailwind CSS 4?
│  ● Yes  ○ No
│
◆  Include platform dashboard?
│  ● Yes  ○ No
│
◆  Initialize git repository?
│  ● Yes  ○ No
│
◆  Install dependencies now?
│  ● Yes  ○ No
```

### Step 2 — Project is generated

```
◇  Project structure created
◇  package.json generated
◇  Git repository initialized
◇  Dependencies installed

◇  Setup complete!
```

### Step 3 — Start building

```bash
cd my-saas-app
npm run dev
```

Your app is running at `http://localhost:3000` with auth, dashboard, and the full GitHat platform wired up.

## CLI Flags

Skip prompts with flags:

```bash
# Use JavaScript instead of TypeScript
npx create-githat-app my-app --js

# Use TypeScript (default)
npx create-githat-app my-app --ts

# Pass your publishable key directly
npx create-githat-app my-app --key pk_live_abc123

# Combine flags
npx create-githat-app my-app --js --key pk_live_abc123

# Show help
npx create-githat-app --help

# Show version
npx create-githat-app --version
```

## What You Get

A production-ready project with:

- **Auth pages** — sign-in, sign-up, forgot password, email verification
- **Protected dashboard** — sidebar navigation, org switcher, user button
- **`@githat/nextjs` SDK** — `<GitHatProvider>`, `<ProtectedRoute>`, `useAuth()`
- **`githat/` platform folder** — typed API client and dashboard modules
- **Dark theme** — zinc/purple design system out of the box
- **Database ready** — Prisma or Drizzle pre-configured (optional)
- **Tailwind CSS 4** — utility-first styling (optional)

## The `githat/` Folder

Your generated project includes a `githat/` directory — a local integration layer between your app and the GitHat platform API:

```
githat/
  config.ts              # Central configuration (env vars, feature flags)
  api/
    client.ts            # Typed fetch wrapper with token refresh
    types.ts             # TypeScript interfaces for all API responses
    auth.ts              # Login, register, forgot password, verify email
    orgs.ts              # Create/update orgs, invite/remove members
    users.ts             # List orgs, switch org
    mcp.ts               # Register/verify MCP servers
    agents.ts            # Register/verify AI agent wallets
  auth/
    guard.tsx            # Role-based route protection component
    index.ts             # Auth exports
  dashboard/
    layout.tsx           # Dashboard shell with sidebar navigation
    overview.tsx         # Stats overview page
    apps.tsx             # App + API key management
    members.tsx          # Invite members, manage roles, remove
    settings.tsx         # Edit org name, brand color, save
    mcp-servers.tsx      # Register MCP servers, verify, remove
    agents.tsx           # Register AI agent wallets, verify, remove
```

All API calls go to `api.githat.io`. The client handles auth tokens and automatic refresh.

## Three Identity Types

GitHat supports three types of identity in a single platform:

| Type            | Auth Method                | Dashboard Page |
| --------------- | -------------------------- | -------------- |
| **Humans**      | Email + password           | Members        |
| **MCP Servers** | Domain verification        | MCP Servers    |
| **AI Agents**   | Ethereum wallet signatures | AI Agents      |

## Project Structure

### Next.js 16

```
my-app/
  app/
    layout.tsx
    page.tsx
    globals.css
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
      forgot-password/page.tsx
      verify-email/page.tsx
    dashboard/
      layout.tsx
      page.tsx
      apps/page.tsx
      members/page.tsx
      settings/page.tsx
      mcp/page.tsx
      agents/page.tsx
  githat/
    ...
  middleware.ts
  next.config.ts
  .env.local
```

### React 19 + Vite 7

```
my-app/
  src/
    main.tsx
    App.tsx
    index.css
    pages/
      Home.tsx
      SignIn.tsx
      SignUp.tsx
      ForgotPassword.tsx
      VerifyEmail.tsx
      Dashboard.tsx
  githat/
    ...
  index.html
  vite.config.ts
  .env.local
```

## Environment Variables

Generated `.env.local`:

```env
# Next.js
NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GITHAT_API_URL=https://api.githat.io

# React/Vite
VITE_GITHAT_PUBLISHABLE_KEY=pk_live_...
VITE_GITHAT_API_URL=https://api.githat.io
```

## Contributing

```bash
git clone https://github.com/GitHat-IO/create-githat-app.git
cd create-githat-app
npm install
npm run build
node bin/index.js test-app
```

## License

MIT
